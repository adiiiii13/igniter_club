import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import StoryBranch from './StoryBranch';

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

const chapters = [
  {
    id: 1,
    year: '2022',
    title: 'The First Spark',
    description:
      'A handful of curious students started meeting after class to build mini projects and share what they learned. Late-night coffee sessions turned into a movement.',
    tags: ['Beginning', 'Community', 'Passion'],
  },
  {
    id: 2,
    year: '2023',
    title: 'The Circle Grew',
    description:
      'Weekly build nights, mentor sessions, and peer learning turned a small group into a campus-wide phenomenon. The community found its voice.',
    tags: ['Growth', 'Mentorship', 'Events'],
  },
  {
    id: 3,
    year: '2024',
    title: 'The Breakthrough Year',
    description:
      'Igniter teams began shipping real products, winning challenges, and representing GMIT in regional and national events. Impact became measurable.',
    tags: ['Shipping', 'Awards', 'Recognition'],
  },
  {
    id: 4,
    year: 'Now',
    title: 'Writing The Next Chapter',
    description:
      'From AI to cloud to open source, every new member adds a new line to the Igniter Club story. The future is being written by builders like you.',
    tags: ['Innovation', 'Future', 'Yours'],
  },
];

export default function StoryTimelineSection() {
  return (
    <section id="story" className="relative overflow-hidden">
      <StoryBranch
        stories={chapters}
        title="Our Story Timeline"
        subtitle="Watch how Igniter Club grew from one spark to a movement"
      />
    </section>
  );
}
