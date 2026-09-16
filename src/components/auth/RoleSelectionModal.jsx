import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiUser } from 'react-icons/fi';

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
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
            className="relative z-10 w-full max-w-md rounded-3xl border border-ignite-400/20 bg-dark-900/90 p-6 shadow-2xl shadow-black/45 sm:p-8"
          >
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-ignite-300">Auth Portal</p>
            <h2 className="font-outfit text-2xl font-bold text-white sm:text-3xl">How would you like to continue?</h2>
            <p className="mt-3 text-sm leading-relaxed text-dark-300">
              Choose your portal to continue with a tailored onboarding flow.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => onSelectRole('student')}
                className="auth-role-btn transition-transform active:scale-[0.98]"
              >
                <FiUser className="text-2xl text-ignite-200 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="block text-left text-base text-white">Student / Member</strong>
                  <span className="block text-left text-xs tracking-wide text-dark-400">Community access and member spaces</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('admin')}
                className="auth-role-btn auth-role-btn-admin transition-transform active:scale-[0.98]"
              >
                <FiShield className="text-2xl text-ignite-400 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="block text-left text-base text-white">Admin</strong>
                  <span className="block text-left text-xs tracking-wide text-ignite-300/80">Authorized club management & controls</span>
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-white/10 bg-dark-900/60 px-4 py-2.5 text-sm text-dark-300 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
