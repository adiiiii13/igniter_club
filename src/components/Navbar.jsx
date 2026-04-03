import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const HOME_REDIRECT_PATH = '/welcome';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use useEffect to handle hash scrolling when route changes
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const navLinks = [
    { label: 'Home', href: HOME_REDIRECT_PATH },
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Communities', href: '/communities' },
  ];

  const handleHomeNavigation = (e, closeMobile = false) => {
    e.preventDefault();
    if (closeMobile) setMobileOpen(false);
    window.location.assign(HOME_REDIRECT_PATH);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || location.pathname !== '/home'
            ? 'py-3 glass shadow-lg shadow-black/20'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" onClick={(e) => handleHomeNavigation(e)} className="flex items-center gap-2.5 group">
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">🔥</span>
            <span className="font-outfit font-bold text-lg text-white">
              Igniter<span className="text-ignite-400 ml-0.5">Club</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={link.label === 'Home' ? (e) => handleHomeNavigation(e) : undefined}
                className="btn-header px-4 py-2 text-sm"
              >
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">{link.label}</span>
                    <span className="btn-roll-text clone">{link.label}</span>
                  </span>
                </span>
              </Link>
            ))}
            <Link
              to="/join"
              className="btn-header-primary ml-3 px-5 py-2.5 text-sm"
            >
              <span className="btn-roll" aria-hidden="true">
                <span className="btn-roll-track">
                  <span className="btn-roll-text">Join Now</span>
                  <span className="btn-roll-text clone">Join Now</span>
                </span>
              </span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-header sm:hidden w-10 h-10 p-0 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle navigation menu"
          >
            <motion.span
              className="w-5 h-0.5 bg-white rounded-full block"
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="w-5 h-0.5 bg-white rounded-full block"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="w-5 h-0.5 bg-white rounded-full block"
              animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-t border-white/5 sm:hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={link.label === 'Home' ? (e) => handleHomeNavigation(e, true) : () => setMobileOpen(false)}
                  className="btn-header px-4 py-3 text-sm"
                >
                  <span className="btn-roll" aria-hidden="true">
                    <span className="btn-roll-track">
                      <span className="btn-roll-text">{link.label}</span>
                      <span className="btn-roll-text clone">{link.label}</span>
                    </span>
                  </span>
                </Link>
              ))}
              <Link
                to="/join"
                onClick={() => setMobileOpen(false)}
                className="btn-header-primary mt-2 px-5 py-3 text-sm text-center"
              >
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">Join Now</span>
                    <span className="btn-roll-text clone">Join Now</span>
                  </span>
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
