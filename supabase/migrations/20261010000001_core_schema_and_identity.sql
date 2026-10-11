-- ============================================================================
-- Migration 01: Core Extensions, Profiles, Identity Sync & Role Governance
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure standard Supabase roles exist for portable DDL execution across any Postgres engine
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END $$;

-- Enum for Platform Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('STUDENT', 'COMPANY', 'EMPLOYEE', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Profiles Table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_url text,
  phone text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON public.profiles(is_demo);

-- 2. User Roles Table (RBAC Authority)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'STUDENT',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);

-- 3. Security Definer Helper Functions (Fixed search_path = public)
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = target_user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- 4. Trusted Signup Trigger Function (Atomic Provisioning & Privileged Role Injection Prevention)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  assigned_role public.app_role;
  extracted_name text;
BEGIN
  -- Extract requested role from metadata, but NEVER trust ADMIN from client metadata
  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
  
  -- Force unprivileged default role for self-service registrations
  IF requested_role IN ('COMPANY', 'EMPLOYEE') THEN
    assigned_role := requested_role::public.app_role;
  ELSE
    assigned_role := 'STUDENT'::public.app_role; -- Defaults to STUDENT if ADMIN or unknown is requested
  END IF;

  extracted_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  -- 1. Create Profile
  INSERT INTO public.profiles (id, email, name, avatar_url, is_demo)
  VALUES (
    NEW.id,
    NEW.email,
    extracted_name,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_demo')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

  -- 2. Create User Role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 3. Initialize Domain Specific Profile shell if STUDENT
  IF assigned_role = 'STUDENT' THEN
    INSERT INTO public.student_profiles (user_id, target_domain)
    VALUES (NEW.id, 'Software Development')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Register AFTER INSERT trigger on auth.users
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_signup();

-- 5. Audited Administrative Role Grant Function (Admin Only)
CREATE OR REPLACE FUNCTION public.grant_user_role(target_user_id uuid, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only platform Administrators can grant or modify user roles.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
