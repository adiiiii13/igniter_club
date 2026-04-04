import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CommunitiesPage from './pages/CommunitiesPage';
import IntroPage from './pages/IntroPage';
import IntroOverlay from './components/IntroOverlay';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentProfileComplete from './pages/StudentProfileComplete';
import StudentHome from './pages/StudentHome';
import StudentSectionPage from './pages/StudentSectionPage';

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
  const forceStudentIntro = queryParams.get('intro') === '1';
  const [showOverlayIntro, setShowOverlayIntro] = useState(false);
  const [overlayIntroText, setOverlayIntroText] = useState('Igniting Innovation');
  const [overlayIntroSubText, setOverlayIntroSubText] = useState('');
  const prevPathRef = useRef(location.pathname);
  const isMainSiteRoute = useMemo(
    () => location.pathname === '/home' || location.pathname === '/communities',
    [location.pathname],
  );
  const isStudentIntroEligibleRoute = useMemo(
    () =>
      location.pathname === '/student/home' ||
      location.pathname === '/student/activity' ||
      location.pathname === '/student/events' ||
      location.pathname === '/student/resources' ||
      location.pathname === '/student/notifications',
    [location.pathname],
  );

  useEffect(() => {
    if (!isMainSiteRoute) return;
    if (forceStudentIntro) return;

    setOverlayIntroText('Igniting Innovation');
    setOverlayIntroSubText('');
    setShowOverlayIntro(true);
  }, [isMainSiteRoute, forceStudentIntro]);

  useEffect(() => {
    const showStudentIntro = async () => {
      prevPathRef.current = location.pathname;

      if (!forceStudentIntro) return;

      const isEligible = isStudentIntroEligibleRoute || location.pathname === '/home';
      if (!isEligible) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setOverlayIntroText('Igniting Innovation');
          setOverlayIntroSubText('');
          setShowOverlayIntro(true);
          return;
        }

        const { data } = await supabase
          .from('students')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const studentName = data?.full_name?.trim() || 'Student';
        setOverlayIntroText('Welcome to Igniter Club X GMIT');
        setOverlayIntroSubText(studentName);
        setShowOverlayIntro(true);

        if (forceStudentIntro) {
          const nextParams = new URLSearchParams(location.search);
          nextParams.delete('intro');
          const nextSearch = nextParams.toString();
          navigate(
            `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash || ''}`,
            { replace: true }
          );
        }
      } catch (err) {
        console.error('Student intro load error:', err);
      }
    };

    showStudentIntro();
  }, [location.pathname, location.search, location.hash, isStudentIntroEligibleRoute, forceStudentIntro, navigate]);

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
      {showOverlayIntro && (
        <IntroOverlay onDone={handleOverlayDone} introText={overlayIntroText} introSubText={overlayIntroSubText} />
      )}
      {!isIntroPage && !isAuthRoute && !isStudentRoute && <Navbar />}

      <Routes key={location.pathname}>
        <Route path="/" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/welcome" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/intro" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/intro/" element={<Navigate to="/Parallax-website-main/" replace />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/auth/admin/login" element={<Navigate to="/home" replace />} />
        <Route path="/auth/verify-signup" element={<VerifySignupPage />} />
        <Route path="/auth/change-password" element={<ChangePasswordPage />} />
        
        {/* Student Routes */}
        <Route path="/student/oauth-setup" element={<OAuthCollegeIdSetup />} />
        <Route path="/student/complete-profile" element={<StudentProfileCompleteRoute />} />
        <Route path="/student/home" element={<StudentHomeRoute />} />
        <Route path="/student/:section" element={<StudentSectionRoute />} />
        
        <Route path="/about" element={<Navigate to="/home#about" replace />} />
        <Route path="/events" element={<Navigate to="/home#events" replace />} />
        <Route path="/join" element={<Navigate to="/home#join" replace />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {!isIntroPage && !isAuthRoute && !isStudentRoute && <Footer />}
    </div>
  );
}
