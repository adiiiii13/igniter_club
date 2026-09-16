import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentNotificationDrawer from '../components/student/StudentNotificationDrawer';
import { supabase } from '../utils/supabase';

const mobileSectionLinks = [
  { label: 'Home', href: '/student/home' },
  { label: 'My Activity', href: '/student/activity' },
  { label: 'Events', href: '/student/events' },
  { label: 'Resources', href: '/student/resources' },
  { label: 'Notifications', href: '/student/notifications' },
];

const sectionTitleMap = {
  activity: 'My Activity',
  events: 'Events',
  resources: 'Resources',
  notifications: 'Notifications',
};

export default function StudentSectionPage({ title: titleProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { section } = useParams();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  const title = titleProp || sectionTitleMap[section] || 'Section';

  useEffect(() => {
    const loadProfileStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
        {/* Persistent sidebar — never remounted */}
        <StudentSidebar />

        <div className="flex-1 min-w-0">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-dark-950/80 px-4 py-4 backdrop-blur-sm sm:px-6 sticky top-0 z-20">
            <div>
              <h1 className="text-lg font-semibold text-white sm:text-xl">{title}</h1>
              <p className="mt-0.5 text-xs text-dark-500">Igniter Club — Student Portal</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="rounded-lg border border-white/10 bg-dark-900/70 p-2 text-dark-300 transition hover:bg-dark-800 hover:text-white"
            >
              <FiBell size={18} />
            </button>
          </div>

          {/* Mobile section pills */}
          <div className="lg:hidden border-b border-white/5 bg-dark-950/70 px-4 py-3 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mobileSectionLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => { if (!isActive) navigate(link.href); }}
                    className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-ignite-400/20 text-ignite-200 border border-ignite-400/40'
                        : 'bg-dark-900/70 text-dark-300 border border-white/10 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Content — animated on section change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative px-4 py-10 sm:px-6"
            >
              <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-8 text-center sm:p-12">
                <p className="text-2xl font-semibold text-white sm:text-3xl">{title}</p>
                <p className="mt-2 text-sm text-dark-300">This section is under active development.</p>
                <p className="mt-6 text-xs uppercase tracking-[0.22em] text-ignite-400/70">Coming Soon</p>
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none text-5xl font-black tracking-[0.18em] text-white/5 sm:text-7xl">
                  COMING SOON
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
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
