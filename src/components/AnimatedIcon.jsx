import { motion } from 'framer-motion';

export default function AnimatedIcon({ children, size = 24, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children}
    </motion.div>
  );
}
