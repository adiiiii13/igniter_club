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

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database');

  // 1. Create table public.banner_modals
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.banner_modals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL DEFAULT 'Igniter Club X GMIT Announcement',
      subtitle TEXT DEFAULT 'Welcome to the tech and innovation hub. Check out our upcoming events and workshops!',
      badge_text TEXT DEFAULT 'Official Update',
      image_url TEXT,
      cta_text TEXT DEFAULT 'Explore Events',
      cta_url TEXT DEFAULT '/events',
      secondary_cta_text TEXT DEFAULT 'Dismiss',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ Table public.banner_modals created / verified');

  // 2. Enable RLS
  await client.query(`ALTER TABLE public.banner_modals ENABLE ROW LEVEL SECURITY;`);

  // 3. Drop existing policies to avoid conflict
  await client.query(`
    DROP POLICY IF EXISTS "Public read banner_modals" ON public.banner_modals;
    DROP POLICY IF EXISTS "Admins manage banner_modals" ON public.banner_modals;
    DROP POLICY IF EXISTS "Public read active banners" ON public.banner_modals;
    DROP POLICY IF EXISTS "Admins can insert banner_modals" ON public.banner_modals;
    DROP POLICY IF EXISTS "Admins can update banner_modals" ON public.banner_modals;
    DROP POLICY IF EXISTS "Admins can delete banner_modals" ON public.banner_modals;
  `);

  // 4. Create RLS policies
  await client.query(`
    CREATE POLICY "Public read banner_modals"
    ON public.banner_modals
    FOR SELECT
    USING (true);

    CREATE POLICY "Admins manage banner_modals"
    ON public.banner_modals
    FOR ALL
    USING (
      EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'noreplay.gkk26@gmail.com'
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'noreplay.gkk26@gmail.com'
    );
  `);
  console.log('✓ RLS policies configured on banner_modals');

  // 5. Ensure initial seed record exists
  const checkCount = await client.query('SELECT COUNT(*) FROM public.banner_modals');
  if (parseInt(checkCount.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO public.banner_modals (
        title, 
        subtitle, 
        badge_text, 
        image_url, 
        cta_text, 
        cta_url, 
        secondary_cta_text, 
        is_active
      ) VALUES (
        'Welcome to Igniter Club X GMIT',
        'Discover innovation, workshops, hackathons, and tech culture built by GMIT students.',
        'Welcome',
        '',
        'Explore Events',
        '/events',
        'Dismiss',
        true
      );
    `);
    console.log('✓ Seeded initial banner_modals record');
  }

  // 6. Create storage bucket 'banners'
  await client.query(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'banners',
      'banners',
      true,
      10485760,
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    )
    ON CONFLICT (id) DO UPDATE SET public = true;
  `);
  console.log('✓ Storage bucket banners created');

  // 7. Storage policies for banners bucket
  await client.query(`
    DROP POLICY IF EXISTS "Public read banner bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Public upload banner bucket" ON storage.objects;
    DROP POLICY IF EXISTS "Admins manage banner bucket" ON storage.objects;

    CREATE POLICY "Public read banner bucket"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'banners');

    CREATE POLICY "Public upload banner bucket"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'banners');

    CREATE POLICY "Admins manage banner bucket"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'banners');
  `);
  console.log('✓ Storage policies configured for banners bucket');

  await client.end();
  console.log('✓ All database and storage setup completed successfully');
}

main().catch(console.error);
