import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff, AlertTriangle, Fingerprint } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLoginSecurity } from '@/hooks/useLoginSecurity';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BIOMETRIC_EMAIL_KEY = 'fraudguard_biometric_email';
const BIOMETRIC_ENABLED_KEY = 'fraudguard_biometric_enabled';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { isLockedOut, remainingTime, attemptsLeft, recordFailedAttempt, resetAttempts, checkLockout } = useLoginSecurity();
  const { biometricSupport, isAuthenticating, authenticate } = useBiometricAuth();
  const [countdown, setCountdown] = useState(remainingTime);

  const storedEmail = localStorage.getItem(BIOMETRIC_EMAIL_KEY);
  const biometricEnabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
  const canUseBiometricLogin = biometricEnabled && !!storedEmail && biometricSupport === 'supported';

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLockedOut) { setCountdown(0); return; }
    setCountdown(remainingTime);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          checkLockout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLockedOut, remainingTime, checkLockout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkLockout()) {
      toast.error('Account temporarily locked. Please wait.');
      return;
    }
    if (!email || !password || (!isLogin && !fullName)) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        resetAttempts();
        // Store email for biometric login if biometric is supported
        if (biometricSupport === 'supported') {
          localStorage.setItem(BIOMETRIC_EMAIL_KEY, email);
          localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        }
        toast.success('Welcome back!');
      } else {
        await signUp(email, password, fullName);
        toast.success('Account created! Please check your email to verify your account.');
      }
      navigate('/portal');
    } catch (err: any) {
      if (isLogin) {
        const locked = recordFailedAttempt();
        if (locked) {
          toast.error('Too many failed attempts. Account locked for 5 minutes.');
        } else {
          toast.error(`${err.message || 'Invalid credentials'}. ${attemptsLeft - 1} attempts remaining.`);
        }
      } else {
        toast.error(err.message || 'Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!storedEmail) return;
    setLoading(true);
    try {
      const verified = await authenticate();
      if (!verified) {
        toast.error('Biometric verification failed. Please sign in with your password.');
        setLoading(false);
        return;
      }
      // Try to restore the existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        resetAttempts();
        toast.success('Welcome back!');
        navigate('/portal');
        return;
      }
      // Try to refresh the session
      const { data: refreshData } = await supabase.auth.refreshSession();
      if (refreshData.session) {
        resetAttempts();
        toast.success('Welcome back!');
        navigate('/portal');
        return;
      }
      // Session fully expired — ask for password
      setEmail(storedEmail);
      toast.info('Session expired. Please enter your password to continue.');
    } catch {
      toast.error('Biometric login failed. Please sign in with your password.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FraudGuard</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
            Secure Your
            <span className="text-gradient"> Digital Banking</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            AI-powered fraud detection protecting your mobile banking transactions in real-time. 
            Monitor, report, and stay safe with our intelligent security platform.
          </p>
          <div className="flex items-center gap-8 mt-12">
            {[
              { value: '98.7%', label: 'Accuracy' },
              { value: '<50ms', label: 'Response' },
              { value: '24/7', label: 'Monitoring' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-gradient font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FraudGuard</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isLogin ? 'Sign in to access your security portal' : 'Get started with FraudGuard protection'}
          </p>

          {/* Lockout warning */}
          {isLockedOut && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Account Temporarily Locked</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Too many failed login attempts. Try again in <strong className="text-foreground font-mono">{formatTime(countdown)}</strong>
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Attempts warning */}
            {isLogin && !isLockedOut && attemptsLeft < 5 && attemptsLeft > 0 && (
              <p className="text-xs text-warning flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {attemptsLeft} login attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
              </p>
            )}

            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {/* Biometric login button (login mode only) */}
            {isLogin && canUseBiometricLogin && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading || isAuthenticating || isLockedOut}
                  className="w-full border border-border rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-secondary transition-all disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><Fingerprint className="w-4 h-4 text-primary" /> Sign in with Biometrics</>
                  )}
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Continuing as <span className="text-foreground font-medium">{storedEmail}</span>
                </p>
              </div>
            )}
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
