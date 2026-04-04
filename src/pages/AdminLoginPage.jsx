import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiMail, FiShield } from 'react-icons/fi';

export default function AdminLoginPage() {
  const rootRef = useRef(null);
  const adminCtaHover = useAnimation();

  useEffect(() => {
    if (!rootRef.current) return;

    const items = rootRef.current.querySelectorAll('[data-admin-enter]');

    animate(items, {
      opacity: [0, 1],
      translateX: [-16, 0],
      translateY: [10, 0],
      duration: 420,
      delay: stagger(80),
    });
  }, []);

  return (
    <main ref={rootRef} className="auth-page auth-page-admin" data-route-item>
      <div className="admin-scanline" aria-hidden="true" />
      <section className="auth-card auth-card-admin">
        <Link to="/home" className="auth-back-link" data-admin-enter>
          <FiArrowLeft aria-hidden="true" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/40 text-amber-300" data-admin-enter>
          <FiShield aria-hidden="true" />
        </div>
        <p className="auth-wordmark auth-wordmark-admin" data-admin-enter>Igniter Control</p>
        <h1 className="auth-title" data-admin-enter>Restricted Access</h1>
        <p className="auth-subtitle" data-admin-enter>Admin panel credentials required.</p>

        <form className="space-y-4" data-admin-enter>
          <div className="auth-field">
            <label className="auth-label auth-label-admin" htmlFor="admin-email">Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-chip" aria-hidden="true">
                <FiMail className="auth-input-leading-icon" aria-hidden="true" />
              </span>
              <input id="admin-email" type="email" required className="auth-input auth-input-admin auth-input-with-icon" placeholder="admin@ignite.club" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label auth-label-admin" htmlFor="admin-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-chip" aria-hidden="true">
                <FiLock className="auth-input-leading-icon" aria-hidden="true" />
              </span>
              <input id="admin-password" type="password" required className="auth-input auth-input-admin auth-input-with-icon" placeholder="Enter secure credential" />
            </div>
          </div>

          <motion.button
            type="submit"
            className="admin-cta-btn w-full"
            onHoverStart={() => adminCtaHover.start({ y: -2, scale: 1.01 })}
            onHoverEnd={() => adminCtaHover.start({ y: 0, scale: 1 })}
            animate={adminCtaHover}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            Enter Admin Panel
          </motion.button>
        </form>
      </section>
    </main>
  );
}
