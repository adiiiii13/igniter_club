import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CommunitiesPage from './pages/CommunitiesPage';
import IntroPage from './pages/IntroPage';
import IntroOverlay from './components/IntroOverlay';

export default function App() {
  const location = useLocation();
  const isIntroPage = location.pathname === '/' || location.pathname === '/welcome';
  const [showOverlayIntro, setShowOverlayIntro] = useState(false);
  const isMainSiteRoute = useMemo(
    () => location.pathname === '/home' || location.pathname === '/communities',
    [location.pathname],
  );

  useEffect(() => {
    if (!isMainSiteRoute) return;

    setShowOverlayIntro(true);
  }, [isMainSiteRoute]);

  useEffect(() => {
    if (location.pathname !== '/home' || !location.hash) return;

    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries.length > 0 ? navEntries[0].type : '';

    if (navType === 'reload') {
      window.history.replaceState(null, '', '/home');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash]);

  const handleOverlayDone = () => {
    setShowOverlayIntro(false);

    if (window.location.pathname === '/home') {
      window.history.replaceState(null, '', '/home');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  return (
    <div className="relative min-h-screen text-dark-200">
      {showOverlayIntro && <IntroOverlay onDone={handleOverlayDone} />}
      {!isIntroPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<IntroPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/about" element={<Navigate to="/home#about" replace />} />
        <Route path="/events" element={<Navigate to="/home#events" replace />} />
        <Route path="/join" element={<Navigate to="/home#join" replace />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {!isIntroPage && <Footer />}
    </div>
  );
}
