import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiBell, FiChevronRight, FiHome } from 'react-icons/fi';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentProfileStrip from '../components/student/StudentProfileStrip';
import StudentNotificationDrawer from '../components/student/StudentNotificationDrawer';
import EditProfileModal from '../components/student/EditProfileModal';
import StudentLayoutSkeleton from '../components/student/StudentLayoutSkeleton';
import { supabase } from '../utils/supabase';

export default function StudentHome() {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [studentData, setStudentData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileReminderToast, setShowProfileReminderToast] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sectionLoading, setSectionLoading] = useState({
    announcements: false,
    events: false,
    stats: false,
    activity: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const isInitialLoad = refreshKey === 0;

      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setSectionLoading({
          announcements: true,
          events: true,
          stats: true,
          activity: true,
        });
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch student data
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (student) {
          setStudentData({
            id: student.id,
            fullName: student.full_name || 'Student',
            email: student.email || '',
            collegeId: student.college_id || '',
            phoneNumber: student.phone_number || '',
            joiningYear: student.joining_year || '',
            studyYear: student.study_year || '',
            semester: student.semester || '',
            department: student.department || 'Department not set',
            role: student.role || 'member',
            isProfileComplete: student.is_profile_complete || false,
            avatar: student.avatar || '👨‍🎓',
            joinDate: student.created_at ? new Date(student.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : '',
          });

          if (!student.is_profile_complete) {
            setShowProfileReminderToast(true);
          }

          // Calculate stats
          setStats({
            eventsAttended: student.events_attended || 0,
            badgesEarned: student.badges_earned || 0,
            memberSince: student.created_at ? new Date(student.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : '',
          });
        }

        // Fetch announcements
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const mappedAnnouncements = (announcementsData || []).map((ann) => ({
          id: ann.id,
          title: ann.title,
          desc: ann.description,
          time: new Date(ann.created_at).toLocaleString(),
        }));
        setAnnouncements(mappedAnnouncements);

        // Fetch events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .limit(5);

        const mappedEvents = (eventsData || []).map((event) => ({
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          isOnline: event.is_online || false,
          status: 'Upcoming',
        }));
        setEvents(mappedEvents);

        const notificationItems = [
          ...mappedAnnouncements.slice(0, 3).map((ann) => ({
            id: `announcement-${ann.id}`,
            type: 'announcement',
            title: ann.title,
            time: ann.time,
            read: false,
          })),
          ...mappedEvents.slice(0, 2).map((evt) => ({
            id: `event-${evt.id}`,
            type: 'event',
            title: evt.name,
            time: new Date(evt.date).toLocaleDateString(),
            read: false,
          })),
        ];
        setNotifications(notificationItems);

        // Fetch registered events
        const { data: registeredData } = await supabase
          .from('event_registrations')
          .select('events(*)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (registeredData) {
          setRegisteredEvents(
            registeredData
              .filter((reg) => reg?.events)
              .map((reg) => ({
                id: reg.events.id,
                name: reg.events.name,
                date: reg.events.date,
                status: 'Upcoming',
              }))
          );
        }

        // Fetch badges
        const { data: badgesData } = await supabase
          .from('student_badges')
          .select('badges(*), earned')
          .eq('student_id', user.id);

        if (badgesData) {
          setBadges(
            badgesData
              .filter((badge) => badge?.badges)
              .map((badge) => ({
                id: badge.badges.id,
                name: badge.badges.name,
                earned: badge.earned,
                event: badge.badges.event || '',
              }))
          );
        }
      } catch (err) {
        console.error('Error fetching student data:', err);

        // No mock fallback: render real data only and rely on empty states.
        setAnnouncements([]);
        setEvents([]);
        setRegisteredEvents([]);
        setBadges([]);
        setNotifications([]);
      } finally {
        setIsLoading(false);
        setSectionLoading({
          announcements: false,
          events: false,
          stats: false,
          activity: false,
        });
      }
    };

    fetchData();
  }, [refreshKey]);

  if (isLoading) {
    return <StudentLayoutSkeleton />;
  }

  const safeStudent = studentData || {
    id: null,
    fullName: 'Student',
    email: '',
    collegeId: 'GMIT/----/----',
    phoneNumber: '',
    joiningYear: '',
    studyYear: '',
    semester: '',
    department: 'Department not set',
    role: 'member',
    isProfileComplete: false,
    avatar: '👨‍🎓',
    joinDate: 'Recently',
  };

  const safeStats = stats || {
    eventsAttended: 0,
    badgesEarned: 0,
    memberSince: safeStudent.joinDate,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <AnimatePresence>
        {showProfileReminderToast && !safeStudent.isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="fixed top-4 right-4 z-40 w-[min(92vw,22rem)] rounded-xl border border-ignite-400/30 bg-dark-900/95 p-4 shadow-2xl shadow-black/35"
          >
            <p className="text-sm font-medium text-white">Complete your profile</p>
            <p className="mt-1 text-xs text-dark-300">Unlock all sidebar sections and features.</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/student/complete-profile')}
                className="text-xs font-medium text-ignite-300 hover:text-ignite-200 transition"
              >
                Complete now
              </button>
              <button
                type="button"
                onClick={() => setShowProfileReminderToast(false)}
                className="text-xs text-dark-400 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <StudentSidebar />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header with Notifications */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 border-b border-white/5 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-20">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-white">Student Dashboard</h1>
              <p className="text-xs text-dark-500 mt-0.5">Welcome back, {safeStudent.fullName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/home')}
                className="rounded-lg border border-white/10 bg-dark-900/60 px-3 py-1.5 text-xs text-dark-200 hover:text-white transition inline-flex items-center gap-1.5"
              >
                <FiHome size={14} />
                Home
              </button>
              <button
                onClick={() => navigate('/student/activity')}
                className="lg:hidden rounded-lg border border-white/10 bg-dark-900/60 px-3 py-1.5 text-xs text-dark-200 hover:text-white transition"
              >
                Activity
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-lg border border-white/10 bg-dark-900/70 text-dark-300 hover:text-white hover:bg-dark-800 transition"
              >
                <FiBell size={18} />
                {notifications.some((item) => !item.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Profile Strip */}
            <StudentProfileStrip student={safeStudent} onEditProfile={() => setIsEditProfileOpen(true)} />

            {!safeStudent.isProfileComplete && (
              <div className="mx-4 mt-4 rounded-xl border border-ignite-500/30 bg-ignite-500/10 px-4 py-3 sm:mx-6 shadow-sm shadow-ignite-500/10">
                <p className="text-sm text-ignite-100">Complete your profile to unlock all sidebar sections.</p>
                <button
                  type="button"
                  onClick={() => navigate('/student/complete-profile')}
                  className="mt-2 text-xs font-semibold text-ignite-300 hover:text-white transition"
                >
                  Go to Complete Profile →
                </button>
              </div>
            )}

            {/* Main Feed Grid */}
            <div className="px-4 py-6 sm:px-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 mb-8">
                {/* Announcements Card */}
                <div className="rounded-xl border border-white/10 bg-dark-900/60 p-5 hover:bg-dark-900/90 hover:-translate-y-0.5 transition">
                  <div className="border-l-2 border-ignite-400 pl-4 mb-4">
                    <h3 className="font-semibold text-white">Latest Announcement</h3>
                    <p className="text-xs text-dark-500 mt-1">Updates from the club</p>
                  </div>
                  {sectionLoading.announcements ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 w-3/4 rounded bg-white/10" />
                      <div className="h-3 w-full rounded bg-white/5" />
                      <div className="h-3 w-2/3 rounded bg-white/5" />
                      <div className="h-3 w-1/3 rounded bg-white/5 mt-2" />
                    </div>
                  ) : announcements.length === 0 && (
                    <p className="text-sm text-dark-400">No announcements yet.</p>
                  )}
                  {!sectionLoading.announcements && announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="mb-3">
                      <p className="text-sm font-medium text-white">{ann.title}</p>
                      <p className="text-xs text-dark-400 mt-1">{ann.desc}</p>
                      <p className="text-xs text-dark-600 mt-2">{ann.time}</p>
                    </div>
                  ))}
                  <button className="inline-flex items-center gap-1 text-xs text-ignite-400 hover:text-ignite-300 transition mt-4 font-medium">
                    View All <FiChevronRight size={14} />
                  </button>
                </div>

                {/* Events Card */}
                <div className="rounded-xl border border-white/10 bg-dark-900/60 p-5 hover:bg-dark-900/90 hover:-translate-y-0.5 transition">
                  <div className="border-l-2 border-ignite-400 pl-4 mb-4">
                    <h3 className="font-semibold text-white">Upcoming Event</h3>
                    <p className="text-xs text-dark-500 mt-1">Your next opportunity</p>
                  </div>
                  {sectionLoading.events ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 w-2/3 rounded bg-white/10" />
                      <div className="h-3 w-1/2 rounded bg-white/5" />
                      <div className="h-9 w-full rounded-lg bg-white/10 mt-4" />
                    </div>
                  ) : events.length === 0 && (
                    <p className="text-sm text-dark-400">No events scheduled yet.</p>
                  )}
                  {!sectionLoading.events && events.slice(0, 1).map((evt) => (
                    <div key={evt.id} className="mb-4">
                      <p className="text-sm font-medium text-white">{evt.name}</p>
                      <div className="flex items-center gap-2 text-xs text-dark-400 mt-2">
                        <FiCalendar size={14} />
                        {new Date(evt.date).toLocaleDateString()}
                      </div>
                      <button className="mt-3 w-full rounded-lg bg-ignite-400 px-3 py-2 text-xs font-medium text-dark-900 hover:bg-ignite-300 transition">
                        Register Now
                      </button>
                    </div>
                  ))}
                </div>

                {/* Stats Card */}
                <div className="rounded-xl border border-white/10 bg-dark-900/60 p-5 hover:bg-dark-900/90 hover:-translate-y-0.5 transition">
                  <div className="border-l-2 border-ignite-400 pl-4 mb-4">
                    <h3 className="font-semibold text-white">Quick Stats</h3>
                    <p className="text-xs text-dark-500 mt-1">Your contribution</p>
                  </div>
                  {sectionLoading.stats ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 w-full rounded bg-white/5" />
                      <div className="h-4 w-full rounded bg-white/5" />
                      <div className="h-4 w-full rounded bg-white/5" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">Events Attended</span>
                        <span className="font-semibold text-white">{safeStats.eventsAttended}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">Badges Earned</span>
                        <span className="font-semibold text-white">{safeStats.badgesEarned}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">Member Since</span>
                        <span className="text-xs font-medium text-white">{safeStats.memberSince}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* My Activity Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">My Activity</h2>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-4 border-b border-white/10 overflow-x-auto pb-1">
                  {['events', 'badges'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                        activeTab === tab
                          ? 'text-ignite-400 border-ignite-400'
                          : 'text-dark-400 border-transparent hover:text-white'
                      }`}
                    >
                      {tab === 'events' ? 'Registered Events' : 'Badges'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-3">
                  {sectionLoading.activity && activeTab === 'events' && (
                    <div className="animate-pulse space-y-3">
                      <div className="h-16 rounded-xl border border-white/10 bg-dark-900/60" />
                      <div className="h-16 rounded-xl border border-white/10 bg-dark-900/60" />
                      <div className="h-16 rounded-xl border border-white/10 bg-dark-900/60" />
                    </div>
                  )}
                  {activeTab === 'events' && (
                    <>
                      {!sectionLoading.activity && registeredEvents.map((evt) => (
                        <div key={evt.id} className="rounded-xl border border-white/10 bg-dark-900/60 p-4 hover:bg-dark-900/90 transition">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">{evt.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <FiCalendar size={14} className="text-dark-400" />
                                <span className="text-xs text-dark-400">{new Date(evt.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              evt.status === 'Attended'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-ignite-400/20 text-ignite-300'
                            }`}>
                              {evt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'badges' && (
                    <>
                      {sectionLoading.activity ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
                          <div className="h-24 rounded-xl border border-white/10 bg-dark-900/60" />
                          <div className="h-24 rounded-xl border border-white/10 bg-dark-900/60" />
                          <div className="h-24 rounded-xl border border-white/10 bg-dark-900/60" />
                          <div className="h-24 rounded-xl border border-white/10 bg-dark-900/60" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {badges.map((badge) => (
                            <div
                              key={badge.id}
                              className={`rounded-xl border p-4 text-center transition ${
                                badge.earned
                                  ? 'border-ignite-400/30 bg-ignite-400/10 hover:bg-ignite-400/20'
                                  : 'border-white/5 bg-dark-900/30 opacity-50'
                              }`}
                            >
                              <div className="text-2xl mb-2">{badge.earned ? '🏆' : '🔒'}</div>
                              <p className="text-xs font-medium text-white">{badge.name}</p>
                              <p className="text-xs text-dark-500 mt-1">{badge.event}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Drawer */}
      <StudentNotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        isProfileComplete={safeStudent.isProfileComplete}
        notifications={notifications}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        student={safeStudent}
        onSaved={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
