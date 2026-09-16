import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { FiCheckCircle, FiLock } from 'react-icons/fi';
import { supabase } from '../utils/supabase';
import IntroOverlay from '../components/IntroOverlay';

export default function OAuthCollegeIdSetup() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const hasCloudinaryConfig = Boolean(cloudName && uploadPreset);
  const navigate = useNavigate();
  const location = useLocation();
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(true);
  const [isLoginIntroDone, setIsLoginIntroDone] = useState(false);
  const [loginDecision, setLoginDecision] = useState(null); // 'home' | 'require_college'
  const [loginIntroSubText, setLoginIntroSubText] = useState('Student');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const pageRef = useRef(null);

  const RATE_LIMIT_COOLDOWN = 3000;
  
  // Get isSignup from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const isSignupFlow = searchParams.get('isSignup') === 'true';

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const uploadRemoteAvatarToCloudinary = async (remoteImageUrl) => {
    if (!hasCloudinaryConfig || !remoteImageUrl) return remoteImageUrl;

    const body = new FormData();
    body.append('file', remoteImageUrl);
    body.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body,
    });
    const result = await response.json();

    if (!response.ok || !result?.secure_url) {
      throw new Error(result?.error?.message || 'Cloudinary avatar upload failed.');
    }

    return result.secure_url;
  };

  const syncOAuthAvatar = async (user) => {
    if (!user) return;

    const metadataAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
    if (!metadataAvatar || !/^https?:\/\//.test(metadataAvatar)) return;

    try {
      const avatarUrl = await uploadRemoteAvatarToCloudinary(metadataAvatar);
      await supabase
        .from('students')
        .update({
          avatar: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    } catch (err) {
      console.error('OAuth avatar sync failed:', err);
      // Keep login flow unblocked if avatar sync fails.
    }
  };

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      setIsCheckingAccount(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsCheckingAccount(false);
        navigate('/home');
        return;
      }

      setCurrentUser(user);
      setLoginIntroSubText((user.user_metadata?.full_name || '').trim() || 'Student');

      // Check if student already exists and has college_id (whether arriving from login or signup)
      const normalizedEmail = (user.email || '').trim().toLowerCase();
      const MAX_ATTEMPTS = 6;
      const RETRY_DELAY_MS = 350;
      let student = null;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        let { data, error } = await supabase
          .from('students')
          .select('id, college_id, avatar, full_name, is_profile_complete, email')
          .eq('id', user.id)
          .maybeSingle();

        // If not found by user.id, check by email in case of OAuth account linking
        if (!data && normalizedEmail) {
          const { data: byEmailData } = await supabase
            .from('students')
            .select('id, college_id, avatar, full_name, is_profile_complete, email')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (byEmailData) {
            data = byEmailData;
            // Align student record id if necessary
            if (byEmailData.id !== user.id) {
              await supabase
                .from('students')
                .update({ id: user.id })
                .eq('email', normalizedEmail);
            }
          }
        }

        if (error) {
          console.error('OAuth account check error:', error);
        }

        student = data || null;

        if (student?.full_name?.trim()) {
          setLoginIntroSubText(student.full_name.trim());
        }

        // If user already has a college ID, they are an existing user!
        if (student?.college_id) {
          if (!student?.avatar) {
            await syncOAuthAvatar(user);
          }
          setLoginDecision('home');
          setIsCheckingAccount(false);
          return;
        }

        await delay(RETRY_DELAY_MS);
      }

      // Only if no college ID exists do we require setting it up
      setLoginDecision('require_college');
      setIsCheckingAccount(false);
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (!isLoginIntroDone) return;
    if (isCheckingAccount) return;
    if (loginDecision !== 'home') return;

    navigate('/student/home', { replace: true });
  }, [isLoginIntroDone, isCheckingAccount, loginDecision, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Page animation
  useEffect(() => {
    if (pageRef.current) {
      animate(pageRef.current, {
        opacity: [0, 1],
        duration: 380,
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!collegeId.trim()) {
      newErrors.collegeId = 'College ID required';
    } else if (!/^GMIT\/\d{4}\/\d{4}$/.test(collegeId)) {
      newErrors.collegeId = 'Invalid format. Use GMIT/0000/0000';
    }

    if (isSignupFlow) {
      if (!password) newErrors.password = 'Password required';
      if (password.length < 6) newErrors.password = 'Minimum 6 characters';
      if (!/\d/.test(password)) newErrors.password = 'Must contain at least one number';
      if (!/[a-zA-Z]/.test(password)) newErrors.password = 'Must contain at least one letter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'collegeId') {
      setCollegeId(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Rate limiting
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
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const normalizedCollegeId = collegeId.trim().toUpperCase();

      const { data: collegeCollision, error: collegeCollisionError } = await supabase
        .from('students')
        .select('id')
        .eq('college_id', normalizedCollegeId)
        .neq('id', currentUser.id)
        .limit(1);

      if (collegeCollisionError) throw collegeCollisionError;
      if (collegeCollision && collegeCollision.length > 0) {
        throw new Error('This GMIT College ID is already linked to another account.');
      }

      // For signup, update auth password
      if (isSignupFlow && password) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: password,
        });
        if (pwError) throw pwError;
      }

      // Create or update student record with college ID
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id, is_profile_complete, account_status')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (existingStudent) {
        // Update existing student without resetting active completion
        const { error: updateError } = await supabase
          .from('students')
          .update({
            college_id: normalizedCollegeId,
            auth_provider: 'oauth',
            account_status: existingStudent.account_status || 'pending_profile',
            college_id_last_changed_at: new Date().toISOString(),
            is_profile_complete: existingStudent.is_profile_complete ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        await syncOAuthAvatar(currentUser);
      } else {
        // Create new student record
        const metadataAvatar = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '';
        let avatarUrl = metadataAvatar;
        if (metadataAvatar && hasCloudinaryConfig) {
          try {
            avatarUrl = await uploadRemoteAvatarToCloudinary(metadataAvatar);
          } catch (err) {
            console.error('Initial OAuth avatar upload failed:', err);
            avatarUrl = metadataAvatar;
          }
        }

        const { error: insertError } = await supabase
          .from('students')
          .insert([
            {
              id: currentUser.id,
              email: currentUser.email,
              full_name: currentUser.user_metadata?.full_name || '',
              college_id: normalizedCollegeId,
              avatar: avatarUrl,
              auth_provider: 'oauth',
              account_status: 'pending_profile',
              college_id_last_changed_at: new Date().toISOString(),
              is_profile_complete: false,
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;
      }

      console.log('College ID setup successful');
      setIsComplete(true);

      // Redirect based on flow
      setTimeout(() => {
        if (isSignupFlow) {
          navigate('/student/complete-profile');
        } else {
          navigate('/student/home');
        }
      }, 1500);
    } catch (err) {
      console.error('Setup error:', err);
      if (err?.code === '23505' && /college_id/i.test(err?.message || '')) {
        setErrors({ submit: 'This GMIT College ID is already linked to another account.' });
      } else {
        setErrors({ submit: err.message || 'Setup failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {loginDecision === 'home' && !isLoginIntroDone && (
        <IntroOverlay
          onDone={() => setIsLoginIntroDone(true)}
          introText="Welcome to Igniter Club X GMIT"
          introSubText={loginIntroSubText}
        />
      )}

      <div ref={pageRef} className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          className="rounded-2xl border border-white/10 bg-dark-900/95 p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ignite-400/20 text-2xl mb-3">
              🔐
            </div>
            <h1 className="text-2xl font-semibold text-white">
              {isSignupFlow ? 'College Verification' : 'Link College Account'}
            </h1>
            <p className="mt-2 text-sm text-dark-400">
              {isSignupFlow
                ? 'Enter your college ID to complete signup'
                : 'Enter your college ID to access your dashboard'}
            </p>
          </div>

          {isCheckingAccount || (loginDecision === 'home' && !isLoginIntroDone) ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-white/20 border-t-ignite-400 animate-spin" />
              <p className="text-sm text-dark-300">
                {loginDecision === 'home' ? 'Welcome back! Preparing your dashboard...' : 'Detecting your account...'}
              </p>
            </div>
          ) : loginDecision === 'home' ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-white/20 border-t-ignite-400 animate-spin" />
              <p className="text-sm text-dark-300">Finishing login...</p>
            </div>
          ) : !isComplete ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* College ID */}
              <div>
                <label htmlFor="collegeId" className="block text-sm font-medium text-white mb-2">
                  College ID <span className="text-red-400">*</span>
                </label>
                <input
                  id="collegeId"
                  name="collegeId"
                  type="text"
                  value={collegeId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition font-mono"
                />
                {errors.collegeId && <p className="text-xs text-red-400 mt-1">{errors.collegeId}</p>}
                <p className="text-xs text-dark-400 mt-2">
                  Format: GMIT/0000/0000
                </p>
              </div>

              {/* Password (only for signup) */}
              {isSignupFlow && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Set Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-dark-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handleChange}
                      placeholder="Min 6 chars, 1 number"
                      className="w-full rounded-lg border border-white/10 bg-dark-800 pl-10 pr-10 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-dark-400 hover:text-white"
                    >
                      {showPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                </div>
              )}

              {errors.submit && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || cooldownRemaining > 0}
                className="w-full mt-6 rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition disabled:opacity-50"
              >
                {cooldownRemaining > 0
                  ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s`
                  : isLoading
                  ? 'Setting up...'
                  : isSignupFlow
                  ? 'Complete Signup'
                  : 'Link Account'}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ignite-400/20 mb-4"
              >
                <FiCheckCircle size={32} className="text-ignite-400" />
              </motion.div>
              <h2 className="text-xl font-semibold text-white">
                {isSignupFlow ? 'Signup complete!' : 'Account linked!'}
              </h2>
              <p className="mt-2 text-sm text-dark-400">
                {isSignupFlow ? 'Now complete your profile...' : 'Redirecting to dashboard...'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
}
