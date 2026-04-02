import { useState, useEffect, useCallback } from 'react';

type BiometricSupport = 'supported' | 'unsupported' | 'checking';

export const useBiometricAuth = () => {
  const [biometricSupport, setBiometricSupport] = useState<BiometricSupport>('checking');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      if (!window.PublicKeyCredential) {
        setBiometricSupport('unsupported');
        return;
      }
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricSupport(available ? 'supported' : 'unsupported');
    } catch {
      setBiometricSupport('unsupported');
    }
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (biometricSupport !== 'supported') return false;
    setIsAuthenticating(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'FraudGuard', id: window.location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'fraudguard-user',
            displayName: 'FraudGuard User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      });
      return !!credential;
    } catch {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [biometricSupport]);

  return { biometricSupport, isAuthenticating, authenticate };
};
