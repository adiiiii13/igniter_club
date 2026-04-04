import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { appRedirectPath } from '../utils/appUrl';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const prefilledEmail = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  }, []);

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  useEffect(() => {
    const bootstrapRecoverySession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const authCode = params.get('code');

        if (authCode) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
          if (exchangeError) throw exchangeError;
          if (data?.user) {
            setIsRecoverySession(true);
            return;
          }
        }

        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
          const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError) throw setSessionError;
          if (sessionData?.user) {
            setIsRecoverySession(true);
            return;
          }
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setIsRecoverySession(true);
        }
      } catch (err) {
        console.error('Recovery bootstrap failed:', err);
      }
    };

    bootstrapRecoverySession();
  }, []);

  const handleSendReset = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email is required.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: appRedirectPath('/auth/change-password'),
      });
      if (resetError) throw resetError;
      setStatus('Password reset email sent. Open the link in your inbox to set a new password.');
    } catch (err) {
      console.error('Send reset email failed:', err);
      setError(err.message || 'Could not send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!newPassword || newPassword.length < 6 || !/\d/.test(newPassword)) {
      setError('Password must be at least 6 characters and include at least one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData?.user;
      if (!user) throw new Error('No authenticated recovery session found. Please use the latest reset link.');

      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, auth_provider, password_changed_at')
        .eq('id', user.id)
        .single();

      if (studentError) throw studentError;
      if (!student) throw new Error('Student profile not found.');

      if (student.auth_provider !== 'manual') {
        throw new Error('Password change is only available for manual signup accounts.');
      }

      if (student.password_changed_at) {
        const lastChangedAtMs = new Date(student.password_changed_at).getTime();
        const elapsed = Date.now() - lastChangedAtMs;
        if (elapsed < FIVE_MINUTES_MS) {
          const remainingSeconds = Math.ceil((FIVE_MINUTES_MS - elapsed) / 1000);
          throw new Error(`Please wait ${remainingSeconds}s before changing password again.`);
        }
      }

      const { error: updateAuthError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateAuthError) throw updateAuthError;

      const { error: updateStudentError } = await supabase
        .from('students')
        .update({
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (updateStudentError) throw updateStudentError;

      setStatus('Password updated successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1200);
    } catch (err) {
      console.error('Update password failed:', err);
      setError(err.message || 'Could not update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-dark-900/95 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-white">Change Password</h1>
        <p className="mt-2 text-sm text-dark-400">
          {isRecoverySession
            ? 'Set a new password for your manual account.'
            : 'Enter your email to receive a password reset link.'}
        </p>

        {!isRecoverySession ? (
          <form className="mt-6 space-y-4" onSubmit={handleSendReset}>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition"
                placeholder="you@gmit.edu.in"
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {status && <p className="text-sm text-emerald-300">{status}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition disabled:opacity-60"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleUpdatePassword}>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-white mb-2">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition"
                placeholder="At least 6 characters, 1 number"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition"
                placeholder="Re-enter your new password"
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {status && <p className="text-sm text-emerald-300">{status}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition disabled:opacity-60"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
