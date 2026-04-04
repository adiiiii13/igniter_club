import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FiZap, FiCpu, FiCloud, FiGlobe, FiShield, FiMic, FiX } from 'react-icons/fi';
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
    title: 'SIH Internal Hackathon',
    date: 'September 11–12, 2025',
    type: 'Hackathon',
    description:
      'An exciting internal hackathon conducted as part of Smart India Hackathon preparation. Participants showcased incredible skills and built innovative solutions.',
    icon: FiZap,
    color: 'from-ignite-500 to-rose-600',
    badge: 'Featured',
    banner: null,
    details: null,
  },
  {
    title: 'Club Orientation Program',
    date: 'July 25, 2025',
    type: 'Orientation',
    description:
      'Join us for the official orientation of Ignite Club x GMIT. Learn about our vision, upcoming activities, and how you can be part of this amazing tech community.',
    icon: FiGlobe,
    color: 'from-violet-500 to-purple-600',
    badge: null,
    banner: null,
    details: null,
  },
  {
    title: 'ByteStorm 1.0',
    date: 'March 8, 2025',
    type: 'Competition',
    description:
      'A thrilling hackathon event where participants compete to build innovative solutions within a limited time frame. Showcase your coding skills and creativity in this exciting competition.',
    icon: FiCpu,
    color: 'from-cyan-500 to-blue-600',
    badge: null,
    banner: '/event-bytestorm-banner.png',
    details: null,
  },
  {
    title: 'Training Session',
    date: 'August 8, 2025',
    type: 'Workshop',
    description:
      'A comprehensive training session designed specifically for first-year students. Learn fundamental programming concepts, development tools, and best practices to kickstart your coding journey.',
    icon: FiCloud,
    color: 'from-emerald-500 to-teal-600',
    badge: null,
    banner: '/event-training-banner.jpg',
    details: null,
  },
  {
    title: 'Code Rush 1.0',
    date: 'Wednesday, 27th August 2025',
    type: 'Competition',
    description:
      'Develop Together or Be a Solo Warrior - An exciting coding competition powered by Code Caffeine in association with CSE, CSBS & ECE departments.',
    icon: FiCpu,
    color: 'from-orange-500 to-red-600',
    badge: null,
    banner: '/event-coderush-banner.png',
    details: {
      organizer: 'Code Caffeine',
      association: 'CSE, CSBS & ECE',
      time: '10:00 AM – 5:00 PM',
      venue: 'GMIT College Lab',
      address: 'Baruipur, Mouza Beralia, Balerampur, Kolkata – 700144',
      phone: '+91 7432 840 665',
      website: 'coderush-1-0.netlify.app',
      collegeSite: 'gmitkolkata.org',
      tagline: 'Develop Together or Be a Solo Warrior',
    },
  },
];

export default function EventsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [selectedEvent, setSelectedEvent] = useState(null);

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
                onClick={() => setSelectedEvent(event)}
              >
                {/* Card banner image or gradient header */}
                {event.banner ? (
                  <div className="h-48 overflow-hidden bg-dark-800">
                    <img 
                      src={event.banner} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className={`h-1.5 bg-gradient-to-r ${event.color}`} />
                )}

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

      {/* Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            <motion.div
              className="absolute inset-0 bg-dark-950/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            />

            <motion.div
              className="relative z-10 w-full max-w-lg rounded-3xl border border-ignite-400/20 bg-dark-900/85 p-6 shadow-2xl shadow-black/45 sm:p-8"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 text-dark-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>

              {/* Banner image if available */}
              {selectedEvent.banner && (
                <img 
                  src={selectedEvent.banner} 
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedEvent.color} flex items-center justify-center text-2xl shadow-lg`}>
                  <selectedEvent.icon size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-2xl text-white">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-inter font-medium text-dark-400 uppercase tracking-wider">
                      {selectedEvent.type}
                    </span>
                    <span className="w-1 h-1 bg-dark-600 rounded-full" />
                    <span className="text-xs font-inter text-ignite-300">
                      {selectedEvent.date}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEvent.details?.tagline && (
                <p className="text-sm font-inter italic text-ignite-300 mb-4">
                  "{selectedEvent.details.tagline}"
                </p>
              )}

              <p className="text-base font-inter leading-relaxed text-dark-300 mb-6">
                {selectedEvent.description}
              </p>

              {selectedEvent.details && (
                <div className="space-y-4 mb-6 text-sm font-inter text-dark-300">
                  {selectedEvent.details.organizer && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Organizer:</span> {selectedEvent.details.organizer}
                    </div>
                  )}
                  {selectedEvent.details.association && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Association:</span> {selectedEvent.details.association}
                    </div>
                  )}
                  {selectedEvent.details.time && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Time:</span> {selectedEvent.details.time}
                    </div>
                  )}
                  {selectedEvent.details.venue && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Venue:</span> {selectedEvent.details.venue}
                    </div>
                  )}
                  {selectedEvent.details.address && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Address:</span> {selectedEvent.details.address}
                    </div>
                  )}
                  {selectedEvent.details.phone && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Phone:</span> <a href={`tel:${selectedEvent.details.phone}`} className="text-ignite-300 hover:text-ignite-200">{selectedEvent.details.phone}</a>
                    </div>
                  )}
                  {selectedEvent.details.website && (
                    <div>
                      <span className="text-ignite-400 font-semibold">Website:</span> <a href={`https://${selectedEvent.details.website}`} target="_blank" rel="noopener noreferrer" className="text-ignite-300 hover:text-ignite-200">{selectedEvent.details.website}</a>
                    </div>
                  )}
                  {selectedEvent.details.collegeSite && (
                    <div>
                      <span className="text-ignite-400 font-semibold">College:</span> <a href={`https://${selectedEvent.details.collegeSite}`} target="_blank" rel="noopener noreferrer" className="text-ignite-300 hover:text-ignite-200">{selectedEvent.details.collegeSite}</a>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="mt-8 w-full rounded-xl border border-white/10 bg-dark-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-800 focus:ring focus:ring-ignite-500/50"
                onClick={() => setSelectedEvent(null)}
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
