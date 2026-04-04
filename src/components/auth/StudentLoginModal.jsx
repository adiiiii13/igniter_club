import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';
import { appRedirectPath } from '../../utils/appUrl';

export default function StudentLoginModal({ isOpen, onClose, onLoginSuccess, onCreateAccount }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  const RATE_LIMIT_COOLDOWN = 3000;

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (!isOpen || !backdropRef.current || !panelRef.current) return;

    animate(backdropRef.current, {
      opacity: [0, 1],
      duration: 220,
    });

    animate(panelRef.current, {
      opacity: [0, 1],
      translateY: [18, 0],
      scale: [0.98, 1],
      duration: 300,
    });
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOAuthLogin = async (provider) => {
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_COOLDOWN) {
      setErrors({ submit: `Please wait ${Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastSubmitTime)) / 1000)}s before trying again` });
      return;
    }

    setLastSubmitTime(now);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${appRedirectPath('/student/oauth-setup')}?isSignup=false`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setErrors({ submit: err.message || `${provider} login failed. Please try again.` });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_COOLDOWN) {
      const remaining = Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
      setErrors({ submit: `Please wait ${remaining}s before trying again` });
      setCooldownRemaining(RATE_LIMIT_COOLDOWN - (now - lastSubmitTime));
      return;
    }

    setLastSubmitTime(now);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Login successful:', data.user);
        onLoginSuccess?.({ email, password });
        
        // Reset form and close modal
        setEmail('');
        setPassword('');
        setErrors({});
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ submit: err.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const query = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '';
    onClose();
    navigate(`/auth/change-password${query}`);
  };

  const handleCreateAccount = () => {
    onClose();
    onCreateAccount?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        ref={backdropRef}
        type="button"
        className="absolute inset-0 bg-dark-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-dark-900/95 p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-dark-400 hover:bg-white/5 hover:text-white transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-ignite-400 mb-2">Welcome back</p>
          <h2 className="text-2xl font-medium text-white">Sign in to your account</h2>
          <p className="mt-2 text-sm text-dark-400">Continue your journey with Igniter Club</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full rounded-lg border border-white/20 bg-dark-800/50 px-4 py-3 text-sm font-medium text-white hover:bg-dark-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <FcGoogle size={18} aria-hidden="true" />
                Sign in with Google
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading}
            className="w-full rounded-lg border border-white/20 bg-dark-800/50 px-4 py-3 text-sm font-medium text-white hover:bg-dark-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <FaGithub size={18} aria-hidden="true" className="text-white" />
                Sign in with GitHub
              </>
            )}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-900 text-dark-500">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-dark-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="you@gmit.edu.in"
                className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-4 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-dark-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-10 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-dark-400 hover:text-white"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-ignite-400 hover:text-ignite-300 transition"
            >
              Forgot password?
            </button>
          </div>

          {errors.submit && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || cooldownRemaining > 0}
            className="w-full rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition disabled:opacity-50"
          >
            {cooldownRemaining > 0 ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` : isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-400">
          Don't have an account?{' '}
          <button type="button" onClick={handleCreateAccount} className="text-ignite-400 hover:text-ignite-300 transition font-medium">
            Create one
          </button>
        </p>
      </motion.div>
    </div>
  );
}
