import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiMail, FiUser, FiLock } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';
import { appRedirectPath } from '../../utils/appUrl';

const STEPS = ['Profile Info', 'College ID', 'Password'];

export default function StudentSignupModal({ isOpen, onClose, onSignupSuccess }) {
  const [step, setStep] = useState(0);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    collegeId: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const stepRef = useRef(null);

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

  useEffect(() => {
    if (stepRef.current) {
      animate(stepRef.current, {
        opacity: [0.5, 1],
        translateY: [8, 0],
        duration: 240,
      });
    }
  }, [step]);

  const handleOAuthSignup = async (provider) => {
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
          redirectTo: `${appRedirectPath('/student/oauth-setup')}?isSignup=true`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error(`${provider} signup error:`, err);
      setErrors({ submit: err.message || `${provider} signup failed. Please try again.` });
      setIsLoading(false);
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
      if (!formData.email.trim()) newErrors.email = 'Email required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    }

    if (step === 1) {
      if (!formData.collegeId.trim()) newErrors.collegeId = 'College ID required';
      if (!/^GMIT\/\d{4}\/\d{4}$/.test(formData.collegeId)) {
        newErrors.collegeId = 'Invalid format. Use GMIT/0000/0000';
      }
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = 'Password required';
      if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
      if (!/\d/.test(formData.password)) newErrors.password = 'Must contain at least one number';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < STEPS.length - 1) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    } else {
      setShowEmailSignup(false);
      setStep(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
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
      const normalizedEmail = formData.email.trim().toLowerCase();
      const normalizedCollegeId = formData.collegeId.trim().toUpperCase();

      const { data: existingCollegeRows, error: existingCollegeError } = await supabase
        .from('students')
        .select('id')
        .eq('college_id', normalizedCollegeId)
        .limit(1);

      if (existingCollegeError) throw existingCollegeError;
      if (existingCollegeRows && existingCollegeRows.length > 0) {
        throw new Error('This GMIT College ID is already linked to another account.');
      }

      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const { error: signupError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: appRedirectPath('/auth/verify-signup'),
          data: {
            signup_flow: 'manual',
            auth_provider: 'manual',
            full_name: fullName,
            college_id: normalizedCollegeId,
          },
        },
      });

      if (signupError) throw signupError;

      setEmailLinkSent(true);
      setErrors({});
      onSignupSuccess?.({ email: normalizedEmail, pendingVerification: true });
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({ submit: err.message || 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
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

        {!showEmailSignup ? (
          // OAuth Signup Screen
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">Create your account</h2>
              <p className="text-sm text-dark-400">Join Igniter Club with one click</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuthSignup('google')}
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
                    Sign up with Google
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignup('github')}
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
                    Sign up with GitHub
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-900 text-dark-500">or</span>
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errors.submit}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowEmailSignup(true)}
              className="w-full rounded-lg border border-ignite-400/50 bg-ignite-400/10 px-4 py-2.5 text-sm font-medium text-ignite-300 hover:bg-ignite-400/20 transition"
            >
              Sign up with Email
            </button>

            <p className="text-center text-xs text-dark-500">
              OAuth users continue directly, email users verify first via magic link
            </p>
          </div>
        ) : (
          // Email Signup Flow
          <>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-ignite-400">Step {step + 1} of {STEPS.length}</p>
              <div className="mt-3 flex gap-2">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      idx <= step ? 'bg-ignite-400' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.div ref={stepRef} key={step} className="space-y-4">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-dark-400" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-4 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-dark-400" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-4 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 text-dark-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@gmit.edu.in"
                        className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-4 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="collegeId" className="block text-sm font-medium text-white mb-2">
                      College ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="collegeId"
                      name="collegeId"
                      type="text"
                      value={formData.collegeId}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition font-mono"
                    />
                    {errors.collegeId && <p className="text-xs text-red-400 mt-1">{errors.collegeId}</p>}
                  </div>

                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-3 text-dark-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 chars, 1 number"
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-3 text-dark-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-10 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-dark-400 hover:text-white"
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errors.submit}
                </div>
              )}

              {emailLinkSent && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  Email sent. Check your inbox and verify your account using the magic link. You can close this window now and log in after verification.
                </div>
              )}
            </motion.div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={emailLinkSent ? onClose : handleBack}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-dark-300 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
              >
                <FiArrowLeft className="inline mr-2" size={16} />
                {emailLinkSent ? 'Close' : 'Back'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading || cooldownRemaining > 0 || emailLinkSent}
                className="flex-1 rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {emailLinkSent ? (
                  <>Email Sent</>
                ) : cooldownRemaining > 0 ? (
                  <>Wait {Math.ceil(cooldownRemaining / 1000)}s</>
                ) : isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    {step === STEPS.length - 1 ? (
                      <>
                        Verify Email
                        <FiCheckCircle size={16} />
                      </>
                    ) : (
                      <>
                        Next
                        <FiArrowRight size={16} />
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-dark-500">{STEPS[step]}</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
