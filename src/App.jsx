import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CommunitiesPage from './pages/CommunitiesPage';
import BikiniSpecialPage from './pages/BikiniSpecialPage';
import IntroPage from './pages/IntroPage';

export default function App() {
  const location = useLocation();
  const isIntroPage = location.pathname === '/';

  return (
    <div className="relative min-h-screen text-dark-200">
      {!isIntroPage && <Navbar />}

      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/bikini-special" element={<BikiniSpecialPage />} />
      </Routes>

      {!isIntroPage && <Footer />}
    </div>
  );
}
