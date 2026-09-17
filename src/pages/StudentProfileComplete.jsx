import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { FiPhone, FiCheckCircle, FiChevronDown } from 'react-icons/fi';
import { supabase } from '../utils/supabase';

export default function StudentProfileComplete() {
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [formData, setFormData] = useState({
    phone: '',
    joiningYear: '',
    studyYear: '',
    semester: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const pageRef = useRef(null);
  const contentRef = useRef(null);
  const departmentDropdownRef = useRef(null);

  const RATE_LIMIT_COOLDOWN = 3000; // 3 seconds between attempts

  const currentYear = new Date().getFullYear();
  const joiningYears = Array.from({ length: 7 }, (_, i) => currentYear - 6 + i).reverse();
  const studyYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
  const departments = [
    'B. Tech in Computer Science Engineering',
    'B. Tech in Computer Science & Business System',
    'B. Tech in Mechanical',
    'B. Tech in Civil',
    'B. Tech in Electronics and Communication Engineering',
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (pageRef.current) {
      animate(pageRef.current, {
        opacity: [0, 1],
        duration: 380,
      });
    }
  }, []);

  useEffect(() => {
    if (contentRef.current && !isComplete) {
      animate(contentRef.current.querySelectorAll('[data-field]'), {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 320,
        delay: stagger(60),
      });
    }
  }, [isComplete]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (!isDepartmentOpen) return;

    const handleClickOutside = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setIsDepartmentOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDepartmentOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.joiningYear) newErrors.joiningYear = 'Joining year required';
    if (!formData.studyYear) newErrors.studyYear = 'Study year required';
    if (!formData.semester) newErrors.semester = 'Semester required';
    if (!formData.department) newErrors.department = 'Department required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_COOLDOWN) {
      const remaining = Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
      setErrors({ submit: `Please wait ${remaining}s before trying again` });
      setCooldownRemaining(RATE_LIMIT_COOLDOWN - (now - lastSubmitTime));
      return;
    }

    setLastSubmitTime(now);
    setIsLoading(true);
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const phoneWithCountryCode = '+91' + formData.phone;
      const { error } = await supabase
        .from('students')
        .update({
          phone_number: phoneWithCountryCode,
          joining_year: formData.joiningYear,
          study_year: formData.studyYear,
          semester: formData.semester,
          department: formData.department,
          is_profile_complete: true,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);
      if (error) throw error;
      console.log('Profile completed successfully');
      setIsComplete(true);
      setTimeout(() => {
        navigate('/student/home?intro=1');
      }, 1500);
    } catch (err) {
      console.error('Profile completion error:', err);
      setErrors({ submit: err.message || 'Failed to complete profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          className="rounded-2xl border border-white/10 bg-dark-900/95 p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 text-center">
            <Link to="/home" className="brand-lockup brand-lockup-auth mb-3 group" aria-label="Go to home">
              <div className="brand-logo-shell brand-logo-auth">
                <img
                  src="/GMITxIgnite-removebg-preview.png"
                  alt="Igniter Club x GMIT Logo"
                  className="brand-logo-img"
                />
              </div>

              <span className="brand-lockup-divider" aria-hidden="true" />

              <div className="brand-partner-shell">
                <img
                  src="/gmit-jis-15years-dark.png"
                  alt="GMIT 15 Years of Tomorrow | JIS Group"
                  className="brand-partner-img"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-semibold text-white">Complete your profile</h1>
            <p className="mt-2 text-sm text-dark-400">to unlock your dashboard</p>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-ignite-400 mb-2">Step 2 of 2</p>
            <div className="h-1.5 rounded-full bg-ignite-400" />
          </div>

          {!isComplete ? (
            <form onSubmit={handleSubmit} ref={contentRef} className="space-y-5">
              <div data-field>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-dark-400 text-sm font-medium">+91</div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="9876543210"
                    maxLength="10"
                    className="w-full rounded-lg border border-white/10 bg-dark-800 pl-14 pr-4 py-2.5 text-white placeholder-dark-500 focus:border-ignite-400 focus:outline-none transition font-mono"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>

              <div data-field>
                <label htmlFor="joiningYear" className="block text-sm font-medium text-white mb-2">
                  College Joining Year <span className="text-red-400">*</span>
                </label>
                <select
                  id="joiningYear"
                  name="joiningYear"
                  value={formData.joiningYear}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition"
                >
                  <option value="">Select year...</option>
                  {joiningYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.joiningYear && <p className="text-xs text-red-400 mt-1">{errors.joiningYear}</p>}
              </div>

              <div data-field>
                <label htmlFor="studyYear" className="block text-sm font-medium text-white mb-2">
                  Current Year of Study <span className="text-red-400">*</span>
                </label>
                <select
                  id="studyYear"
                  name="studyYear"
                  value={formData.studyYear}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition"
                >
                  <option value="">Select year...</option>
                  {studyYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.studyYear && <p className="text-xs text-red-400 mt-1">{errors.studyYear}</p>}
              </div>

              <div data-field>
                <label htmlFor="semester" className="block text-sm font-medium text-white mb-2">
                  Current Semester <span className="text-red-400">*</span>
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none transition"
                >
                  <option value="">Select semester...</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
                {errors.semester && <p className="text-xs text-red-400 mt-1">{errors.semester}</p>}
              </div>

              <div data-field>
                <label htmlFor="department" className="block text-sm font-medium text-white mb-2">
                  Department / Branch <span className="text-red-400">*</span>
                </label>
                <div ref={departmentDropdownRef} className="relative">
                  <button
                    id="department"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isDepartmentOpen}
                    onClick={() => setIsDepartmentOpen((prev) => !prev)}
                    className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-left text-white focus:border-ignite-400 focus:outline-none transition flex items-center justify-between"
                  >
                    <span className={formData.department ? 'text-white' : 'text-dark-500'}>
                      {formData.department || 'Select department...'}
                    </span>
                    <FiChevronDown
                      className={`text-dark-300 transition-transform ${isDepartmentOpen ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>

                  {isDepartmentOpen && (
                    <div
                      role="listbox"
                      className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-ignite-400/30 bg-dark-900 shadow-xl shadow-black/40"
                    >
                      {departments.map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, department: dept }));
                            if (errors.department) {
                              setErrors((prev) => ({ ...prev, department: '' }));
                            }
                            setIsDepartmentOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition ${
                            formData.department === dept
                              ? 'bg-ignite-400/20 text-ignite-200'
                              : 'text-dark-100 hover:bg-white/5'
                          }`}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.department && <p className="text-xs text-red-400 mt-1">{errors.department}</p>}
              </div>

              {errors.submit && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || cooldownRemaining > 0}
                className="w-full mt-6 rounded-lg bg-ignite-400 px-4 py-2.5 text-sm font-medium text-dark-900 hover:bg-ignite-300 transition disabled:opacity-50"
              >
                {cooldownRemaining > 0 ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` : isLoading ? 'Unlocking dashboard...' : 'Save & Unlock Dashboard'}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ignite-400/20 mb-4"
              >
                <FiCheckCircle size={32} className="text-ignite-400" />
              </motion.div>
              <h2 className="text-xl font-semibold text-white">Profile complete!</h2>
              <p className="mt-2 text-sm text-dark-400">Taking you to your dashboard...</p>
            </motion.div>
          )}
        </motion.div>

        {!isComplete && (
          <p className="mt-6 text-center text-xs text-dark-500">
            This info helps us personalize your member experience
          </p>
        )}
      </div>
    </div>
  );
}
