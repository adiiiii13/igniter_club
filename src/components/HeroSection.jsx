import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';

export default function HeroSection({ onAuthClick, isLoggedIn }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20"
      aria-label="Hero section"
    >
      {/* Hero text overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full">
        {/* Subtitle badge */}
        <motion.div 
          className="mb-6 px-5 py-2 rounded-full glass border border-ignite-500/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="font-inter text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-ignite-300">
            Chapter Zero: The Spark
          </span>
        </motion.div>

        {/* Main title */}
        <h1 className="font-outfit font-black text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.9] tracking-tight mb-6">
          <motion.span 
            className="block text-white drop-shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            IGNITER CLUB
          </motion.span>
          <motion.span 
            className="block text-gradient"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            × GMIT
          </motion.span>
        </h1>

        {/* Tagline - secondary text */}
        <motion.p
          className="font-inter text-dark-300 text-lg sm:text-xl md:text-2xl max-w-2xl leading-relaxed mb-10 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Every Spark Tells A Story
        </motion.p>

        {/* Description */}
        <motion.p
          className="font-inter text-dark-300 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          From first-year curiosity to shipped products, this is the journey of students who chose to build, break, and learn together.
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#story" className="btn-ignite px-8 py-4 text-base">
            <span className="btn-roll" aria-hidden="true">
              <span className="btn-roll-track">
                <span className="btn-roll-text">📖 Start The Story</span>
                <span className="btn-roll-text clone">📖 Start The Story</span>
              </span>
            </span>
          </a>
          {!isLoggedIn ? (
            <>
              <a
                href="#founders"
                className="btn-ignite px-8 py-4 text-base"
              >
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">✨ Meet The Founders</span>
                    <span className="btn-roll-text clone">✨ Meet The Founders</span>
                  </span>
                </span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <button
                type="button"
                onClick={onAuthClick}
                className="btn-header-primary px-8 py-4 text-base"
              >
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">Join The Club</span>
                    <span className="btn-roll-text clone">Join The Club</span>
                  </span>
                </span>
              </button>
            </>
          ) : (
            <Link
              to="/student/home"
              className="btn-header-primary px-8 py-4 text-base"
            >
              <span className="btn-roll" aria-hidden="true">
                <span className="btn-roll-track">
                  <span className="btn-roll-text">🚀 Go to Dashboard</span>
                  <span className="btn-roll-text clone">🚀 Go to Dashboard</span>
                </span>
              </span>
            </Link>
          )}
        </div>

      </div>
    </section>
  );
}
