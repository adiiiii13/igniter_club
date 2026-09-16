import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import JoinSection from '../components/JoinSection';
import BackgroundScrubber from '../components/BackgroundScrubber';
import RoleSelectionModal from '../components/auth/RoleSelectionModal';
import StudentSignupModal from '../components/auth/StudentSignupModal';
import StudentLoginModal from '../components/auth/StudentLoginModal';
import { navigateWithAnimeExit } from '../utils/authAnimations';
import { supabase } from '../utils/supabase';
import { getCurrentUserRole } from '../utils/authRole';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleAuthEntry = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setIsRoleModalOpen(true);
        return;
      }

      const roleInfo = await getCurrentUserRole(user);
      if (roleInfo.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/home');
      }
    } catch (err) {
      console.error('Auth entry check failed:', err);
      setIsRoleModalOpen(true);
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const roleInfo = await getCurrentUserRole(user);
        if (roleInfo.isAdmin) {
          navigate('/admin/dashboard?intro=1');
        } else {
          navigate('/home?intro=1');
        }
      }
    } catch (err) {
      console.error('Error after signup:', err);
      navigate('/home?intro=1');
    }
  };

  const handleLoginSuccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const roleInfo = await getCurrentUserRole(user);
        if (roleInfo.isAdmin) {
          navigate('/admin/dashboard?intro=1');
        } else {
          navigate('/home?intro=1');
        }
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

        {/* Subtle separator */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
        </div>

        <div data-route-item>
          <JoinSection />
        </div>
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
        onSwitchToLogin={(email) => {
          if (email) setLoginEmail(email);
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <StudentLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialEmail={loginEmail}
        onCreateAccount={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
    </>
  );
}
