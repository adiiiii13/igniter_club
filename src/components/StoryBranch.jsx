import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function StoryBranch({ 
  stories = [],
  title = "Our Story",
  subtitle = "Watch it unfold"
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  return (
    <section
      ref={containerRef}
      className="relative py-32 sm:py-48 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-ignite-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-rose-600/4 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-28"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="font-outfit font-bold text-5xl sm:text-6xl md:text-7xl text-white mb-4">
            {title}
          </h2>
          <p className="font-inter text-ignite-300 text-lg">
            {subtitle}
          </p>
        </motion.div>

        {/* Timeline container */}
        <div className="relative">
          {/* Center vertical line */}
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-ignite-500 via-pink-500 to-rose-600 -translate-x-1/2"
            initial={{ scaleY: 0, originY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 2.8, ease: "easeInOut", delay: 0.1 }}
          />

          {/* Story items */}
          <div className="space-y-0">
            {stories.map((story, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={story.id}
                  className="relative flex gap-4 sm:gap-8 items-stretch"
                  style={{ minHeight: '220px' }}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {/* Left content (even indexes) */}
                  <div className={`flex-1 ${isEven ? 'flex items-center justify-end pr-4 sm:pr-8' : 'hidden'}`}>
                    <motion.div
                      className="glass rounded-2xl p-6 sm:p-8 backdrop-blur-lg border border-ignite-500/20 max-w-sm w-full"
                      initial={{ opacity: 0, x: -40 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(244, 63, 94, 0.4)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-inter text-sm tracking-[0.2em] uppercase text-ignite-400 font-bold">
                          {story.year}
                        </span>
                      </div>
                      <h3 className="font-outfit font-bold text-2xl sm:text-3xl text-white mb-3 text-right">
                        {story.title}
                      </h3>
                      <p className="font-inter text-dark-300 leading-relaxed text-sm sm:text-base mb-4 text-right">
                        {story.description}
                      </p>
                      {story.tags && (
                        <div className="flex flex-wrap gap-2 justify-end">
                          {story.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-inter font-medium text-ignite-300 bg-ignite-500/10 border border-ignite-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Center - timeline dot and branches */}
                  <div className="flex flex-col items-center justify-center relative w-12 sm:w-16">
                    {/* Branch line left */}
                    <motion.div
                      className="absolute right-full top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-ignite-400 to-ignite-500"
                      style={{
                        width: isEven ? '100%' : '0%',
                        right: 'calc(100% + 0px)',
                      }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: isEven ? '100px' : '0px' } : { width: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.12, ease: 'easeOut' }}
                    />

                    {/* Branch line right */}
                    <motion.div
                      className="absolute left-full top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-l from-ignite-400 to-ignite-500"
                      style={{
                        width: !isEven ? '100%' : '0%',
                        left: 'calc(100% + 0px)',
                      }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: !isEven ? '100px' : '0px' } : { width: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.12, ease: 'easeOut' }}
                    />

                    {/* Center dot */}
                    <motion.div
                      className="relative z-10 w-5 h-5 rounded-full bg-gradient-to-br from-ignite-400 to-rose-500 border-4 border-dark-950 shadow-lg"
                      style={{ boxShadow: '0 0 24px rgba(244, 63, 94, 0.8)' }}
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 + index * 0.12 + 0.5 }}
                    />
                  </div>

                  {/* Right content (odd indexes) */}
                  <div className={`flex-1 ${!isEven ? 'flex items-center justify-start pl-4 sm:pl-8' : 'hidden'}`}>
                    <motion.div
                      className="glass rounded-2xl p-6 sm:p-8 backdrop-blur-lg border border-ignite-500/20 max-w-sm w-full"
                      initial={{ opacity: 0, x: 40 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(244, 63, 94, 0.4)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-inter text-sm tracking-[0.2em] uppercase text-ignite-400 font-bold">
                          {story.year}
                        </span>
                      </div>
                      <h3 className="font-outfit font-bold text-2xl sm:text-3xl text-white mb-3">
                        {story.title}
                      </h3>
                      <p className="font-inter text-dark-300 leading-relaxed text-sm sm:text-base mb-4">
                        {story.description}
                      </p>
                      {story.tags && (
                        <div className="flex flex-wrap gap-2">
                          {story.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-inter font-medium text-ignite-300 bg-ignite-500/10 border border-ignite-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
