import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import { preloadAllFrames } from '../utils/framePreload';
import AnimatedWordmarkIntro from './AnimatedWordmarkIntro';

const INTRO_MIN_DURATION_MS = 3000;
const OUTRO_DURATION_MS = 1300;

const lineCharVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.52,
      delay: 0.14 + i * 0.028,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exiting: (custom) => {
    const [i, total] = custom;
    return {
    opacity: 0,
    y: -18,
    filter: 'blur(3px)',
    transition: {
      duration: 0.36,
      delay: (total - 1 - i) * 0.014,
      ease: [0.55, 0.085, 0.68, 0.53],
    },
    };
  },
};

function AnimatedTextLine({ text, className, isExiting, charClassName = '' }) {
  const chars = Array.from(text || '');
  const total = chars.length;

  return (
    <p className={className}>
      {chars.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className={`inline-block ${charClassName}`.trim()}
          variants={lineCharVariants}
          initial="hidden"
          animate={isExiting ? 'exiting' : 'visible'}
          custom={isExiting ? [index, total] : index}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </p>
  );
}

export default function IntroOverlay({ onDone, introText = 'Igniting Innovation', introSubText = '', isAdmin = false }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const shouldShowWordmark = !introSubText;

  useEffect(() => {
    let active = true;
    const start = Date.now();

    const run = async () => {
      await preloadAllFrames((p) => {
        if (active) setProgress(p);
      });

      const elapsed = Date.now() - start;
      const waitMore = Math.max(INTRO_MIN_DURATION_MS - elapsed, 0);
      if (waitMore > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMore));
      }

      if (active) {
        setIsExiting(true);
        await new Promise((resolve) => setTimeout(resolve, OUTRO_DURATION_MS));
      }

      if (active) onDone();
    };

    run();

    return () => {
      active = false;
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] bg-dark-950 flex items-center justify-center px-6"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-ignite-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute inset-0 noise-overlay" />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex flex-col items-center">
          <AnimatedTextLine
            text={introText}
            className={`order-1 font-outfit text-xl sm:text-2xl lg:text-3xl font-semibold uppercase tracking-[0.12em] ${
              isAdmin ? 'text-ignite-300' : 'text-ignite-200'
            }`}
            isExiting={isExiting}
          />

          {introSubText && (
            <AnimatedTextLine
              text={introSubText}
              className="order-2 mt-2 font-outfit text-3xl sm:text-5xl lg:text-6xl font-bold tracking-wide leading-tight"
              charClassName={
                isAdmin
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-ignite-400 via-rose-300 to-ignite-200'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-ignite-300 via-rose-300 to-ignite-200'
              }
              isExiting={isExiting}
            />
          )}

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="order-3 mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-ignite-500/40 bg-ignite-500/10 text-ignite-300 text-xs font-semibold tracking-widest uppercase shadow-lg shadow-ignite-500/10"
            >
              <FiShield className="text-ignite-400" />
              <span>Verified Administrator</span>
            </motion.div>
          )}
        </div>

        {shouldShowWordmark && <AnimatedWordmarkIntro isExiting={isExiting} />}

        <motion.div
          className="mt-10 w-64 sm:w-80 mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={isExiting ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <div className="relative h-1.5 rounded-full bg-dark-800 overflow-hidden">
            <motion.div
              className={`absolute top-0 left-0 h-full rounded-full ${
                isAdmin
                  ? 'bg-gradient-to-r from-ignite-700 via-ignite-500 to-rose-400'
                  : 'bg-gradient-to-r from-ignite-600 via-ignite-500 to-rose-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-inter mt-3 text-xs tracking-[0.2em] uppercase text-dark-400">
            {isAdmin ? `Loading dashboard ${progress}%` : `Loading background ${progress}%`}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
