import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiZap, FiCpu, FiCloud, FiGlobe, FiShield, FiMic } from 'react-icons/fi';
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

const events = [
  {
    title: 'HackIgnite 2026',
    date: 'Apr 12–13, 2026',
    type: 'Hackathon',
    description:
      '24-hour hackathon where teams compete to build innovative solutions. Cash prizes, mentors from top companies, and free swag!',
    icon: FiZap,
    color: 'from-ignite-500 to-rose-600',
    badge: 'Featured',
  },
  {
    title: 'AI Workshop Series',
    date: 'Apr 20, 2026',
    type: 'Workshop',
    description:
      'Hands-on deep dive into building production-ready AI applications with Large Language Models and modern ML frameworks.',
    icon: FiCpu,
    color: 'from-violet-500 to-purple-600',
    badge: 'New',
  },
  {
    title: 'Cloud Deploy Day',
    date: 'May 5, 2026',
    type: 'Workshop',
    description:
      'Learn to deploy containerized applications to the cloud using Docker, Kubernetes, and CI/CD pipelines from scratch.',
    icon: FiCloud,
    color: 'from-cyan-500 to-blue-600',
    badge: null,
  },
  {
    title: 'Open Source Sprint',
    date: 'May 15–16, 2026',
    type: 'Sprint',
    description:
      'Contribute to real open-source projects with guidance from experienced maintainers. Perfect for building your GitHub profile!',
    icon: FiGlobe,
    color: 'from-emerald-500 to-teal-600',
    badge: null,
  },
  {
    title: 'Cyber CTF Challenge',
    date: 'Jun 1, 2026',
    type: 'Competition',
    description:
      'Capture-the-flag cybersecurity competition testing web, binary, and crypto skills. Compete solo or in teams of three.',
    icon: FiShield,
    color: 'from-amber-500 to-orange-600',
    badge: 'Popular',
  },
  {
    title: 'Tech Talk: Future of Web',
    date: 'Jun 10, 2026',
    type: 'Talk',
    description:
      'Industry speakers share insights on WebAssembly, edge computing, and the next generation of web technologies.',
    icon: FiMic,
    color: 'from-pink-500 to-rose-600',
    badge: null,
  },
];

export default function EventsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="events"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-ignite-600/4 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-violet-600/4 rounded-full blur-[120px]" />

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
            Chapter Two And Beyond
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-6">
            The Next <span className="text-gradient">Story Beats</span>
          </h2>
          <div className="section-divider mx-auto" />
        </motion.div>

        {/* Events grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.title}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.1 + index * 0.08}
            >
              <motion.article
                className="glass rounded-2xl overflow-hidden h-full flex flex-col group cursor-pointer"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Card header gradient */}
                <div className={`h-1.5 bg-gradient-to-r ${event.color}`} />

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Top row: icon + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center text-xl shadow-lg`}>
                      <AnimatedIcon>
                        <event.icon size={24} className="text-white" />
                      </AnimatedIcon>
                    </div>
                    {event.badge && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-inter font-bold uppercase tracking-wider text-ignite-300 bg-ignite-500/15 border border-ignite-500/25">
                        {event.badge}
                      </span>
                    )}
                  </div>

                  {/* Event type + date */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-inter font-medium text-dark-400 uppercase tracking-wider">
                      {event.type}
                    </span>
                    <span className="w-1 h-1 bg-dark-600 rounded-full" />
                    <span className="text-xs font-inter text-dark-500">
                      {event.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-outfit font-semibold text-lg text-white mb-3 group-hover:text-ignite-300 transition-colors duration-300">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="font-inter text-sm text-dark-400 leading-relaxed flex-1">
                    {event.description}
                  </p>

                  {/* Footer link */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <span className="inline-flex items-center text-sm font-inter font-medium text-ignite-400 group-hover:text-ignite-300 transition-colors">
                      Read this chapter
                      <svg
                        className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
