import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

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
    { label: 'About', href: '/home#about' },
    { label: 'Events', href: '/home#events' },
    { label: 'Communities', href: '/communities' },
    { label: 'Bikini Special', href: '/bikini-special' },
  ];

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
          <Link to="/home" className="flex items-center gap-2.5 group">
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
                className="px-4 py-2 rounded-lg font-inter text-sm font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/home#join"
              className="ml-3 px-5 py-2.5 rounded-xl font-outfit font-semibold text-sm text-white bg-gradient-to-r from-ignite-600 to-ignite-500 hover:from-ignite-500 hover:to-ignite-400 shadow-md shadow-ignite-500/20 hover:shadow-lg hover:shadow-ignite-500/30 transition-all duration-300"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-white/5 transition-colors"
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
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl font-inter text-sm font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/home#join"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-5 py-3 rounded-xl font-outfit font-semibold text-sm text-white text-center bg-gradient-to-r from-ignite-600 to-ignite-500 shadow-md shadow-ignite-500/20"
              >
                Join Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
