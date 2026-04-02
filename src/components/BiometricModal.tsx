import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, KeyRound, ShieldCheck, AlertCircle, Loader2, Delete, X } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { toast } from 'sonner';

const PIN_KEY = 'fraudguard_pin';

interface BiometricModalProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

const BiometricModal = ({ open, onVerified, onCancel }: BiometricModalProps) => {
  const { biometricSupport, isAuthenticating, authenticate } = useBiometricAuth();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSuccess = () => {
    resetState();
    onVerified();
    toast.success('Identity verified — transaction authorized');
  };

  const resetState = () => {
    setShowPinSetup(false);
    setShowPinEntry(false);
    setPin('');
    setConfirmPin('');
    setIsSettingUp(false);
    setAttempts(0);
  };

  const handleBiometric = async () => {
    const success = await authenticate();
    if (success) {
      handleSuccess();
    } else {
      toast.error('Biometric verification failed');
      const hasPin = localStorage.getItem(PIN_KEY);
      hasPin ? setShowPinEntry(true) : (setIsSettingUp(true), setShowPinSetup(true));
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
            handleSuccess();
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
          handleSuccess();
        } else {
          setAttempts(prev => prev + 1);
          setPin('');
          if (attempts >= 2) {
            toast.error('Too many failed attempts.');
            resetState();
            onCancel();
          } else {
            toast.error(`Incorrect PIN. ${2 - attempts} attempts remaining.`);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (isSettingUp && pin.length === 4) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const startPinEntry = () => {
    const hasPin = localStorage.getItem(PIN_KEY);
    if (hasPin) {
      setShowPinEntry(true);
      setShowPinSetup(false);
      setIsSettingUp(false);
      setPin('');
    } else {
      setIsSettingUp(true);
      setShowPinSetup(true);
      setShowPinEntry(false);
      setPin('');
      setConfirmPin('');
    }
  };

  if (!open) return null;

  const currentPin = isSettingUp ? (pin.length === 4 ? confirmPin : pin) : pin;
  const pinLabel = isSettingUp
    ? pin.length < 4 ? 'Create a 4-digit PIN' : 'Confirm your PIN'
    : 'Enter your 4-digit PIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl relative"
      >
        <button onClick={() => { resetState(); onCancel(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Authorize Transaction</h2>
          <p className="text-xs text-muted-foreground mt-1">Verify your identity to proceed</p>
        </div>

        <AnimatePresence mode="wait">
          {!showPinSetup && !showPinEntry ? (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {biometricSupport === 'checking' ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : (
                <>
                  {biometricSupport === 'supported' && (
                    <button onClick={handleBiometric} disabled={isAuthenticating}
                      className="w-full border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-all">
                      {isAuthenticating ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Fingerprint className="w-8 h-8 text-primary" />}
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-sm">{isAuthenticating ? 'Verifying...' : 'Use Biometric'}</p>
                        <p className="text-xs text-muted-foreground">Face ID or Touch ID</p>
                      </div>
                    </button>
                  )}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">{biometricSupport === 'supported' ? 'or' : 'Biometric not available'}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <button onClick={startPinEntry}
                    className="w-full border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-all">
                    <KeyRound className="w-8 h-8 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-semibold text-foreground text-sm">Use PIN</p>
                      <p className="text-xs text-muted-foreground">4-digit PIN</p>
                    </div>
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <p className="text-sm font-medium text-foreground text-center">{pinLabel}</p>
              <div className="flex justify-center gap-4">
                {[0, 1, 2, 3].map(i => (
                  <motion.div key={i} animate={{ scale: i < currentPin.length ? 1.2 : 1 }}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${i < currentPin.length ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`} />
                ))}
              </div>
              {attempts > 0 && !isSettingUp && (
                <div className="flex justify-center gap-1.5 text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">{3 - attempts} attempts remaining</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                {['1','2','3','4','5','6','7','8','9','','0','del'].map(key => (
                  <button key={key || 'empty'}
                    onClick={() => key === 'del' ? handleDelete() : key ? handlePinDigit(key) : null}
                    disabled={!key}
                    className={`h-12 rounded-lg text-base font-semibold transition-all ${key === 'del' ? 'text-muted-foreground hover:text-foreground' : key ? 'text-foreground hover:bg-primary/10' : 'invisible'}`}>
                    {key === 'del' ? <Delete className="w-4 h-4 mx-auto" /> : key}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowPinSetup(false); setShowPinEntry(false); setIsSettingUp(false); setPin(''); setConfirmPin(''); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground text-center">← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BiometricModal;
