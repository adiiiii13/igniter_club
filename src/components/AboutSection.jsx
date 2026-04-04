import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiTarget, FiTool, FiAward } from 'react-icons/fi';
import AnimatedIcon from './AnimatedIcon';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-ignite-600/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-ignite-500/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
        >
          <span className="inline-block font-inter text-xs tracking-[0.3em] uppercase text-ignite-400 mb-4">
            Chapter One
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            Where The Story <span className="text-gradient">Began</span>
          </h2>
          <div className="section-divider mx-auto" />
        </motion.div>

        {/* Content */}
        <div className="flex justify-center">
          {/* Text content */}
          <motion.div
            className="w-full max-w-3xl"
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.15}
          >
            <div className="glass rounded-2xl p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ignite-500 to-ignite-700 flex items-center justify-center">
                  <AnimatedIcon>
                    <FiTool size={20} className="text-white" />
                  </AnimatedIcon>
                </div>
                <h3 className="font-outfit font-semibold text-xl text-white">
                  The Origin
                </h3>
              </div>
              <motion.p 
                className="font-inter text-dark-300 leading-relaxed mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                The idea of building a student-led tech community started taking shape in 2024 through planning, pitching, and learning what it takes to run a club from scratch. That early effort became Codecaffeine, our campus's first tech club built from the ground up.
              </motion.p>
              <motion.p 
                className="font-inter text-dark-300 leading-relaxed mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                Like many ambitious first attempts, it faced challenges, but the drive returned in March 2026 with selection into Unstop's Igniter program. Today, with stronger institutional backing, the club has relaunched with renewed momentum, turning a past setback into a sustainable comeback.
              </motion.p>
              <div className="flex flex-wrap gap-3">
                {['Community Built', 'Resilience', 'Unstop Igniter', 'Comeback', 'Momentum'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-inter font-medium text-ignite-300 bg-ignite-500/10 border border-ignite-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
