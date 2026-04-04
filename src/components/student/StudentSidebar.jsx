import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiClipboard, FiCalendar, FiBook, FiBell, FiLogOut, FiLock } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigatingTo, setNavigatingTo] = useState(null);
  
  const [student, setStudent] = useState({
    fullName: 'Student',
    role: 'member',
    avatar: '👨‍🎓',
    isProfileComplete: null,
  });

  const navItems = [
    { label: 'Home', icon: FiHome, href: '/student/home', requiresProfile: false },
    { label: 'My Activity', icon: FiClipboard, href: '/student/activity', requiresProfile: true },
    { label: 'Events', icon: FiCalendar, href: '/student/events', requiresProfile: true },
    { label: 'Resources', icon: FiBook, href: '/student/resources', requiresProfile: true },
    { label: 'Notifications', icon: FiBell, href: '/student/notifications', requiresProfile: true },
  ];

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from('students')
          .select('full_name, role, avatar, is_profile_complete')
          .eq('id', user.id)
          .single();

        if (!data) return;

        setStudent({
          fullName: data.full_name || 'Student',
          role: data.role || 'member',
          avatar: data.avatar || '👨‍🎓',
          isProfileComplete: Boolean(data.is_profile_complete),
        });
      } catch (err) {
        console.error('Sidebar student load error:', err);
      }
    };

    loadStudent();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadStudent();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  const hasAvatarUrl = typeof student.avatar === 'string' && /^https?:\/\//.test(student.avatar);



  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-dark-900/70 border-r border-white/5 p-4 sticky top-0 h-screen">
      {/* Logo */}
      <div className="mb-8 px-2">
        <Link to="/home" className="brand-logo-shell brand-logo-sidebar" aria-label="Go to home">
          <img
            src="/GMITxIgnite-removebg-preview.png"
            alt="Igniter Club x GMIT Logo"
            className="brand-logo-img"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isLocked = item.requiresProfile && student.isProfileComplete === false;
          const isActive = location.pathname === item.href;
          const isNavigating = navigatingTo === item.href;
          
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                if (isLocked) {
                  navigate('/student/complete-profile');
                  return;
                }
                if (isActive) return;
                
                // Show a smooth, professional loading state briefly, then natively redirect
                // resolving any deep React Router bugs permanently.
                setNavigatingTo(item.href);
                setTimeout(() => {
                  window.location.href = item.href;
                }, 120);
              }}
              title={isLocked ? 'Complete profile to unlock' : item.label}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive && !isNavigating
                  ? 'text-white bg-dark-800/90 border border-ignite-400/40 shadow-[0_8px_24px_rgba(190,24,93,0.16)]'
                  : isLocked
                    ? 'text-dark-600 border border-transparent cursor-not-allowed'
                    : isNavigating
                      ? 'text-ignite-300 bg-ignite-400/10 border border-ignite-400/30 shadow-[0_0_15px_rgba(190,24,93,0.2)]'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800/50 border border-transparent'
              }`}
            >
              {/* Optional pulsating background during navigation */}
              {isNavigating && (
                <span className="absolute inset-0 rounded-xl bg-ignite-400/20 animate-pulse" />
              )}
              
              <Icon size={18} className={`relative z-10 ${isNavigating ? 'animate-bounce' : ''}`} />
              <span className="relative z-10 flex-1 text-left">{item.label}</span>
              
              {isLocked && <FiLock size={14} className="relative z-10 text-dark-600" />}
              {item.badge && (
                <span className="relative z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom Profile Card */}
      <div className="rounded-xl border border-white/10 bg-dark-800/50 p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-ignite-400/20 flex items-center justify-center text-lg">
            {hasAvatarUrl ? (
              <img src={student.avatar} alt={student.fullName} className="h-full w-full object-cover" />
            ) : (
              student.avatar
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{student.fullName}</p>
            <p className="text-xs text-dark-500 capitalize">{student.role}</p>
          </div>
        </div>
        {student.isProfileComplete === false && (
          <div className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2.5">
            <p className="text-[11px] leading-relaxed text-amber-200">Complete your profile to unlock all sidebar options.</p>
            <button
              type="button"
              onClick={() => navigate('/student/complete-profile')}
              className="mt-2 text-[11px] font-medium text-amber-300 hover:text-amber-200 transition"
            >
              Complete Profile
            </button>
          </div>
        )}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-dark-400 hover:text-red-400 transition rounded-lg hover:bg-white/5">
          <FiLogOut size={14} />
          Logout
        </button>
        <button
          onClick={() => navigate('/auth/change-password')}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-dark-400 hover:text-ignite-300 transition rounded-lg hover:bg-white/5"
        >
          <FiLock size={14} />
          Change Password
        </button>
      </div>
    </aside>
  );
}
