import { motion } from 'framer-motion';

const communities = [
  {
    title: 'AI And Machine Learning',
    description: 'Build practical ML projects, experiment with LLM workflows, and learn with peers through weekly build sessions.',
  },
  {
    title: 'Web And Product Engineering',
    description: 'Design and ship modern apps using React, APIs, cloud tools, and strong UX foundations.',
  },
  {
    title: 'Cybersecurity Circle',
    description: 'Practice real-world security skills through CTFs, labs, and team-based problem solving.',
  },
  {
    title: 'Open Source Guild',
    description: 'Contribute to open source projects, sharpen collaboration skills, and build a public portfolio.',
  },
];

export default function CommunitiesPage() {
  return (
    <div className="relative min-h-screen pt-28 pb-20 bg-dark-950 px-4 sm:px-6 lg:px-8">
      <div className="noise-overlay" />

      <div className="absolute top-1/4 right-0 w-[520px] h-[520px] bg-ignite-500/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[460px] h-[460px] bg-rose-600/6 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block font-inter text-xs tracking-[0.3em] uppercase text-ignite-400 mb-4">
            Explore And Build
          </span>
          <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-2xl mb-4">
            Igniter <span className="text-gradient">Communities</span>
          </h1>
          <p className="font-inter text-dark-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Join focused circles where members collaborate, learn, and ship meaningful projects together.
          </p>
          <div className="section-divider mx-auto mt-8" />
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {communities.map((item, index) => (
            <motion.article
              key={item.title}
              className="glass rounded-2xl p-7 sm:p-8 border border-white/10 hover:border-ignite-500/35 transition-smooth"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 * index }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <h2 className="font-outfit text-2xl text-white font-bold mb-3">{item.title}</h2>
              <p className="font-inter text-dark-300 leading-relaxed">{item.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="glass rounded-2xl p-7 sm:p-9 mt-8 text-center border border-ignite-500/20"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <h3 className="font-outfit text-2xl sm:text-3xl text-white font-bold mb-3">Want To Start A New Circle?</h3>
          <p className="font-inter text-dark-300 max-w-2xl mx-auto">
            Propose a theme, gather interested members, and we will help you launch a new learning track under Igniter Club.
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-7 sm:p-9 mt-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <h3 className="font-outfit text-2xl sm:text-3xl text-white font-bold mb-2">Community Creation Form</h3>
          <p className="font-inter text-dark-400 mb-6">Fill this form to propose a new community.</p>

          <form className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="communityName" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                Community Name
              </label>
              <input
                id="communityName"
                name="communityName"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                placeholder="Example: DevOps Circle"
              />
            </div>

            <div>
              <label htmlFor="leadName" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                Lead Name
              </label>
              <input
                id="leadName"
                name="leadName"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                Contact Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                placeholder="name@gmit.edu.in"
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                Focus Domain
              </label>
              <input
                id="domain"
                name="domain"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300"
                placeholder="AI, Cloud, Security, etc."
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="proposal" className="block text-sm font-inter font-medium text-dark-300 mb-2">
                Proposal Summary
              </label>
              <textarea
                id="proposal"
                name="proposal"
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-900/60 border border-white/10 text-white font-inter placeholder:text-dark-600 focus:outline-none focus:border-ignite-500/50 focus:ring-2 focus:ring-ignite-500/20 transition-all duration-300 resize-y"
                placeholder="Describe the purpose, goals, and expected activities of this community."
              />
            </div>

            <div className="sm:col-span-2">
              <button type="submit" className="btn-ignite px-8 py-3 text-sm sm:text-base">
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">Submit Community Proposal</span>
                    <span className="btn-roll-text clone">Submit Community Proposal</span>
                  </span>
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
