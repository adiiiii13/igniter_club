import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import StudentLayoutSkeleton from './student/StudentLayoutSkeleton';

export default function ProtectedRoute({ children, requireProfileComplete = false }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [hasCollegeId, setHasCollegeId] = useState(false);
  const [accountStatus, setAccountStatus] = useState('pending_profile');
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async (isInitialCheck = false) => {
      if (isInitialCheck) {
        setIsLoading(true);
      }
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        let user = sessionData?.session?.user || null;

        if (!user) {
          const { data } = await supabase.auth.getUser();
          user = data?.user || null;
        }

        if (!user) {
          setIsAuthenticated(false);
          setIsAdminUser(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Check if admin user
        const { data: adminRecord } = await supabase
          .from('admins')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle();

        const isKnownAdmin = ['noreplay.gkk26@gmail.com'].includes(
          (user.email || '').trim().toLowerCase()
        );

        if (adminRecord || isKnownAdmin) {
          setIsAdminUser(true);
          setIsLoading(false);
          return;
        }

        // Check student profile data
        const { data, error } = await supabase
          .from('students')
          .select('is_profile_complete, college_id, account_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setIsProfileComplete(false);
          setHasCollegeId(false);
          setAccountStatus('pending_profile');
        } else {
          setIsProfileComplete(data?.is_profile_complete || false);
          setHasCollegeId(!!data?.college_id);
          setAccountStatus(data?.account_status || 'pending_profile');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
      } finally {
        if (isInitialCheck) {
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    };

    if (!hasInitialized) {
      checkAuth(true);
    } else {
      checkAuth(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      checkAuth(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [requireProfileComplete, hasInitialized]);

  if (isLoading) {
    return <StudentLayoutSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Parallax-website-main/" replace />;
  }

  if (isAdminUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (accountStatus === 'locked') {
    return <Navigate to="/home" replace />;
  }

  // Check college ID first (unless already on oauth-setup page)
  if (!hasCollegeId && location.pathname !== '/student/oauth-setup') {
    return <Navigate to="/student/oauth-setup" replace />;
  }

  if (requireProfileComplete && (!isProfileComplete || accountStatus !== 'active')) {
    return <Navigate to="/student/complete-profile" replace />;
  }

  return children;
}
