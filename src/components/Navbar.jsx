import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShield, FiExternalLink, FiLogOut } from 'react-icons/fi';
import RoleSelectionModal from './auth/RoleSelectionModal';
import StudentLoginModal from './auth/StudentLoginModal';
import StudentSignupModal from './auth/StudentSignupModal';
import { navigateWithAnimeExit } from '../utils/authAnimations';
import { supabase } from '../utils/supabase';
import { getCurrentUserRole } from '../utils/authRole';

const PARALLAX_LANDING_PATH = '/Parallax-website-main/';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStudentLoginModalOpen, setIsStudentLoginModalOpen] = useState(false);
  const [isStudentSignupModalOpen, setIsStudentSignupModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const userMenuContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);

      if (currentUser) {
        const roleInfo = await getCurrentUserRole(currentUser);
        if (isMounted) {
          setIsAdmin(roleInfo.isAdmin);
          setAdminProfile(roleInfo);
        }
      } else {
        if (isMounted) {
          setIsAdmin(false);
          setAdminProfile(null);
        }
      }
    };

    // 1. Immediately read cached session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) {
        syncAuthState(session.user);
      }
    });

    // 2. Also verify with server
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted && user) {
        syncAuthState(user);
      }
    });

    // 3. Listen to all auth changes (including INITIAL_SESSION!)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      syncAuthState(currentUser);
    });

    return () => {
      isMounted = false;
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
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
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
    }
    // About, Events, Communities — navigate normally via Link href
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

  const handleSignOnClick = () => {
    setMobileOpen(false);
    setIsAuthModalOpen(true);
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

      const roleInfo = await getCurrentUserRole(user);
      if (roleInfo.isAdmin) {
        navigate('/admin/dashboard?admin=1');
      } else {
        navigate('/home?intro=1');
      }
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
          className="brand-lockup brand-lockup-nav inline-flex items-center absolute left-4 sm:left-6 md:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-20 group"
          aria-label="Igniter Club GMIT and JIS Group 15 Years of Tomorrow"
        >
          <div className="brand-logo-shell brand-logo-nav">
            <img
              src="/GMITxIgnite-removebg-preview.png"
              alt="Igniter Club x GMIT Logo"
              className="brand-logo-img"
            />
          </div>

          <span className="brand-lockup-divider" aria-hidden="true" />

          <div className="brand-partner-shell">
            <img
              src="/gmit-jis-15years-dark.png"
              alt="GMIT 15 Years of Tomorrow | JIS Group"
              className="brand-partner-img"
            />
          </div>
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
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-ignite-500/50 bg-ignite-500/15 text-ignite-300 hover:bg-ignite-500/25 transition-all text-xs font-semibold tracking-wide uppercase font-mono shadow-lg shadow-ignite-500/15"
                  >
                    <FiShield className="text-ignite-400 text-sm" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/student/home" className="btn-header-primary px-4 py-2 text-sm">
                    <span className="btn-roll" aria-hidden="true">
                      <span className="btn-roll-track">
                        <span className="btn-roll-text">Dashboard</span>
                        <span className="btn-roll-text clone">Dashboard</span>
                      </span>
                    </span>
                  </Link>
                )}

                <Link
                  to={isAdmin ? '/admin/dashboard' : '/student/home'}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 overflow-hidden ${
                    isAdmin
                      ? 'bg-ignite-500/15 border border-ignite-500/60 shadow-lg shadow-ignite-500/20 hover:scale-105'
                      : 'bg-ignite-500/10 border border-ignite-500/30 shadow-lg shadow-ignite-500/20 hover:bg-ignite-500/20 hover:scale-105 hover:-translate-y-0.5'
                  }`}
                  title={isAdmin ? 'Admin Dashboard' : 'Student Profile'}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-outfit font-bold text-lg text-ignite-300">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                  {isAdmin && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-dark-950 border border-ignite-500 flex items-center justify-center">
                      <FiShield className="text-[8px] text-ignite-300" />
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
                      className={`absolute top-14 right-0 rounded-2xl p-2 shadow-2xl backdrop-blur-xl border ${
                        isAdmin
                          ? 'w-52 border-ignite-500/30 bg-dark-900/95 shadow-ignite-500/10'
                          : 'w-48 border-white/10 bg-dark-900/95'
                      }`}
                    >
                      {isAdmin ? (
                        <>
                          <div className="px-3 py-2 border-b border-white/10 mb-1">
                            <p className="text-xs font-semibold text-white truncate">{adminProfile?.displayName || 'Administrator'}</p>
                            <p className="text-[10px] text-ignite-400 font-mono uppercase tracking-wider">{adminProfile?.role || 'SUPER ADMIN'}</p>
                          </div>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ignite-200 hover:bg-ignite-500/10 transition"
                          >
                            <FiShield className="text-ignite-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/student/home"
                          onClick={() => setUserMenuOpen(false)}
                          className="block rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5 transition"
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2"
                      >
                        <FiLogOut className="text-xs" />
                        <span>Logout</span>
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
                  {isAdmin ? (
                    <Link
                      to="/admin/dashboard"
                      className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-ignite-500/15 border border-ignite-500/30 hover:bg-ignite-500/25 transition-all text-ignite-200 font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-ignite-500/20 border border-ignite-500/40 flex items-center justify-center text-ignite-300">
                        <FiShield />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-white">Admin Dashboard</span>
                        <span className="text-[10px] text-ignite-400/80 font-mono uppercase">{adminProfile?.role || 'Super Admin'}</span>
                      </div>
                    </Link>
                  ) : (
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
                  )}
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
        initialEmail={loginEmail}
        onCreateAccount={() => {
          setIsStudentLoginModalOpen(false);
          setIsStudentSignupModalOpen(true);
        }}
      />

      <StudentSignupModal
        isOpen={isStudentSignupModalOpen}
        onClose={() => setIsStudentSignupModalOpen(false)}
        onSignupSuccess={handleStudentSignupSuccess}
        onSwitchToLogin={(email) => {
          if (email) setLoginEmail(email);
          setIsStudentSignupModalOpen(false);
          setIsStudentLoginModalOpen(true);
        }}
      />
    </>
  );
}
