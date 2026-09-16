import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiLock, FiMail, FiShield } from 'react-icons/fi';
import { supabase } from '../utils/supabase';

export default function AdminLoginPage() {
  const rootRef = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!rootRef.current) return;

    const items = rootRef.current.querySelectorAll('[data-admin-enter]');

    animate(items, {
      opacity: [0, 1],
      translateX: [-16, 0],
      translateY: [10, 0],
      duration: 380,
      delay: stagger(50),
    });
  }, []);

  // Check if already authenticated as admin
  useEffect(() => {
    const checkCurrentAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: adminRecord } = await supabase
          .from('admins')
          .select('role, full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (adminRecord) {
          setSuccess(`Welcome back, ${adminRecord.full_name || 'Admin'}! Redirecting...`);
          setTimeout(() => {
            navigate('/admin/dashboard?admin=1');
          }, 900);
        }
      } catch (err) {
        console.error('Admin status check failed:', err);
      }
    };

    checkCurrentAdmin();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) throw signInError;

      const user = data.user;
      if (!user) {
        throw new Error('Authentication failed. No user profile returned.');
      }

      // 2. Verify admin table authorization
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admins')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (adminErr) {
        console.error('Admin check query error:', adminErr);
      }

      if (!adminRecord) {
        await supabase.auth.signOut();
        throw new Error('Access denied: This account is not an authorized administrator.');
      }

      setSuccess(`Authorization verified (${adminRecord.role}). Entering panel...`);
      setTimeout(() => {
        navigate('/admin/dashboard?admin=1');
      }, 900);
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to authenticate. Check credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main ref={rootRef} className="auth-page auth-page-admin min-h-screen flex items-center justify-center p-4 relative" data-route-item>
      <div className="admin-scanline" aria-hidden="true" />
      
      <section className="auth-card auth-card-admin relative z-10 w-full max-w-md rounded-2xl border bg-dark-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        
        {/* Header navigation bar */}
        <div className="flex items-center justify-between mb-6" data-admin-enter>
          <Link to="/home" className="auth-back-link inline-flex items-center gap-2 text-xs text-dark-400 hover:text-white transition">
            <FiArrowLeft aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ignite-500/35 text-ignite-400 bg-ignite-500/10 shadow-md shadow-ignite-500/10">
            <FiShield className="text-base" aria-hidden="true" />
          </div>
        </div>

        {/* Title & info */}
        <p className="auth-wordmark auth-wordmark-admin text-xs uppercase tracking-widest text-ignite-400/80 font-mono font-semibold" data-admin-enter>
          Igniter Club
        </p>
        <h1 className="auth-title text-2xl sm:text-3xl font-bold text-white mt-1" data-admin-enter>
          Admin Portal
        </h1>
        <p className="auth-subtitle text-xs text-dark-400 mb-6" data-admin-enter>
          Sign in with your administrator credentials to access the dashboard.
        </p>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300" data-admin-enter>
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300" data-admin-enter>
            <FiCheckCircle className="text-base shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form: Email & Password only */}
        <form onSubmit={handleSubmit} className="space-y-5" data-admin-enter>
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2" htmlFor="admin-email">
              <FiMail className="text-ignite-400 text-sm" aria-hidden="true" />
              <span>Admin Email</span>
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-dark-950/80 px-4 py-3 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 focus:ring-2 focus:ring-ignite-500/20 transition-all"
              placeholder="noreplay.gkk26@gmail.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2" htmlFor="admin-password">
              <FiLock className="text-ignite-400 text-sm" aria-hidden="true" />
              <span>Password</span>
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-dark-950/80 px-4 py-3 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 focus:ring-2 focus:ring-ignite-500/20 transition-all"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-cta-btn w-full mt-2 flex items-center justify-center gap-2 cursor-pointer font-semibold uppercase tracking-wider text-xs py-3 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white shadow-lg shadow-ignite-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying Credentials...' : 'Enter Admin Panel'}
          </button>
        </form>
      </section>
    </main>
  );
}
