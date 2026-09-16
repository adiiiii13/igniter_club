import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { FiArrowLeft, FiLock, FiMail } from 'react-icons/fi';
import { animateAuthEntry, navigateWithAnimeExit } from '../utils/authAnimations';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const loginHover = useAnimation();

  useEffect(() => {
    animateAuthEntry(rootRef.current);
  }, []);

  const handleGotoSignup = (event) => {
    event.preventDefault();
    navigateWithAnimeExit(navigate, '/auth/student/signup');
  };

  return (
    <main ref={rootRef} className="auth-page auth-page-student" data-route-item>
      <div className="auth-bg-glow" aria-hidden="true" />
      <section className="auth-card" data-auth-enter>
        <Link to="/home" className="auth-back-link" data-auth-enter>
          <FiArrowLeft aria-hidden="true" />
          <span>Back to Home</span>
        </Link>
        <Link to="/home" className="brand-lockup brand-lockup-auth mb-3 group" data-auth-enter aria-label="Go to home">
          <div className="brand-logo-shell brand-logo-auth">
            <img
              src="/GMITxIgnite-removebg-preview.png"
              alt="Igniter Club x GMIT Logo"
              className="brand-logo-img"
            />
          </div>

          <span className="brand-lockup-divider" aria-hidden="true" />

          <div className="brand-partner-shell">
            <img
              src="/gmit-jis-15years-dark.png"
              alt="GMIT 15 Years of Tomorrow | JIS Group"
              className="brand-partner-img"
            />
          </div>
        </Link>
        <h1 className="auth-title" data-auth-enter>Welcome back</h1>
        <p className="auth-subtitle" data-auth-enter>Continue your chapter with the club.</p>

        <form className="space-y-4" data-auth-enter>
          <div className="auth-field">
            <label className="auth-label" htmlFor="student-email">Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-chip" aria-hidden="true">
                <FiMail className="auth-input-leading-icon" aria-hidden="true" />
              </span>
              <input id="student-email" type="email" required className="auth-input auth-input-with-icon" placeholder="you@gmit.edu.in" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="student-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-chip" aria-hidden="true">
                <FiLock className="auth-input-leading-icon" aria-hidden="true" />
              </span>
              <input id="student-password" type="password" required className="auth-input auth-input-with-icon" placeholder="Enter your password" />
            </div>
          </div>

          <div className="pt-1 text-right">
            <a href="#" className="auth-inline-link">Forgot password?</a>
          </div>

          <motion.button
            type="submit"
            className="btn-ignite w-full px-8 py-3 text-sm"
            onHoverStart={() => loginHover.start({ y: -2, scale: 1.01 })}
            onHoverEnd={() => loginHover.start({ y: 0, scale: 1 })}
            animate={loginHover}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            Login
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-400" data-auth-enter>
          Not a member yet?{' '}
          <Link to="/auth/student/signup" onClick={handleGotoSignup} className="auth-inline-link">
            Sign Up
          </Link>
        </p>
      </section>
    </main>
  );
}
