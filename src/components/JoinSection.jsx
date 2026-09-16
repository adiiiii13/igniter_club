import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FiX, FiLinkedin, FiGithub, FiMail, FiExternalLink, FiHeart, FiAward } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
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

export default function JoinSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [showModal, setShowModal] = useState(false);

  const founders = [
    {
      name: 'Aditya',
      role: 'Lead Organizer & Founder',
      dept: 'Computer Science & Engineering',
      college: 'GMIT (Gargi Memorial Institute of Technology)',
      avatar: '/founders/adi.png',
      quote: 'We started Igniter because students needed a launchpad where learning by shipping is the default culture, not an afterthought.',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      tags: ['Unstop Igniter Lead', 'Community Architect', 'Builder'],
    },
    {
      name: 'Payel',
      role: 'Co-Founder & Creative Lead',
      dept: 'Computer Science & Engineering',
      college: 'GMIT (Gargi Memorial Institute of Technology)',
      avatar: '/founders/payel.png',
      quote: 'Building Igniter has been about creating the space at GMIT where ambition meets opportunity — for every student who dares to build.',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      tags: ['Creative Direction', 'Community', 'Strategy'],
    },
    {
      name: 'DevFest Representative',
      role: 'Technical Co-Founder',
      dept: 'Computer Science & Engineering',
      college: 'GMIT (Gargi Memorial Institute of Technology)',
      avatar: '/founders/devfest.png',
      quote: 'From late-night hackathons to rebuilding stronger after every hurdle — this club is proof that student grit creates real impact.',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      tags: ['Google DevFest', 'Technical Lead', 'Developer'],
    },
  ];

  return (
    <section
      id="founders"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Invisible anchor for backward compatibility with #join */}
      <div id="join" className="sr-only" tabIndex={-1} aria-hidden="true" />

      {/* Subtle Background Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ignite-950/15 to-dark-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-ignite-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="glass rounded-3xl p-8 sm:p-14 lg:p-16 border border-white/10 relative overflow-hidden shadow-2xl text-center"
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
        >
          {/* Top subtle ambient highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-ignite-400 to-transparent" />

          {/* Sparkles Icon (Matching Reference Image) */}
          <motion.div
            className="flex justify-center items-center mb-8"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative inline-flex items-center justify-center">
              {/* Primary 4-point star sparkle */}
              <svg
                className="w-9 h-9 sm:w-11 sm:h-11 text-ignite-400 drop-shadow-[0_0_14px_rgba(244,63,94,0.6)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
              {/* Secondary offset sparkle */}
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 absolute -top-2.5 -right-3 animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>
          </motion.div>

          {/* Main Bold Quote */}
          <motion.h2
            className="font-outfit font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white tracking-tight leading-[1.18] max-w-3xl mx-auto mb-7"
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.2}
          >
            &ldquo;I was tired of walking into rooms that were not made for me.&rdquo;
          </motion.h2>

          {/* Emotional & Professional Note */}
          <motion.p
            className="font-inter text-dark-200/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.3}
          >
            The Igniter Club started because the rooms we wanted to be in did not exist yet. So we built one. It is messy, evolving, and exactly as loud and ambitious as it needs to be.
          </motion.p>

          {/* Overlapping Founder Profile Photos */}
          <motion.div
            className="flex justify-center items-center mb-9"
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.4}
          >
            <div
              className="flex items-center -space-x-4 cursor-pointer group"
              onClick={() => setShowModal(true)}
              title="Click to meet the founders"
            >
              <div className="relative z-30">
                <img
                  src="/founders/adi.png"
                  alt="Aditya — Lead Organizer & Founder"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-[3px] border-dark-900 shadow-xl ring-2 ring-white/10 group-hover:ring-ignite-500/60 group-hover:scale-105 group-hover:z-20 relative transition-all duration-300"
                />
              </div>
              <div className="relative z-20">
                <img
                  src="/founders/payel.png"
                  alt="Payel — Co-Founder & Creative Lead"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-[3px] border-dark-900 shadow-xl ring-2 ring-white/10 group-hover:ring-ignite-500/60 group-hover:scale-105 group-hover:z-20 relative transition-all duration-300"
                />
              </div>
              <div className="relative z-10">
                <img
                  src="/founders/devfest.png"
                  alt="Technical Co-Founder — Google DevFest"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-[3px] border-dark-900 shadow-xl ring-2 ring-white/10 group-hover:ring-ignite-500/60 group-hover:scale-105 group-hover:z-20 relative transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>

          {/* Action Button: MEET THE FOUNDERS */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.5}
          >
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-dark-900 hover:bg-dark-850 text-white font-outfit font-bold text-xs sm:text-sm tracking-[0.16em] uppercase border border-white/20 hover:border-ignite-500/60 shadow-xl hover:shadow-ignite-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              MEET THE FOUNDERS
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Meet the Founders Interactive Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-dark-950 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 overflow-hidden my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-inter font-medium text-ignite-400 bg-ignite-500/10 border border-ignite-500/20 mb-3">
                    <FiHeart className="w-3.5 h-3.5" />
                    <span>The Founding Team</span>
                  </div>
                  <h3 className="font-outfit font-bold text-2xl sm:text-3xl text-white">
                    The Minds Behind <span className="text-gradient">Igniter Club</span>
                  </h3>
                  <p className="font-inter text-sm text-dark-300 mt-1">
                    Students building the technology culture and innovation ecosystem at GMIT.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Founder Cards */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {founders.map((founder, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-dark-900/80 border border-white/10 flex flex-col justify-between hover:border-ignite-500/30 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={founder.avatar}
                          alt={founder.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-ignite-500/40 shadow-lg"
                        />
                        <div>
                          <h4 className="font-outfit font-bold text-lg text-white">
                            {founder.name}
                          </h4>
                          <p className="font-inter text-xs text-ignite-300 font-medium">
                            {founder.role}
                          </p>
                          <p className="font-inter text-[11px] text-dark-400 mt-0.5">
                            {founder.dept}
                          </p>
                        </div>
                      </div>

                      <p className="font-inter text-xs text-dark-300 italic leading-relaxed mb-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        &ldquo;{founder.quote}&rdquo;
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {founder.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-inter font-medium text-dark-300 bg-white/5 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-dark-400 text-xs font-inter">
                      <span>{founder.college}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-ignite-500/20 hover:text-white transition-colors"
                          aria-label="LinkedIn"
                        >
                          <FiLinkedin size={14} />
                        </a>
                        <a
                          href={founder.github}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-ignite-500/20 hover:text-white transition-colors"
                          aria-label="GitHub"
                        >
                          <FiGithub size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="p-4 rounded-xl bg-ignite-500/5 border border-ignite-500/20 flex items-center justify-between flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2.5 text-xs text-dark-300 font-inter">
                  <FiAward className="w-4 h-4 text-ignite-400 shrink-0" />
                  <span>Selected under Unstop Igniter Club Program • GMIT Campus</span>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-outfit font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
