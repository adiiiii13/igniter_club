import { buildGithubOAuthUrl } from '../../config/authConfig';
import { motion, useAnimation } from 'framer-motion';
import { FaGithub } from 'react-icons/fa6';

export default function GithubOAuthButton({ mode = 'login', label, className = '' }) {
  const controls = useAnimation();

  const handleGithubAuth = () => {
    const authUrl = buildGithubOAuthUrl({ mode });
    window.location.assign(authUrl);
  };

  return (
    <motion.button
      type="button"
      onClick={handleGithubAuth}
      onHoverStart={() => controls.start({ y: -2, scale: 1.01 })}
      onHoverEnd={() => controls.start({ y: 0, scale: 1 })}
      animate={controls}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className={`github-pill ${className}`.trim()}
    >
      <FaGithub className="h-5 w-5" aria-hidden="true" />
      <span>{label ?? 'Continue with GitHub'}</span>
    </motion.button>
  );
}
