-- ============================================================================
-- Migration 07: Supabase Storage Buckets & Path-Scoped Object Access Policies
-- ============================================================================

-- Ensure storage schema & tables exist for portable execution (bypassed if already provisioned by Supabase)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    CREATE SCHEMA storage;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN NULL;
  WHEN duplicate_schema THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    CREATE TABLE storage.buckets (
      id text PRIMARY KEY,
      name text NOT NULL,
      owner uuid,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      public boolean DEFAULT false,
      avif_autodetection boolean DEFAULT false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    CREATE TABLE storage.objects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id text REFERENCES storage.buckets(id),
      name text,
      owner uuid,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      last_accessed_at timestamptz DEFAULT now(),
      metadata jsonb,
      path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
    );
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION storage.foldername(name text)
  RETURNS text[]
  LANGUAGE sql IMMUTABLE
  SET search_path = storage, public
  AS $fn$
    SELECT string_to_array(name, '/');
  $fn$;
EXCEPTION
  WHEN insufficient_privilege THEN NULL;
END $$;

-- 1. Insert Storage Buckets configuration into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('resumes', 'resumes', false, 5242880, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('company-logos', 'company-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']),
  ('verification-docs', 'verification-docs', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects if not already enabled (safely handled if system owned)
DO $$ BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 2. RESUMES BUCKET POLICIES (Private: Requires Candidate Owner or Signed URL)
-- Folder Path Format: {student_profile_id}/{filename}
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Candidates upload own resume" ON storage.objects;
CREATE POLICY "Candidates upload own resume"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.student_profiles WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates view own resume" ON storage.objects;
CREATE POLICY "Candidates view own resume"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.student_profiles WHERE user_id = auth.uid()
    )
    OR public.is_admin()
  )
);

DROP POLICY IF EXISTS "Candidates delete own resume" ON storage.objects;
CREATE POLICY "Candidates delete own resume"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.student_profiles WHERE user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- 3. VERIFICATION DOCS BUCKET POLICIES (Private: Recruiter Upload / Admin Read)
-- Folder Path Format: {company_id}/{filename}
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Company members upload verification doc" ON storage.objects;
CREATE POLICY "Company members upload verification doc"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM public.company_members 
    WHERE user_id = auth.uid() AND status = 'ACTIVE'
  )
);

DROP POLICY IF EXISTS "Admins read verification docs" ON storage.objects;
CREATE POLICY "Admins read verification docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-docs' AND public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 4. AVATARS BUCKET POLICIES (Public Read / Owner Write)
-- Folder Path Format: {user_id}/{filename}
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ----------------------------------------------------------------------------
-- 5. COMPANY LOGOS BUCKET POLICIES (Public Read / Active Member Write)
-- Folder Path Format: {company_id}/{filename}
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read company logos" ON storage.objects;
CREATE POLICY "Public read company logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Company members upload company logo" ON storage.objects;
CREATE POLICY "Company members upload company logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM public.company_members 
    WHERE user_id = auth.uid() AND status = 'ACTIVE'
  )
);
