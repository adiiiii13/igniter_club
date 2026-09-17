import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiPlus,
  FiSearch,
  FiChevronRight,
  FiAward,
  FiBook,
  FiExternalLink,
  FiUserCheck,
  FiBookmark,
  FiRefreshCw,
  FiInfo,
  FiX,
  FiActivity,
  FiVideo,
  FiTag,
  FiCheck,
  FiLayers,
} from 'react-icons/fi';
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
  events: 'Club Events',
  resources: 'Learning Resources',
  notifications: 'Announcements & Alerts',
};

const sectionSubtitleMap = {
  activity: 'Track your participation history, registered sessions, and earned club badges.',
  events: 'Discover upcoming workshops, tech symposiums, hackathons, and guest lectures.',
  resources: 'Curated developer roadmaps, project kits, and orientation guides.',
  notifications: 'Official updates, urgent notices, and broadcasts from club leadership.',
};

// Curated resources directory
const DEFAULT_RESOURCES = [
  {
    id: 'res-git-guide',
    title: 'Git & GitHub Hands-on Quickstart',
    category: 'Guides',
    description: 'Master version control, branches, pull requests, and collaborative open-source workflows.',
    url: 'https://github.com',
    type: 'Guide & Cheatsheet',
    badge: 'Essential',
  },
  {
    id: 'res-fullstack-kit',
    title: 'Modern Full-Stack Web Development Roadmap',
    category: 'Web Dev',
    description: 'A curated roadmap covering React, Node.js, Tailwind CSS, PostgreSQL, and modern API design.',
    url: 'https://roadmap.sh/full-stack',
    type: 'Curriculum Roadmap',
    badge: 'Popular',
  },
  {
    id: 'res-ai-notebooks',
    title: 'AI & Machine Learning Foundations',
    category: 'AI & ML',
    description: 'Beginner to intermediate Python notebooks covering NumPy, Pandas, Scikit-Learn, and Neural Networks.',
    url: 'https://github.com',
    type: 'Jupyter Notebooks',
    badge: 'Workshop Asset',
  },
  {
    id: 'res-competitive-prog',
    title: 'Data Structures & Algorithms Problem Bank',
    category: 'Problem Solving',
    description: 'Topic-wise curated collection of foundational DSA patterns for technical interviews and coding contests.',
    url: 'https://leetcode.com',
    type: 'Practice Directory',
    badge: 'Career',
  },
  {
    id: 'res-club-branding',
    title: 'Igniter Club Brand Assets & Guidelines',
    category: 'Club Assets',
    description: 'Official Igniter Club SVG logos, color codes, presentation templates, and poster assets.',
    url: '/home',
    type: 'Design Assets',
    badge: 'Official',
  },
];

export default function StudentSectionPage({ title: titleProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { section = 'events' } = useParams();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Section specific data
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [announcements, setAnnouncements] = useState([]);
  const [studentStats, setStudentStats] = useState({
    eventsAttended: 0,
    badgesEarned: 0,
    memberSince: '',
  });
  const [registeredEventsList, setRegisteredEventsList] = useState([]);

  // Filter / Search / Tab states
  const [eventsTab, setEventsTab] = useState('upcoming'); // 'upcoming' | 'all' | 'registered'
  const [eventSearch, setEventSearch] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('ALL');
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [resourceCategory, setResourceCategory] = useState('ALL');
  const [resourceSearch, setResourceSearch] = useState('');

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisteringId, setIsRegisteringId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const title = titleProp || sectionTitleMap[section] || 'Section';
  const subtitle = sectionSubtitleMap[section] || 'Igniter Club — Student Portal';

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load user profile & section data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/home', { replace: true });
          return;
        }
        if (isMounted) setCurrentUser(user);

        // Fetch student profile
        const { data: studentRecord } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (isMounted && studentRecord) {
          setIsProfileComplete(Boolean(studentRecord.is_profile_complete));
          setStudentStats({
            eventsAttended: studentRecord.events_attended || 0,
            badgesEarned: studentRecord.badges_earned || 0,
            memberSince: studentRecord.created_at
              ? new Date(studentRecord.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : '2026',
          });
        }

        // Fetch based on active section
        if (section === 'events' || section === 'activity') {
          // 1. Events
          const { data: eventsData, error: evError } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

          if (!evError && isMounted) {
            setEvents(eventsData || []);
          }

          // 2. User Registrations
          const { data: regData, error: regError } = await supabase
            .from('event_registrations')
            .select('*, events(*)')
            .eq('student_id', user.id);

          if (!regError && isMounted) {
            const registeredIds = new Set((regData || []).map((r) => r.event_id));
            setRegisteredEventIds(registeredIds);
            const mappedRegList = (regData || [])
              .filter((r) => r.events)
              .map((r) => ({
                id: r.id,
                eventId: r.event_id,
                name: r.events.name,
                date: r.events.date,
                location: r.events.location,
                isOnline: r.events.is_online,
                meetingLink: r.events.meeting_link,
                registeredAt: r.created_at,
              }));
            setRegisteredEventsList(mappedRegList);
          }
        }

        if (section === 'notifications') {
          const { data: annData, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

          if (!annError && isMounted) {
            setAnnouncements(annData || []);
          }
        }
      } catch (err) {
        console.error('Failed loading section data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    // Supabase Real-time listener for announcements & events
    const announcementsChannel = supabase
      .channel('student-section-announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(announcementsChannel);
    };
  }, [section, navigate]);

  // Event registration toggle handler
  const handleToggleRegistration = async (eventId, isCurrentlyRegistered) => {
    if (!currentUser) return;
    setIsRegisteringId(eventId);

    try {
      if (isCurrentlyRegistered) {
        // Cancel registration
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .eq('student_id', currentUser.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setRegisteredEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        setRegisteredEventsList((prev) => prev.filter((r) => r.eventId !== eventId));
        showToast('info', 'Event registration cancelled.');
      } else {
        // Register for event
        const { error } = await supabase
          .from('event_registrations')
          .insert([{ student_id: currentUser.id, event_id: eventId, status: 'confirmed' }]);

        if (error) throw error;

        setRegisteredEventIds((prev) => new Set([...prev, eventId]));
        const targetedEvent = events.find((e) => e.id === eventId);
        if (targetedEvent) {
          setRegisteredEventsList((prev) => [
            {
              id: `reg-${Date.now()}`,
              eventId: targetedEvent.id,
              name: targetedEvent.name,
              date: targetedEvent.date,
              location: targetedEvent.location,
              isOnline: targetedEvent.is_online,
              meetingLink: targetedEvent.meeting_link,
              registeredAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        showToast('success', '🎉 Successfully registered for event!');
      }
    } catch (err) {
      console.error('Registration toggle failed:', err);
      showToast('error', 'Action failed: ' + (err.message || 'Please try again.'));
    } finally {
      setIsRegisteringId(null);
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((evt) => {
      // Search filter
      const matchesSearch =
        !eventSearch.trim() ||
        evt.name?.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.description?.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.location?.toLowerCase().includes(eventSearch.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      const evtDate = evt.date ? new Date(evt.date) : null;
      const isUpcoming = evtDate ? evtDate >= today : true;
      const isRegistered = registeredEventIds.has(evt.id);

      if (eventsTab === 'upcoming') return isUpcoming;
      if (eventsTab === 'registered') return isRegistered;
      return true;
    });
  }, [events, eventSearch, eventsTab, registeredEventIds]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesSearch =
        !announcementSearch.trim() ||
        item.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
        (item.description || item.content || '')?.toLowerCase().includes(announcementSearch.toLowerCase());

      const matchesCat =
        announcementCategory === 'ALL' ||
        item.category?.toLowerCase() === announcementCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [announcements, announcementSearch, announcementCategory]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return DEFAULT_RESOURCES.filter((res) => {
      const matchesSearch =
        !resourceSearch.trim() ||
        res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        res.description.toLowerCase().includes(resourceSearch.toLowerCase());

      const matchesCat =
        resourceCategory === 'ALL' || res.category === resourceCategory;

      return matchesSearch && matchesCat;
    });
  }, [resourceSearch, resourceCategory]);

  // Club Badges definition
  const clubBadges = useMemo(() => {
    const isMember = true;
    const hasRegistered = registeredEventIds.size > 0;
    const hasAttended = (studentStats.eventsAttended || 0) > 0;
    const isChampion = (studentStats.eventsAttended || 0) >= 3;

    return [
      {
        id: 'b-welcome',
        name: 'Igniter Member',
        desc: 'Joined the official Igniter Club community.',
        icon: '🌟',
        unlocked: isMember,
        requirement: 'Welcome to the club',
      },
      {
        id: 'b-explorer',
        name: 'Event Explorer',
        desc: 'Registered for your first club event or workshop.',
        icon: '🎟️',
        unlocked: hasRegistered,
        requirement: 'Register for 1 event',
      },
      {
        id: 'b-pioneer',
        name: 'Campus Pioneer',
        desc: 'Attended and checked in at a campus tech session.',
        icon: '🚀',
        unlocked: hasAttended,
        requirement: 'Attend 1 verified event',
      },
      {
        id: 'b-champion',
        name: 'Workshop Master',
        desc: 'Demonstrated consistency across 3+ club sessions.',
        icon: '🏆',
        unlocked: isChampion,
        requirement: 'Attend 3+ verified events',
      },
      {
        id: 'b-hackathon',
        name: 'Hackathon Hero',
        desc: 'Participated in a hackathon or technical showcase.',
        icon: '⚡',
        unlocked: false,
        requirement: 'Compete in Annual Hackathon',
      },
    ];
  }, [registeredEventIds, studentStats]);

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col">
      <div className="flex flex-1">
        {/* Persistent sidebar */}
        <StudentSidebar />

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Sticky Top Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-dark-950/80 px-4 py-4 backdrop-blur-md sm:px-6 sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-ignite-400">Student Portal</span>
                <span className="text-dark-600 text-xs">/</span>
                <span className="text-xs text-dark-400">{sectionTitleMap[section] || section}</span>
              </div>
              <h1 className="text-lg font-bold font-outfit text-white sm:text-xl tracking-wide mt-0.5">{title}</h1>
              <p className="text-xs text-dark-400 hidden sm:block">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/student/home"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-dark-900/60 hover:bg-dark-800 text-xs text-dark-300 hover:text-white transition"
              >
                ← Back to Home
              </Link>
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="relative rounded-xl border border-white/10 bg-dark-900/70 p-2 text-dark-300 transition hover:bg-dark-800 hover:text-white cursor-pointer"
                title="View Notifications"
              >
                <FiBell size={18} />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-ignite-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile section navigation pills */}
          <div className="lg:hidden border-b border-white/5 bg-dark-950/70 px-4 py-2.5 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {mobileSectionLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => { if (!isActive) navigate(link.href); }}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-ignite-500/20 text-ignite-300 border border-ignite-500/40'
                        : 'bg-dark-900/70 text-dark-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between shadow-xl ${
                  toastMessage.type === 'error'
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                    : toastMessage.type === 'info'
                    ? 'bg-blue-950/80 border-blue-500/40 text-blue-200'
                    : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <span>{toastMessage.text}</span>
                <button
                  onClick={() => setToastMessage(null)}
                  className="p-1 text-white/60 hover:text-white transition"
                >
                  <FiX size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Dynamic Content Area */}
          <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
            {isLoading ? (
              // Loading Skeleton
              <div className="space-y-4 py-8">
                <div className="h-10 w-64 bg-dark-900/70 rounded-xl animate-pulse border border-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-dark-900/50 border border-white/5 animate-pulse p-6 space-y-3">
                      <div className="h-4 w-20 bg-white/10 rounded" />
                      <div className="h-6 w-3/4 bg-white/10 rounded" />
                      <div className="h-12 w-full bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // -------------------------------------------------------------
              // SECTION 1: EVENTS (/student/events)
              // -------------------------------------------------------------
              section === 'events' && (
                <div className="space-y-6">
                  {/* Controls: Tabs & Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/60 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-1.5 p-1 bg-dark-950/70 rounded-xl border border-white/5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setEventsTab('upcoming')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          eventsTab === 'upcoming'
                            ? 'bg-ignite-500/20 text-ignite-300 border border-ignite-500/30'
                            : 'text-dark-400 hover:text-white'
                        }`}
                      >
                        Upcoming Sessions
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventsTab('registered')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          eventsTab === 'registered'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'text-dark-400 hover:text-white'
                        }`}
                      >
                        <span>My Registrations</span>
                        {registeredEventIds.size > 0 && (
                          <span className="w-4 h-4 rounded-full bg-purple-500/40 text-purple-200 text-[10px] flex items-center justify-center font-bold">
                            {registeredEventIds.size}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventsTab('all')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          eventsTab === 'all'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-dark-400 hover:text-white'
                        }`}
                      >
                        All Events
                      </button>
                    </div>

                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search events by title or venue..."
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="pl-8 pr-4 py-2 rounded-xl border border-white/10 bg-dark-800 text-xs text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 w-full sm:w-64"
                      />
                    </div>
                  </div>

                  {/* Events Grid or Empty Handler */}
                  {filteredEvents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-dark-900/40 py-16 px-6 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-dark-800/80 border border-white/10 mx-auto flex items-center justify-center text-dark-400 text-2xl">
                        <FiCalendar className="text-ignite-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {eventsTab === 'registered'
                          ? 'No Event Registrations Yet'
                          : eventSearch
                          ? 'No Events Match Your Search'
                          : 'No Events Scheduled Currently'}
                      </h3>
                      <p className="text-xs text-dark-400 max-w-md mx-auto leading-relaxed">
                        {eventsTab === 'registered'
                          ? "You haven't signed up for any club events yet. Switch to the Upcoming Sessions tab to reserve your seat in workshops and tech talks!"
                          : eventSearch
                          ? `No events found matching "${eventSearch}". Clear your search query to see all club programs.`
                          : 'The Igniter Club executive committee is actively planning upcoming workshops, hackathons, and symposiums. Keep an eye on announcements!'}
                      </p>
                      {eventsTab === 'registered' && (
                        <button
                          type="button"
                          onClick={() => setEventsTab('upcoming')}
                          className="mt-2 px-4 py-2 rounded-xl bg-ignite-500/20 hover:bg-ignite-500/30 text-ignite-300 border border-ignite-500/30 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          Browse Upcoming Events →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredEvents.map((event) => {
                        const isRegistered = registeredEventIds.has(event.id);
                        const isRegistering = isRegisteringId === event.id;
                        const eventDateObj = event.date ? new Date(event.date) : null;
                        const formattedDate = eventDateObj
                          ? eventDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Date TBD';

                        return (
                          <div
                            key={event.id}
                            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 relative group ${
                              isRegistered
                                ? 'border-purple-500/30 bg-purple-950/10 shadow-lg shadow-purple-950/20'
                                : 'border-white/10 bg-dark-900/70 hover:bg-dark-900 hover:border-white/20'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-ignite-500/15 border border-ignite-500/30 text-ignite-300">
                                  {event.status || 'Club Event'}
                                </span>
                                {isRegistered && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                    <FiCheck size={11} /> Registered
                                  </span>
                                )}
                              </div>

                              <div>
                                <h3 className="text-base font-bold text-white group-hover:text-ignite-300 transition-colors">
                                  {event.name}
                                </h3>
                                <p className="text-xs text-dark-300 mt-1.5 line-clamp-3 leading-relaxed">
                                  {event.description || 'Join this exciting club session to learn hands-on technical skills and collaborate with peers.'}
                                </p>
                              </div>

                              <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-dark-300">
                                <div className="flex items-center gap-2">
                                  <FiCalendar className="text-ignite-400 text-xs shrink-0" />
                                  <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FiMapPin className="text-ignite-400 text-xs shrink-0" />
                                  <span className="truncate">{event.location || (event.is_online ? 'Virtual Online Session' : 'Campus Lab')}</span>
                                </div>
                                {event.is_online && event.meeting_link && isRegistered && (
                                  <div className="flex items-center gap-2 pt-1 text-emerald-400 font-mono text-[11px]">
                                    <FiVideo size={12} />
                                    <a
                                      href={event.meeting_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline hover:text-emerald-300 truncate"
                                    >
                                      Join Meeting Room ↗
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-white/5">
                              <button
                                type="button"
                                disabled={isRegistering}
                                onClick={() => handleToggleRegistration(event.id, isRegistered)}
                                className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                                  isRegistered
                                    ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300'
                                    : 'bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white shadow-lg shadow-ignite-500/20'
                                }`}
                              >
                                {isRegistering ? (
                                  <>
                                    <FiRefreshCw className="animate-spin text-xs" />
                                    <span>Updating...</span>
                                  </>
                                ) : isRegistered ? (
                                  <>
                                    <FiX size={13} />
                                    <span>Cancel Registration</span>
                                  </>
                                ) : (
                                  <>
                                    <FiCheckCircle size={13} />
                                    <span>Register for Session</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            )}

            {/* -------------------------------------------------------------
              // SECTION 2: MY ACTIVITY (/student/activity)
              // ------------------------------------------------------------- */}
            {!isLoading && section === 'activity' && (
              <div className="space-y-6">
                {/* Stats Header Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Registrations</span>
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <FiBookmark />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-bold font-outfit text-white">{registeredEventsList.length}</p>
                    <p className="mt-1 text-[11px] text-dark-400">Events registered</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Verified Attendance</span>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <FiUserCheck />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-bold font-outfit text-white">{studentStats.eventsAttended}</p>
                    <p className="mt-1 text-[11px] text-dark-400">Sessions attended in-person</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Badges Unlocked</span>
                      <div className="p-2 rounded-xl bg-ignite-500/10 text-ignite-400 border border-ignite-500/20">
                        <FiAward />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-bold font-outfit text-white">
                      {clubBadges.filter((b) => b.unlocked).length} / {clubBadges.length}
                    </p>
                    <p className="mt-1 text-[11px] text-dark-400">Achievement milestones</p>
                  </div>
                </div>

                {/* Badges Showcase */}
                <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <FiAward className="text-ignite-400" />
                        Club Badges & Recognition
                      </h3>
                      <p className="text-xs text-dark-400 mt-0.5">
                        Earn special community badges by attending events, contributing, and engaging.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
                    {clubBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`rounded-xl border p-4 text-center transition-all flex flex-col justify-between ${
                          badge.unlocked
                            ? 'border-ignite-500/30 bg-ignite-500/10 shadow-lg shadow-ignite-500/10'
                            : 'border-white/5 bg-dark-800/30 opacity-60'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="text-3xl select-none">{badge.unlocked ? badge.icon : '🔒'}</div>
                          <h4 className="text-xs font-bold text-white tracking-wide">{badge.name}</h4>
                          <p className="text-[10px] text-dark-400 leading-tight">{badge.desc}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                              badge.unlocked
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-dark-700 text-dark-400'
                            }`}
                          >
                            {badge.unlocked ? 'Unlocked' : badge.requirement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registered Events Log */}
                <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FiActivity className="text-ignite-400" />
                      My Event Registrations & History ({registeredEventsList.length})
                    </h3>
                    <Link to="/student/events" className="text-xs text-ignite-400 hover:underline">
                      Explore More Events →
                    </Link>
                  </div>

                  {registeredEventsList.length === 0 ? (
                    <div className="py-10 text-center rounded-xl border border-dashed border-white/10 bg-dark-800/30 space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-dark-700/50 border border-white/10 mx-auto flex items-center justify-center text-dark-400 text-lg">
                        <FiBookmark />
                      </div>
                      <p className="text-sm font-semibold text-white">No Event History Recorded</p>
                      <p className="text-xs text-dark-400 max-w-sm mx-auto">
                        You haven't signed up for any events yet. Your registrations and attendance records will appear here.
                      </p>
                      <Link
                        to="/student/events"
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ignite-500/20 hover:bg-ignite-500/30 text-ignite-300 border border-ignite-500/30 text-xs font-semibold transition"
                      >
                        Join an Event Now
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 space-y-2">
                      {registeredEventsList.map((reg) => (
                        <div key={reg.id} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-white">{reg.name}</p>
                            <p className="text-xs text-dark-400 mt-0.5">
                              {reg.date ? new Date(reg.date).toLocaleDateString() : 'Date TBD'} • {reg.location || (reg.isOnline ? 'Online Session' : 'Campus')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium flex items-center gap-1">
                              <FiCheckCircle size={12} /> Confirmed
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRegistration(reg.eventId, true)}
                              className="px-2.5 py-1 rounded-lg border border-white/10 bg-dark-800 text-xs text-dark-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
              // SECTION 3: LEARNING RESOURCES (/student/resources)
              // ------------------------------------------------------------- */}
            {!isLoading && section === 'resources' && (
              <div className="space-y-6">
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/60 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                    {['ALL', 'Guides', 'Web Dev', 'AI & ML', 'Problem Solving', 'Club Assets'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setResourceCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          resourceCategory === cat
                            ? 'bg-ignite-500/20 text-ignite-300 border border-ignite-500/40'
                            : 'bg-dark-800 text-dark-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Resources' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search learning materials..."
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      className="pl-8 pr-4 py-2 rounded-xl border border-white/10 bg-dark-800 text-xs text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 w-full sm:w-60"
                    />
                  </div>
                </div>

                {/* Resources Grid or Empty Handler */}
                {filteredResources.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-dark-900/40 py-16 px-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-dark-800/80 border border-white/10 mx-auto flex items-center justify-center text-dark-400 text-2xl">
                      <FiBook className="text-ignite-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">No Resources Found</h3>
                    <p className="text-xs text-dark-400 max-w-sm mx-auto">
                      No learning materials match your current category or search keyword. Try switching categories or clearing search.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResourceCategory('ALL');
                        setResourceSearch('');
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs text-white hover:bg-dark-700 transition cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResources.map((res) => (
                      <div
                        key={res.id}
                        className="rounded-2xl border border-white/10 bg-dark-900/70 p-5 hover:bg-dark-900 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-ignite-500/15 border border-ignite-500/30 text-ignite-300">
                              {res.category}
                            </span>
                            <span className="text-[10px] font-mono text-dark-500">
                              {res.type}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-ignite-300 transition-colors leading-snug">
                            {res.title}
                          </h3>

                          <p className="text-xs text-dark-300 line-clamp-3 leading-relaxed">
                            {res.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-dark-400">
                            {res.badge}
                          </span>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ignite-400 hover:text-ignite-300 transition"
                          >
                            <span>Access Resource</span>
                            <FiExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
              // SECTION 4: NOTIFICATIONS & ANNOUNCEMENTS (/student/notifications)
              // ------------------------------------------------------------- */}
            {!isLoading && section === 'notifications' && (
              <div className="space-y-6">
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/60 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                    {['ALL', 'general', 'event', 'workshop', 'milestone', 'urgent', 'opportunity'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAnnouncementCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                          announcementCategory === cat
                            ? 'bg-ignite-500/20 text-ignite-300 border border-ignite-500/40'
                            : 'bg-dark-800 text-dark-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Broadcasts' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={announcementSearch}
                      onChange={(e) => setAnnouncementSearch(e.target.value)}
                      className="pl-8 pr-4 py-2 rounded-xl border border-white/10 bg-dark-800 text-xs text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 w-full sm:w-60"
                    />
                  </div>
                </div>

                {/* Announcement Feed or Empty Handler */}
                {filteredAnnouncements.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-dark-900/40 py-16 px-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-dark-800/80 border border-white/10 mx-auto flex items-center justify-center text-dark-400 text-2xl">
                      <FiBell className="text-ignite-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">No Announcements Available</h3>
                    <p className="text-xs text-dark-400 max-w-sm mx-auto leading-relaxed">
                      {announcements.length === 0
                        ? "You're completely up to date! Official club announcements, urgent alerts, and event news from club administrators will show up here."
                        : 'No announcements match your selected filter criteria. Try viewing all categories.'}
                    </p>
                    {announcements.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnnouncementCategory('ALL');
                          setAnnouncementSearch('');
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs text-white hover:bg-dark-700 transition cursor-pointer"
                      >
                        Show All Announcements
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredAnnouncements.map((item) => {
                      const isUrgent = item.category === 'urgent' || item.priority === 'urgent';
                      const isEvent = item.category === 'event' || item.priority === 'event';
                      const isMilestone = item.category === 'milestone' || item.priority === 'milestone';
                      const isWorkshop = item.category === 'workshop' || item.priority === 'workshop';

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-5 transition-all space-y-3 relative group ${
                            item.is_pinned
                              ? 'border-purple-500/30 bg-purple-950/10 shadow-lg shadow-purple-950/20'
                              : 'border-white/10 bg-dark-900/60 hover:bg-dark-900/90 hover:border-white/20'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start gap-5">
                            {/* Media Banner Thumbnail */}
                            {item.image_url && (
                              <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black/40">
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}

                            {/* Text Details */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                                    isUrgent
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : isEvent
                                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      : isMilestone
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : isWorkshop
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : 'bg-ignite-500/20 text-ignite-300 border-ignite-500/30'
                                  }`}
                                >
                                  {item.category || item.priority || 'general'}
                                </span>

                                {item.is_pinned && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                                    📌 Pinned Announcement
                                  </span>
                                )}

                                <span className="text-[11px] text-dark-400 font-mono">
                                  {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-white tracking-wide leading-snug">
                                {item.title}
                              </h3>

                              <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-line">
                                {item.description || item.content}
                              </p>

                              <p className="text-[11px] text-dark-500 font-mono pt-1">
                                Published by: {item.author_name || 'Igniter Club Administration'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <StudentNotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        isProfileComplete={isProfileComplete}
      />
    </div>
  );
}
