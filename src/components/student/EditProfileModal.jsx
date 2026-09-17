import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown, FiCheck } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';

const DEPARTMENTS = [
  'B. Tech in Computer Science Engineering',
  'B. Tech in Computer Science & Business System',
  'B. Tech in Mechanical',
  'B. Tech in Civil',
  'B. Tech in Electronics and Communication Engineering',
];

export default function EditProfileModal({ isOpen, onClose, student, onSaved }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const hasCloudinaryConfig = Boolean(cloudName && uploadPreset);

  const currentYear = new Date().getFullYear();
  const joiningYears = useMemo(() => Array.from({ length: 7 }, (_, i) => currentYear - 6 + i).reverse(), [currentYear]);
  const studyYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    collegeId: '',
    phone: '',
    joiningYear: '',
    studyYear: '',
    semester: '',
    department: '',
    avatar: '',
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const departmentDropdownRef = useRef(null);

  useEffect(() => {
    if (!student || !isOpen) return;

    const phoneDigits = (student.phoneNumber || '').replace(/^\+91/, '').replace(/\D/g, '').slice(0, 10);

    setFormData({
      fullName: student.fullName || '',
      email: student.email || '',
      collegeId: student.collegeId || '',
      phone: phoneDigits,
      joiningYear: student.joiningYear || '',
      studyYear: student.studyYear || '',
      semester: student.semester || '',
      department: student.department || '',
      avatar: student.avatar || '',
    });
    setAvatarFile(null);
    setAvatarPreview(student.avatar || '');
    setErrors({});
  }, [student, isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name required';

    if (!formData.collegeId.trim()) {
      newErrors.collegeId = 'College ID required';
    } else if (!/^GMIT\/\d{4}\/\d{4}$/.test(formData.collegeId.trim())) {
      newErrors.collegeId = 'Invalid format. Use GMIT/0000/0000';
    }

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

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, avatar: 'Please select a valid image file.' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Image must be under 2MB.' }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setErrors((prev) => ({ ...prev, avatar: '' }));
  };

  const handleAvatarUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, avatar: url }));
    if (/^https?:\/\//.test(url)) {
      setAvatarPreview(url);
    }
    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: '' }));
    }
  };

  const uploadAvatarToCloudinary = async (file) => {
    if (!cloudName || !uploadPreset) {
      throw new Error('Avatar upload not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result?.secure_url) {
      throw new Error(result?.error?.message || 'Failed to upload image.');
    }

    return result.secure_url;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!student?.id) {
      setErrors({ submit: 'User profile not loaded. Please refresh and try again.' });
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrlToSave = formData.avatar || '';

      if (avatarFile) {
        if (!hasCloudinaryConfig) {
          throw new Error('Upload env missing. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET, or use Avatar URL field.');
        }
        avatarUrlToSave = await uploadAvatarToCloudinary(avatarFile);
      } else if (avatarUrlToSave && !/^https?:\/\//.test(avatarUrlToSave)) {
        throw new Error('Avatar URL must start with http:// or https://');
      }

      const { error } = await supabase
        .from('students')
        .update({
          full_name: formData.fullName.trim(),
          college_id: formData.collegeId.trim(),
          phone_number: '+91' + formData.phone,
          joining_year: Number(formData.joiningYear),
          study_year: formData.studyYear,
          semester: formData.semester,
          department: formData.department,
          avatar: avatarUrlToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id);

      if (error) throw error;

      setSaveSuccess(true);
      onSaved?.();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose?.();
      }, 950);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save profile changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close edit profile"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-dark-900 p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-dark-400 hover:bg-white/5 hover:text-white transition active:scale-95"
            >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
        <p className="mt-1 text-xs text-dark-400">Email is fixed. College ID updates follow the 24-hour change rule.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSave}>
          <div>
            <p className="mb-1 block text-sm text-white">Profile Image</p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-dark-800 flex items-center justify-center text-2xl text-dark-400">
                {avatarPreview && /^https?:\/\/|^blob:/.test(avatarPreview) ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  '👨‍🎓'
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-white/10 px-3 py-2 text-xs text-dark-200 hover:bg-white/5">
                Browse from computer
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-dark-500">
              {hasCloudinaryConfig
                ? 'Image is uploaded to Cloudinary and saved as URL in profile.'
                : 'Cloudinary not configured yet. Use Avatar URL below or add env vars.'}
            </p>
            <div className="mt-3">
              <label htmlFor="edit-avatar-url" className="mb-1 block text-xs text-dark-300">Avatar URL (optional)</label>
              <input
                id="edit-avatar-url"
                name="avatar"
                value={formData.avatar}
                onChange={handleAvatarUrlChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none"
              />
            </div>
            {errors.avatar && <p className="mt-1 text-xs text-red-400">{errors.avatar}</p>}
          </div>

          <div>
            <label htmlFor="edit-fullName" className="mb-1 block text-sm text-white">Full Name</label>
            <input
              id="edit-fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="edit-email" className="mb-1 block text-sm text-white">Email</label>
            <input
              id="edit-email"
              value={formData.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-dark-800/60 px-4 py-2.5 text-dark-300"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-collegeId" className="mb-1 block text-sm text-white">College ID</label>
              <input
                id="edit-collegeId"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 font-mono text-white focus:border-ignite-400 focus:outline-none"
              />
              {errors.collegeId && <p className="mt-1 text-xs text-red-400">{errors.collegeId}</p>}
            </div>
            <div>
              <label htmlFor="edit-phone" className="mb-1 block text-sm text-white">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-dark-400">+91</span>
                <input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="w-full rounded-lg border border-white/10 bg-dark-800 py-2.5 pl-12 pr-4 text-white focus:border-ignite-400 focus:outline-none"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-joiningYear" className="mb-1 block text-sm text-white">Joining Year</label>
              <select
                id="edit-joiningYear"
                name="joiningYear"
                value={formData.joiningYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none"
              >
                <option value="">Select year...</option>
                {joiningYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.joiningYear && <p className="mt-1 text-xs text-red-400">{errors.joiningYear}</p>}
            </div>
            <div>
              <label htmlFor="edit-studyYear" className="mb-1 block text-sm text-white">Study Year</label>
              <select
                id="edit-studyYear"
                name="studyYear"
                value={formData.studyYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none"
              >
                <option value="">Select study year...</option>
                {studyYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.studyYear && <p className="mt-1 text-xs text-red-400">{errors.studyYear}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-semester" className="mb-1 block text-sm text-white">Semester</label>
              <select
                id="edit-semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-white focus:border-ignite-400 focus:outline-none"
              >
                <option value="">Select semester...</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              {errors.semester && <p className="mt-1 text-xs text-red-400">{errors.semester}</p>}
            </div>
            <div>
              <label htmlFor="edit-department" className="mb-1 block text-sm text-white">Department</label>
              <div ref={departmentDropdownRef} className="relative">
                <button
                  id="edit-department"
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
                    {DEPARTMENTS.map((dept) => (
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
              {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department}</p>}
            </div>
          </div>

          {errors.submit && <p className="text-sm text-red-300">{errors.submit}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-dark-300 hover:bg-white/5 hover:text-white transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || saveSuccess}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 active:scale-[0.98] ${
                saveSuccess
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-ignite-400 text-dark-900 hover:bg-ignite-300 disabled:opacity-60'
              }`}
            >
              {saveSuccess ? (
                <>
                  <FiCheck size={16} className="text-white" />
                  <span>Changes Saved!</span>
                </>
              ) : isSaving ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-dark-900/30 border-t-dark-900 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
