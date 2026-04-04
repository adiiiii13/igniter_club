# Ignite Club Database Schema Documentation

## Overview
This database schema supports the Ignite Club student management platform. It includes student profiles, event management, announcements, and achievement tracking through badges.

**Database Type:** PostgreSQL (Supabase)  
**Total Tables:** 7 core tables  
**Created:** April 4, 2026  
**Status:** Production-ready with RLS policies

---

## Table Reference

### 1. **students** (Core User Profile)
**Purpose:** Extends Supabase `auth.users` with application-specific student data  
**Size:** ~100-1000 rows  
**Primary Key:** `id` (UUID, FK from auth.users)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Links to auth.users |
| `email` | VARCHAR(255) | ✅ | Unique, from OAuth/signup |
| `full_name` | VARCHAR(255) | ❌ | May be from OAuth metadata |
| `college_id` | VARCHAR(50) | ✅ | **UNIQUE** - Post-OAuth verification |
| `phone_number` | VARCHAR(20) | ❌ | Added during profile completion |
| `joining_year` | INTEGER | ❌ | Academic entry year (2020-2027) |
| `study_year` | VARCHAR(50) | ❌ | 1st/2nd/3rd/4th Year |
| `semester` | VARCHAR(50) | ❌ | 1st-8th Semester |
| `avatar` | VARCHAR(100) | ❌ | Emoji or image URL (👨‍🎓) |
| `role` | VARCHAR(50) | ✅ | Default: 'member' |
| `is_profile_complete` | BOOLEAN | ✅ | **CRITICAL** - Controls app routing |
| `events_attended` | INTEGER | ✅ | Cached count for performance |
| `badges_earned` | INTEGER | ✅ | Cached count for performance |
| `created_at` | TIMESTAMP | ✅ | Auto-set on signup |
| `updated_at` | TIMESTAMP | ✅ | Updated on profile changes |

**Key App Logic:**
- `is_profile_complete = FALSE` → Redirect to `/student/complete-profile`
- `is_profile_complete = TRUE` → Access `/student/home`
- `college_id` must be non-NULL → Redirect to `/student/oauth-setup` if missing
- Retrieved in `StudentHome` for profile strip display
- Updated in `StudentProfileComplete` after registration

**Indexes:**
- `idx_students_college_id` — Fast college ID lookups
- `idx_students_email` — For authentication lookups
- `idx_students_is_profile_complete` — Route guard queries

---

### 2. **announcements** (News & Updates)
**Purpose:** Store club-wide announcements, updates, and news  
**Size:** ~5-50 rows (archived after expiry)  
**Primary Key:** `id` (UUID)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Auto-generated |
| `title` | VARCHAR(255) | ✅ | Announcement headline |
| `description` | TEXT | ✅ | Full announcement text |
| `author_id` | UUID | ❌ | FK to students (who posted) |
| `category` | VARCHAR(100) | ❌ | event, milestone, general |
| `is_pinned` | BOOLEAN | ✅ | Default: FALSE |
| `is_published` | BOOLEAN | ✅ | Default: TRUE |
| `created_at` | TIMESTAMP | ✅ | Auto-set on creation |
| `updated_at` | TIMESTAMP | ✅ | Updated on edit |
| `expires_at` | TIMESTAMP | ❌ | Optional auto-hide date |

**App Usage:**
- Fetched in `StudentHome` (limit 5, ordered by `created_at DESC`)
- Displayed in notification drawer
- RLS allows all authenticated users to view published announcements

**Indexes:**
- `idx_announcements_created_at` — Sort by newest first
- `idx_announcements_published` — Filter by visibility

---

### 3. **events** (Club Events & Workshops)
**Purpose:** Store all club activities: workshops, hackathons, meetups, etc.  
**Size:** ~10-100 rows (archive completed events)  
**Primary Key:** `id` (UUID)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Auto-generated |
| `name` | VARCHAR(255) | ✅ | "React Workshop", "Hackathon 2025" |
| `description` | TEXT | ❌ | Event details & agenda |
| `date` | TIMESTAMP | ✅ | Event start date/time |
| `end_date` | TIMESTAMP | ❌ | Event end time |
| `location` | VARCHAR(255) | ❌ | "Room 301" or building name |
| `is_online` | BOOLEAN | ✅ | Default: FALSE |
| `meeting_link` | VARCHAR(500) | ❌ | Zoom/Teams URL if online |
| `created_by` | UUID | ❌ | FK to students (organizer) |
| `capacity` | INTEGER | ❌ | Max registrations (NULL = unlimited) |
| `current_registrations` | INTEGER | ✅ | Default: 0 (cached count) |
| `status` | VARCHAR(50) | ✅ | upcoming, ongoing, completed, cancelled |
| `created_at` | TIMESTAMP | ✅ | Auto-set on creation |
| `updated_at` | TIMESTAMP | ✅ | Updated on edit |

**App Usage:**
- Fetched in `StudentHome` (limit 5, ordered by `date ASC`)
- Displayed in modal/drawer for event list
- Referenced by `event_registrations` and `badges`
- Status determines visibility in UI

**Indexes:**
- `idx_events_date` — Sort upcoming events
- `idx_events_status` — Filter by event lifecycle
- `idx_events_is_online` — Filter online vs in-person

---

### 4. **event_registrations** (Student-Event Mapping)
**Purpose:** Track which students registered for which events (many-to-many)  
**Size:** 100s-1000s of rows  
**Primary Key:** `id` (UUID)  
**Unique Constraint:** `(student_id, event_id)` — Prevent double registrations

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Auto-generated |
| `student_id` | UUID | ✅ | FK to students |
| `event_id` | UUID | ✅ | FK to events |
| `status` | VARCHAR(50) | ✅ | registered, attended, cancelled |
| `created_at` | TIMESTAMP | ✅ | Registration date |

**App Usage:**
- Fetched in `StudentHome` to show user's registered events
- Query: `.select('events(*)').eq('student_id', user.id)`
- Displayed in "My Activity" → "Registered Events" tab
- Used to check capacity constraints before registration

**Indexes:**
- `idx_event_registrations_student_id` — Find all events for a student
- `idx_event_registrations_event_id` — Find all students in an event
- `idx_event_registrations_status` — Filter by registration status

---

### 5. **badges** (Achievement Definitions)
**Purpose:** Define badge templates that can be earned by students  
**Size:** ~5-20 rows (static)  
**Primary Key:** `id` (UUID)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Auto-generated |
| `name` | VARCHAR(100) | ✅ | **UNIQUE** - "Hackathon Champion" |
| `description` | TEXT | ❌ | Explanation & criteria |
| `icon` | VARCHAR(100) | ❌ | Emoji or image URL |
| `event` | UUID | ❌ | FK to events (if event-specific) |
| `created_at` | TIMESTAMP | ✅ | Auto-set on creation |

**App Usage:**
- Examples: "Hackathon Champion 🏆", "Event Regular ⭐", "Workshop Master 📚"
- Fetched in `StudentHome` via join with `student_badges`
- Static data (rarely added/modified)

---

### 6. **student_badges** (Student-Badge Mapping)
**Purpose:** Track earned achievements for each student (many-to-many)  
**Size:** 10s-100s of rows  
**Primary Key:** `id` (UUID)  
**Unique Constraint:** `(student_id, badge_id)` — Each student earns badge once

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Auto-generated |
| `student_id` | UUID | ✅ | FK to students |
| `badge_id` | UUID | ✅ | FK to badges |
| `earned` | TIMESTAMP | ✅ | When badge was earned |
| `created_at` | TIMESTAMP | ✅ | When record was created |

**App Usage:**
- Fetched in `StudentHome` with: `.select('badges(*), earned').eq('student_id', user.id)`
- Displayed in "My Activity" → "Badges" tab
- Shows earned timestamp and badge details

**Indexes:**
- `idx_student_badges_student_id` — Find all badges for a student
- `idx_student_badges_badge_id` — Find all students with a badge

---

### 7. **admins** (Admin Access & Management)
**Purpose:** Track admin users and their permissions  
**Size:** ~2-10 rows (static)  
**Primary Key:** `id` (UUID, FK from auth.users)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | UUID | ✅ | Links to auth.users, auto-generated |
| `email` | VARCHAR(255) | ✅ | **UNIQUE** - Admin email |
| `full_name` | VARCHAR(255) | ❌ | Admin's display name |
| `role` | VARCHAR(50) | ✅ | admin, super_admin |
| `created_at` | TIMESTAMP | ✅ | When admin was added |
| `updated_at` | TIMESTAMP | ✅ | Last modified |

**App Usage:**
- Currently: `AdminLoginPage` only (form is UI placeholder)
- Future: Admin dashboard, event management, announcement posting

**Indexes:**
- `idx_admins_email` — Admin authentication lookup

---

## Data Flow by User Journey

### 1. **OAuth Signup with Google/GitHub**
```
OAuth Provider
    ↓
Supabase Auth (creates auth.users)
    ↓
OAuthCollegeIdSetup.jsx (user enters college_id + password)
    ↓
INSERT into students (id, email, full_name, college_id, is_profile_complete=false)
    ↓
StudentProfileComplete.jsx (user fills phone, year, semester)
    ↓
UPDATE students SET phone_number, joining_year, study_year, semester, is_profile_complete=true
    ↓
StudentHome.jsx (access granted)
```

### 2. **Email/Password Signup**
```
StudentSignupModal (3-step form)
    ↓
supabase.auth.signUp(email, password)
    ↓
INSERT into students (manual flow includes college_id)
    ↓
StudentProfileComplete.jsx
    ↓
StudentHome.jsx
```

### 3. **Login with OAuth**
```
OAuth Provider
    ↓
Supabase Auth (loads existing auth.users)
    ↓
ProtectedRoute checks college_id
    ↓
If college_id missing → OAuthCollegeIdSetup.jsx
If college_id exists → StudentHome.jsx
```

### 4. **View Events & Register**
```
StudentHome.jsx
    ↓
SELECT * FROM events WHERE status='upcoming' ORDER BY date
    ↓
SELECT * FROM event_registrations WHERE student_id = current_user
    ↓
JOIN with events table → Display "My Events"
    ↓
User clicks "Register" → INSERT into event_registrations
```

### 5. **View Announcements**
```
StudentHome.jsx
    ↓
SELECT * FROM announcements WHERE is_published=true ORDER BY created_at DESC LIMIT 5
    ↓
Display in notification drawer
```

### 6. **View Badges Earned**
```
StudentHome.jsx
    ↓
SELECT * FROM student_badges WHERE student_id = current_user
    ↓
JOIN with badges table → Get badge details
    ↓
Display with icon, name, earned date
```

---

## Constraints & Uniqueness

| Table | Constraint | Purpose |
|-------|-----------|---------|
| students | PK: id | Links to auth.users |
| students | UNIQUE: college_id | Prevents duplicate college IDs |
| students | UNIQUE: email | From auth.users |
| event_registrations | UNIQUE: (student_id, event_id) | One registration per student per event |
| student_badges | UNIQUE: (student_id, badge_id) | One instance of each badge per student |
| badges | UNIQUE: name | Badge definitions are unique |
| admins | PK: id | Links to auth.users |
| admins | UNIQUE: email | Admin email is unique |

---

## Row Level Security (RLS) Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **students** | All can view | Users own only | Users own only | None |
| **announcements** | Published only | Admins | Admins | Admins |
| **events** | All can view | Admins | Admins | Admins |
| **event_registrations** | Own only | Own only | Own | Own |
| **badges** | All can view | Admins | Admins | Admins |
| **student_badges** | Own only | Admins | Admins | None |
| **admins** | Admin only | Admins | Admins | Admins |

---

## Performance Optimization Notes

### Caching Strategy
- `students.events_attended` — Cached count (update on registration)
- `students.badges_earned` — Cached count (update on badge award)
- `events.current_registrations` — Cached count (update on registration)

**Benefit:** Avoid expensive COUNT() queries on large result sets

### Pagination Recommendations
```javascript
// For announcements (can grow over time)
SELECT * FROM announcements 
WHERE is_published = true 
ORDER BY created_at DESC 
LIMIT 10 OFFSET {page * 10}

// For events (can grow over time)  
SELECT * FROM events 
WHERE status != 'cancelled' 
ORDER BY date ASC 
LIMIT 10 OFFSET {page * 10}

// For badges (small, safe to fetch all)
SELECT * FROM student_badges 
WHERE student_id = current_user
```

### Archive Strategy
- Keep only last 2 years of completed events
- Archive announcements older than 6 months
- Use soft deletes (add `deleted_at` timestamp) instead of hard deletes

---

## migration scripts (if needed)

### Add New Column Example
```sql
ALTER TABLE students 
ADD COLUMN bio TEXT;
```

### Add New Badge
```sql
INSERT INTO badges (name, description, icon) 
VALUES ('Tech Speaker', 'Gave a tech talk', '🎤');
```

### Update Cached Statistics
```sql
UPDATE students 
SET events_attended = (
  SELECT COUNT(*) FROM event_registrations 
  WHERE student_id = students.id AND status = 'attended'
)
WHERE id = (current user);
```

---

## Disaster Recovery & Backups

- Supabase provides automatic daily backups
- Point-in-time recovery available (contact Supabase support)
- Manual exports: Use Supabase dashboard → Database → Backups
- Test recovery procedures quarterly

---

## Future Enhancements

1. **Community/Clubs Sub-table** — Support multiple clubs
2. **Event Comments Table** — Discussion/Q&A for events
3. **Invitation System** — Invite-only events
4. **Leaderboard** — Top students by attendance/badges
5. **Integration Logs** — Audit trail of admin actions
6. **Notification Preferences** — User opt-in for types
7. **Analytics Table** — Track page views, signups, etc.

---

## Support & Questions

- **Schema Last Updated:** April 4, 2026
- **Status:** Production (v1.0)
- **Total Table Size Estimate:** ~100-10,000 rows (depending on usage)
- **Query Performance:** All tables indexed for primary operations
