import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, KeyRound, ShieldCheck, AlertCircle, Loader2, Delete } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { toast } from 'sonner';

const VERIFIED_KEY = 'biometric_verified';
const PIN_KEY = 'fraudguard_pin';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

interface BiometricGateProps {
  children: React.ReactNode;
}

const BiometricGate = ({ children }: BiometricGateProps) => {
  const { biometricSupport, isAuthenticating, authenticate } = useBiometricAuth();
  // Initialise synchronously from sessionStorage to avoid a flash of the gate UI
  const [verified, setVerified] = useState(() => {
    const ts = sessionStorage.getItem(VERIFIED_KEY);
    return !!(ts && Date.now() - parseInt(ts) < SESSION_DURATION);
  });
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const markVerified = () => {
    sessionStorage.setItem(VERIFIED_KEY, Date.now().toString());
    setVerified(true);
    toast.success('Identity verified successfully');
  };

  const handleBiometric = async () => {
    const success = await authenticate();
    if (success) {
      markVerified();
    } else {
      toast.error('Biometric verification failed');
      const hasPin = localStorage.getItem(PIN_KEY);
      if (hasPin) {
        setShowPinEntry(true);
      } else {
        setIsSettingUp(true);
        setShowPinSetup(true);
      }
    }
  };

  const handlePinDigit = (digit: string) => {
    if (isSettingUp) {
      if (confirmPin.length < 4 && pin.length === 4) {
        const next = confirmPin + digit;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === pin) {
            localStorage.setItem(PIN_KEY, btoa(next));
            markVerified();
            setShowPinSetup(false);
          } else {
            toast.error('PINs do not match. Try again.');
            setPin('');
            setConfirmPin('');
          }
        }
      } else if (pin.length < 4) {
        setPin(prev => prev + digit);
      }
    } else {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        const stored = atob(localStorage.getItem(PIN_KEY) || '');
        if (next === stored) {
          markVerified();
          setShowPinEntry(false);
        } else {
          setAttempts(prev => prev + 1);
          setPin('');
          if (attempts >= 2) {
            toast.error('Too many failed attempts. Please try biometric again.');
            setShowPinEntry(false);
            setAttempts(0);
          } else {
            toast.error(`Incorrect PIN. ${2 - attempts} attempts remaining.`);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (isSettingUp) {
      if (pin.length === 4) {
        setConfirmPin(prev => prev.slice(0, -1));
      } else {
        setPin(prev => prev.slice(0, -1));
      }
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const startPinSetup = () => {
    setIsSettingUp(true);
    setShowPinSetup(true);
    setShowPinEntry(false);
    setPin('');
    setConfirmPin('');
  };

  const startPinEntry = () => {
    const hasPin = localStorage.getItem(PIN_KEY);
    if (hasPin) {
      setShowPinEntry(true);
      setShowPinSetup(false);
      setIsSettingUp(false);
      setPin('');
    } else {
      startPinSetup();
    }
  };

  if (verified) return <>{children}</>;

  const currentPin = isSettingUp ? (pin.length === 4 ? confirmPin : pin) : pin;
  const pinLabel = isSettingUp
    ? pin.length < 4
      ? 'Create a 4-digit PIN'
      : 'Confirm your PIN'
    : 'Enter your 4-digit PIN';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Verify Your Identity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Secure access to your FraudGuard portal
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showPinSetup && !showPinEntry ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {biometricSupport === 'checking' ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {biometricSupport === 'supported' && (
                    <button
                      onClick={handleBiometric}
                      disabled={isAuthenticating}
                      className="w-full glass border border-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-primary/50 transition-all group"
                    >
                      {isAuthenticating ? (
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      ) : (
                        <Fingerprint className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {isAuthenticating ? 'Verifying...' : 'Use Biometric'}
                        </p>
                        <p className="text-xs text-muted-foreground">Face ID or Touch ID</p>
                      </div>
                    </button>
                  )}

                  <div className="relative flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {biometricSupport === 'supported' ? 'or' : 'Biometric not available'}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <button
                    onClick={startPinEntry}
                    className="w-full glass border border-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-primary/50 transition-all group"
                  >
                    <KeyRound className="w-10 h-10 text-accent-foreground group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Use PIN</p>
                      <p className="text-xs text-muted-foreground">Enter your 4-digit PIN</p>
                    </div>
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <p className="text-sm font-medium text-foreground text-center">{pinLabel}</p>

              {/* PIN dots */}
              <div className="flex items-center justify-center gap-4">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: i < currentPin.length ? 1.2 : 1 }}
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      i < currentPin.length
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/40 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {attempts > 0 && !isSettingUp && (
                <div className="flex items-center justify-center gap-1.5 text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">{3 - attempts} attempts remaining</span>
                </div>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(key => (
                  <button
                    key={key || 'empty'}
                    onClick={() => {
                      if (key === 'del') handleDelete();
                      else if (key) handlePinDigit(key);
                    }}
                    disabled={!key}
                    className={`h-14 rounded-xl text-lg font-semibold transition-all ${
                      key === 'del'
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        : key
                          ? 'text-foreground hover:bg-primary/10 active:bg-primary/20'
                          : ''
                    } ${!key ? 'invisible' : ''}`}
                  >
                    {key === 'del' ? <Delete className="w-5 h-5 mx-auto" /> : key}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowPinSetup(false);
                  setShowPinEntry(false);
                  setIsSettingUp(false);
                  setPin('');
                  setConfirmPin('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                ← Back to options
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BiometricGate;
