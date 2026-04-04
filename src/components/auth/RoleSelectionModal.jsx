import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { motion, useAnimation } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const studentHover = useAnimation();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-dark-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-md rounded-3xl border border-ignite-400/20 bg-dark-900/85 p-6 shadow-2xl shadow-black/45 sm:p-8"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-ignite-300">Auth Portal</p>
        <h2 className="font-outfit text-2xl font-bold text-white sm:text-3xl">How would you like to continue?</h2>
        <p className="mt-3 text-sm leading-relaxed text-dark-300">
          Choose your portal to continue with a tailored onboarding flow.
        </p>

        <div className="mt-6 space-y-3">
          <motion.button
            type="button"
            onClick={() => onSelectRole('student')}
            onHoverStart={() => studentHover.start({ y: -2, scale: 1.01 })}
            onHoverEnd={() => studentHover.start({ y: 0, scale: 1 })}
            animate={studentHover}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="auth-role-btn"
          >
            <FiUser className="text-2xl text-ignite-200" aria-hidden="true" />
            <span>
              <strong className="block text-left text-base text-white">Student / Member</strong>
              <span className="block text-left text-xs tracking-wide text-dark-400">Community access and member spaces</span>
            </span>
          </motion.button>

          <div className="auth-role-btn auth-role-btn-admin opacity-60 cursor-not-allowed" aria-disabled="true">
            <span>
              <strong className="block text-left text-base text-white">Admin</strong>
              <span className="block text-left text-xs tracking-wide text-dark-400">Temporarily disabled, coming in next update</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/10 bg-dark-900 px-4 py-2.5 text-sm text-dark-300 transition-colors hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
