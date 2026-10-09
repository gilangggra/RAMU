import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setup() {
  console.log("Setting up Supabase Storage buckets via database connection...");

  try {
    // 1. Insert buckets
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES 
        ('portfolios', 'portfolios', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']),
        ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log("✓ Buckets 'portfolios' & 'avatars' successfully created/updated in storage.buckets!");

    // 2. Allow public read access to these buckets
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for RAMU Assets'
        ) THEN
          CREATE POLICY "Public Access for RAMU Assets" ON storage.objects
          FOR SELECT USING (bucket_id IN ('portfolios', 'avatars'));
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Upload to RAMU Buckets'
        ) THEN
          CREATE POLICY "Allow Upload to RAMU Buckets" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id IN ('portfolios', 'avatars'));
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Update to RAMU Buckets'
        ) THEN
          CREATE POLICY "Allow Update to RAMU Buckets" ON storage.objects
          FOR UPDATE USING (bucket_id IN ('portfolios', 'avatars'));
        END IF;
      END
      $$;
    `);
    console.log("✓ Storage policies configured for public access and uploads!");

    // 3. Verify
    const buckets: any[] = await prisma.$queryRawUnsafe('SELECT id, name, public FROM storage.buckets;');
    console.log("Current Supabase Buckets in DB:", buckets);
  } catch (err: any) {
    console.error("Storage setup failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
