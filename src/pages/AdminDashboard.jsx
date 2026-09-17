import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiShield, FiUsers, FiCalendar, FiBell, FiPlus, FiTrash2, 
  FiSearch, FiExternalLink, FiLogOut, FiCheckCircle, FiAlertTriangle, 
  FiRefreshCw, FiHome, FiLock, FiAward, FiSliders, FiImage, FiEye, FiUploadCloud, FiCheck, FiArrowRight,
  FiEdit2, FiBookmark, FiTag, FiX, FiFilter
} from 'react-icons/fi';
import { supabase } from '../utils/supabase';
import { getCurrentUserRole } from '../utils/authRole';
import PublicBannerModal from '../components/PublicBannerModal';

export default function AdminDashboard() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const hasCloudinaryConfig = Boolean(cloudName && uploadPreset);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEvents: 0,
    totalAnnouncements: 0,
    totalRegistrations: 0,
  });
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [bannerConfig, setBannerConfig] = useState({
    id: null,
    title: 'Passing the Torch Event',
    subtitle: 'As we, the current 4th-year members, prepare to move forward in our journey, it is time to entrust the future of the Igniters Club to you. To continue the legacy and spirit of the club, we will be hosting the "Passing the Torch" event, where leadership and creative responsibilities will be handed over to the next generation.',
    badge_text: 'Official Announcement',
    audience: 'Dear Juniors [2nd & 3rd Year],',
    highlight_title: 'The positions open for succession are:',
    highlight_items: ['President', 'Vice President', 'Leader', 'Photographer', 'Video Editor'],
    highlight_box: "This event marks an important milestone in ensuring the continuity of the Igniters Club's vision and activities. We look forward to your enthusiastic participation and commitment to carrying the flame ahead.",
    urgency_note: 'Apply before this Sunday',
    sign_off: 'Warm regards,\nIgniters Club – 4th Year Team',
    image_url: 'https://pxzzkvflkvvstqpbwyus.supabase.co/storage/v1/object/public/banners/passing-the-torch-banner.jpg',
    cta_text: 'Apply Over This Link',
    cta_url: 'https://forms.gle/WN2E6EkaNAXygpPP6',
    secondary_cta_text: 'Dismiss',
    is_active: true,
  });
  const [newHighlightItem, setNewHighlightItem] = useState('');
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [bannerSaveSuccess, setBannerSaveSuccess] = useState(false);
  const [isUploadingBannerImg, setIsUploadingBannerImg] = useState(false);
  const [testPopupOpen, setTestPopupOpen] = useState(false);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Form states
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'general',
    is_pinned: false,
    image_url: '',
  });
  const [isUploadingAnnouncementImg, setIsUploadingAnnouncementImg] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isEditingUploadingImg, setIsEditingUploadingImg] = useState(false);
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState('ALL');
  const [announcementPinnedOnly, setAnnouncementPinnedOnly] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '10:00 AM',
    venue: 'Auditorium A',
    category: 'Workshop',
    max_capacity: 100,
  });
  const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const roleInfo = await getCurrentUserRole(user);
      setAdminUser(roleInfo);

      // 1. Fetch stats & collections
      const [
        studentsRes,
        eventsRes,
        announcementsRes,
        registrationsRes,
        whitelistRes,
        adminsRes,
        bannerRes
      ] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('event_registrations').select('id', { count: 'exact' }),
        supabase.from('admin_whitelist').select('*').order('created_at', { ascending: false }),
        supabase.from('admins').select('*').order('created_at', { ascending: false }),
        supabase.from('banner_modals').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const studentList = studentsRes.data || [];
      const eventList = eventsRes.data || [];
      const announcementList = announcementsRes.data || [];
      const whitelistList = whitelistRes.data || [];
      const activeAdmins = adminsRes.data || [];
      const latestBanner = bannerRes?.data;

      setStudents(studentList);
      setEvents(eventList);
      setAnnouncements(announcementList);
      setWhitelist(whitelistList);
      setAdminsList(activeAdmins);
      if (latestBanner) {
        setBannerConfig({
          id: latestBanner.id,
          title: latestBanner.title || '',
          subtitle: latestBanner.subtitle || '',
          badge_text: latestBanner.badge_text || 'Official Announcement',
          audience: latestBanner.audience || '',
          highlight_title: latestBanner.highlight_title || 'The positions open for succession are:',
          highlight_items: Array.isArray(latestBanner.highlight_items)
            ? latestBanner.highlight_items
            : typeof latestBanner.highlight_items === 'string'
              ? JSON.parse(latestBanner.highlight_items || '[]')
              : [],
          highlight_box: latestBanner.highlight_box || '',
          urgency_note: latestBanner.urgency_note || '',
          sign_off: latestBanner.sign_off || '',
          image_url: latestBanner.image_url || '',
          cta_text: latestBanner.cta_text || 'Apply Over This Link',
          cta_url: latestBanner.cta_url || '',
          secondary_cta_text: latestBanner.secondary_cta_text || 'Dismiss',
          is_active: latestBanner.is_active ?? true,
        });
      }

      setStats({
        totalStudents: studentList.length,
        activeEvents: eventList.filter(e => e.status !== 'completed' && e.status !== 'cancelled').length,
        totalAnnouncements: announcementList.length,
        totalRegistrations: registrationsRes.count || 0,
      });
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      showFeedback('error', 'Error refreshing dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/admin/login', { replace: true });
  };

  const handleAnnouncementImageUpload = async (file, isEdit = false) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', 'Image size must be less than 10MB.');
      return;
    }

    if (isEdit) {
      setIsEditingUploadingImg(true);
    } else {
      setIsUploadingAnnouncementImg(true);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const cleanFileName = `announcement-${Date.now()}.${fileExt}`;

      // 1. Try Supabase storage bucket 'banners'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(cleanFileName, file, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(cleanFileName);

        if (isEdit) {
          setEditingAnnouncement(prev => ({ ...prev, image_url: publicUrl }));
        } else {
          setNewAnnouncement(prev => ({ ...prev, image_url: publicUrl }));
        }
        showFeedback('success', 'Announcement image uploaded successfully!');
        return;
      }

      console.warn('Supabase storage error, attempting Cloudinary fallback:', uploadError);

      // 2. Fallback to Cloudinary if configured
      if (hasCloudinaryConfig) {
        const body = new FormData();
        body.append('file', file);
        body.append('upload_preset', uploadPreset);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body,
        });
        const result = await response.json();
        if (response.ok && result?.secure_url) {
          if (isEdit) {
            setEditingAnnouncement(prev => ({ ...prev, image_url: result.secure_url }));
          } else {
            setNewAnnouncement(prev => ({ ...prev, image_url: result.secure_url }));
          }
          showFeedback('success', 'Announcement image uploaded successfully!');
          return;
        }
        throw new Error(result?.error?.message || 'Cloudinary upload failed');
      }

      throw uploadError;
    } catch (err) {
      console.error('Failed to upload announcement image:', err);
      showFeedback('error', 'Failed to upload image: ' + (err.message || 'Storage error'));
    } finally {
      if (isEdit) {
        setIsEditingUploadingImg(false);
      } else {
        setIsUploadingAnnouncementImg(false);
      }
    }
  };

  const handleCreateAnnouncement = async (e) => {
    if (e) e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      showFeedback('error', 'Please fill in title and announcement content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: newAnnouncement.title.trim(),
        description: newAnnouncement.content.trim(),
        category: newAnnouncement.priority || 'general',
        is_pinned: Boolean(newAnnouncement.is_pinned),
        image_url: newAnnouncement.image_url?.trim() || null,
        is_published: true,
        author_id: adminUser?.user?.id || null,
      };

      const { data, error } = await supabase.from('announcements').insert([payload]).select().single();

      if (error) throw error;

      showFeedback('success', 'Announcement published and broadcasted successfully!');
      setNewAnnouncement({ title: '', content: '', priority: 'general', is_pinned: false, image_url: '' });
      setIsCreateModalOpen(false);
      if (data) {
        setAnnouncements(prev => [data, ...prev]);
        setStats(prev => ({ ...prev, totalAnnouncements: prev.totalAnnouncements + 1 }));
      } else {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to create announcement:', err);
      showFeedback('error', 'Error publishing announcement: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    if (e) e.preventDefault();
    if (!editingAnnouncement?.title?.trim() || !(editingAnnouncement?.description || editingAnnouncement?.content || '').trim()) {
      showFeedback('error', 'Announcement title and content are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: editingAnnouncement.title.trim(),
        description: (editingAnnouncement.description || editingAnnouncement.content || '').trim(),
        category: editingAnnouncement.category || editingAnnouncement.priority || 'general',
        is_pinned: Boolean(editingAnnouncement.is_pinned),
        image_url: editingAnnouncement.image_url?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', editingAnnouncement.id);

      if (error) throw error;

      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? { ...a, ...payload } : a));
      showFeedback('success', 'Announcement updated successfully!');
      setEditingAnnouncement(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to update announcement:', err);
      showFeedback('error', 'Error updating announcement: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePinAnnouncement = async (item) => {
    const newPinState = !item.is_pinned;
    try {
      setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, is_pinned: newPinState } : a));
      const { error } = await supabase
        .from('announcements')
        .update({ is_pinned: newPinState, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;
      showFeedback('success', newPinState ? 'Announcement pinned to top!' : 'Announcement unpinned.');
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      showFeedback('error', 'Failed to update pin state: ' + err.message);
      await fetchDashboardData();
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const snapshot = [...announcements];
    try {
      setDeletingAnnouncementId(id);
      // Optimistic delete: immediately drop from UI
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setStats(prev => ({ ...prev, totalAnnouncements: Math.max(0, prev.totalAnnouncements - 1) }));

      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) {
        setAnnouncements(snapshot);
        setStats(prev => ({ ...prev, totalAnnouncements: snapshot.length }));
        throw error;
      }

      showFeedback('success', 'Announcement deleted successfully.');
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      setAnnouncements(snapshot);
      setStats(prev => ({ ...prev, totalAnnouncements: snapshot.length }));
      showFeedback('error', 'Error deleting announcement: ' + (err.message || 'Server error'));
    } finally {
      setDeletingAnnouncementId(null);
      setAnnouncementToDelete(null);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.event_date) {
      showFeedback('error', 'Please provide event title and date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const eventDate = newEvent.event_date ? new Date(newEvent.event_date).toISOString() : new Date().toISOString();
      const { error } = await supabase.from('events').insert([
        {
          name: newEvent.title.trim(),
          description: newEvent.description.trim(),
          date: eventDate,
          location: newEvent.venue || 'Auditorium A',
          capacity: parseInt(newEvent.max_capacity, 10) || 100,
          status: 'upcoming',
          created_by: adminUser?.user?.id || null,
        },
      ]);

      if (error) throw error;

      showFeedback('success', 'Event scheduled successfully!');
      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        event_time: '10:00 AM',
        venue: 'Auditorium A',
        category: 'Workshop',
        max_capacity: 100,
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to create event:', err);
      showFeedback('error', 'Error creating event: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    const snapshot = [...events];
    try {
      setDeletingEventId(id);
      // Optimistic delete: immediately drop from UI
      setEvents(prev => prev.filter(e => e.id !== id));
      setStats(prev => ({ ...prev, activeEvents: Math.max(0, prev.activeEvents - 1) }));

      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        setEvents(snapshot);
        setStats(prev => ({ ...prev, activeEvents: snapshot.filter(e => e.status !== 'completed' && e.status !== 'cancelled').length }));
        throw error;
      }

      showFeedback('success', 'Event deleted successfully.');
    } catch (err) {
      console.error('Failed to delete event:', err);
      setEvents(snapshot);
      setStats(prev => ({ ...prev, activeEvents: snapshot.filter(e => e.status !== 'completed' && e.status !== 'cancelled').length }));
      showFeedback('error', 'Error deleting event: ' + (err.message || 'Server error'));
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleAddWhitelistEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = newWhitelistEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showFeedback('error', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('admin_whitelist').insert([
        { email: cleanEmail, role: 'super_admin' },
      ]);
      if (error) throw error;

      showFeedback('success', `Added ${cleanEmail} to admin whitelist!`);
      setNewWhitelistEmail('');
      await fetchDashboardData();
    } catch (err) {
      showFeedback('error', 'Failed to whitelist: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadBannerImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', 'Image size must be less than 10MB.');
      return;
    }

    setIsUploadingBannerImg(true);
    try {
      const fileExt = file.name.split('.').pop();
      const cleanFileName = `banner-${Date.now()}.${fileExt}`;

      // 1. Try Supabase storage bucket 'banners'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(cleanFileName, file, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(cleanFileName);

        setBannerConfig(prev => ({ ...prev, image_url: publicUrl }));
        showFeedback('success', 'Banner image uploaded to Supabase storage successfully!');
        return;
      }

      console.warn('Supabase storage error, attempting Cloudinary fallback:', uploadError);

      // 2. Fallback to Cloudinary if configured
      if (hasCloudinaryConfig) {
        const body = new FormData();
        body.append('file', file);
        body.append('upload_preset', uploadPreset);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body,
        });
        const result = await response.json();
        if (response.ok && result?.secure_url) {
          setBannerConfig(prev => ({ ...prev, image_url: result.secure_url }));
          showFeedback('success', 'Banner image uploaded successfully!');
          return;
        }
        throw new Error(result?.error?.message || 'Cloudinary upload failed');
      }

      throw uploadError;
    } catch (err) {
      console.error('Failed to upload banner image:', err);
      showFeedback('error', 'Failed to upload image: ' + (err.message || 'Storage error'));
    } finally {
      setIsUploadingBannerImg(false);
      e.target.value = '';
    }
  };

  const handleSaveBanner = async (e) => {
    if (e) e.preventDefault();

    if (!bannerConfig.title.trim()) {
      showFeedback('error', 'Banner title is required.');
      return;
    }

    setIsSavingBanner(true);
    try {
      const payload = {
        title: bannerConfig.title.trim(),
        subtitle: bannerConfig.subtitle?.trim() || '',
        badge_text: bannerConfig.badge_text?.trim() || 'Official Announcement',
        audience: bannerConfig.audience?.trim() || '',
        highlight_title: bannerConfig.highlight_title?.trim() || 'The positions open for succession are:',
        highlight_items: Array.isArray(bannerConfig.highlight_items) ? bannerConfig.highlight_items : [],
        highlight_box: bannerConfig.highlight_box?.trim() || '',
        urgency_note: bannerConfig.urgency_note?.trim() || '',
        sign_off: bannerConfig.sign_off?.trim() || '',
        image_url: bannerConfig.image_url?.trim() || '',
        cta_text: bannerConfig.cta_text?.trim() || 'Apply Over This Link',
        cta_url: bannerConfig.cta_url?.trim() || '',
        secondary_cta_text: bannerConfig.secondary_cta_text?.trim() || 'Dismiss',
        is_active: Boolean(bannerConfig.is_active),
        updated_at: new Date().toISOString(),
      };

      let resultError = null;

      if (bannerConfig.id) {
        const { error } = await supabase
          .from('banner_modals')
          .update(payload)
          .eq('id', bannerConfig.id);
        resultError = error;
      } else {
        const { data, error } = await supabase
          .from('banner_modals')
          .insert([payload])
          .select('id')
          .single();
        if (data?.id) {
          setBannerConfig(prev => ({ ...prev, id: data.id }));
        }
        resultError = error;
      }

      if (resultError) throw resultError;

      setBannerSaveSuccess(true);
      setTimeout(() => setBannerSaveSuccess(false), 2500);
      showFeedback('success', bannerConfig.is_active ? 'Popup banner is ACTIVE on all pages!' : 'Popup banner saved (currently disabled).');
    } catch (err) {
      console.error('Failed to save banner:', err);
      showFeedback('error', 'Error saving banner: ' + (err.message || 'Server error'));
    } finally {
      setIsSavingBanner(false);
    }
  };

  // Filtered students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.full_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.college_id || '').toLowerCase().includes(studentSearch.toLowerCase());
    const dept = (student.department || '').toLowerCase();
    const matchesDept = deptFilter === 'ALL' || 
      student.department === deptFilter ||
      (deptFilter === 'CSE' && (dept.includes('computer') || dept.includes('cse'))) ||
      (deptFilter === 'IT' && dept.includes('information')) ||
      (deptFilter === 'ECE' && (dept.includes('electronics') || dept.includes('ece'))) ||
      (deptFilter === 'ME' && (dept.includes('mechanical') || dept.includes('me'))) ||
      (deptFilter === 'CE' && (dept.includes('civil') || dept.includes('ce')));
    return matchesSearch && matchesDept;
  });

  // Filtered announcements
  const filteredAnnouncements = announcements.filter(item => {
    const query = announcementSearch.toLowerCase().trim();
    const titleMatch = (item.title || '').toLowerCase().includes(query);
    const descMatch = (item.description || item.content || '').toLowerCase().includes(query);
    const authorMatch = (item.author_name || '').toLowerCase().includes(query);
    const matchesSearch = !query || titleMatch || descMatch || authorMatch;

    const cat = (item.category || item.priority || 'general').toLowerCase();
    const matchesCategory = announcementCategoryFilter === 'ALL' || cat === announcementCategoryFilter.toLowerCase();

    const matchesPinned = !announcementPinnedOnly || Boolean(item.is_pinned);

    return matchesSearch && matchesCategory && matchesPinned;
  });

  const [sidebarHovered, setSidebarHovered] = useState(false);

  const navSections = [
    { id: 'overview', label: 'Overview', icon: FiHome, count: undefined, desc: 'Club operations overview and quick broadcasts' },
    { id: 'students', label: 'Students', icon: FiUsers, count: students.length, desc: 'Registered student members and profile directory' },
    { id: 'events', label: 'Events', icon: FiCalendar, count: events.length, desc: 'Schedule and manage campus club events' },
    { id: 'announcements', label: 'Announcements', icon: FiBell, count: announcements.length, desc: 'Manage announcements, alerts, and pinned updates' },
    { id: 'banners', label: 'Popup Banner', icon: FiSliders, count: bannerConfig.is_active ? 'Active' : 'Off', desc: 'Control public announcement popup modal shown on every page on open' },
    { id: 'whitelist', label: 'Administrators', icon: FiShield, count: adminsList.length, desc: 'Manage administrator accounts and permissions' },
  ];

  const currentSection = navSections.find(s => s.id === activeTab) || navSections[0];
  const ActiveSectionIcon = currentSection.icon;

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col font-inter">
      {/* Auto-Open Sidebar on Hover */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-dark-900/95 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-out select-none ${
          sidebarHovered
            ? 'w-72 shadow-[0_0_50px_rgba(0,0,0,0.85)] ring-1 ring-ignite-500/25'
            : 'w-[72px] shadow-xl'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0 overflow-hidden">
          <Link to="/home" className="flex items-center gap-3 min-w-max group" title="Go to Home">
            <div className="w-10 h-10 rounded-xl bg-ignite-500/10 border border-ignite-500/30 flex items-center justify-center text-ignite-400 shadow-md shadow-ignite-500/10 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img src="/GMITxIgnite-removebg-preview.png" alt="Igniter" className="h-7 w-auto object-contain" />
            </div>
            <div className={`flex items-center gap-2.5 transition-all duration-300 ${sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none w-0'}`}>
              <div className="h-5 w-px bg-white/15" />
              <img
                src="/gmit-jis-15years-dark.png"
                alt="GMIT 15 Years of Tomorrow | JIS Group"
                className="h-7 w-auto object-contain brightness-95 group-hover:brightness-110 transition-all"
              />
            </div>
          </Link>
        </div>

        {/* Section Options (Auto-open on hover) */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">

          {navSections.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-ignite-500/15 border border-ignite-500/40 text-white shadow-md shadow-ignite-500/15'
                    : 'text-dark-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
                title={!sidebarHovered ? item.label : undefined}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-ignite-500 rounded-r-full shadow-[0_0_10px_#f43f5e]" />
                )}

                {/* Icon */}
                <div className={`shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-ignite-400' : 'text-dark-400 group-hover:text-ignite-400'
                }`}>
                  <Icon className="text-lg" />
                </div>

                {/* Label & Badge */}
                <div className={`flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none w-0'
                }`}>
                  <span className="text-xs font-semibold tracking-wide truncate">
                    {item.label}
                  </span>
                  {item.count !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-ignite-500/20 text-ignite-300 border-ignite-500/30'
                        : 'bg-dark-800 text-dark-400 border-white/10 group-hover:border-white/20 group-hover:text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-white/10 bg-dark-950/40 space-y-1 overflow-hidden shrink-0">
          <Link
            to="/home"
            className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs text-dark-300 hover:text-white hover:bg-white/[0.04] transition group"
            title={!sidebarHovered ? 'Main Website' : undefined}
          >
            <FiHome className="text-base shrink-0 text-dark-400 group-hover:text-ignite-400" />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none w-0'}`}>
              Main Site
            </span>
          </Link>

          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs text-dark-300 hover:text-white hover:bg-white/[0.04] transition group"
            title={!sidebarHovered ? 'Refresh Data' : undefined}
          >
            <FiRefreshCw className={`text-base shrink-0 ${refreshing ? 'animate-spin text-ignite-400' : 'text-dark-400 group-hover:text-ignite-400'}`} />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none w-0'}`}>
              Refresh Data
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 transition group"
            title={!sidebarHovered ? 'Sign Out' : undefined}
          >
            <FiLogOut className="text-base shrink-0 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none w-0'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - offset by 72px for sidebar rail */}
      <div className="flex-1 flex flex-col pl-[72px] min-w-0">
        {/* Top Banner & Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-dark-900/90 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold font-outfit text-white tracking-wide">
                Admin Dashboard
              </span>
              <span className="text-dark-600 text-xs">/</span>
              <span className="text-xs text-dark-300 font-medium">
                {currentSection.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="p-2 rounded-lg border border-white/10 bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700 transition"
                title="Refresh Data"
              >
                <FiRefreshCw className={`text-sm ${refreshing ? 'animate-spin text-ignite-400' : ''}`} />
              </button>

              <Link
                to="/home"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-dark-800/80 text-xs font-medium text-dark-300 hover:text-white hover:border-white/20 transition"
              >
                <FiHome />
                Main Site
              </Link>

              <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white tracking-wide">
                    {adminUser?.displayName || 'Club Administrator'}
                  </span>
                  <span className="text-[10px] text-ignite-400 font-mono uppercase">
                    {adminUser?.role || 'super_admin'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-ignite-500/15 border border-ignite-500/40 flex items-center justify-center text-ignite-300 font-bold text-sm shadow-md shadow-ignite-500/10">
                  <FiShield />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition ml-1"
                title="Log Out of Admin Panel"
              >
                <FiLogOut className="text-sm" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Admin Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
          {/* Feedback Alert Toast */}
          <AnimatePresence>
            {feedback.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border flex items-center gap-3 text-sm shadow-lg ${
                  feedback.type === 'error'
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                }`}
              >
                {feedback.type === 'error' ? <FiAlertTriangle className="text-lg" /> : <FiCheckCircle className="text-lg" />}
                <span>{feedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Total Students</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FiUsers />
                </div>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold font-outfit text-white">{stats.totalStudents}</p>
              <p className="mt-1 text-[11px] text-dark-400">Registered club members</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Active Events</span>
                <div className="p-2 rounded-xl bg-ignite-500/10 text-ignite-400 border border-ignite-500/20">
                  <FiCalendar />
                </div>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold font-outfit text-white">{stats.activeEvents}</p>
              <p className="mt-1 text-[11px] text-dark-400">Scheduled campus sessions</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Announcements</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FiBell />
                </div>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold font-outfit text-white">{stats.totalAnnouncements}</p>
              <p className="mt-1 text-[11px] text-dark-400">Live club broadcasts</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-dark-400">Registrations</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FiAward />
                </div>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold font-outfit text-white">{stats.totalRegistrations}</p>
              <p className="mt-1 text-[11px] text-dark-400">Total event signups</p>
            </div>
          </div>

          {/* Active Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-outfit text-white tracking-tight">
                {currentSection.label}
              </h2>
              <p className="text-xs text-dark-400 mt-1">{currentSection.desc}</p>
            </div>
          </div>

        {/* Tab 1: Overview & Quick Broadcast */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Broadcast Announcement */}
              <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FiBell className="text-ignite-400" />
                    Quick Announcement Broadcast
                  </h3>
                  <span className="text-xs text-dark-400">Broadcasts immediately to student feed</span>
                </div>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                      Announcement Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Welcome to Igniter Club 2026 Season!"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-dark-800/80 px-4 py-2.5 text-sm text-white placeholder:text-dark-500 focus:border-ignite-500/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                      Content / Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type announcement details for students..."
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-dark-800/80 px-4 py-2.5 text-sm text-white placeholder:text-dark-500 focus:border-ignite-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-dark-300">Category:</label>
                        <select
                          value={newAnnouncement.priority}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                          className="rounded-lg border border-white/10 bg-dark-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="general">General</option>
                          <option value="event">Event</option>
                          <option value="milestone">Milestone</option>
                          <option value="workshop">Workshop</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-dark-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAnnouncement.is_pinned}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, is_pinned: e.target.checked })}
                          className="rounded border-white/20 bg-dark-800 text-ignite-500 focus:ring-ignite-500"
                        />
                        <span>Pin to top</span>
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-ignite-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Publishing...' : 'Broadcast Now'}
                    </button>
                  </div>
                </form>

                {/* Active Broadcasts in Overview */}
                {announcements.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Active Broadcasts ({announcements.length})</span>
                      <button onClick={() => setActiveTab('announcements')} className="text-xs text-ignite-400 hover:underline">
                        Manage All →
                      </button>
                    </div>
                    <div className="space-y-2">
                      {announcements.slice(0, 3).map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-dark-800/60 border border-white/5 flex items-center justify-between gap-3">
                          <div className="truncate min-w-0">
                            <p className="text-xs font-medium text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-dark-400 truncate">{item.description || item.content}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            disabled={deletingAnnouncementId === item.id}
                            className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-white transition text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer shadow-sm shadow-rose-500/10"
                            title="Delete Announcement"
                          >
                            {deletingAnnouncementId === item.id ? (
                              <FiRefreshCw className="text-[10px] animate-spin" />
                            ) : (
                              <FiTrash2 className="text-[10px]" />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Events Preview */}
              <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FiCalendar className="text-ignite-400" />
                    Scheduled Events
                  </h3>
                  <button onClick={() => setActiveTab('events')} className="text-xs text-ignite-400 hover:underline">
                    View All →
                  </button>
                </div>
                {events.length === 0 ? (
                  <p className="text-xs text-dark-400 py-4 text-center">No events scheduled. Use the Events tab to add one.</p>
                ) : (
                  <div className="divide-y divide-white/5 space-y-2">
                    {events.slice(0, 4).map(event => (
                      <div key={event.id} className="pt-2 flex items-center justify-between gap-3">
                        <div className="truncate min-w-0">
                          <p className="text-sm font-medium text-white truncate">{event.name || event.title}</p>
                          <p className="text-xs text-dark-400 truncate">
                            {event.date ? new Date(event.date).toLocaleDateString() : (event.event_date || 'TBD')} • {event.location || event.venue || 'Campus'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-ignite-500/10 border border-ignite-500/30 text-ignite-300">
                            {event.status || event.category || 'Upcoming'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deletingEventId === event.id}
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-white transition flex items-center justify-center cursor-pointer shadow-sm shadow-rose-500/10"
                            title="Delete Event"
                          >
                            {deletingEventId === event.id ? (
                              <FiRefreshCw className="text-[11px] animate-spin" />
                            ) : (
                              <FiTrash2 className="text-[11px]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Right Column: System & Recent Students */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl">
                <h3 className="text-sm font-semibold text-white tracking-wide mb-1.5 flex items-center gap-2">
                  <FiShield className="text-ignite-400 text-base" />
                  Administrator Account
                </h3>
                <p className="text-xs text-dark-400 mb-3">
                  Signed in with administrator management privileges.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-dark-900/80 border border-white/5">
                    <span className="text-dark-400">Role:</span>
                    <span className="text-ignite-400 uppercase font-bold">{adminUser?.role || 'super_admin'}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-dark-900/80 border border-white/5">
                    <span className="text-dark-400">User:</span>
                    <span className="text-white truncate max-w-[170px]">{adminUser?.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Recent Students List */}
              <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FiUsers className="text-blue-400" />
                    Latest Students
                  </h3>
                  <button onClick={() => setActiveTab('students')} className="text-xs text-ignite-400 hover:underline">
                    Manage →
                  </button>
                </div>
                {students.length === 0 ? (
                  <p className="text-xs text-dark-400 py-3 text-center">No students registered yet.</p>
                ) : (
                  <div className="space-y-3">
                    {students.slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-800/50 border border-white/5">
                        <div className="truncate">
                          <p className="text-xs font-medium text-white truncate">{s.full_name || 'Anonymous'}</p>
                          <p className="text-[10px] text-dark-400 font-mono truncate">{s.college_id || s.email}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          s.is_profile_complete 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-dark-800 border-white/10 text-dark-400'
                        }`}>
                          {s.is_profile_complete ? 'Complete' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Students Directory */}
        {activeTab === 'students' && (
          <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Registered Students Database</h3>
                <p className="text-xs text-dark-400">Total {students.length} students enrolled in the club</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search name, email, roll..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 pr-4 py-1.5 rounded-xl border border-white/10 bg-dark-800 text-xs text-white focus:outline-none focus:border-ignite-500/60 w-48 sm:w-64"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-dark-800 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Depts</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-dark-400 text-sm">
                No students found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-dark-400 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="pb-3 font-semibold whitespace-nowrap">Student</th>
                      <th className="pb-3 font-semibold whitespace-nowrap">College ID</th>
                      <th className="pb-3 font-semibold whitespace-nowrap">Department</th>
                      <th className="pb-3 font-semibold whitespace-nowrap">Year & Sem</th>
                      <th className="pb-3 font-semibold whitespace-nowrap">Profile Status</th>
                      <th className="pb-3 font-semibold whitespace-nowrap">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map(student => {
                      const isAvatarUrl = typeof student.avatar === 'string' && (student.avatar.startsWith('http://') || student.avatar.startsWith('https://') || student.avatar.startsWith('data:image/'));
                      const isAvatarEmoji = typeof student.avatar === 'string' && student.avatar.trim().length > 0 && student.avatar.trim().length <= 4;
                      const displayDepartment = student.department ? student.department.replace(/Sceince/gi, 'Science') : '—';

                      return (
                        <tr key={student.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-xs overflow-hidden shrink-0 shadow-sm">
                                {isAvatarUrl ? (
                                  <img
                                    src={student.avatar}
                                    alt={student.full_name || 'Student avatar'}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.parentElement) {
                                        e.currentTarget.parentElement.innerHTML = '<span>👨‍🎓</span>';
                                      }
                                    }}
                                  />
                                ) : (
                                  <span>{isAvatarEmoji ? student.avatar : '👨‍🎓'}</span>
                                )}
                              </div>
                              <div className="min-w-0 max-w-[220px]">
                                <p className="font-semibold text-white truncate" title={student.full_name || 'Not provided'}>
                                  {student.full_name || 'Not provided'}
                                </p>
                                <p className="text-[11px] text-dark-400 font-mono truncate" title={student.email}>
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-dark-300 whitespace-nowrap">{student.college_id || '—'}</td>
                          <td className="py-3 font-semibold text-ignite-300 whitespace-nowrap" title={displayDepartment}>
                            {displayDepartment}
                          </td>
                          <td className="py-3 text-dark-300 whitespace-nowrap">
                            {student.study_year ? `Year ${student.study_year}` : '—'} 
                            {student.semester ? ` • Sem ${student.semester}` : ''}
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${
                              student.is_profile_complete
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-dark-800 border-white/10 text-dark-400'
                            }`}>
                              {student.is_profile_complete ? 'Complete' : 'Pending Profile'}
                            </span>
                          </td>
                          <td className="py-3 text-dark-400 whitespace-nowrap">
                            {student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Events Management */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Create Event Card */}
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FiPlus className="text-ignite-400" />
                Schedule New Club Event
              </h3>
              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI & Robotics Bootcamp 2026"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 1:00 PM"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    placeholder="Auditorium / Lab 3"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Tech Talk">Tech Talk</option>
                    <option value="Competition">Competition</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the event..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-ignite-500/25 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Events List */}
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-white">Current Event Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(event => (
                  <div key={event.id} className="p-4 rounded-xl border border-white/10 bg-dark-800/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-white text-sm">{event.name || event.title}</h4>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deletingEventId === event.id}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-white transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm shadow-rose-500/10"
                          title="Delete Event"
                        >
                          {deletingEventId === event.id ? (
                            <>
                              <FiRefreshCw className="text-xs animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <FiTrash2 className="text-xs" />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-dark-400 mt-1 line-clamp-2">{event.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-dark-300">
                      <span>
                        {event.date ? new Date(event.date).toLocaleDateString() : (event.event_date || 'TBD')} • {event.location || event.venue || 'Campus'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Announcements Management */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Top Announcements Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/60 border border-white/10 rounded-2xl p-5 shadow-xl">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FiBell className="text-ignite-400" />
                  Club Announcements & Broadcasts
                </h3>
                <p className="text-xs text-dark-400 mt-1">
                  Upload official club announcements, attach media banners, edit active broadcasts, and manage student alerts.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-dark-800 border border-white/10 text-dark-300">
                    Total: <strong className="text-white">{announcements.length}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    📌 Pinned: <strong className="text-purple-200">{announcements.filter(a => a.is_pinned).length}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-ignite-500/25 cursor-pointer flex items-center gap-1.5"
                >
                  <FiPlus className="text-sm" />
                  <span>New Announcement</span>
                </button>
              </div>
            </div>



            {/* 2. Published Announcements Database & Controls */}
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Published Club Announcements ({filteredAnnouncements.length})
                  </h3>
                  <p className="text-xs text-dark-400">
                    Live announcements currently visible to registered students and club members.
                  </p>
                </div>

                {/* Filter and Search Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={announcementSearch}
                      onChange={(e) => setAnnouncementSearch(e.target.value)}
                      className="pl-8 pr-4 py-1.5 rounded-xl border border-white/10 bg-dark-800 text-xs text-white focus:outline-none focus:border-ignite-500/60 w-44 sm:w-56"
                    />
                  </div>

                  <select
                    value={announcementCategoryFilter}
                    onChange={(e) => setAnnouncementCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-dark-800 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="workshop">Workshop</option>
                    <option value="milestone">Milestone</option>
                    <option value="urgent">Urgent</option>
                    <option value="opportunity">Opportunity</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setAnnouncementPinnedOnly(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                      announcementPinnedOnly
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-dark-800 border-white/10 text-dark-400 hover:text-white'
                    }`}
                  >
                    <span>📌 Pinned</span>
                  </button>
                </div>
              </div>

              {filteredAnnouncements.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-white/10 bg-dark-800/30 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-dark-700/60 border border-white/10 mx-auto flex items-center justify-center text-dark-400 text-lg">
                    <FiBell />
                  </div>
                  <p className="text-sm text-dark-300 font-medium">No announcements found</p>
                  <p className="text-xs text-dark-500 max-w-sm mx-auto">
                    {announcements.length === 0
                      ? 'No announcements have been uploaded yet. Click below to create and broadcast your first club update!'
                      : 'No announcements match your search filter.'}
                  </p>
                  {announcements.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-ignite-500/25 transition cursor-pointer flex items-center gap-2 mx-auto"
                    >
                      <FiPlus size={14} />
                      <span>Create Announcement Now</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredAnnouncements.map(item => {
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
                            : 'border-white/10 bg-dark-800/40 hover:bg-dark-800/70 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Image Banner if uploaded */}
                          {item.image_url && (
                            <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black/40">
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
                                    : 'bg-ignite-500/20 text-ignite-300 border border-ignite-500/30'
                                }`}
                              >
                                {item.category || item.priority || 'general'}
                              </span>

                              {item.is_pinned && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                                  📌 Pinned
                                </span>
                              )}

                              <span className="text-[11px] text-dark-400 font-mono">
                                {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white tracking-wide leading-snug">
                              {item.title}
                            </h4>

                            <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-line">
                              {item.description || item.content}
                            </p>

                            <p className="text-[11px] text-dark-500 font-mono pt-1">
                              Published by: {item.author_name || 'Club Administrator'}
                            </p>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-3 lg:pt-0 lg:pl-4">
                            {/* Pin / Unpin Button */}
                            <button
                              type="button"
                              onClick={() => handleTogglePinAnnouncement(item)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 w-full justify-center ${
                                item.is_pinned
                                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25'
                                  : 'bg-dark-800 border-white/10 text-dark-300 hover:text-white hover:bg-dark-700'
                              }`}
                              title={item.is_pinned ? 'Unpin Announcement' : 'Pin to Top'}
                            >
                              <span>📌</span>
                              <span>{item.is_pinned ? 'Unpin' : 'Pin'}</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingAnnouncement(item)}
                              className="px-3 py-1.5 rounded-xl border border-ignite-500/30 bg-ignite-500/10 hover:bg-ignite-500/20 text-ignite-300 hover:text-white transition text-xs font-semibold cursor-pointer flex items-center gap-1.5 w-full justify-center shadow-sm shadow-ignite-500/10"
                              title="Edit Announcement"
                            >
                              <FiEdit2 className="text-xs" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setAnnouncementToDelete(item)}
                              disabled={deletingAnnouncementId === item.id}
                              className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-white transition disabled:opacity-50 text-xs font-semibold cursor-pointer flex items-center gap-1.5 w-full justify-center shadow-sm shadow-rose-500/10"
                              title="Delete Announcement"
                            >
                              {deletingAnnouncementId === item.id ? (
                                <>
                                  <FiRefreshCw className="text-xs animate-spin" />
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <FiTrash2 className="text-xs" />
                                  <span>Delete</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Announcement Modal */}
            <AnimatePresence>
              {isCreateModalOpen && (
                <motion.div
                  key="create-announcement-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <motion.div
                    key="create-announcement-modal-dialog"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col bg-dark-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0 bg-dark-900">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <FiUploadCloud className="text-ignite-400" />
                        Create & Upload New Announcement
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleCreateAnnouncement} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                          Announcement Headline / Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Annual Tech Symposium & Hackathon Registrations Open!"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                            Category
                          </label>
                          <select
                            value={newAnnouncement.priority}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-dark-800 px-3 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="general">General Update</option>
                            <option value="event">Event Notice</option>
                            <option value="workshop">Workshop / Training</option>
                            <option value="milestone">Milestone & Achievement</option>
                            <option value="urgent">Urgent Announcement</option>
                            <option value="opportunity">Recruitment / Opportunity</option>
                          </select>
                        </div>

                        <div className="flex items-end pb-2">
                          <label className="flex items-center gap-2 text-xs text-white font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAnnouncement.is_pinned}
                              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, is_pinned: e.target.checked })}
                              className="rounded border-white/20 bg-dark-700 text-ignite-500 focus:ring-ignite-500 w-4 h-4 cursor-pointer"
                            />
                            <span>📌 Pin to top of student feed</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                          Announcement Details / Content *
                        </label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Write the full announcement message for club members and students..."
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 leading-relaxed"
                        />
                      </div>

                      {/* Image Upload inside Modal */}
                      <div className="rounded-xl border border-white/10 bg-dark-800/60 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-dark-300 flex items-center gap-1.5">
                            <FiImage className="text-ignite-400" />
                            Banner Image / Media Attachment (Optional)
                          </label>
                          {newAnnouncement.image_url && (
                            <button
                              type="button"
                              onClick={() => setNewAnnouncement(prev => ({ ...prev, image_url: '' }))}
                              className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                            >
                              <FiTrash2 size={12} /> Remove
                            </button>
                          )}
                        </div>

                        {newAnnouncement.image_url ? (
                          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/40 max-h-32">
                            <img
                              src={newAnnouncement.image_url}
                              alt="Attached media"
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-emerald-300 font-mono">
                              ✓ Image Attached
                            </div>
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                          <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/20 hover:border-ignite-500/50 bg-dark-800 hover:bg-dark-700/60 cursor-pointer transition text-xs text-dark-300 hover:text-white">
                            {isUploadingAnnouncementImg ? (
                              <>
                                <FiRefreshCw className="animate-spin text-ignite-400" />
                                <span>Uploading image...</span>
                              </>
                            ) : (
                              <>
                                <FiUploadCloud className="text-ignite-400 text-sm" />
                                <span>Browse or Drag Image (PNG, JPG, WEBP &lt; 10MB)</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingAnnouncementImg}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleAnnouncementImageUpload(e.target.files[0], false);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="url"
                            placeholder="Or paste direct image URL (https://...)"
                            value={newAnnouncement.image_url || ''}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-dark-800 px-2.5 py-1 text-xs text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="px-4 py-2 rounded-xl border border-white/10 bg-dark-800 text-xs text-dark-300 hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || isUploadingAnnouncementImg}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-ignite-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <FiRefreshCw className="animate-spin text-xs" />
                              <span>Publishing...</span>
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="text-xs" />
                              <span>Publish & Broadcast Announcement</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Edit Announcement Modal */}
            <AnimatePresence>
              {editingAnnouncement && (
                <motion.div
                  key="edit-announcement-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
                  onClick={() => setEditingAnnouncement(null)}
                >
                  <motion.div
                    key="edit-announcement-modal-dialog"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col bg-dark-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0 bg-dark-900">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <FiEdit2 className="text-ignite-400" />
                        Edit Club Announcement
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingAnnouncement(null)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateAnnouncement} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                          Announcement Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingAnnouncement.title || ''}
                          onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                            Category
                          </label>
                          <select
                            value={editingAnnouncement.category || editingAnnouncement.priority || 'general'}
                            onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-dark-800 px-3 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="general">General</option>
                            <option value="event">Event</option>
                            <option value="workshop">Workshop</option>
                            <option value="milestone">Milestone</option>
                            <option value="urgent">Urgent</option>
                            <option value="opportunity">Opportunity</option>
                          </select>
                        </div>

                        <div className="flex items-end pb-2">
                          <label className="flex items-center gap-2 text-xs text-white font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editingAnnouncement.is_pinned)}
                              onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, is_pinned: e.target.checked })}
                              className="rounded border-white/20 bg-dark-700 text-ignite-500 focus:ring-ignite-500 w-4 h-4"
                            />
                            <span>📌 Pinned Announcement</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                          Details / Description *
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={editingAnnouncement.description || editingAnnouncement.content || ''}
                          onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, description: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ignite-500/60 leading-relaxed"
                        />
                      </div>

                      {/* Image Attachment inside Modal */}
                      <div className="rounded-xl border border-white/10 bg-dark-800/60 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-dark-300 flex items-center gap-1.5">
                            <FiImage className="text-ignite-400" />
                            Media Banner
                          </label>
                          {editingAnnouncement.image_url && (
                            <button
                              type="button"
                              onClick={() => setEditingAnnouncement(prev => ({ ...prev, image_url: '' }))}
                              className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                            >
                              <FiTrash2 size={12} /> Remove
                            </button>
                          )}
                        </div>

                        {editingAnnouncement.image_url ? (
                          <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 max-h-32">
                            <img
                              src={editingAnnouncement.image_url}
                              alt="Attached media"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 hover:border-ignite-500/50 bg-dark-800 hover:bg-dark-700/60 cursor-pointer transition text-xs text-dark-300 hover:text-white">
                            {isEditingUploadingImg ? (
                              <>
                                <FiRefreshCw className="animate-spin text-ignite-400" />
                                <span>Uploading image...</span>
                              </>
                            ) : (
                              <>
                                <FiUploadCloud className="text-ignite-400" />
                                <span>Upload New Banner Image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isEditingUploadingImg}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleAnnouncementImageUpload(e.target.files[0], true);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="url"
                            placeholder="Or paste direct image URL (https://...)"
                            value={editingAnnouncement.image_url || ''}
                            onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, image_url: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-dark-800 px-2.5 py-1 text-xs text-white placeholder:text-dark-500 focus:outline-none focus:border-ignite-500/60 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingAnnouncement(null)}
                          className="px-4 py-2 rounded-xl border border-white/10 bg-dark-800 text-xs text-dark-300 hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || isEditingUploadingImg}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-ignite-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <FiRefreshCw className="animate-spin text-xs" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <FiCheck className="text-xs" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Delete Confirmation Modal */}
            <AnimatePresence>
              {announcementToDelete && (
                <motion.div
                  key="delete-announcement-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
                  onClick={() => setAnnouncementToDelete(null)}
                >
                  <motion.div
                    key="delete-announcement-modal-dialog"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-md bg-dark-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-black/80 space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl mx-auto">
                      <FiAlertTriangle />
                    </div>

                    <div className="text-center space-y-1">
                      <h4 className="text-base font-bold text-white">Delete Announcement?</h4>
                      <p className="text-xs text-dark-400">
                        Are you sure you want to permanently delete{' '}
                        <span className="text-white font-semibold">"{announcementToDelete.title}"</span>? This will remove it from all student feeds immediately.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setAnnouncementToDelete(null)}
                        className="px-4 py-2 rounded-xl border border-white/10 bg-dark-800 text-xs font-semibold text-dark-300 hover:text-white transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={deletingAnnouncementId === announcementToDelete.id}
                        onClick={() => handleDeleteAnnouncement(announcementToDelete.id)}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
                      >
                        {deletingAnnouncementId === announcementToDelete.id ? (
                          <>
                            <FiRefreshCw className="animate-spin text-xs" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="text-xs" />
                            <span>Yes, Delete Announcement</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab 5: Administrators */}
        {activeTab === 'whitelist' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Admins */}
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FiShield className="text-ignite-400" />
                Club Administrators
              </h3>
              <p className="text-xs text-dark-400">
                Registered team members with active administrative privileges.
              </p>
              <div className="space-y-2">
                {adminsList.map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-dark-800/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{a.full_name || 'Admin'}</p>
                      <p className="text-[11px] text-dark-400 font-mono">{a.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-ignite-500/15 border border-ignite-500/40 text-ignite-300">
                      {a.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Whitelist Manager */}
            <div className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FiLock className="text-ignite-400" />
                Grant Administrator Access
              </h3>
              <p className="text-xs text-dark-400">
                Pre-approve campus email addresses for administrator onboarding.
              </p>

              <form onSubmit={handleAddWhitelistEmail} className="flex gap-2">
                <input
                  type="email"
                  placeholder="admin-email@gmit.ac.in"
                  value={newWhitelistEmail}
                  onChange={(e) => setNewWhitelistEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-dark-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-ignite-500/60"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-ignite-500/25 cursor-pointer disabled:opacity-50"
                >
                  Whitelist
                </button>
              </form>

              <div className="space-y-2 pt-2">
                {whitelist.map(w => (
                  <div key={w.email} className="p-2.5 rounded-lg bg-dark-800/40 border border-white/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-dark-200">{w.email}</span>
                    <span className="text-[10px] text-ignite-400 uppercase font-mono">{w.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Public Banner Modal Manager */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            {/* Control Header & Status Bar */}
            <div className="rounded-2xl border border-white/10 bg-dark-900/70 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-ignite-500/15 border border-ignite-500/30 text-ignite-400 text-xl shadow-lg shadow-ignite-500/10">
                  <FiSliders />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-outfit text-white">Public Announcement Popup Controller</h3>
                  <p className="text-xs text-dark-300">
                    Controls the rich popup announcement modal shown to visitors across all pages on open.
                  </p>
                </div>
              </div>

              {/* Instant Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-dark-300">Public Visibility:</span>
                <button
                  type="button"
                  onClick={() => setBannerConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    bannerConfig.is_active ? 'bg-emerald-500' : 'bg-dark-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                      bannerConfig.is_active ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold uppercase tracking-wider ${bannerConfig.is_active ? 'text-emerald-400' : 'text-dark-400'}`}>
                  {bannerConfig.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Split View: Editor & Live Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Form Controls Column */}
              <div className="xl:col-span-7 space-y-6">
                <form onSubmit={handleSaveBanner} className="rounded-2xl border border-white/10 bg-dark-900/60 p-6 sm:p-7 shadow-xl space-y-6">
                  {/* Template Quick Loader */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-semibold text-dark-300 uppercase tracking-wider">
                      Announcement Configuration
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerConfig({
                          id: bannerConfig.id,
                          title: 'Passing the Torch Event',
                          subtitle: 'As we, the current 4th-year members, prepare to move forward in our journey, it is time to entrust the future of the Igniters Club to you. To continue the legacy and spirit of the club, we will be hosting the "Passing the Torch" event, where leadership and creative responsibilities will be handed over to the next generation.',
                          badge_text: 'Official Announcement',
                          audience: 'Dear Juniors [2nd & 3rd Year],',
                          highlight_title: 'The positions open for succession are:',
                          highlight_items: ['President', 'Vice President', 'Leader', 'Photographer', 'Video Editor'],
                          highlight_box: "This event marks an important milestone in ensuring the continuity of the Igniters Club's vision and activities. We look forward to your enthusiastic participation and commitment to carrying the flame ahead.",
                          urgency_note: 'Apply before this Sunday',
                          sign_off: 'Warm regards,\nIgniters Club – 4th Year Team',
                          image_url: 'https://pxzzkvflkvvstqpbwyus.supabase.co/storage/v1/object/public/banners/passing-the-torch-banner.jpg',
                          cta_text: 'Apply Over This Link',
                          cta_url: 'https://forms.gle/WN2E6EkaNAXygpPP6',
                          secondary_cta_text: 'Dismiss',
                          is_active: true,
                        });
                        showFeedback('success', 'Loaded "Passing the Torch" announcement template!');
                      }}
                      className="text-xs text-ignite-400 hover:text-ignite-300 font-medium transition"
                    >
                      + Load Succession Example Template
                    </button>
                  </div>

                  {/* 1. Category Badge & Urgency Pill */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                          Category Badge Label
                        </label>
                        <input
                          type="text"
                          value={bannerConfig.badge_text}
                          onChange={(e) => setBannerConfig(prev => ({ ...prev, badge_text: e.target.value }))}
                          placeholder="e.g. Official Announcement"
                          className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3.5 py-2.5 text-xs text-white focus:border-ignite-500/60 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                          Urgent Callout / Deadline (Optional)
                        </label>
                        <input
                          type="text"
                          value={bannerConfig.urgency_note || ''}
                          onChange={(e) => setBannerConfig(prev => ({ ...prev, urgency_note: e.target.value }))}
                          placeholder="e.g. Apply before this Sunday"
                          className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3.5 py-2.5 text-xs text-amber-300 placeholder:text-dark-500 focus:border-amber-500/60 focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Official Announcement', 'Passing the Torch', 'Upcoming Event', 'Workshop', 'Hackathon'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setBannerConfig(prev => ({ ...prev, badge_text: tag }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition active:scale-95 ${
                            bannerConfig.badge_text === tag
                              ? 'bg-ignite-500/20 border-ignite-400/50 text-ignite-300'
                              : 'bg-dark-800/80 border-white/5 text-dark-400 hover:text-white'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Headline & Target Audience */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                        Announcement Headline <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bannerConfig.title}
                        onChange={(e) => setBannerConfig(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Passing the Torch Event"
                        className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-4 py-2.5 text-sm text-white focus:border-ignite-500/60 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                        Target Audience / Salutation (Highlighted)
                      </label>
                      <input
                        type="text"
                        value={bannerConfig.audience || ''}
                        onChange={(e) => setBannerConfig(prev => ({ ...prev, audience: e.target.value }))}
                        placeholder="e.g. Dear Juniors [2nd & 3rd Year],"
                        className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-4 py-2 text-xs text-ignite-300 focus:border-ignite-500/60 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* 3. Normal Body Message */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                      Main Narrative / Announcement Letter (Normal Text)
                    </label>
                    <textarea
                      rows={4}
                      value={bannerConfig.subtitle}
                      onChange={(e) => setBannerConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Write the main message body..."
                      className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-ignite-500/60 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 4. Highlighted Open Positions / Key Points */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300">
                        Highlighted Items / Open Positions (Organized List)
                      </label>
                      <span className="text-[11px] text-dark-400">
                        {(bannerConfig.highlight_items || []).length} items
                      </span>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={bannerConfig.highlight_title || ''}
                        onChange={(e) => setBannerConfig(prev => ({ ...prev, highlight_title: e.target.value }))}
                        placeholder="List Header (e.g. The positions open for succession are:)"
                        className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3 py-2 text-xs text-white focus:border-ignite-500/60 focus:outline-none font-medium mb-2"
                      />
                    </div>

                    {/* Current Items Pills */}
                    <div className="space-y-1.5">
                      {(bannerConfig.highlight_items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-dark-800/80 border border-white/10 text-xs text-white group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-md bg-ignite-500/20 text-ignite-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-ignite-500/30">
                              {idx + 1}
                            </span>
                            <span className="font-medium truncate">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBannerConfig(prev => ({
                                ...prev,
                                highlight_items: prev.highlight_items.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1 rounded-md text-dark-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                            title="Remove item"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Item Bar */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlightItem}
                        onChange={(e) => setNewHighlightItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newHighlightItem.trim()) {
                              setBannerConfig(prev => ({
                                ...prev,
                                highlight_items: [...(prev.highlight_items || []), newHighlightItem.trim()]
                              }));
                              setNewHighlightItem('');
                            }
                          }
                        }}
                        placeholder="e.g. Lead Designer (Press Enter to add)"
                        className="flex-1 rounded-xl border border-white/10 bg-dark-800/90 px-3 py-2 text-xs text-white focus:border-ignite-500/60 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newHighlightItem.trim()) {
                            setBannerConfig(prev => ({
                              ...prev,
                              highlight_items: [...(prev.highlight_items || []), newHighlightItem.trim()]
                            }));
                            setNewHighlightItem('');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-ignite-500/20 hover:bg-ignite-500/30 text-ignite-300 border border-ignite-500/40 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shrink-0"
                      >
                        <FiPlus size={14} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Highlighted Milestone Box */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                      Highlighted Callout / Milestone Quote Box
                    </label>
                    <textarea
                      rows={2}
                      value={bannerConfig.highlight_box || ''}
                      onChange={(e) => setBannerConfig(prev => ({ ...prev, highlight_box: e.target.value }))}
                      placeholder="Important milestone note or inspirational quote to highlight..."
                      className="w-full rounded-xl border border-ignite-500/30 bg-ignite-500/5 px-4 py-2 text-xs text-white placeholder:text-dark-500 focus:border-ignite-500/60 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 6. Sign-off / Signature */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                      Sign-off / Signature
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.sign_off || ''}
                      onChange={(e) => setBannerConfig(prev => ({ ...prev, sign_off: e.target.value }))}
                      placeholder="e.g. Warm regards, Igniters Club – 4th Year Team"
                      className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3.5 py-2 text-xs text-dark-200 italic focus:border-ignite-500/60 focus:outline-none"
                    />
                  </div>

                  {/* 7. Image Uploader & URL */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                      Cover Banner Graphic (16:9 Image)
                    </label>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition active:scale-95">
                          <FiUploadCloud size={16} className="text-ignite-400" />
                          <span>{isUploadingBannerImg ? 'Uploading...' : 'Upload to Supabase Bucket'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadBannerImage}
                            disabled={isUploadingBannerImg}
                            className="hidden"
                          />
                        </label>

                        {bannerConfig.image_url && (
                          <button
                            type="button"
                            onClick={() => setBannerConfig(prev => ({ ...prev, image_url: '' }))}
                            className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition active:scale-95"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <FiImage className="absolute left-3.5 top-2.5 text-dark-400" />
                        <input
                          type="url"
                          value={bannerConfig.image_url}
                          onChange={(e) => setBannerConfig(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="Or paste direct image URL (https://...)"
                          className="w-full rounded-xl border border-white/10 bg-dark-800/90 pl-10 pr-4 py-2 text-xs text-white focus:border-ignite-500/60 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 8. Buttons Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                        Primary CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={bannerConfig.cta_text}
                        onChange={(e) => setBannerConfig(prev => ({ ...prev, cta_text: e.target.value }))}
                        placeholder="e.g. Apply Over This Link"
                        className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3 py-2 text-xs text-white focus:border-ignite-500/60 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                        Action Target URL / Route
                      </label>
                      <input
                        type="text"
                        value={bannerConfig.cta_url}
                        onChange={(e) => setBannerConfig(prev => ({ ...prev, cta_url: e.target.value }))}
                        placeholder="https://forms.gle/... or /events"
                        className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3 py-2 text-xs text-white focus:border-ignite-500/60 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                        Secondary Button Label
                      </label>
                      <input
                        type="text"
                        value={bannerConfig.secondary_cta_text}
                        onChange={(e) => setBannerConfig(prev => ({ ...prev, secondary_cta_text: e.target.value }))}
                        placeholder="e.g. Dismiss"
                        className="w-full rounded-xl border border-white/10 bg-dark-800/90 px-3 py-2 text-xs text-white focus:border-ignite-500/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={isSavingBanner || isUploadingBannerImg}
                      className={`px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2 active:scale-[0.98] ${
                        bannerSaveSuccess
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                          : 'bg-gradient-to-r from-ignite-500 to-rose-600 hover:from-ignite-400 hover:to-rose-500 text-white shadow-lg shadow-ignite-500/25'
                      }`}
                    >
                      {bannerSaveSuccess ? (
                        <>
                          <FiCheck size={16} />
                          <span>Saved Successfully!</span>
                        </>
                      ) : isSavingBanner ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Saving Banner...</span>
                        </>
                      ) : (
                        <span>Save Announcement Settings</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTestPopupOpen(true)}
                      className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase transition flex items-center gap-2 active:scale-[0.98]"
                    >
                      <FiEye size={15} className="text-ignite-400" />
                      <span>Test Live Popup</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Column */}
              <div className="xl:col-span-5 space-y-4">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-dark-300 flex items-center gap-2">
                      <FiEye className="text-ignite-400" />
                      Real-time Live Preview
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      bannerConfig.is_active
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-dark-800 border-white/10 text-dark-400'
                    }`}>
                      {bannerConfig.is_active ? 'Will Appear on Open' : 'Hidden from Public'}
                    </span>
                  </div>

                  {/* Visual Mockup Container matching PublicBannerModal */}
                  <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-dark-900 via-dark-900/98 to-dark-950 shadow-2xl shadow-black/80 overflow-hidden max-h-[80vh] flex flex-col">
                    <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-60 rounded-full bg-gradient-to-br from-ignite-500/25 to-rose-600/10 blur-2xl" />

                    {/* Scrollable preview body */}
                    <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                      {/* Badge & Urgency Tag */}
                      <div className="flex flex-wrap items-center gap-2">
                        {bannerConfig.badge_text && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-ignite-500/15 text-ignite-300 border border-ignite-500/30">
                            <FiBell size={12} className="text-ignite-400" />
                            {bannerConfig.badge_text}
                          </span>
                        )}

                        {bannerConfig.urgency_note && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {bannerConfig.urgency_note}
                          </span>
                        )}
                      </div>

                      {/* Cover image preview */}
                      {bannerConfig.image_url && (
                        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-dark-950 aspect-[16/9] shadow-inner">
                          <img
                            src={bannerConfig.image_url}
                            alt="Cover"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent pointer-events-none" />
                        </div>
                      )}

                      {/* Title & Audience */}
                      <div className="space-y-1">
                        <h3 className="font-outfit text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                          {bannerConfig.title || 'Your Headline Here'}
                        </h3>
                        {bannerConfig.audience && (
                          <p className="font-inter text-xs font-semibold text-ignite-300/90">
                            {bannerConfig.audience}
                          </p>
                        )}
                      </div>

                      {/* Subtitle / Normal text */}
                      {bannerConfig.subtitle && (
                        <p className="font-inter text-xs sm:text-sm text-dark-300 leading-relaxed whitespace-pre-line">
                          {bannerConfig.subtitle}
                        </p>
                      )}

                      {/* Highlighted Items */}
                      {(bannerConfig.highlight_items || []).length > 0 && (
                        <div className="space-y-2 pt-1">
                          {bannerConfig.highlight_title && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 font-mono block">
                              {bannerConfig.highlight_title}
                            </span>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {bannerConfig.highlight_items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white"
                              >
                                <span className="w-4 h-4 rounded bg-ignite-500/20 text-ignite-300 font-bold text-[9px] flex items-center justify-center shrink-0 border border-ignite-500/30">
                                  {idx + 1}
                                </span>
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestone Box */}
                      {bannerConfig.highlight_box && (
                        <div className="rounded-xl border border-ignite-500/30 bg-ignite-500/10 p-3 flex items-start gap-2.5">
                          <FiAward className="text-ignite-400 shrink-0 mt-0.5" size={15} />
                          <p className="text-xs text-white/90 leading-relaxed font-medium">
                            {bannerConfig.highlight_box}
                          </p>
                        </div>
                      )}

                      {/* Sign-off */}
                      {bannerConfig.sign_off && (
                        <p className="text-[11px] text-dark-400 italic whitespace-pre-line border-t border-white/10 pt-2">
                          {bannerConfig.sign_off}
                        </p>
                      )}
                    </div>

                    {/* Buttons Preview Sticky Footer */}
                    <div className="p-4 border-t border-white/10 bg-dark-950/70 flex items-center gap-2.5 shrink-0">
                      {bannerConfig.cta_text && (
                        <div className="flex-1 btn-header-primary py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 pointer-events-none shadow-md">
                          <span>{bannerConfig.cta_text}</span>
                          <FiArrowRight size={13} />
                        </div>
                      )}
                      <div className="py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-dark-300 text-center pointer-events-none">
                        {bannerConfig.secondary_cta_text || 'Dismiss'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Live Popup Modal inside Admin */}
            {testPopupOpen && (
              <PublicBannerModal
                isPreview={true}
                overrideConfig={bannerConfig}
                onClosePreview={() => setTestPopupOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
}
