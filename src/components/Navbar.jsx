import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RoleSelectionModal from './auth/RoleSelectionModal';
import StudentLoginModal from './auth/StudentLoginModal';
import StudentSignupModal from './auth/StudentSignupModal';
import { navigateWithAnimeExit } from '../utils/authAnimations';
import { supabase } from '../utils/supabase';

const PARALLAX_LANDING_PATH = '/Parallax-website-main/';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStudentLoginModalOpen, setIsStudentLoginModalOpen] = useState(false);
  const [isStudentSignupModalOpen, setIsStudentSignupModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const userMenuContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (!userMenuContainerRef.current) return;
      if (!userMenuContainerRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [userMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '/home' },
    { label: 'About', href: '#about' },
    { label: 'Events', href: '#events' },
    { label: 'Communities', href: '/communities' },
  ];

  const handleNavClick = (e, link, isMobile) => {
    if (isMobile) setMobileOpen(false);

    if (link.label === 'Home') {
      e.preventDefault();
      if (location.pathname === '/home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', window.location.pathname);
      } else {
        navigate('/home');
      }
      return;
    }

    if (link.label === 'About' || link.label === 'Events') {
      e.preventDefault();
      const targetId = link.label.toLowerCase();

      if (location.pathname === '/home') {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${targetId}`);
        }
      } else {
        navigate(`/home#${targetId}`);
      }
    }
  };

  const handleSelectRole = (role) => {
    setIsAuthModalOpen(false);
    setMobileOpen(false);

    if (role === 'admin') {
      navigateWithAnimeExit(navigate, '/auth/admin/login');
      return;
    }

    setIsStudentLoginModalOpen(true);
  };

  const handleSignOnClick = async () => {
    setMobileOpen(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }

      navigate('/home?intro=1');
    } catch (err) {
      console.error('Sign on auth check failed:', err);
      navigate('/home?intro=1');
    }
  };

  const handleStudentLoginSuccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/home');
        return;
      }

      navigate('/home?intro=1');
    } catch (err) {
      console.error('Error after navbar login:', err);
      navigate('/home?intro=1');
    }
  };

  const handleStudentSignupSuccess = async (payload) => {
    if (payload?.pendingVerification) {
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/home');
        return;
      }

      navigate('/home?intro=1');
    } catch (err) {
      console.error('Error after navbar signup:', err);
      navigate('/home?intro=1');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserMenuOpen(false);
      setMobileOpen(false);
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/home', { replace: true });
    }
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
        <Link
          to="/home"
          onClick={(e) => handleNavClick(e, { label: 'Home' }, false)}
          className="brand-logo-shell brand-logo-nav hidden sm:inline-flex absolute left-8 sm:left-12 top-1/2 -translate-y-1/2 z-20"
        >
          <img
            src="/GMITxIgnite-removebg-preview.png"
            alt="Igniter Club x GMIT Logo"
            className="brand-logo-img"
          />
        </Link>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="hidden sm:flex items-center gap-2">
            <a href={PARALLAX_LANDING_PATH} className="btn-header px-4 py-2 text-sm">
              <span className="btn-roll" aria-hidden="true">
                <span className="btn-roll-track">
                  <span className="btn-roll-text">Landing Page</span>
                  <span className="btn-roll-text clone">Landing Page</span>
                </span>
              </span>
            </a>

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleNavClick(e, link, false)}
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

            {user ? (
              <div ref={userMenuContainerRef} className="relative flex items-center gap-3 ml-3">
                <Link to="/student/home" className="btn-header-primary px-4 py-2 text-sm">
                  <span className="btn-roll" aria-hidden="true">
                    <span className="btn-roll-track">
                      <span className="btn-roll-text">Dashboard</span>
                      <span className="btn-roll-text clone">Dashboard</span>
                    </span>
                  </span>
                </Link>

                <Link
                  to="/student/home"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-ignite-500/10 border border-ignite-500/30 shadow-lg shadow-ignite-500/20 hover:bg-ignite-500/20 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-outfit font-bold text-ignite-300 text-lg">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="btn-header w-10 h-10 p-0 flex flex-col items-center justify-center gap-1"
                  aria-label="Open user menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="w-5 h-0.5 bg-white rounded-full block" />
                  <span className="w-5 h-0.5 bg-white rounded-full block" />
                  <span className="w-5 h-0.5 bg-white rounded-full block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-14 right-0 w-44 rounded-xl border border-white/10 bg-dark-900/95 p-2 shadow-2xl"
                    >
                      <Link
                        to="/student/home"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5 transition"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 transition"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignOnClick}
                className="btn-header-primary ml-3 px-5 py-2.5 text-sm"
              >
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">Sign on</span>
                    <span className="btn-roll-text clone">Sign on</span>
                  </span>
                </span>
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-header sm:hidden w-10 h-10 p-0 flex flex-col items-center justify-center gap-1.5 absolute right-4"
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
              <a
                href={PARALLAX_LANDING_PATH}
                className="btn-header px-4 py-3 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                <span className="btn-roll" aria-hidden="true">
                  <span className="btn-roll-track">
                    <span className="btn-roll-text">Landing Page</span>
                    <span className="btn-roll-text clone">Landing Page</span>
                  </span>
                </span>
              </a>

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link, true)}
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

              {user ? (
                <>
                  <Link
                    to="/student/home"
                    className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-ignite-500/10 border border-ignite-500/20 hover:bg-ignite-500/20 transition-all text-white font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-ignite-500/30 flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-ignite-200 font-bold">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-1 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-200 hover:bg-red-500/20 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOnClick}
                  className="btn-header-primary mt-2 px-5 py-3 text-sm text-center"
                >
                  <span className="btn-roll" aria-hidden="true">
                    <span className="btn-roll-track">
                      <span className="btn-roll-text">Sign on</span>
                      <span className="btn-roll-text clone">Sign on</span>
                    </span>
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoleSelectionModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectRole={handleSelectRole}
      />

      <StudentLoginModal
        isOpen={isStudentLoginModalOpen}
        onClose={() => setIsStudentLoginModalOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
        onCreateAccount={() => {
          setIsStudentLoginModalOpen(false);
          setIsStudentSignupModalOpen(true);
        }}
      />

      <StudentSignupModal
        isOpen={isStudentSignupModalOpen}
        onClose={() => setIsStudentSignupModalOpen(false)}
        onSignupSuccess={handleStudentSignupSuccess}
      />
    </>
  );
}
