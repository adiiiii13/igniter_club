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

  // Check columns in announcements
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'announcements' ORDER BY ordinal_position;");
  console.log('Current columns in announcements:', res.rows.map(r => r.column_name));

  // Add image_url if missing
  const hasImageUrl = res.rows.some(r => r.column_name === 'image_url');
  if (!hasImageUrl) {
    await client.query("ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url TEXT;");
    console.log('✓ Added image_url column to announcements');
  } else {
    console.log('✓ image_url column already exists');
  }

  // Ensure RLS policy allows admins to INSERT, UPDATE, DELETE on announcements
  await client.query(`
    DROP POLICY IF EXISTS "Anyone can view published announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
    DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;

    CREATE POLICY "Public can view announcements"
    ON public.announcements
    FOR SELECT
    USING (true);

    CREATE POLICY "Admins manage announcements"
    ON public.announcements
    FOR ALL
    USING (true)
    WITH CHECK (true);
  `);
  console.log('✓ Configured open/admin RLS policies for announcements');

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
