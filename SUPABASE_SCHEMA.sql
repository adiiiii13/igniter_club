-- Ignite Club Supabase Database Schema
-- This schema covers all current functionality as of April 4, 2026

-- =====================================================================
-- 1. STUDENTS TABLE (Profile & Account Management)
-- =====================================================================
-- Extends Supabase auth.users for student-specific data
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  college_id VARCHAR(50) NOT NULL UNIQUE,
  account_status VARCHAR(20) NOT NULL DEFAULT 'pending_profile', -- pending_profile, active, locked
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'oauth', -- manual, oauth
  college_id_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  phone_number VARCHAR(20),
  
  -- Academic Information
  joining_year INTEGER, -- Year student joined college (e.g., 2024)
  study_year VARCHAR(50), -- 1st Year, 2nd Year, 3rd Year, 4th Year
  semester VARCHAR(50), -- 1st Semester through 8th Semester
  department VARCHAR(120), -- Branch/Department (e.g., CSE, ECE, Mechanical)
  
  -- Profile
  avatar VARCHAR(500), -- Emoji or URL (e.g., '👨‍🎓')
  role VARCHAR(50) DEFAULT 'member', -- member, moderator, organizer
  
  -- Profile Completion Status
  is_profile_complete BOOLEAN DEFAULT FALSE, -- Triggers redirect in app
  
  -- Statistics (cached for performance)
  events_attended INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'pending_profile';

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'oauth';

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS college_id_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS department VARCHAR(120);

ALTER TABLE students
  ALTER COLUMN avatar TYPE VARCHAR(500);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_account_status_chk'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_account_status_chk
      CHECK (account_status IN ('pending_profile', 'active', 'locked'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_auth_provider_chk'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_auth_provider_chk
      CHECK (auth_provider IN ('manual', 'oauth'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_college_id_format_chk'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_college_id_format_chk
      CHECK (college_id ~ '^GMIT/[0-9]{4}/[0-9]{4}$');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION enforce_students_update_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Email is immutable once account is created.
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Email cannot be changed.';
  END IF;

  -- College ID can be changed only once every 24 hours.
  IF NEW.college_id IS DISTINCT FROM OLD.college_id THEN
    IF OLD.college_id_last_changed_at IS NOT NULL
       AND NOW() - OLD.college_id_last_changed_at < INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'College ID can only be changed once every 24 hours.';
    END IF;
    NEW.college_id_last_changed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_update_rules_trg ON students;
CREATE TRIGGER students_update_rules_trg
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION enforce_students_update_rules();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_email_lowercase_chk'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT students_email_lowercase_chk
      CHECK (email = lower(email));
  END IF;
END $$;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_students_college_id ON students(college_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_college_id_unique ON students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_is_profile_complete ON students(is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_students_account_status ON students(account_status);

-- =====================================================================
-- 2. ANNOUNCEMENTS TABLE (News & Updates)
-- =====================================================================
-- Stores club-wide announcements and updates
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES students(id) ON DELETE SET NULL,
  
  -- Content
  category VARCHAR(100), -- event, milestone, general, etc.
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Visibility
  is_published BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE -- Optional expiration
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);

-- =====================================================================
-- 3. EVENTS TABLE (Club Events & Workshops)
-- =====================================================================
-- Stores all club events, workshops, hackathons, etc.
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Date & Time
  date TIMESTAMP WITH TIME ZONE NOT NULL, -- Event date/time
  end_date TIMESTAMP WITH TIME ZONE, -- Event end time
  
  -- Location
  location VARCHAR(255), -- Building/Room (e.g., "Room 301")
  is_online BOOLEAN DEFAULT FALSE,
  meeting_link VARCHAR(500), -- Zoom/Teams link if online
  
  -- Event Details
  created_by UUID REFERENCES students(id) ON DELETE SET NULL,
  capacity INTEGER, -- Max registrations (NULL = unlimited)
  current_registrations INTEGER DEFAULT 0, -- Cached count
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_online ON events(is_online);

-- =====================================================================
-- 4. EVENT REGISTRATIONS TABLE (Student-Event Mapping)
-- =====================================================================
-- Tracks which students registered for which events
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Registration Status
  status VARCHAR(50) DEFAULT 'registered', -- registered, attended, cancelled
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: One registration per student per event
  UNIQUE(student_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- =====================================================================
-- 5. BADGES TABLE (Achievement Definitions)
-- =====================================================================
-- Stores badge templates and definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100), -- Emoji or URL
  event UUID REFERENCES events(id) ON DELETE SET NULL, -- Associated event
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 6. STUDENT BADGES TABLE (Student-Badge Mapping)
-- =====================================================================
-- Tracks which students have earned which badges
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  
  -- Achievement Timestamp
  earned TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: One instance of each badge per student
  UNIQUE(student_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_badge_id ON student_badges(badge_id);

-- =====================================================================
-- 7. ADMINS TABLE (Admin Access & Management)
-- =====================================================================
-- Optional table for admin users (extends auth.users)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view all student profiles" ON students;
DROP POLICY IF EXISTS "Students can update their own profile" ON students;
DROP POLICY IF EXISTS "Students can insert their own profile" ON students;
DROP POLICY IF EXISTS "Anyone can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Students can view their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Students can create registrations" ON event_registrations;
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
DROP POLICY IF EXISTS "Students can view their own earned badges" ON student_badges;
DROP POLICY IF EXISTS "Only admins can view admin profiles" ON admins;

-- Students: Users can view all students, but only update their own
CREATE POLICY "Students can view all student profiles" ON students FOR SELECT USING (TRUE);
CREATE POLICY "Students can update their own profile" ON students FOR UPDATE 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Students can insert their own profile" ON students FOR INSERT 
  WITH CHECK (
    auth.uid() = id
    AND auth.jwt() ->> 'email' = email
  );

-- Announcements: Everyone can view published announcements
CREATE POLICY "Anyone can view published announcements" ON announcements FOR SELECT 
  USING (is_published = TRUE);

-- Events: Everyone can view all events
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (TRUE);

-- Event Registrations: Users can view only their own registrations
CREATE POLICY "Students can view their own registrations" ON event_registrations FOR SELECT 
  USING (auth.uid() = student_id);
CREATE POLICY "Students can create registrations" ON event_registrations FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Badges: Everyone can view badges
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (TRUE);

-- Student Badges: Users can view only their own earned badges
CREATE POLICY "Students can view their own earned badges" ON student_badges FOR SELECT 
  USING (auth.uid() = student_id);

-- Admins: Only admins can view admin table
CREATE POLICY "Only admins can view admin profiles" ON admins FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admins));

-- =====================================================================
-- INITIAL DATA (Optional)
-- =====================================================================
-- You can uncomment and modify this section to add initial data

-- INSERT INTO badges (name, description, icon) VALUES
-- ('Hackathon Champion', 'Won a hackathon', '🏆'),
-- ('Event Regular', 'Attended 5+ events', '⭐'),
-- ('Workshop Master', 'Completed all workshops', '📚'),
-- ('Community Leader', 'Organized an event', '👑');

-- =====================================================================
-- SCHEMA DOCUMENTATION
-- =====================================================================
-- 
-- TABLE SIZES & RETENTION:
-- - students: Main user profiles, ~100-1000 rows
-- - announcements: ~5-50 rows (archived after expiry)
-- - events: ~10-100 rows (archived after completion)
-- - event_registrations: 100s-1000s of rows (linked to events)
-- - badges: ~5-20 rows (static achievement definitions)
-- - student_badges: 10s-100s of rows (incremental growth)
-- - admins: ~2-10 rows (static admin list)
--
-- KEY FIELDS FOR APP LOGIC:
-- - students.is_profile_complete: Controls redirect in ProtectedRoute
-- - students.college_id: Required post-OAuth verification
-- - students.account_status: Primary lock/unlock gate (pending_profile, active, locked)
-- - students.college_id_last_changed_at: Enforces 24-hour interval between changes
-- - students.password_changed_at: Used by manual accounts for 5-minute password cooldown
-- - students.auth_provider: Distinguishes manual vs OAuth signup behavior
-- - students row is created only after email/magic-link verification for manual signup
-- - events.date: Sorting for "upcoming events"
-- - event_registrations: Tracks user engagement
-- - student_badges: User achievements & gamification
--
-- RATE LIMITING: Implemented at Supabase auth level
-- - 5 sign-ups/sign-ins per IP per 5 minutes
-- - Client-side 3s cooldown in UI components
--
-- PERFORMANCE NOTES:
-- - All tables have appropriate indexes for common queries
-- - Use cached counts (current_registrations, events_attended) to avoid N+1
-- - Consider pagination for large result sets (announcements, events)
-- - Archive old events to keep performance optimal
