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

  const stats = [
    { value: '200+', label: 'Characters In The Story', icon: FiUsers },
    { value: '25+', label: 'Story Moments Hosted', icon: FiTarget },
    { value: '10+', label: 'Skill Arcs Unlocked', icon: FiTool },
    { value: '5+', label: 'Winning Chapters', icon: FiAward },
  ];

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

        {/* Content grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
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
                Igniter Club started as a late-evening conversation between students who wanted to build more than assignments. That single spark became a campus-wide community focused on real projects, real impact.
              </motion.p>
              <motion.p 
                className="font-inter text-dark-300 leading-relaxed mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                Today, every workshop, hackathon, and open build night adds another chapter to our story. Beginners find confidence, makers find collaborators, and teams turn ideas into things people can actually use.
              </motion.p>
              <div className="flex flex-wrap gap-3">
                {['AI/ML', 'Web Dev', 'Cybersecurity', 'Cloud', 'Open Source'].map((tag) => (
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

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.3}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass rounded-2xl p-6 sm:p-8 text-center group hover:border-ignite-500/30 transition-smooth"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                  <AnimatedIcon className="w-10 h-10">
                    <stat.icon size={32} className="text-ignite-400" />
                  </AnimatedIcon>
                </span>
                <span className="block font-outfit font-bold text-3xl sm:text-4xl text-gradient mb-1">
                  {stat.value}
                </span>
                <span className="font-inter text-sm text-dark-400">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
