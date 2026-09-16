import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiMail, FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';
import { appRedirectPath } from '../../utils/appUrl';

const STEPS = ['Profile Info', 'College ID', 'Password'];

export default function StudentSignupModal({ isOpen, onClose, onSignupSuccess, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
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

  const RATE_LIMIT_COOLDOWN = 3000;

  // Check if a user is already logged in on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const checkAuthStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted && user) {
          setLoggedInUser(user);
        } else if (isMounted) {
          setLoggedInUser(null);
        }
      } catch (err) {
        console.error('Check auth error in signup modal:', err);
      }
    };

    checkAuthStatus();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleOAuthSignup = async (provider) => {
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_COOLDOWN) {
      setErrors({ submit: `Please wait ${Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastSubmitTime)) / 1000)}s before trying again` });
      return;
    }

    setLastSubmitTime(now);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
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
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    }

    if (step === 1) {
      if (!formData.collegeId.trim()) newErrors.collegeId = 'College ID required';
      else if (!/^GMIT\/\d{4}\/\d{4}$/.test(formData.collegeId.trim().toUpperCase())) {
        newErrors.collegeId = 'Invalid format. Use GMIT/0000/0000';
      }
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = 'Password required';
      else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
      else if (!/\d/.test(formData.password)) newErrors.password = 'Must contain at least one number';
      else if (!/[a-zA-Z]/.test(formData.password)) newErrors.password = 'Must contain at least one letter';

      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password';
      else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // Early check on Step 0: Detect if the entered email is already registered
    if (step === 0) {
      setIsLoading(true);
      try {
        const normalizedEmail = formData.email.trim().toLowerCase();
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id, full_name, college_id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (existingStudent) {
          setErrors({
            email: 'An account with this email already exists.',
            existingAccount: true,
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Email check error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    } else {
      setShowEmailSignup(false);
      setStep(0);
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.existingAccount) {
      setErrors((prev) => ({ ...prev, [name]: '', existingAccount: false, submit: '' }));
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

      // Check if college ID is linked to another student
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
      const { data: authData, error: signupError } = await supabase.auth.signUp({
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

      if (signupError) {
        if (/already registered|already exists|unique/i.test(signupError.message)) {
          setErrors({
            submit: 'An account with this email already exists. Please log in.',
            existingAccount: true,
          });
          return;
        }
        throw signupError;
      }

      // If user already exists, Supabase returns identities as empty list
      if (authData?.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        setErrors({
          submit: 'An account with this email is already registered. Please log in.',
          existingAccount: true,
        });
        return;
      }

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

  const handleSignOutActiveUser = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setLoggedInUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = (prefilledEmail = '') => {
    onClose();
    onSwitchToLogin?.(prefilledEmail || formData.email);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0 bg-dark-950/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-dark-900/95 p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-dark-400 hover:bg-white/5 hover:text-white transition active:scale-95"
            >
              ✕
            </button>

            {/* If user is already logged in, offer quick access to dashboard */}
            {loggedInUser ? (
              <div className="space-y-6 text-center py-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl mb-1">
                  <FiCheckCircle />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Already Logged In</h2>
                  <p className="text-sm text-dark-300 mt-1">
                    You are currently signed in as:
                  </p>
                  <p className="text-sm font-medium text-ignite-300 mt-0.5">
                    {loggedInUser.user_metadata?.full_name || loggedInUser.email}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/student/home');
                    }}
                    className="w-full rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Go to Student Dashboard
                    <FiArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOutActiveUser}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-dark-300 hover:bg-white/5 hover:text-white transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? 'Signing out...' : 'Sign out to switch account'}
                  </button>
                </div>
              </div>
            ) : !showEmailSignup ? (
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
                    className="w-full rounded-lg border border-white/20 bg-dark-800/50 px-4 py-3 text-sm font-medium text-white hover:bg-dark-800 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
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
                  className="w-full rounded-lg border border-ignite-400/50 bg-ignite-400/10 px-4 py-2.5 text-sm font-medium text-ignite-300 hover:bg-ignite-400/20 transition active:scale-[0.98]"
                >
                  Sign up with Email
                </button>

                <p className="text-center text-xs text-dark-500">
                  OAuth users connect directly with your college or personal Google account
                </p>

                <div className="pt-4 border-t border-white/10 text-center">
                  <span className="text-xs text-dark-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchToLogin()}
                    className="text-xs font-semibold text-ignite-300 hover:text-ignite-200 transition underline-offset-4 hover:underline active:scale-95"
                  >
                    Log In
                  </button>
                </div>
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
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          idx <= step ? 'bg-ignite-400' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
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

                        {/* Existing account prompt */}
                        {errors.existingAccount && (
                          <div className="mt-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <FiAlertCircle className="text-amber-400 shrink-0" size={16} />
                              <span>This email already has an account registered.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSwitchToLogin(formData.email)}
                              className="w-full py-2 px-3 rounded-lg bg-amber-400 font-semibold text-dark-950 hover:bg-amber-300 transition text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                              Log in with this email
                              <FiArrowRight size={14} />
                            </button>
                          </div>
                        )}
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
                          placeholder="GMIT/2024/0001"
                          className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition font-mono uppercase"
                        />
                        {errors.collegeId && <p className="text-xs text-red-400 mt-1">{errors.collegeId}</p>}
                        <p className="text-xs text-dark-400 mt-1">Format: GMIT/YYYY/XXXX</p>
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
                            className="absolute right-3 top-3 text-dark-400 hover:text-white transition active:scale-90"
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
                            className="absolute right-3 top-3 text-dark-400 hover:text-white transition active:scale-90"
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
                      {errors.existingAccount && (
                        <button
                          type="button"
                          onClick={() => handleSwitchToLogin(formData.email)}
                          className="mt-2 w-full py-1.5 rounded-md bg-red-400 font-semibold text-dark-950 hover:bg-red-300 transition text-xs"
                        >
                          Log in to your account
                        </button>
                      )}
                    </div>
                  )}

                  {emailLinkSent && (
                    <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      Verification email sent. Check your inbox and click the link to verify. You can close this window and log in after verification.
                    </div>
                  )}
                </motion.div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={emailLinkSent ? onClose : handleBack}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-dark-300 hover:bg-white/5 hover:text-white transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <FiArrowLeft className="inline mr-2" size={16} />
                    {emailLinkSent ? 'Close' : 'Back'}
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading || cooldownRemaining > 0 || emailLinkSent}
                    className="flex-1 rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailLinkSent ? (
                      <>Email Sent</>
                    ) : cooldownRemaining > 0 ? (
                      <>Wait {Math.ceil(cooldownRemaining / 1000)}s</>
                    ) : isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                        Checking...
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

                <div className="mt-4 pt-3 border-t border-white/10 text-center flex items-center justify-between text-xs text-dark-400">
                  <span>{STEPS[step]}</span>
                  <div>
                    <span>Already a member? </span>
                    <button
                      type="button"
                      onClick={() => handleSwitchToLogin()}
                      className="font-semibold text-ignite-300 hover:text-ignite-200 transition underline-offset-4 hover:underline active:scale-95"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
