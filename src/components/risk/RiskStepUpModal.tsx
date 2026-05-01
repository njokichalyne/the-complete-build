import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Fingerprint, KeyRound, Mail, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAuth } from '@/hooks/useAuth';
import { getCredentials, hashPin } from '@/lib/credentials';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RiskResult } from '@/lib/behavioral';

type Method = 'biometric' | 'pin' | 'email_otp';

interface Props {
  open: boolean;
  risk: RiskResult | null;
  onPass: (method: Method) => void;
  onCancel: () => void;
}

const reasonLabels: Record<string, string> = {
  new_device: 'Signing in from a device we don't recognize',
  new_location: 'New location detected',
  unusual_hour: 'Unusual time for you',
  typing_pattern_deviation: 'Typing rhythm differs from your usual',
  pointer_pattern_deviation: 'Mouse movement looks different',
  cold_start: 'We're still learning your patterns',
  accessibility_mode_active: 'Accessibility mode is on',
};

const RiskStepUpModal = ({ open, risk, onPass, onCancel }: Props) => {
  const { user } = useAuth();
  const { biometricSupport, isAuthenticating, authenticate } = useBiometricAuth();
  const [method, setMethod] = useState<Method | null>(null);
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open || !risk) return null;

  const tier = risk.score >= 60 ? 'high' : risk.score >= 40 ? 'medium' : 'low';
  const tierColor = tier === 'high' ? 'text-warning' : 'text-primary';
  const tierBg = tier === 'high' ? 'bg-warning/10 border-warning/30' : 'bg-primary/10 border-primary/30';

  const reset = () => { setMethod(null); setPin(''); setOtp(''); setOtpSent(false); setBusy(false); };
  const close = () => { reset(); onCancel(); };

  const tryBiometric = async () => {
    setBusy(true);
    const ok = await authenticate();
    setBusy(false);
    if (ok) { reset(); onPass('biometric'); }
    else toast.error('Biometric verification didn't succeed — try a PIN or email code instead.');
  };

  const submitPin = async () => {
    if (!user || pin.length !== 4) return;
    setBusy(true);
    try {
      const creds = await getCredentials(user.id);
      if (creds?.pin_hash === hashPin(pin)) { reset(); onPass('pin'); }
      else toast.error('Incorrect PIN');
    } finally { setBusy(false); setPin(''); }
  };

  const sendOtp = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('step-up-otp', { body: { action: 'send' } });
      if (error || !data?.ok) throw new Error(data?.error || 'Failed to send code');
      setOtpSent(true);
      toast.success('Verification code sent to your email');
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('step-up-otp', { body: { action: 'verify', code: otp } });
      if (error || !data?.ok) throw new Error(data?.error || 'Invalid code');
      reset(); onPass('email_otp');
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl relative"
      >
        <button onClick={close} aria-label="Cancel verification" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {/* Soft header — no scary alarms */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${tierBg} border flex items-center justify-center shrink-0`}>
            <ShieldAlert className={`w-5 h-5 ${tierColor}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Quick check before we continue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your pattern looks a little unusual today. A quick verification keeps your account safe.
            </p>
          </div>
        </div>

        {/* Transparent reasons */}
        <div className="bg-secondary/40 border border-border rounded-lg p-3 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Why we're asking</p>
          <ul className="space-y-1">
            {risk.reasonCodes.filter(r => reasonLabels[r]).slice(0, 3).map(r => (
              <li key={r} className="flex items-start gap-2 text-xs text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>{reasonLabels[r]}</span>
              </li>
            ))}
          </ul>
        </div>

        <AnimatePresence mode="wait">
          {!method ? (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {biometricSupport === 'supported' && (
                <button onClick={() => { setMethod('biometric'); tryBiometric(); }}
                  className="w-full border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/50 transition-all text-left">
                  <Fingerprint className="w-6 h-6 text-primary" />
                  <div><p className="text-sm font-semibold text-foreground">Use biometric</p><p className="text-xs text-muted-foreground">Face ID / Touch ID</p></div>
                </button>
              )}
              <button onClick={() => setMethod('pin')}
                className="w-full border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/50 transition-all text-left">
                <KeyRound className="w-6 h-6 text-primary" />
                <div><p className="text-sm font-semibold text-foreground">Enter PIN</p><p className="text-xs text-muted-foreground">Your 4-digit PIN</p></div>
              </button>
              <button onClick={() => { setMethod('email_otp'); sendOtp(); }}
                className="w-full border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/50 transition-all text-left">
                <Mail className="w-6 h-6 text-primary" />
                <div><p className="text-sm font-semibold text-foreground">Email a code</p><p className="text-xs text-muted-foreground">6-digit code to your inbox</p></div>
              </button>
            </motion.div>
          ) : method === 'pin' ? (
            <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <input
                type="password" inputMode="numeric" maxLength={4} autoFocus
                value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-background border border-border rounded-lg py-3 outline-none focus:border-primary"
              />
              <button onClick={submitPin} disabled={pin.length !== 4 || busy}
                className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50">
                {busy ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : 'Verify'}
              </button>
              <button onClick={() => setMethod(null)} className="w-full text-xs text-muted-foreground hover:text-foreground">← Use another method</button>
            </motion.div>
          ) : method === 'email_otp' ? (
            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {!otpSent ? (
                <div className="text-center py-2"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /><p className="text-xs text-muted-foreground mt-2">Sending code...</p></div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground text-center">Code sent to {user?.email}</p>
                  <input type="text" inputMode="numeric" maxLength={6} autoFocus value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-2xl tracking-[0.4em] font-mono bg-background border border-border rounded-lg py-3 outline-none focus:border-primary"
                  />
                  <button onClick={verifyOtp} disabled={otp.length !== 6 || busy}
                    className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50">
                    {busy ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : 'Verify'}
                  </button>
                  <button onClick={sendOtp} disabled={busy} className="w-full text-xs text-muted-foreground hover:text-foreground">Resend code</button>
                </>
              )}
              <button onClick={() => setMethod(null)} className="w-full text-xs text-muted-foreground hover:text-foreground">← Use another method</button>
            </motion.div>
          ) : (
            <motion.div key="bio" className="text-center py-4">
              {isAuthenticating || busy ? <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /> : <Fingerprint className="w-8 h-8 text-primary mx-auto" />}
              <p className="text-xs text-muted-foreground mt-2">Use your device biometric...</p>
              <button onClick={() => setMethod(null)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">← Use another method</button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Wasn't you noticing something unusual? You can <button onClick={close} className="text-primary underline">cancel and dispute later</button>.
        </p>
      </motion.div>
    </div>
  );
};

export default RiskStepUpModal;
