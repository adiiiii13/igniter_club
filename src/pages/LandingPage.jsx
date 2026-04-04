import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import EventsSection from '../components/EventsSection';
import JoinSection from '../components/JoinSection';
import BackgroundScrubber from '../components/BackgroundScrubber';
import StoryTimelineSection from '../components/StoryTimelineSection';
import RoleSelectionModal from '../components/auth/RoleSelectionModal';
import StudentSignupModal from '../components/auth/StudentSignupModal';
import StudentLoginModal from '../components/auth/StudentLoginModal';
import { navigateWithAnimeExit } from '../utils/authAnimations';
import { supabase } from '../utils/supabase';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleAuthEntry = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsRoleModalOpen(true);
        return;
      }

      navigate('/home?intro=1');
    } catch (err) {
      console.error('Auth entry check failed:', err);
      navigate('/home?intro=1');
    }
  };

  const handleSelectRole = (role) => {
    setIsRoleModalOpen(false);
    if (role === 'admin') {
      navigateWithAnimeExit(navigate, '/auth/admin/login');
    } else {
      setIsSignupModalOpen(true);
    }
  };

  const handleSignupSuccess = async (payload) => {
    if (payload?.pendingVerification) {
      return;
    }

    // After signup, check profile completion and redirect
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/home?intro=1');
      }
    } catch (err) {
      console.error('Error after signup:', err);
      navigate('/home?intro=1');
    }
  };

  const handleLoginSuccess = async () => {
    // After login, check profile completion and redirect
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/home?intro=1');
      }
    } catch (err) {
      console.error('Error after login:', err);
      navigate('/home?intro=1');
    }
  };

  return (
    <>
      <BackgroundScrubber />
      
      {/* Subtle noise overlay for premium texture */}
      <div className="noise-overlay" />

      {/* Main content */}
      <main className="relative z-10" data-route-item>
        <div data-route-item>
          <HeroSection onAuthClick={handleAuthEntry} isLoggedIn={isLoggedIn} />
        </div>
        <div data-route-item>
          <AboutSection />
        </div>

        {/* Subtle separator */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
        </div>

        <div data-route-item>
          <StoryTimelineSection />
        </div>

        {/* Subtle separator */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
        </div>

        <div data-route-item>
          <EventsSection />
        </div>

        {/* Subtle separator */}
        {!isLoggedIn && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
          </div>
        )}

        {!isLoggedIn && (
          <div data-route-item>
            <JoinSection onAuthClick={handleAuthEntry} />
          </div>
        )}
      </main>

      {/* Auth Modals */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRole={handleSelectRole}
      />

      <StudentSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={handleSignupSuccess}
      />

      <StudentLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onCreateAccount={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
    </>
  );
}
