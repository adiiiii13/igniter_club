import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { preloadAllFrames } from '../utils/framePreload';
import AnimatedWordmarkIntro from './AnimatedWordmarkIntro';

const INTRO_MIN_DURATION_MS = 1800;
const OUTRO_DURATION_MS = 950;

export default function IntroOverlay({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

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
        <motion.p
          className="font-inter text-xs sm:text-sm uppercase tracking-[0.35em] text-ignite-300 mb-6"
          initial={{ opacity: 0, y: 14 }}
          animate={isExiting ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Igniting Innovation
        </motion.p>

        <AnimatedWordmarkIntro isExiting={isExiting} />

        <motion.div
          className="mt-10 w-64 sm:w-80 mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={isExiting ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <div className="relative h-1.5 rounded-full bg-dark-800 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-ignite-600 via-ignite-500 to-rose-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-inter mt-3 text-xs tracking-[0.2em] uppercase text-dark-400">
            Loading background {progress}%
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
