import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { animate } from 'animejs';
import { FiBell, FiCalendar, FiAlertCircle, FiX, FiCheck } from 'react-icons/fi';

const EMPTY_ARRAY = [];

export default function StudentNotificationDrawer({ isOpen, onClose, isProfileComplete = true, notifications = EMPTY_ARRAY }) {
  const drawerRef = useRef(null);
  const navigate = useNavigate();
  const [notificationItemsState, setNotificationItemsState] = useState(notifications);

  useEffect(() => {
    setNotificationItemsState(notifications);
  }, [notifications]);


  const reminderNotification = !isProfileComplete
    ? {
        id: 'profile-reminder',
        type: 'announcement',
        title: 'Complete your profile to unlock all sidebar sections.',
        time: 'Now',
        icon: FiAlertCircle,
        read: false,
      }
    : null;

  const notificationItems = reminderNotification
    ? [reminderNotification, ...notificationItemsState]
    : notificationItemsState;

  const unreadCount = notificationItems.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotificationItemsState((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearAllNotifications = () => {
    setNotificationItemsState([]);
  };

  const dismissNotification = (id) => {
    setNotificationItemsState((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[26rem] bg-dark-900 border-l border-white/10 shadow-2xl flex flex-col"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <FiBell size={20} className="text-ignite-400" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-white/5 px-6 py-3">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-medium text-ignite-400 hover:text-ignite-300 transition"
            >
              Mark all as read
            </button>
            <button
              type="button"
              onClick={clearAllNotifications}
              className="text-xs font-medium text-dark-400 hover:text-white transition"
            >
              Clear all
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-white/5">
              {notificationItems.length === 0 && (
                <div className="px-6 py-6 text-sm text-dark-400">No notifications right now.</div>
              )}
              {notificationItems.map((notif) => {
                const Icon = notif.type === 'event' ? FiCalendar : FiAlertCircle;
                return (
                  <div
                    key={notif.id}
                    className={`px-6 py-4 hover:bg-white/5 transition cursor-pointer ${
                      notif.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                        notif.type === 'event'
                          ? 'bg-ignite-400/20 text-ignite-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-dark-500 mt-1">{notif.time}</p>
                        {notif.id === 'profile-reminder' && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate('/student/complete-profile');
                            }}
                            className="mt-2 text-xs font-medium text-ignite-300 hover:text-ignite-200 transition"
                          >
                            Complete Profile
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {notif.read && (
                          <FiCheck size={16} className="text-emerald-400 flex-shrink-0" />
                        )}
                        {notif.id !== 'profile-reminder' && (
                          <button
                            type="button"
                            onClick={() => dismissNotification(notif.id)}
                            className="rounded p-1 text-dark-500 hover:text-white hover:bg-white/5 transition"
                            aria-label="Dismiss notification"
                          >
                            <FiX size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
