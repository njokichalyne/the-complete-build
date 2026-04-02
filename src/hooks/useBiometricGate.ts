import { useState, useCallback } from 'react';

const VERIFIED_KEY = 'biometric_tx_verified';
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes for transactions

export const useBiometricGate = () => {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showGate, setShowGate] = useState(false);

  const isVerified = useCallback(() => {
    const ts = sessionStorage.getItem(VERIFIED_KEY);
    return !!(ts && Date.now() - parseInt(ts) < SESSION_DURATION);
  }, []);

  const markVerified = useCallback(() => {
    sessionStorage.setItem(VERIFIED_KEY, Date.now().toString());
  }, []);

  const requireVerification = useCallback((action: () => void) => {
    if (isVerified()) {
      action();
    } else {
      setPendingAction(() => action);
      setShowGate(true);
    }
  }, [isVerified]);

  const onVerified = useCallback(() => {
    markVerified();
    setShowGate(false);
    pendingAction?.();
    setPendingAction(null);
  }, [markVerified, pendingAction]);

  const onCancel = useCallback(() => {
    setShowGate(false);
    setPendingAction(null);
  }, []);

  return { showGate, requireVerification, onVerified, onCancel };
};
