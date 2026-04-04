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
    year: '2024',
    title: 'Planning The Foundation',
    description:
      'The idea of building a student-led tech community started taking shape through planning, pitching, and learning what it takes to run a club from scratch.',
    tags: ['Planning', 'Pitching', 'Groundwork'],
  },
  {
    id: 2,
    year: 'Mid 2025',
    title: 'Codecaffeine Was Established',
    description:
      'That early effort became Codecaffeine, the first tech club built from the ground up. It marked a major milestone for building real community inside college.',
    tags: ['Milestone', 'First Tech Club', 'Built From Scratch'],
  },
  {
    id: 3,
    year: 'End 2025',
    title: 'A Hard Setback',
    description:
      'Like many ambitious first attempts, Codecaffeine faced challenges that could not be sustained and was eventually discontinued by the end of 2025.',
    tags: ['Challenge', 'Discontinued', 'Resilience'],
  },
  {
    id: 4,
    year: 'March 2026',
    title: 'Igniter Selection',
    description:
      "The same drive returned through Unstop's Igniter program. Getting selected in March 2026 put the club on a level comparable to GDG networks and opened the door to institutional support.",
    tags: ['Unstop Igniter', 'Recognition', 'Breakthrough'],
  },
  {
    id: 5,
    year: '2026',
    title: 'The Comeback',
    description:
      'With stronger backing and clearer direction, the club relaunched with renewed momentum, turning a past setback into a more sustainable comeback.',
    tags: ['Stronger Return', 'Institutional Backing', 'Momentum'],
  },
];

export default function StoryTimelineSection() {
  return (
    <section id="story" className="relative overflow-hidden">
      <StoryBranch
        stories={chapters}
        title="The Story"
        subtitle="Not a clean rise, but a real one: built, lost, and rebuilt stronger."
      />
    </section>
  );
}
