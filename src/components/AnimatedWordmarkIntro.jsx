import { motion } from 'framer-motion';

const WORDMARK = 'IGNITER CLUB × GMIT';
const GRADIENT_START_INDEX = WORDMARK.indexOf('×');
const TOTAL_CHARS = WORDMARK.length;

const charVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      delay: 0.24 + i * 0.045,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exiting: (i) => ({
    opacity: 0,
    y: -24,
    filter: 'blur(3px)',
    transition: {
      duration: 0.4,
      delay: (TOTAL_CHARS - 1 - i) * 0.02,
      ease: [0.55, 0.085, 0.68, 0.53],
    },
  }),
};

export default function AnimatedWordmarkIntro({ isExiting = false }) {
  return (
    <h1 className="font-outfit font-black tracking-tight whitespace-nowrap leading-none text-[clamp(1.35rem,5.9vw,6rem)]">
      {WORDMARK.split('').map((char, index) => {
        const isGradientChar = index >= GRADIENT_START_INDEX;

        return (
          <motion.span
            key={`${char}-${index}`}
            className={`inline-block ${isGradientChar ? 'text-gradient' : 'text-white'}`}
            variants={charVariants}
            initial="hidden"
            animate={isExiting ? 'exiting' : 'visible'}
            custom={index}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </h1>
  );
}
