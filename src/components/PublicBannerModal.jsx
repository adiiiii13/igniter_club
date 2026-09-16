import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiBell, FiExternalLink, FiAward } from 'react-icons/fi';
import { supabase } from '../utils/supabase';

export default function PublicBannerModal({ 
  overrideConfig = null, 
  isPreview = false, 
  onClosePreview = null,
  hasActiveIntro = false 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [banner, setBanner] = useState(overrideConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // If in preview mode inside Admin Dashboard, use passed config
  useEffect(() => {
    if (isPreview && overrideConfig) {
      setBanner(overrideConfig);
      setIsOpen(true);
      setLoading(false);
      return;
    }

    // Skip auto-popup on admin management console unless previewing
    if (location.pathname.startsWith('/admin')) {
      setIsOpen(false);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchActiveBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('banner_modals')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Failed to load active banner modal:', error);
          return;
        }

        if (isMounted) {
          if (data && data.is_active) {
            setBanner(data);
          } else {
            setBanner(null);
            setIsOpen(false);
          }
        }
      } catch (err) {
        console.error('Banner modal fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActiveBanner();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, isPreview, overrideConfig]);

  // Open modal when banner is loaded and no active intro is playing
  useEffect(() => {
    if (isPreview) return;
    if (location.pathname.startsWith('/admin')) return;
    if (!banner || !banner.is_active) {
      setIsOpen(false);
      return;
    }

    // If an intro overlay is playing on the landing page, wait for it to complete
    if (hasActiveIntro) {
      setIsOpen(false);
      return;
    }

    // Silky smooth entrance delay (500ms after page settle or intro end)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [hasActiveIntro, banner, isPreview, location.pathname]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (isPreview && onClosePreview) {
      onClosePreview();
    }
  };

  const handleAction = () => {
    if (!banner?.cta_url) {
      handleClose();
      return;
    }

    const url = banner.cta_url.trim();
    handleClose();

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  if (!banner || !banner.is_active) return null;

  // Safely normalize highlight_items into an array
  const highlightItems = Array.isArray(banner.highlight_items)
    ? banner.highlight_items
    : typeof banner.highlight_items === 'string'
      ? banner.highlight_items.split('\n').map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
      : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Soft Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={handleClose}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container with comfortable scroll for mobile/tablets */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 bg-gradient-to-b from-dark-900 via-dark-900/98 to-dark-950 shadow-2xl shadow-black/80 overflow-hidden my-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Ambient Highlight Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-80 rounded-full bg-gradient-to-br from-ignite-500/25 to-rose-600/10 blur-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close banner modal"
              className="absolute top-4 right-4 z-30 rounded-full p-2 text-dark-400 bg-dark-950/70 border border-white/10 hover:bg-white/10 hover:text-white transition active:scale-90 backdrop-blur-sm"
            >
              <FiX size={18} />
            </button>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-5 space-y-5 custom-scrollbar">
              {/* Header Badges: Category & Urgency */}
              <div className="flex flex-wrap items-center gap-2 pr-8">
                {banner.badge_text && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-ignite-500/15 text-ignite-300 border border-ignite-500/30 shadow-sm shadow-ignite-500/10">
                    <FiBell className="text-ignite-400" size={13} />
                    {banner.badge_text}
                  </span>
                )}

                {banner.urgency_note && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {banner.urgency_note}
                  </span>
                )}

                {isPreview && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Preview
                  </span>
                )}
              </div>

              {/* Cover Banner Image */}
              {banner.image_url && (
                <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-dark-950/90 aspect-[16/9] group shadow-inner">
                  <img
                    src={banner.image_url}
                    alt={banner.title || 'Banner'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* Title & Audience */}
              <div className="space-y-1.5">
                <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {banner.title}
                </h2>
                {banner.audience && (
                  <p className="font-inter text-xs sm:text-sm font-semibold tracking-wide text-ignite-300/90">
                    {banner.audience}
                  </p>
                )}
              </div>

              {/* Normal Main Narrative / Description */}
              {banner.subtitle && (
                <div className="font-inter text-sm text-dark-200 leading-relaxed whitespace-pre-line">
                  {banner.subtitle}
                </div>
              )}

              {/* Organized Highlighted Section: Open Positions / Key Points */}
              {highlightItems.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {banner.highlight_title && (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ignite-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-dark-300 font-mono">
                        {banner.highlight_title}
                      </h4>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {highlightItems.map((pos, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-white shadow-sm hover:border-ignite-500/30 hover:bg-white/[0.06] transition"
                      >
                        <span className="w-5 h-5 rounded-lg bg-ignite-500/20 text-ignite-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-ignite-500/30">
                          {idx + 1}
                        </span>
                        <span className="truncate">{pos}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlighted Callout Box */}
              {banner.highlight_box && (
                <div className="rounded-2xl border border-ignite-500/30 bg-gradient-to-r from-ignite-500/10 via-rose-500/5 to-transparent p-4 flex items-start gap-3 shadow-lg shadow-ignite-500/5">
                  <div className="p-1.5 rounded-lg bg-ignite-500/20 text-ignite-400 shrink-0 mt-0.5 border border-ignite-500/30">
                    <FiAward size={16} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-dark-100 font-medium">
                    {banner.highlight_box}
                  </p>
                </div>
              )}

              {/* Sign-off / Signature */}
              {banner.sign_off && (
                <div className="pt-2 border-t border-white/10 text-xs text-dark-400 font-medium italic whitespace-pre-line leading-relaxed">
                  {banner.sign_off}
                </div>
              )}
            </div>

            {/* Bottom Action Buttons (Sticky footer) */}
            <div className="p-4 sm:px-8 sm:py-5 border-t border-white/10 bg-dark-950/60 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {banner.cta_text && (
                <button
                  type="button"
                  onClick={handleAction}
                  className="w-full sm:flex-1 btn-header-primary py-3 px-6 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-ignite-600/25"
                >
                  <span>{banner.cta_text}</span>
                  {banner.cta_url && banner.cta_url.startsWith('http') ? (
                    <FiExternalLink size={15} />
                  ) : (
                    <FiArrowRight size={15} />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-dark-300 hover:text-white transition active:scale-[0.98]"
              >
                {banner.secondary_cta_text || 'Dismiss'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
