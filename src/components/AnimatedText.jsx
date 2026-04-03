import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedText({ 
  text, 
  className = '', 
  as = 'p',
  staggerDelay = 0.05,
  duration = 0.6,
  onceOnly = true,
  margin = '-80px'
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: onceOnly, margin });

  // Split text into words while preserving spaces
  const words = text.split(/(\s+)/).filter(word => word);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const Component = motion[as];

  return (
    <Component
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className="inline-block"
          style={{ whiteSpace: word === '\n' ? 'pre' : 'normal' }}
        >
          {word}
          {word === ' ' ? ' ' : ''}
        </motion.span>
      ))}
    </Component>
  );
}
