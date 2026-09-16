import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUserRole } from '../utils/authRole';
import { supabase } from '../utils/supabase';

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        let user = sessionData?.session?.user || null;

        if (!user) {
          const { data } = await supabase.auth.getUser();
          user = data?.user || null;
        }

        if (!user) {
          if (isMounted) {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) setIsAuthenticated(true);

        const roleInfo = await getCurrentUserRole(user);

        if (isMounted) {
          setIsAdmin(roleInfo.isAdmin);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Admin protection verification error:', err);
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    };

    verifyAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } else {
        const roleInfo = await getCurrentUserRole(session.user);
        if (isMounted) {
          setIsAuthenticated(true);
          setIsAdmin(roleInfo.isAdmin);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl border border-ignite-500/40 bg-ignite-500/10 flex items-center justify-center animate-pulse shadow-lg shadow-ignite-500/20 mb-4">
          <span className="text-ignite-400 font-mono font-bold text-lg">🛡️</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white">Loading Admin Dashboard</p>
        <p className="text-xs text-dark-400 mt-1">Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
