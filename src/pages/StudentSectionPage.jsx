import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, NavLink } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentNotificationDrawer from '../components/student/StudentNotificationDrawer';
import { supabase } from '../utils/supabase';

function StudentSectionPageContent({ title: titleProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState(null);

  const { section } = useParams();

  const sectionTitleMap = {
    'activity': 'My Activity',
    'events': 'Events',
    'resources': 'Resources',
    'notifications': 'Notifications',
  };
  const title = titleProp || sectionTitleMap[section] || 'Section';

  const mobileSectionLinks = [
    { label: 'Home', href: '/student/home' },
    { label: 'My Activity', href: '/student/activity' },
    { label: 'Events', href: '/student/events' },
    { label: 'Resources', href: '/student/resources' },
    { label: 'Notifications', href: '/student/notifications' },
  ];

  useEffect(() => {
    const loadProfileStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from('students')
          .select('is_profile_complete')
          .eq('id', user.id)
          .single();

        setIsProfileComplete(data?.is_profile_complete || false);
      } catch (err) {
        console.error('Section profile status error:', err);
      }
    };

    loadProfileStatus();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="flex">
        <StudentSidebar />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between border-b border-white/5 bg-dark-950/80 px-4 py-4 backdrop-blur-sm sm:px-6">
            <div>
              <h1 className="text-lg font-semibold text-white sm:text-xl">{title}</h1>
              <p className="mt-0.5 text-xs text-dark-500">Student section is being built</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="rounded-lg border border-white/10 bg-dark-900/70 p-2 text-dark-300 transition hover:bg-dark-800 hover:text-white"
            >
              <FiBell size={18} />
            </button>
          </div>

          <div className="lg:hidden border-b border-white/5 bg-dark-950/70 px-4 py-3 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mobileSectionLinks.map((link) => {
                const isActive = location.pathname === link.href;
                const isNavigating = navigatingTo === link.href;
                
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isActive) return;
                      setNavigatingTo(link.href);
                      setTimeout(() => window.location.href = link.href, 120);
                    }}
                    className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                      isActive && !isNavigating
                        ? 'bg-ignite-400/20 text-ignite-200 border border-ignite-400/40'
                        : isNavigating
                          ? 'bg-ignite-400/10 text-ignite-300 border border-ignite-400/30 shadow-[0_0_10px_rgba(190,24,93,0.2)] animate-pulse'
                          : 'bg-dark-900/70 text-dark-300 border border-white/10 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="relative px-4 py-10 sm:px-6">
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-8 text-center sm:p-12">
              <p className="text-2xl font-semibold text-white sm:text-3xl">{title}</p>
              <p className="mt-2 text-sm text-dark-300">This section is under active development.</p>
              <p className="mt-6 text-xs uppercase tracking-[0.22em] text-ignite-400/70">Coming Soon</p>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="select-none text-5xl font-black tracking-[0.18em] text-white/5 sm:text-7xl">COMING SOON</span>
            </div>
          </div>
        </div>
      </div>

      <StudentNotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        isProfileComplete={isProfileComplete}
      />
    </div>
  );
}

export default function StudentSectionPage(props) {
  const { section } = useParams();
  const location = useLocation();
  console.log('[DEBUG] StudentSectionPage wrapper rendered. useParams section:', section, 'location.pathname:', location.pathname);

  // Using key={section} unconditionally forces React to destroy and completely recreate the entire component
  // whenever the route section changes. This permanently fixes the 'frozen UI' issue in client-side navigation.
  return <StudentSectionPageContent key={section || 'none'} {...props} />;
}
