import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function VerifySignupPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const finalizeSignup = async () => {
      try {
        let sessionUser = null;

        const searchParams = new URLSearchParams(window.location.search);
        const authCode = searchParams.get('code');

        if (authCode) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
          if (exchangeError) throw exchangeError;
          sessionUser = exchangeData?.user || null;
        }

        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!sessionUser && accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          sessionUser = sessionData?.user || null;
        }

        if (!sessionUser) {
          const { data: currentSession } = await supabase.auth.getSession();
          sessionUser = currentSession?.session?.user || null;
        }

        if (!sessionUser) {
          throw new Error('Verification session not found. Please open the latest verification link again.');
        }

        const fullName = sessionUser.user_metadata?.full_name || '';
        const collegeId = (sessionUser.user_metadata?.college_id || '').trim().toUpperCase();
        const authProvider = sessionUser.user_metadata?.auth_provider || 'manual';
        const email = sessionUser.email || '';

        if (!collegeId) {
          throw new Error('Verification succeeded, but college ID data is missing. Please sign up again.');
        }

        const { data: existingStudent } = await supabase
          .from('students')
          .select('id, is_profile_complete')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (!existingStudent) {
          const { error: insertError } = await supabase
            .from('students')
            .insert([
              {
                id: sessionUser.id,
                email,
                full_name: fullName,
                college_id: collegeId,
                account_status: 'pending_profile',
                auth_provider: authProvider,
                college_id_last_changed_at: new Date().toISOString(),
                password_changed_at: new Date().toISOString(),
                is_profile_complete: false,
                created_at: new Date().toISOString(),
              },
            ]);
          if (insertError) throw insertError;
        }

        setStatus('Email verified. Redirecting to profile setup...');
        navigate('/student/complete-profile', { replace: true });
      } catch (err) {
        console.error('Email verification finalization failed:', err);
        if (err?.code === '23505' && /college_id/i.test(err?.message || '')) {
          setError('This GMIT College ID is already linked to another account. Use a different GMIT ID.');
        } else {
          setError(err.message || 'Verification failed. Please try signing up again.');
        }
      }
    };

    finalizeSignup();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-dark-900/95 p-6 sm:p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Email Verification</h1>
        {!error ? (
          <p className="mt-3 text-sm text-dark-300">{status}</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/home', { replace: true })}
              className="mt-5 rounded-lg bg-ignite-400 px-4 py-2 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </main>
  );
}
