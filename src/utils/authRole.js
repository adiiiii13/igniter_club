import { supabase } from './supabase';

/**
 * Checks the current session user and determines their role and profile.
 * Returns:
 * {
 *   user, // Supabase auth user
 *   role: 'super_admin' | 'admin' | 'student' | null,
 *   isAdmin: boolean,
 *   adminRecord: { id, email, full_name, role } | null,
 *   studentRecord: { id, full_name, college_id, is_profile_complete, ... } | null,
 *   displayName: string
 * }
 */
const KNOWN_ADMIN_EMAILS = [
  'noreplay.gkk26@gmail.com',
];

export async function getCurrentUserRole(providedUser = null) {
  try {
    let user = providedUser;
    if (!user) {
      const { data: sessionData } = await supabase.auth.getSession();
      user = sessionData?.session?.user || null;
    }
    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    }

    if (!user) {
      return {
        user: null,
        role: null,
        isAdmin: false,
        adminRecord: null,
        studentRecord: null,
        displayName: '',
      };
    }

    const normalizedEmail = (user.email || '').trim().toLowerCase();

    // Fast-path: Known super admin emails (zero RLS latency, 100% reliable)
    if (normalizedEmail && KNOWN_ADMIN_EMAILS.includes(normalizedEmail)) {
      return {
        user,
        role: 'super_admin',
        isAdmin: true,
        adminRecord: {
          id: user.id,
          email: user.email,
          full_name: 'Club Administrator',
          role: 'super_admin',
        },
        studentRecord: null,
        displayName: 'Club Administrator',
      };
    }

    // 1. Check admins table in Supabase
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (adminRecord) {
      return {
        user,
        role: adminRecord.role || 'admin',
        isAdmin: true,
        adminRecord,
        studentRecord: null,
        displayName: adminRecord.full_name?.trim() || 'Club Administrator',
      };
    }

    // 2. Also check admin_whitelist in case trigger hasn't fired yet
    if (user.email) {
      const normalizedEmail = user.email.trim().toLowerCase();
      const { data: whitelistRecord } = await supabase
        .from('admin_whitelist')
        .select('role')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (whitelistRecord) {
        return {
          user,
          role: whitelistRecord.role || 'super_admin',
          isAdmin: true,
          adminRecord: {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Club Administrator',
            role: whitelistRecord.role,
          },
          studentRecord: null,
          displayName: user.user_metadata?.full_name || 'Club Administrator',
        };
      }
    }

    // 3. Check students table
    const { data: studentRecord } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      user,
      role: 'student',
      isAdmin: false,
      adminRecord: null,
      studentRecord,
      displayName: studentRecord?.full_name?.trim() || user.user_metadata?.full_name?.trim() || 'Student',
    };
  } catch (err) {
    console.error('Error determining user role:', err);
    return {
      user: null,
      role: null,
      isAdmin: false,
      adminRecord: null,
      studentRecord: null,
      displayName: '',
    };
  }
}
