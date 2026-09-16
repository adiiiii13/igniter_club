import pg from 'pg';
import fs from 'fs';

let connectionString = process.env.DATABASE_URL;
if (!connectionString && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) connectionString = match[1].trim();
}

const client = new pg.Client({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('✓ Connected successfully!');

  console.log('Beginning schema execution...');

  const schemaSql = `
    -- 1. ADMINS TABLE (Created first so helper functions and policies can reference it)
    CREATE TABLE IF NOT EXISTS public.admins (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

    -- 2. Helper function for admin check
    CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    STABLE
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.admins WHERE id = user_id
      );
    $$;

    -- 3. STUDENTS TABLE
    CREATE TABLE IF NOT EXISTS public.students (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255),
      college_id VARCHAR(50) NOT NULL UNIQUE,
      account_status VARCHAR(20) NOT NULL DEFAULT 'pending_profile',
      auth_provider VARCHAR(20) NOT NULL DEFAULT 'oauth',
      college_id_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      password_changed_at TIMESTAMP WITH TIME ZONE,
      phone_number VARCHAR(20),
      joining_year INTEGER,
      study_year VARCHAR(50),
      semester VARCHAR(50),
      department VARCHAR(120),
      avatar VARCHAR(500) DEFAULT '👨‍🎓',
      role VARCHAR(50) DEFAULT 'member',
      is_profile_complete BOOLEAN DEFAULT FALSE,
      events_attended INTEGER DEFAULT 0,
      badges_earned INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Constraints on students
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_account_status_chk') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_account_status_chk
          CHECK (account_status IN ('pending_profile', 'active', 'locked'));
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_auth_provider_chk') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_auth_provider_chk
          CHECK (auth_provider IN ('manual', 'oauth'));
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_college_id_format_chk') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_college_id_format_chk
          CHECK (college_id ~ '^GMIT/[0-9]{4}/[0-9]{4}$');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_email_lowercase_chk') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_email_lowercase_chk
          CHECK (email = lower(email));
      END IF;
    END $$;

    -- Trigger for student updates
    CREATE OR REPLACE FUNCTION public.enforce_students_update_rules()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      -- Email is immutable
      IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Email cannot be changed.';
      END IF;

      -- College ID can be changed only once every 24 hours (unless setting initial ID)
      IF NEW.college_id IS DISTINCT FROM OLD.college_id THEN
        IF OLD.college_id IS NOT NULL AND OLD.college_id <> '' AND OLD.college_id_last_changed_at IS NOT NULL
           AND NOW() - OLD.college_id_last_changed_at < INTERVAL '24 hours' THEN
          RAISE EXCEPTION 'College ID can only be changed once every 24 hours.';
        END IF;
        NEW.college_id_last_changed_at = NOW();
      END IF;

      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS students_update_rules_trg ON public.students;
    CREATE TRIGGER students_update_rules_trg
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_students_update_rules();

    -- Students indexes
    CREATE INDEX IF NOT EXISTS idx_students_college_id ON public.students(college_id);
    CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
    CREATE INDEX IF NOT EXISTS idx_students_is_profile_complete ON public.students(is_profile_complete);
    CREATE INDEX IF NOT EXISTS idx_students_account_status ON public.students(account_status);

    -- 4. ANNOUNCEMENTS TABLE
    CREATE TABLE IF NOT EXISTS public.announcements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      category VARCHAR(100) DEFAULT 'general',
      is_pinned BOOLEAN DEFAULT FALSE,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP WITH TIME ZONE
    );

    CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);

    -- 5. EVENTS TABLE
    CREATE TABLE IF NOT EXISTS public.events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE,
      location VARCHAR(255),
      is_online BOOLEAN DEFAULT FALSE,
      meeting_link VARCHAR(500),
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      capacity INTEGER,
      current_registrations INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'upcoming',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date ASC);
    CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
    CREATE INDEX IF NOT EXISTS idx_events_is_online ON public.events(is_online);

    -- 6. EVENT REGISTRATIONS TABLE
    CREATE TABLE IF NOT EXISTS public.event_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
      event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'registered',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, event_id)
    );

    CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON public.event_registrations(student_id);
    CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

    -- 7. BADGES TABLE
    CREATE TABLE IF NOT EXISTS public.badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(100),
      event VARCHAR(255),
      event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. STUDENT BADGES TABLE
    CREATE TABLE IF NOT EXISTS public.student_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
      badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
      earned TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, badge_id)
    );

    CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON public.student_badges(student_id);
    CREATE INDEX IF NOT EXISTS idx_student_badges_badge_id ON public.student_badges(badge_id);

    -- Triggers for counts
    CREATE OR REPLACE FUNCTION public.update_event_registrations_count()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE public.events
        SET current_registrations = current_registrations + 1
        WHERE id = NEW.event_id;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events
        SET current_registrations = GREATEST(0, current_registrations - 1)
        WHERE id = OLD.event_id;
      END IF;
      RETURN NULL;
    END;
    $$;

    DROP TRIGGER IF EXISTS event_registrations_count_trg ON public.event_registrations;
    CREATE TRIGGER event_registrations_count_trg
    AFTER INSERT OR DELETE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_event_registrations_count();

    CREATE OR REPLACE FUNCTION public.update_student_badges_count()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE public.students
        SET badges_earned = badges_earned + 1
        WHERE id = NEW.student_id;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.students
        SET badges_earned = GREATEST(0, badges_earned - 1)
        WHERE id = OLD.student_id;
      END IF;
      RETURN NULL;
    END;
    $$;

    DROP TRIGGER IF EXISTS student_badges_count_trg ON public.student_badges;
    CREATE TRIGGER student_badges_count_trg
    AFTER INSERT OR DELETE ON public.student_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_student_badges_count();

    -- ROW LEVEL SECURITY (RLS) POLICIES
    ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

    -- Drop old policies to allow idempotency
    DROP POLICY IF EXISTS "Anyone can select students" ON public.students;
    DROP POLICY IF EXISTS "Students can view all student profiles" ON public.students;
    DROP POLICY IF EXISTS "Students can insert their own profile" ON public.students;
    DROP POLICY IF EXISTS "Students can update their own profile" ON public.students;
    DROP POLICY IF EXISTS "Admins can delete students" ON public.students;

    DROP POLICY IF EXISTS "Anyone can view published announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins and authors can insert announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins and authors can update announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins and authors can delete announcements" ON public.announcements;

    DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
    DROP POLICY IF EXISTS "Admins and organizers can insert events" ON public.events;
    DROP POLICY IF EXISTS "Admins and organizers can update events" ON public.events;
    DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

    DROP POLICY IF EXISTS "Students can view their own registrations" ON public.event_registrations;
    DROP POLICY IF EXISTS "Students can create registrations" ON public.event_registrations;
    DROP POLICY IF EXISTS "Students can cancel registrations" ON public.event_registrations;

    DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
    DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;

    DROP POLICY IF EXISTS "Students and admins can view earned badges" ON public.student_badges;
    DROP POLICY IF EXISTS "Students can view their own earned badges" ON public.student_badges;
    DROP POLICY IF EXISTS "Admins can assign badges" ON public.student_badges;

    DROP POLICY IF EXISTS "Only admins can view admin profiles" ON public.admins;
    DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can manage admins" ON public.admins;

    -- Students policies
    CREATE POLICY "Anyone can select students" ON public.students FOR SELECT
      USING (true);

    CREATE POLICY "Students can insert their own profile" ON public.students FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

    CREATE POLICY "Students can update their own profile" ON public.students FOR UPDATE TO authenticated
      USING (auth.uid() = id OR public.is_admin(auth.uid()))
      WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

    CREATE POLICY "Admins can delete students" ON public.students FOR DELETE TO authenticated
      USING (public.is_admin(auth.uid()));

    -- Announcements policies
    CREATE POLICY "Anyone can view published announcements" ON public.announcements FOR SELECT
      USING (is_published = true OR public.is_admin(auth.uid()));

    CREATE POLICY "Admins and authors can insert announcements" ON public.announcements FOR INSERT TO authenticated
      WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = author_id);

    CREATE POLICY "Admins and authors can update announcements" ON public.announcements FOR UPDATE TO authenticated
      USING (public.is_admin(auth.uid()) OR auth.uid() = author_id);

    CREATE POLICY "Admins and authors can delete announcements" ON public.announcements FOR DELETE TO authenticated
      USING (public.is_admin(auth.uid()) OR auth.uid() = author_id);

    -- Events policies
    CREATE POLICY "Anyone can view events" ON public.events FOR SELECT
      USING (true);

    CREATE POLICY "Admins and organizers can insert events" ON public.events FOR INSERT TO authenticated
      WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = created_by);

    CREATE POLICY "Admins and organizers can update events" ON public.events FOR UPDATE TO authenticated
      USING (public.is_admin(auth.uid()) OR auth.uid() = created_by);

    CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated
      USING (public.is_admin(auth.uid()));

    -- Event Registrations policies
    CREATE POLICY "Students can view their own registrations" ON public.event_registrations FOR SELECT TO authenticated
      USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

    CREATE POLICY "Students can create registrations" ON public.event_registrations FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = student_id OR public.is_admin(auth.uid()));

    CREATE POLICY "Students can cancel registrations" ON public.event_registrations FOR DELETE TO authenticated
      USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

    -- Badges policies
    CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT
      USING (true);

    CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));

    -- Student Badges policies
    CREATE POLICY "Students and admins can view earned badges" ON public.student_badges FOR SELECT TO authenticated
      USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

    CREATE POLICY "Admins can assign badges" ON public.student_badges FOR ALL TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));

    -- Admins table policies
    CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT TO authenticated
      USING (auth.uid() = id OR public.is_admin(auth.uid()));

    CREATE POLICY "Super admins can manage admins" ON public.admins FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role = 'super_admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role = 'super_admin'));
  `;

  await client.query(schemaSql);
  console.log('✓ Tables, constraints, triggers, indexes, and RLS policies created successfully!');

  // Seed badges if empty
  console.log('Checking & seeding initial Badges...');
  const existingBadges = await client.query('SELECT COUNT(*) FROM public.badges;');
  if (parseInt(existingBadges.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO public.badges (name, description, icon, event) VALUES
      ('Early Igniter', 'Joined Igniter Club during the foundation phase', '🚀', 'Igniter Onboarding 2026'),
      ('Hackathon Contender', 'Competed in an official Igniter Club hackathon', '🏆', 'Annual Hackathon'),
      ('Workshop Explorer', 'Completed a hands-on technical workshop or masterclass', '⚡', 'Web & AI Build Sprint'),
      ('Open Source Builder', 'Contributed code, docs, or reviews to club open source repositories', '🌟', 'Open Source Guild'),
      ('Community Leader', 'Organized an event or mentored junior members', '🔥', 'Igniter Community Circle');
    `);
    console.log('✓ Seeded 5 initial achievement badges');
  } else {
    console.log('✓ Badges already exist, skipping seed');
  }

  // Seed events if empty
  console.log('Checking & seeding initial Events...');
  const existingEvents = await client.query('SELECT COUNT(*) FROM public.events;');
  if (parseInt(existingEvents.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO public.events (name, description, date, end_date, location, is_online, capacity, status) VALUES
      (
        'Igniter Induction & Orientation 2026',
        'Official welcome session for new Igniter Club members. Discover active technical circles, roadmap for the semester, and meet senior mentors.',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '5 days 2 hours',
        'Auditorium Hall, GMIT Campus',
        FALSE,
        150,
        'upcoming'
      ),
      (
        'Full-Stack Web & AI Build Sprint',
        'Intensive hands-on workshop building production-ready web apps with React, Supabase, and AI integrations.',
        NOW() + INTERVAL '12 days',
        NOW() + INTERVAL '12 days 3 hours',
        'Computer Lab 3, GMIT',
        FALSE,
        60,
        'upcoming'
      ),
      (
        'Cloud Architecture & Open Source Masterclass',
        'Live interactive session covering cloud deployment patterns, containerization, and making your first open source pull request.',
        NOW() + INTERVAL '19 days',
        NOW() + INTERVAL '19 days 2 hours',
        'Online (Google Meet)',
        TRUE,
        250,
        'upcoming'
      );
    `);
    console.log('✓ Seeded 3 initial events');
  } else {
    console.log('✓ Events already exist, skipping seed');
  }

  // Seed announcements if empty
  console.log('Checking & seeding initial Announcements...');
  const existingAnnouncements = await client.query('SELECT COUNT(*) FROM public.announcements;');
  if (parseInt(existingAnnouncements.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO public.announcements (title, description, category, is_pinned, is_published) VALUES
      (
        'Igniter Club GMIT Portal is Live!',
        'Welcome to our official club portal. Sign up with your GMIT College ID to participate in hackathons, track achievements, and join community circles.',
        'general',
        TRUE,
        TRUE
      ),
      (
        'Upcoming Web & AI Build Sprint Announced',
        'Join us next week in Computer Lab 3 for our hands-on workshop. Registration opens for all verified members.',
        'event',
        FALSE,
        TRUE
      ),
      (
        'Community Circle Leads Applications Open',
        'Passionate about AI, Web Development, or Cybersecurity? Propose a new circle or apply to lead a track under the Communities tab.',
        'milestone',
        FALSE,
        TRUE
      );
    `);
    console.log('✓ Seeded 3 initial announcements');
  } else {
    console.log('✓ Announcements already exist, skipping seed');
  }

  // Summary verification
  const tablesSummary = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('\nFinal Public Tables in Database:', tablesSummary.rows.map(r => r.table_name));

  for (const table of tablesSummary.rows.map(r => r.table_name)) {
    const countRes = await client.query(`SELECT COUNT(*) FROM public."${table}";`);
    console.log(`  - ${table}: ${countRes.rows[0].count} rows`);
  }

  await client.end();
  console.log('\nAll database setup completed successfully! 🎉');
}

run().catch((err) => {
  console.error('\n❌ Database setup error:', err);
  process.exit(1);
});
