import { useState, useEffect, useCallback } from 'react';

type BiometricSupport = 'supported' | 'unsupported' | 'checking';

const CREDENTIAL_ID_KEY = 'fraudguard_credential_id';

const bufToBase64 = (buf: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));

const base64ToBuf = (b64: string): ArrayBuffer => {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return bytes.buffer as ArrayBuffer;
};

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
      const storedId = localStorage.getItem(CREDENTIAL_ID_KEY);

      if (storedId) {
        // Re-authenticate using the previously registered credential
        try {
          const credential = await navigator.credentials.get({
            publicKey: {
              challenge,
              rpId: window.location.hostname,
              allowCredentials: [{ type: 'public-key', id: base64ToBuf(storedId) }],
              userVerification: 'required',
              timeout: 60000,
            },
          });
          if (credential) return true;
        } catch {
          // Stored credential is no longer valid (e.g. different device/profile);
          // fall through to re-register below.
          localStorage.removeItem(CREDENTIAL_ID_KEY);
        }
      }

      // First-time registration or re-registration after credential loss
      const credential = (await navigator.credentials.create({
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
      })) as PublicKeyCredential | null;

      if (credential) {
        localStorage.setItem(CREDENTIAL_ID_KEY, bufToBase64(credential.rawId));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [biometricSupport]);

  return { biometricSupport, isAuthenticating, authenticate };
};
