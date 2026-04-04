# Ignite Club Database Schema - Quick Reference

## 📊 Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH.USERS                      │
│                   (PostgreSQL + Auth Built-in)                │
│  ┌────────────┐                               ┌────────────┐  │
│  │  STUDENTS  │◄─── 1:1 ───────────────────►  │   ADMINS   │  │
│  └────────────┘                               └────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ├──── Many:1 ────► ANNOUNCEMENTS
         │
         ├──── Many:1 ────► EVENTS
         │
         ├──── Many:Many ──► EVENT_REGISTRATIONS ◄──── Many:1 ── EVENTS
         │
         ├──── Many:Many ──► STUDENT_BADGES ◄──── Many:1 ── BADGES ◄──── Many:1 ── EVENTS
         │
         └──── Includes Cached Metrics ─► events_attended, badges_earned
```

## 🗂️ All Tables (Compact Reference)

### Core Tables
| Table | Rows | Purpose | Key Field |
|-------|------|---------|-----------|
| **students** | ~100-1K | User profiles | `college_id` |
| **announcements** | ~5-50 | Club news | `is_published` |
| **events** | ~10-100 | Activities | `date`, `status` |
| **event_registrations** | ~100-1K | Signups | `(student_id, event_id)` |
| **badges** | ~5-20 | Achievements | `name` |
| **student_badges** | ~10-100 | Earned badges | `(student_id, badge_id)` |
| **admins** | ~2-10 | Admins | `email` |

---

## 🔑 All Columns by Table

### students
```
✅ REQUIRED
  • id: UUID (PK, FK→auth.users)
  • email: VARCHAR(255) [UNIQUE]
  • college_id: VARCHAR(50) [UNIQUE]
  • is_profile_complete: BOOLEAN

⚙️ OPTIONAL (Profile Info)
  • full_name: VARCHAR(255)
  • phone_number: VARCHAR(20)
  • joining_year: INTEGER
  • study_year: VARCHAR(50)
  • semester: VARCHAR(50)
  • avatar: VARCHAR(100)

📊 PERFORMANCE FIELDS
  • role: VARCHAR(50) [default: 'member']
  • events_attended: INTEGER [default: 0]
  • badges_earned: INTEGER [default: 0]

🕐 METADATA
  • created_at: TIMESTAMP [auto]
  • updated_at: TIMESTAMP [auto]

INDICES: college_id, email, is_profile_complete
UNIQUE: email, college_id
```

### announcements
```
✅ REQUIRED
  • id: UUID (PK) [auto]
  • title: VARCHAR(255)
  • description: TEXT
  • is_published: BOOLEAN [default: true]

❌ OPTIONAL
  • author_id: UUID (FK→students)
  • category: VARCHAR(100)
  • is_pinned: BOOLEAN [default: false]
  • expires_at: TIMESTAMP

🕐 METADATA
  • created_at: TIMESTAMP [auto]
  • updated_at: TIMESTAMP [auto]

INDICES: created_at DESC, is_published
```

### events
```
✅ REQUIRED
  • id: UUID (PK) [auto]
  • name: VARCHAR(255)
  • date: TIMESTAMP

❌ OPTIONAL
  • description: TEXT
  • end_date: TIMESTAMP
  • location: VARCHAR(255)
  • is_online: BOOLEAN [default: false]
  • meeting_link: VARCHAR(500)
  • created_by: UUID (FK→students)
  • capacity: INTEGER
  • current_registrations: INTEGER [default: 0]
  • status: VARCHAR(50) [default: 'upcoming']

🕐 METADATA
  • created_at: TIMESTAMP [auto]
  • updated_at: TIMESTAMP [auto]

INDICES: date ASC, status, is_online
```

### event_registrations
```
✅ REQUIRED
  • id: UUID (PK) [auto]
  • student_id: UUID (FK→students)
  • event_id: UUID (FK→events)

❌ OPTIONAL
  • status: VARCHAR(50) [default: 'registered']

🕐 METADATA
  • created_at: TIMESTAMP [auto]

UNIQUE: (student_id, event_id)
INDICES: student_id, event_id, status
```

### badges
```
✅ REQUIRED
  • id: UUID (PK) [auto]
  • name: VARCHAR(100) [UNIQUE]

❌ OPTIONAL
  • description: TEXT
  • icon: VARCHAR(100)
  • event: UUID (FK→events)

🕐 METADATA
  • created_at: TIMESTAMP [auto]

INDICES: name
```

### student_badges
```
✅ REQUIRED
  • id: UUID (PK) [auto]
  • student_id: UUID (FK→students)
  • badge_id: UUID (FK→badges)
  • earned: TIMESTAMP

🕐 METADATA
  • created_at: TIMESTAMP [auto]

UNIQUE: (student_id, badge_id)
INDICES: student_id, badge_id
```

### admins
```
✅ REQUIRED
  • id: UUID (PK, FK→auth.users)
  • email: VARCHAR(255) [UNIQUE]
  • role: VARCHAR(50) [default: 'admin']

❌ OPTIONAL
  • full_name: VARCHAR(255)

🕐 METADATA
  • created_at: TIMESTAMP [auto]
  • updated_at: TIMESTAMP [auto]

INDICES: email
```

---

## 🔐 Row Level Security (RLS)

| Policy | Table | Rule |
|--------|-------|------|
| VIEW_ALL_STUDENTS | students | `SELECT` allowed for all |
| EDIT_OWN_STUDENT | students | `UPDATE` only if `auth.uid() = id` |
| INSERT_OWN_STUDENT | students | `INSERT` only if `auth.uid() = id` |
| VIEW_PUBLISHED_ANN | announcements | `SELECT` only published |
| VIEW_ALL_EVENTS | events | `SELECT` allowed for all |
| VIEW_OWN_REG | event_registrations | `SELECT` only own registrations |
| CREATE_REG | event_registrations | `INSERT` only own records |
| VIEW_ALL_BADGES | badges | `SELECT` allowed for all |
| VIEW_OWN_BADGES | student_badges | `SELECT` only own badges |
| ADMIN_ONLY | admins | `SELECT` only for admins |

---

## 📱 App Integration Points

### StudentSignupModal
```javascript
// CREATE PASSWORD AUTH
supabase.auth.signUp({ email, password })

// CREATE STUDENT RECORD
.from('students').insert({
  id, email, full_name, college_id, is_profile_complete: false
})
```

### OAuthCollegeIdSetup
```javascript
// UPDATE STUDENT WITH COLLEGE_ID
.from('students').update({
  college_id, is_profile_complete: false
})

// OR INSERT NEW STUDENT
.from('students').insert({
  id, email, full_name, college_id, is_profile_complete: false
})
```

### StudentProfileComplete
```javascript
// UPDATE PROFILE INFO
.from('students').update({
  phone_number: '+91' + phone,
  joining_year, study_year, semester,
  is_profile_complete: true
})
```

### StudentHome
```javascript
// FETCH STUDENT DATA
.from('students').select('*').eq('id', user.id)

// FETCH ANNOUNCEMENTS
.from('announcements').select('*')
  .eq('is_published', true)
  .order('created_at', { ascending: false })
  .limit(5)

// FETCH EVENTS
.from('events').select('*')
  .order('date', { ascending: true })
  .limit(5)

// FETCH REGISTERED EVENTS
.from('event_registrations').select('events(*)')
  .eq('student_id', user.id)

// FETCH BADGES
.from('student_badges').select('badges(*), earned')
  .eq('student_id', user.id)
```

### ProtectedRoute
```javascript
// CHECK COLLEGE_ID (post-auth gate)
.from('students').select('college_id, is_profile_complete')
  .eq('id', user.id)
  
// If college_id is NULL → redirect to /student/oauth-setup
// If is_profile_complete is FALSE → redirect to /student/complete-profile
```

---

## 🚀 Deployment Checklist

- [ ] Copy `SUPABASE_SCHEMA.sql` into Supabase SQL Editor
- [ ] Run entire schema (creates all 7 tables + indexes + RLS)
- [ ] Verify tables exist in Supabase dashboard
- [ ] Test RLS policies:
  - [ ] Login as student, verify can see own profile
  - [ ] Login as student, verify CANNOT see other students' profiles
  - [ ] Verify can see all published announcements
  - [ ] Verify can see all events
- [ ] Test signup flow end-to-end
- [ ] Test OAuth flow end-to-end
- [ ] Backup database before production launch
- [ ] Set up monitoring for query performance
- [ ] Document credentials in secure location

---

## 📈 Expected Growth

**Year 1:**
- students: ~500-1K
- events: ~30-50
- announcements: ~50-100
- registrations: ~2-5K

**Year 2:**
- students: ~1K-2K
- events: ~50-100
- announcements: ~100-200
- registrations: ~5-10K

**Performance impact:** Minimal until 10K+ registrations. Consider archiving at that point.

---

## 🔧 Common Queries

### Find student's upcoming events
```sql
SELECT e.* FROM events e
JOIN event_registrations er ON e.id = er.event_id
WHERE er.student_id = 'user-uuid'
  AND e.date > NOW()
  AND e.status = 'upcoming'
ORDER BY e.date ASC;
```

### Get student's earned badges
```sql
SELECT b.*, sb.earned FROM badges b
JOIN student_badges sb ON b.id = sb.badge_id
WHERE sb.student_id = 'user-uuid'
ORDER BY sb.earned DESC;
```

### Check event capacity
```sql
SELECT capacity, current_registrations,
       (capacity - current_registrations) as spots_remaining
FROM events WHERE id = 'event-uuid';
```

### Get announcements by category
```sql
SELECT * FROM announcements
WHERE is_published = true AND category = 'event'
ORDER BY created_at DESC;
```

### Count students by year
```sql
SELECT study_year, COUNT(*) as count
FROM students WHERE is_profile_complete = true
GROUP BY study_year;
```

---

## 🆘 Troubleshooting

### Profile won't complete
- Check: `is_profile_complete` is FALSE in students table
- Check: All required fields are being saved (phone, year, semester)
- Fix: Manually update: `UPDATE students SET is_profile_complete = true WHERE id = '...'`

### Can't register for event
- Check: Unique constraint on `(student_id, event_id)` — already registered?
- Check: Event capacity not exceeded
- Fix: Delete duplicate registration record

### Announcements not showing
- Check: `is_published = true`
- Check: No expired announcements (check `expires_at`)

### RLS blocking queries
- Check: User authenticated (valid JWT in auth header)
- Check: Policy allows operation for user role
- Fix: Temporarily disable RLS for debugging (NOT in production)

---

**Schema Version:** 1.0  
**Last Updated:** April 4, 2026  
**Status:** Production Ready ✅
