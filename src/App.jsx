import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CommunitiesPage from './pages/CommunitiesPage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import IntroPage from './pages/IntroPage';
import IntroOverlay from './components/IntroOverlay';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import StudentProfileComplete from './pages/StudentProfileComplete';
import StudentHome from './pages/StudentHome';
import StudentSectionPage from './pages/StudentSectionPage';
import PublicBannerModal from './components/PublicBannerModal';
import { getCurrentUserRole } from './utils/authRole';

// Wrapper components to prevent React Router 6/7 static element caching bugs that cause frozen UI on parameter changes
function StudentHomeRoute() {
  return (
    <ProtectedRoute>
      <StudentHome />
    </ProtectedRoute>
  );
}

function StudentSectionRoute() {
  return (
    <ProtectedRoute requireProfileComplete>
      <StudentSectionPage />
    </ProtectedRoute>
  );
}

function StudentProfileCompleteRoute() {
  return (
    <ProtectedRoute>
      <StudentProfileComplete />
    </ProtectedRoute>
  );
}
import OAuthCollegeIdSetup from './pages/OAuthCollegeIdSetup';
import VerifySignupPage from './pages/VerifySignupPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './utils/supabase';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isIntroPage = location.pathname === '/' || location.pathname === '/welcome' || location.pathname === '/intro' || location.pathname === '/intro/' || location.pathname.startsWith('/Parallax-website-main');
  const isAuthRoute = location.pathname.startsWith('/auth/');
  const isStudentRoute = location.pathname.startsWith('/student/');
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // If arriving with a Supabase recovery token in URL hash
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') && location.pathname !== '/auth/change-password') {
      navigate('/auth/change-password' + hash, { replace: true });
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/auth/change-password');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const forceIntro = queryParams.get('intro') === '1' || queryParams.get('admin') === '1';
  const [showOverlayIntro, setShowOverlayIntro] = useState(false);
  const [overlayIntroText, setOverlayIntroText] = useState('Igniting Innovation');
  const [overlayIntroSubText, setOverlayIntroSubText] = useState('');
  const [isOverlayAdmin, setIsOverlayAdmin] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const isMainSiteRoute = useMemo(
    () =>
      location.pathname === '/home' ||
      location.pathname === '/about' ||
      location.pathname === '/events' ||
      location.pathname === '/communities',
    [location.pathname],
  );
  const isIntroEligibleRoute = useMemo(
    () =>
      location.pathname === '/student/home' ||
      location.pathname === '/student/activity' ||
      location.pathname === '/student/events' ||
      location.pathname === '/student/resources' ||
      location.pathname === '/student/notifications' ||
      location.pathname === '/admin/dashboard' ||
      location.pathname === '/home',
    [location.pathname],
  );

  useEffect(() => {
    if (!isMainSiteRoute) return;
    if (forceIntro) return;

    setOverlayIntroText('Igniting Innovation');
    setOverlayIntroSubText('');
    setIsOverlayAdmin(false);
    setShowOverlayIntro(true);
  }, [isMainSiteRoute, forceIntro]);

  useEffect(() => {
    const triggerUserIntro = async () => {
      prevPathRef.current = location.pathname;

      if (!forceIntro) return;
      if (!isIntroEligibleRoute) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setOverlayIntroText('Igniting Innovation');
          setOverlayIntroSubText('');
          setIsOverlayAdmin(false);
          setShowOverlayIntro(true);
          return;
        }

        const roleInfo = await getCurrentUserRole(user);

        if (roleInfo.isAdmin) {
          setIsOverlayAdmin(true);
          setOverlayIntroText('Welcome to Igniter Admin');
          setOverlayIntroSubText(roleInfo.displayName || 'Club Administrator');
        } else {
          setIsOverlayAdmin(false);
          setOverlayIntroText('Welcome to Igniter Club X GMIT');
          setOverlayIntroSubText(roleInfo.displayName || 'Student');
        }

        setShowOverlayIntro(true);

        // Remove intro / admin query parameters cleanly
        const nextParams = new URLSearchParams(location.search);
        nextParams.delete('intro');
        nextParams.delete('admin');
        const nextSearch = nextParams.toString();
        navigate(
          `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash || ''}`,
          { replace: true }
        );
      } catch (err) {
        console.error('Intro load error:', err);
      }
    };

    triggerUserIntro();
  }, [location.pathname, location.search, location.hash, isIntroEligibleRoute, forceIntro, navigate]);

  useEffect(() => {
    if (location.pathname !== '/home' || !location.hash) return;

    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries.length > 0 ? navEntries[0].type : '';

    if (navType === 'reload') {
      navigate('/home', { replace: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash, navigate]);

  const handleOverlayDone = () => {
    setShowOverlayIntro(false);

    if (window.location.pathname === '/home') {
      navigate('/home', { replace: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  return (
    <div className="relative min-h-screen text-dark-200">
      <PublicBannerModal hasActiveIntro={showOverlayIntro} />
      {showOverlayIntro && (
        <IntroOverlay
          onDone={handleOverlayDone}
          introText={overlayIntroText}
          introSubText={overlayIntroSubText}
          isAdmin={isOverlayAdmin}
        />
      )}
      {!isIntroPage && !isAuthRoute && !isStudentRoute && !isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/welcome" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/intro" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/intro/" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/auth/admin/login" element={<AdminLoginPage />} />
        <Route path="/auth/verify-signup" element={<VerifySignupPage />} />
        <Route path="/auth/change-password" element={<ChangePasswordPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Student Routes */}
        <Route path="/student/oauth-setup" element={<OAuthCollegeIdSetup />} />
        <Route path="/student/complete-profile" element={<StudentProfileCompleteRoute />} />
        <Route path="/student/home" element={<StudentHomeRoute />} />
        <Route path="/student/:section" element={<StudentSectionRoute />} />
        
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/join" element={<Navigate to="/home#founders" replace />} />
        <Route path="/founders" element={<Navigate to="/home#founders" replace />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {!isIntroPage && !isAuthRoute && !isStudentRoute && !isAdminRoute && <Footer />}
    </div>
  );
}
