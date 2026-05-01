# Behavioral Risk Detection — Architecture & Design

This document covers the **UX**, **ML/system**, and **ethical** design of FraudGuard\'s behavioral risk system. It complements the diagram (typing cadence, swipe & gesture, facial recognition, session context → personalized baseline → anomaly engine → decision gate → approve / step-up / block).

---

## 1. UX — surfacing risk without alarming the user

The core principle: **friction should feel like care, not suspicion.** A user who sees red exclamation marks and "SUSPICIOUS ACTIVITY" banners every time the model has a bad day will lose trust in the product. The UI is built around three patterns:

### a. The soft "unusual pattern" banner
Appears inline above sensitive forms when the recent score sits in the 25–40 range (just below step-up). It is informational, dismissible, never red, and uses a friendly icon (✨, not ⚠).
> *"Heads up — your pattern looks a little different today. We may ask for extra verification."*

### b. The elegant step-up modal (medium risk, 40–75)
- **Tone first.** Title is *"Quick check before we continue"*, not *"Verification required"*.
- **Transparency by default.** A short bullet list explains *why* we\'re asking ("Signing in from a device we don\'t recognize", "Typing rhythm differs from your usual"). No risk score is shown — scores are technical, reasons are human.
- **User-chosen factor.** Biometric, PIN, and email OTP are offered side by side. The user picks. We don\'t force the most secure option; we offer the most usable one.
- **Always cancellable.** A muted "Cancel and dispute later" link is always visible.

### c. The blocked modal (high risk, 75+)
- Single neutral-firm message: *"Transaction paused for safety."*
- Explains exactly which signals triggered the hold.
- **The primary CTA is "This was me — dispute the block,"** not "OK". We assume good faith first.
- Disputes route to a queue an admin reviews; an accepted dispute feeds the user\'s baseline so the same pattern doesn\'t trigger again.

### d. Settings — give the user the steering wheel
A dedicated **Security & Behavior** page exposes:
- **A live baseline progress bar** (e.g. "3/5 samples — learning"). When users can *see* the model learning, they understand why early friction exists.
- A list of recent risk events with decision + reason codes.
- A list of disputes with status.
- Toggles described below in §3.

---

## 2. Technical / ML architecture

### Per-user baseline
Each user has a row in `behavioral_baselines`:

| Signal | Stored as |
|---|---|
| Typing cadence | `avg_typing_interval_ms`, `std_typing_interval_ms` |
| Pointer kinematics | `avg_pointer_velocity`, `std_pointer_velocity` |
| Time-of-day | `common_hours INTEGER[]` |
| Devices | `known_devices TEXT[]` (hashed UA + screen + TZ) |
| Locations | `known_locations TEXT[]` (timezone hint, not GPS) |
| Confidence | `samples_count INTEGER` |

The baseline is updated incrementally with an **exponential moving average** (α = 0.2) plus a recompute of std over the last 30 samples. This is a deliberately simple approximation of an **on-device incremental learner** — it captures the same "learn from each session" behavior without the operational cost of a real per-user neural net.

### Anomaly engine (`scoreSample` in `src/lib/behavioral.ts`)
A weighted sum of independent signals → 0–100 score:
- Unknown device: +20
- Unknown location: +15
- Unusual hour: +10
- Typing z-score > 2: up to +30
- Pointer z-score > 2: up to +25

Then a **decision gate**:
- `score < 40` → **approved**
- `40 ≤ score < 75` → **step-up**
- `score ≥ 75` → **blocked**

Reason codes accompany every score so the UX can explain itself.

### Federated / on-device direction (production roadmap)
The current implementation captures aggregates client-side and stores them server-side per user (RLS-enforced). A production path:

1. **On-device feature extraction.** Raw key-down timings and pointer events never leave the device. Only summary stats (`mean`, `std`, histograms) are computed locally and sent.
2. **Federated averaging for the *global* model.** The personal baseline stays on-device. Only model gradients (not data) participate in a federated round, weighted by `samples_count`. Users opt in with `share_signals_for_global_model`.
3. **Differential privacy.** Each gradient is perturbed with calibrated Gaussian noise (ε ≈ 1.0 per round) before transmission.
4. **Update cadence.** Personal baseline updates per-action (cheap). Global model updates **weekly**, async, only including users who opted in and have ≥ 100 fresh samples.

### Cold-start
Every fraud-detection paper acknowledges that a brand-new user has no baseline. Our handling:
- `samples_count < 5` is **cold-start mode**.
- In cold-start, the engine **never blocks** — at most a step-up if a genuinely unknown device is used.
- The score is capped at `STEP_UP_THRESHOLD + 5`.
- The Security page tells the user explicitly: *"We\'re still learning your patterns."*
- We bias toward false negatives during cold-start because false positives early in a user\'s lifecycle are the single largest cause of churn in published fraud-detection telemetry.

---

## 3. Ethics & accessibility

### False positives: assumed, not exceptional
False positives are a *certainty* in any behavioral system. Three mitigations:
1. **A score doesn\'t equal a block.** The decision gate keeps blocks rare; step-up is the default escalation.
2. **Disputes are first-class.** Every block surfaces "This was me" as the primary CTA. Disputes are stored in `risk_disputes` with status `pending → accepted/rejected`.
3. **Accepted disputes feed the baseline.** A disputed pattern is added to the user\'s known patterns, so the same trigger doesn\'t fire twice.

### Accessibility — disabilities don\'t equal fraud
Behavioral biometrics will systematically penalize users with:
- Motor disabilities (Parkinson\'s, MS, RSI) — pointer velocity and typing rhythm vary day-to-day.
- Switch/AAC users — typing cadence is dictated by the device, not the person.
- Screen-reader users — keyboard navigation produces atypical key-down patterns.
- Users on a new prosthesis, new keyboard, or in physical pain.

**Accessibility mode** is a one-toggle escape hatch:
- Damps the typing/pointer score by 60%.
- Surfaced prominently in Security settings with a clear, non-judgmental description.
- Does **not** disable fraud detection — device, location, and time signals continue. Only the variance-sensitive signals are quieted.
- Logged as `accessibility_mode_active` reason code for audit transparency.

### Opt-in, opt-out, and disputes
- **Default-on**, but disclosed at signup (see roadmap).
- `behavioral_monitoring_enabled` — full kill-switch in Security settings. When off, only password + biometric/PIN gates apply.
- `share_signals_for_global_model` — **default-off**. Federated participation is opt-in only.
- Disputes have a 24-hour SLA and are reviewable by support.

### Data minimization
- Raw keystrokes and raw pointer paths are **never persisted**, on the client or server. Only aggregates.
- Location is a timezone hint, not GPS or IP geo-lookup.
- Device fingerprint is a salted hash of UA + screen + TZ — not the raw UA string.
- `behavioral_signals` rows are TTL candidates (recommended: 90-day rolling window).

### What we will not do
- We will not show a fraud risk score to the end user. Scores are calibrated to a model, not a person, and surfacing them invites users to self-blame ("am I a 75 today?").
- We will not chain multiple step-ups. One challenge per session — pass or block.
- We will not auto-lock an account on a single high score. A block is a *transaction-level* decision, never an account-level one.

---

## 4. Files in this implementation

| File | Purpose |
|---|---|
| `src/lib/behavioral.ts` | Recorder, scoring, baseline updates, DB helpers |
| `src/hooks/useRiskEngine.ts` | React glue: capture → score → modal state |
| `src/components/risk/RiskStepUpModal.tsx` | Medium-risk step-up UI |
| `src/components/risk/RiskBlockedModal.tsx` | High-risk block + dispute UI |
| `src/components/risk/UnusualPatternBanner.tsx` | Soft inline notice |
| `src/pages/portal/RiskSettings.tsx` | User control panel |
| `supabase/functions/step-up-otp/index.ts` | Email-OTP step-up factor |
| `supabase/migrations/...behavioral...sql` | Tables + RLS |

---

*Last updated: 2026-05-01.*
