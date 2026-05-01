/**
 * Behavioral signal capture & risk scoring.
 *
 * Privacy: All raw signals are aggregated client-side into summary stats
 * (mean, std). Only the aggregates are persisted — never per-keystroke logs.
 * This is the minimal data needed to score deviation from baseline.
 *
 * Cold-start handling: Until samples_count >= COLD_START_THRESHOLD, the engine
 * returns a low-confidence score and never blocks — only soft step-up at most.
 */
import { supabase } from '@/integrations/supabase/client';

export const COLD_START_THRESHOLD = 5;
export const STEP_UP_THRESHOLD = 40;
export const BLOCK_THRESHOLD = 75;

export interface SignalSample {
  avg_typing_interval_ms: number | null;
  avg_pointer_velocity: number | null;
  hour_of_day: number;
  device_fp: string;
  location_hint: string;
}

export interface RiskResult {
  score: number;          // 0-100
  decision: 'approved' | 'step_up' | 'blocked';
  reasonCodes: string[];
  coldStart: boolean;
  baselineSamples: number;
}

// ---- Capture ----
export class BehavioralRecorder {
  private keyTimes: number[] = [];
  private pointerSamples: { x: number; y: number; t: number }[] = [];
  private maxKeys = 200;
  private maxPointer = 200;

  attach(el: HTMLElement) {
    el.addEventListener('keydown', this.onKey);
    window.addEventListener('pointermove', this.onPointer);
  }
  detach(el: HTMLElement) {
    el.removeEventListener('keydown', this.onKey);
    window.removeEventListener('pointermove', this.onPointer);
  }
  private onKey = () => {
    const t = performance.now();
    this.keyTimes.push(t);
    if (this.keyTimes.length > this.maxKeys) this.keyTimes.shift();
  };
  private onPointer = (e: PointerEvent) => {
    this.pointerSamples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (this.pointerSamples.length > this.maxPointer) this.pointerSamples.shift();
  };

  summarize(): { typing: number | null; pointer: number | null } {
    let typing: number | null = null;
    if (this.keyTimes.length >= 3) {
      const intervals: number[] = [];
      for (let i = 1; i < this.keyTimes.length; i++) intervals.push(this.keyTimes[i] - this.keyTimes[i - 1]);
      typing = mean(intervals);
    }
    let pointer: number | null = null;
    if (this.pointerSamples.length >= 5) {
      const velocities: number[] = [];
      for (let i = 1; i < this.pointerSamples.length; i++) {
        const a = this.pointerSamples[i - 1], b = this.pointerSamples[i];
        const dt = b.t - a.t;
        if (dt > 0) {
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          velocities.push(d / dt);
        }
      }
      pointer = velocities.length ? mean(velocities) : null;
    }
    return { typing, pointer };
  }
  reset() { this.keyTimes = []; this.pointerSamples = []; }
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const std = (xs: number[], m: number) =>
  Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / Math.max(xs.length - 1, 1));

export function deviceFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];
  let h = 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return `dev_${Math.abs(h).toString(36)}`;
}

export function locationHint(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
}

// ---- DB ----
export async function loadBaseline(userId: string) {
  const { data } = await supabase.from('behavioral_baselines').select('*').eq('user_id', userId).maybeSingle();
  return data;
}

export async function loadPrefs(userId: string) {
  const { data } = await supabase.from('user_risk_prefs').select('*').eq('user_id', userId).maybeSingle();
  return data;
}

export async function ensurePrefs(userId: string) {
  const existing = await loadPrefs(userId);
  if (existing) return existing;
  const { data } = await supabase.from('user_risk_prefs').insert({ user_id: userId }).select().single();
  return data;
}

export async function recordSignal(userId: string, sample: SignalSample, context: string) {
  await supabase.from('behavioral_signals').insert({ user_id: userId, ...sample, context });
}

/**
 * Update the rolling baseline with a fresh sample using exponential moving
 * average. This mimics on-device incremental learning — the baseline is
 * always personal and never leaves the user's row.
 */
export async function updateBaseline(userId: string, sample: SignalSample) {
  const baseline = await loadBaseline(userId);
  const ALPHA = 0.2; // fresh sample weight
  const ema = (prev: number | null | undefined, next: number | null) =>
    next == null ? prev ?? null : prev == null ? next : prev * (1 - ALPHA) + next * ALPHA;

  const knownDevices = new Set([...(baseline?.known_devices ?? []), sample.device_fp]);
  const knownLocations = new Set([...(baseline?.known_locations ?? []), sample.location_hint]);
  const commonHours = new Set<number>([...(baseline?.common_hours ?? []), sample.hour_of_day]);

  // Rough std update — for the simulation we recompute against last N signals
  const { data: recent } = await supabase
    .from('behavioral_signals')
    .select('avg_typing_interval_ms, avg_pointer_velocity')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  const typings = (recent ?? []).map(r => r.avg_typing_interval_ms).filter((x): x is number => x != null);
  const pointers = (recent ?? []).map(r => r.avg_pointer_velocity).filter((x): x is number => x != null);
  const tMean = typings.length ? mean(typings) : null;
  const tStd = typings.length ? std(typings, tMean!) : null;
  const pMean = pointers.length ? mean(pointers) : null;
  const pStd = pointers.length ? std(pointers, pMean!) : null;

  const payload = {
    user_id: userId,
    avg_typing_interval_ms: ema(baseline?.avg_typing_interval_ms, sample.avg_typing_interval_ms) ?? tMean,
    std_typing_interval_ms: tStd,
    avg_pointer_velocity: ema(baseline?.avg_pointer_velocity, sample.avg_pointer_velocity) ?? pMean,
    std_pointer_velocity: pStd,
    known_devices: Array.from(knownDevices).slice(-10),
    known_locations: Array.from(knownLocations).slice(-10),
    common_hours: Array.from(commonHours).slice(-24),
    samples_count: (baseline?.samples_count ?? 0) + 1,
    last_updated: new Date().toISOString(),
  };

  if (baseline) await supabase.from('behavioral_baselines').update(payload).eq('user_id', userId);
  else await supabase.from('behavioral_baselines').insert(payload);
}

// ---- Scoring ----
/**
 * Score a current sample against the user's baseline. Returns a 0-100 risk
 * score plus reason codes. Cold-start users (few samples) get a low score
 * and never reach the BLOCK threshold.
 */
export function scoreSample(
  baseline: Awaited<ReturnType<typeof loadBaseline>>,
  sample: SignalSample,
  accessibilityMode = false,
): RiskResult {
  const reasonCodes: string[] = [];
  const samples = baseline?.samples_count ?? 0;
  const coldStart = samples < COLD_START_THRESHOLD;

  let score = 0;

  // Device unknown → +20
  if (baseline && !baseline.known_devices.includes(sample.device_fp)) {
    score += 20; reasonCodes.push('new_device');
  }
  // Location unknown → +15
  if (baseline && !baseline.known_locations.includes(sample.location_hint)) {
    score += 15; reasonCodes.push('new_location');
  }
  // Unusual hour → +10
  if (baseline && baseline.common_hours.length > 0 && !baseline.common_hours.includes(sample.hour_of_day)) {
    score += 10; reasonCodes.push('unusual_hour');
  }
  // Typing deviation (z-score)
  if (baseline?.avg_typing_interval_ms && baseline?.std_typing_interval_ms && sample.avg_typing_interval_ms) {
    const z = Math.abs((sample.avg_typing_interval_ms - Number(baseline.avg_typing_interval_ms)) / Math.max(Number(baseline.std_typing_interval_ms), 10));
    if (z > 2) { score += Math.min(30, Math.round(z * 8)); reasonCodes.push('typing_pattern_deviation'); }
  }
  // Pointer deviation
  if (baseline?.avg_pointer_velocity && baseline?.std_pointer_velocity && sample.avg_pointer_velocity) {
    const z = Math.abs((sample.avg_pointer_velocity - Number(baseline.avg_pointer_velocity)) / Math.max(Number(baseline.std_pointer_velocity), 0.05));
    if (z > 2) { score += Math.min(25, Math.round(z * 6)); reasonCodes.push('pointer_pattern_deviation'); }
  }

  // Accessibility mode dampens behavioral signals — disability/AT users may
  // have legitimate variance that would otherwise cause false positives.
  if (accessibilityMode) {
    score = Math.round(score * 0.4);
    reasonCodes.push('accessibility_mode_active');
  }

  score = Math.min(100, Math.max(0, score));

  let decision: RiskResult['decision'] = 'approved';
  if (coldStart) {
    // Cold-start: never block. Step-up only on genuinely new device.
    if (reasonCodes.includes('new_device')) decision = 'step_up';
    score = Math.min(score, STEP_UP_THRESHOLD + 5);
    reasonCodes.push('cold_start');
  } else if (score >= BLOCK_THRESHOLD) {
    decision = 'blocked';
  } else if (score >= STEP_UP_THRESHOLD) {
    decision = 'step_up';
  }

  return { score, decision, reasonCodes, coldStart, baselineSamples: samples };
}

export async function logRiskEvent(userId: string, result: RiskResult, transactionRef?: string) {
  const { data, error } = await supabase.from('risk_events').insert({
    user_id: userId,
    risk_score: result.score,
    decision: result.decision,
    reason_codes: result.reasonCodes,
    transaction_ref: transactionRef ?? null,
    cold_start: result.coldStart,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function markStepUpResult(eventId: string, method: string, passed: boolean) {
  await supabase.from('risk_events').update({ step_up_method: method, step_up_passed: passed }).eq('id', eventId);
}
