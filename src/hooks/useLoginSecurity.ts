import { useState, useCallback } from 'react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_KEY = 'fraudguard_login_lockout';
const ATTEMPTS_KEY = 'fraudguard_login_attempts';

interface LoginSecurityState {
  isLockedOut: boolean;
  remainingTime: number;
  attemptsLeft: number;
}

export const useLoginSecurity = () => {
  const [state, setState] = useState<LoginSecurityState>(() => getInitialState());

  function getInitialState(): LoginSecurityState {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0');
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0');
    const now = Date.now();

    if (lockoutUntil > now) {
      return {
        isLockedOut: true,
        remainingTime: Math.ceil((lockoutUntil - now) / 1000),
        attemptsLeft: 0,
      };
    }

    // Clear expired lockout
    if (lockoutUntil > 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
    }

    return {
      isLockedOut: false,
      remainingTime: 0,
      attemptsLeft: MAX_ATTEMPTS - attempts,
    };
  }

  const recordFailedAttempt = useCallback(() => {
    const currentAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
    localStorage.setItem(ATTEMPTS_KEY, currentAttempts.toString());

    if (currentAttempts >= MAX_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION;
      localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
      setState({
        isLockedOut: true,
        remainingTime: Math.ceil(LOCKOUT_DURATION / 1000),
        attemptsLeft: 0,
      });
      return true; // locked out
    }

    setState({
      isLockedOut: false,
      remainingTime: 0,
      attemptsLeft: MAX_ATTEMPTS - currentAttempts,
    });
    return false;
  }, []);

  const resetAttempts = useCallback(() => {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    setState({ isLockedOut: false, remainingTime: 0, attemptsLeft: MAX_ATTEMPTS });
  }, []);

  const checkLockout = useCallback((): boolean => {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0');
    const now = Date.now();
    if (lockoutUntil > now) {
      setState(prev => ({
        ...prev,
        isLockedOut: true,
        remainingTime: Math.ceil((lockoutUntil - now) / 1000),
      }));
      return true;
    }
    if (lockoutUntil > 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      setState({ isLockedOut: false, remainingTime: 0, attemptsLeft: MAX_ATTEMPTS });
    }
    return false;
  }, []);

  return { ...state, recordFailedAttempt, resetAttempts, checkLockout };
};
