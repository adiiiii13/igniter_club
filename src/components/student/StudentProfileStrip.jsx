import { FiEdit } from 'react-icons/fi';

export default function StudentProfileStrip({ student, onEditProfile }) {
  const safeStudent = student || {
    avatar: '👨‍🎓',
    fullName: 'Student',
    collegeId: 'GMIT/----/----',
    department: 'Department not set',
    role: 'member',
    joinDate: 'Recently',
  };
  const hasAvatarUrl = typeof safeStudent.avatar === 'string' && /^https?:\/\//.test(safeStudent.avatar);

  const roleLabel = safeStudent.role
    ? safeStudent.role.charAt(0).toUpperCase() + safeStudent.role.slice(1)
    : 'Member';

  return (
    <div className="border-b border-white/5 bg-gradient-to-r from-dark-900 via-dark-900/95 to-dark-900/80">
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-ignite-400/20 flex items-center justify-center text-2xl sm:text-3xl border border-ignite-400/40 shadow-[0_0_0_4px_rgba(244,63,94,0.08)]">
              {hasAvatarUrl ? (
                <img src={safeStudent.avatar} alt={safeStudent.fullName} className="h-full w-full rounded-full object-cover" />
              ) : (
                safeStudent.avatar
              )}
            </div>

            {/* Profile Info */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{safeStudent.fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-[11px] sm:text-xs font-mono text-dark-300 rounded-md border border-white/10 bg-white/5 px-2 py-1">
                  {safeStudent.collegeId}
                </span>
                <span className="text-[11px] sm:text-xs text-dark-300 rounded-md border border-white/10 bg-white/5 px-2 py-1">
                  {safeStudent.department}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  safeStudent.role === 'member'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-dark-500 mt-2">Member since {safeStudent.joinDate}</p>
            </div>
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-dark-300 hover:text-white hover:bg-white/5 transition hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <FiEdit size={16} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
