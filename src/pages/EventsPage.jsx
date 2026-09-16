import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BackgroundScrubber from '../components/BackgroundScrubber';
import EventsSection from '../components/EventsSection';

export default function EventsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <>
      <BackgroundScrubber />
      <div className="noise-overlay" />

      {/* Page Header */}
      <motion.div
        className="relative z-10 pt-36 pb-10 text-center px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-ignite-500/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-ignite-400 animate-pulse" />
          <span className="font-inter text-xs font-medium tracking-[0.2em] uppercase text-ignite-300">
            What We Build Together
          </span>
        </div>
        <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
          <span className="text-gradient">Events</span> &amp; Programs
        </h1>
        <p className="mt-4 font-inter text-dark-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Hackathons, workshops, talks — every event is a launchpad for your next big idea.
        </p>
      </motion.div>

      {/* Thin separator */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
      </div>

      <main className="relative z-10">
        <EventsSection />
      </main>
    </>
  );
}
