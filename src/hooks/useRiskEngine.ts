import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  BehavioralRecorder, deviceFingerprint, locationHint,
  loadBaseline, loadPrefs, recordSignal, updateBaseline,
  scoreSample, logRiskEvent, markStepUpResult,
  type RiskResult, type SignalSample,
} from '@/lib/behavioral';

/**
 * useRiskEngine — captures behavioral signals on the bound element, computes
 * a risk score for a sensitive action, and provides modal state for step-up
 * or block flows.
 */
export function useRiskEngine() {
  const { user } = useAuth();
  const recorderRef = useRef<BehavioralRecorder | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [riskEventId, setRiskEventId] = useState<string | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);

  if (!recorderRef.current) recorderRef.current = new BehavioralRecorder();

  const attach = useCallback((el: HTMLElement | null) => {
    if (!el || !recorderRef.current) return;
    recorderRef.current.attach(el);
  }, []);

  useEffect(() => () => {
    // best-effort detach — recorder is fine if listeners outlive the element
  }, []);

  /**
   * Score the current behavioral context. If risk is low → run action.
   * If medium → step-up modal. If high → blocked modal.
   */
  const evaluate = useCallback(async (action: () => void | Promise<void>, context = 'transaction', txRef?: string) => {
    if (!user) { await action(); return; }
    const prefs = await loadPrefs(user.id);
    if (prefs && !prefs.behavioral_monitoring_enabled) {
      await action();
      return;
    }
    const summary = recorderRef.current!.summarize();
    const sample: SignalSample = {
      avg_typing_interval_ms: summary.typing,
      avg_pointer_velocity: summary.pointer,
      hour_of_day: new Date().getHours(),
      device_fp: deviceFingerprint(),
      location_hint: locationHint(),
    };
    const baseline = await loadBaseline(user.id);
    const result = scoreSample(baseline, sample, prefs?.accessibility_mode ?? false);

    // Log signal + event no matter what — the engine learns from every action.
    await recordSignal(user.id, sample, context);
    const event = await logRiskEvent(user.id, result, txRef);
    setRisk(result);
    setRiskEventId(event.id);
    pendingActionRef.current = async () => {
      await updateBaseline(user.id, sample);
      await action();
    };

    if (result.decision === 'approved') {
      await pendingActionRef.current();
      pendingActionRef.current = null;
    } else if (result.decision === 'step_up') {
      setStepUpOpen(true);
    } else {
      setBlockedOpen(true);
    }
    recorderRef.current!.reset();
  }, [user]);

  const onStepUpPass = useCallback(async (method: 'biometric' | 'pin' | 'email_otp') => {
    if (riskEventId) await markStepUpResult(riskEventId, method, true);
    setStepUpOpen(false);
    if (pendingActionRef.current) { await pendingActionRef.current(); pendingActionRef.current = null; }
  }, [riskEventId]);

  const onStepUpCancel = useCallback(async () => {
    if (riskEventId) await markStepUpResult(riskEventId, 'cancelled', false);
    setStepUpOpen(false); pendingActionRef.current = null;
  }, [riskEventId]);

  const onBlockedClose = useCallback(() => { setBlockedOpen(false); pendingActionRef.current = null; }, []);

  return {
    attach, evaluate,
    risk, riskEventId,
    stepUpOpen, blockedOpen,
    onStepUpPass, onStepUpCancel, onBlockedClose,
  };
}
