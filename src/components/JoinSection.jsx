import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

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

export default function JoinSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [formData, setFormData] = useState({ name: '', email: '', branch: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', branch: '' });
  };

  return (
    <section
      id="join"
      ref={ref}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ignite-950/20 to-dark-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ignite-600/5 rounded-full blur-[200px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
        >
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-ignite-600 via-ignite-400 to-rose-500" />

          <div className="p-8 sm:p-12 lg:p-16">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ignite-500 to-ignite-700 text-3xl mb-6 shadow-lg shadow-ignite-500/20"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                🔥
              </motion.div>
              <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
                Ready to <span className="text-gradient">Ignite</span>?
              </h2>
              <p className="font-inter text-dark-300 max-w-lg mx-auto leading-relaxed">
                Join a community of 200+ passionate tech enthusiasts. No experience required —
                just bring your curiosity and we'll bring the fire.
              </p>
            </div>

            {/* Form */}
            {!submitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto space-y-5"
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                custom={0.2}
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                    placeholder="john@gmit.edu.in"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                    Branch / Year
                  </label>
                  <input
                    type="text"
                    id="branch"
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                    placeholder="CSE / 2nd Year"
                  />
                </div>

                <button type="submit" className="btn-ignite w-full text-base mt-2">
                  <span className="mr-2">🚀</span>
                  Join Igniter Club
                </button>

                <p className="text-center text-xs font-inter text-dark-600 mt-3">
                  Free to join · No spam · Unsubscribe anytime
                </p>
              </motion.form>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-outfit font-bold text-2xl text-white mb-2">
                  Welcome to the Club!
                </h3>
                <p className="font-inter text-dark-300">
                  Check your inbox — we'll send you the next steps.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
