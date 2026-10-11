-- ============================================================================
-- Migration 02: Candidate Profiles, Multi-Recruiter Companies & Verifications
-- ============================================================================

-- 1. Student Profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline text,
  college text,
  degree text,
  branch text,
  grad_year integer,
  cgpa numeric(3, 2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
  location text,
  target_domain text DEFAULT 'Software Development',
  target_roles text[],
  experience_level text DEFAULT 'Fresher',
  bio text,
  resume_url text,
  resume_score integer DEFAULT 0 CHECK (resume_score BETWEEN 0 AND 100),
  missing_skills text[],
  github_url text,
  linkedin_url text,
  portfolio_url text,
  talent_score integer DEFAULT 0 CHECK (talent_score BETWEEN 0 AND 100),
  talent_tier text DEFAULT 'Tier B' CHECK (talent_tier IN ('Tier S', 'Tier A', 'Tier B', 'Tier C')),
  percentile numeric(5, 2) DEFAULT 0.00,
  tech_score integer DEFAULT 0,
  problem_solving_score integer DEFAULT 0,
  comm_score integer DEFAULT 0,
  projects_score integer DEFAULT 0,
  interview_score integer DEFAULT 0,
  human_verified boolean DEFAULT false,
  privacy_level text DEFAULT 'PUBLIC' CHECK (privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS', 'REFERRAL_ONLY', 'PRIVATE')),
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_domain_score ON public.student_profiles(target_domain, talent_score DESC);
CREATE INDEX IF NOT EXISTS idx_student_profiles_privacy ON public.student_profiles(privacy_level, human_verified);

-- Nested Candidate Tables
CREATE TABLE IF NOT EXISTS public.student_educations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text NOT NULL,
  field_of_study text NOT NULL,
  start_year integer NOT NULL,
  end_year integer NOT NULL,
  grade text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_educations_profile ON public.student_educations(student_profile_id);

CREATE TABLE IF NOT EXISTS public.student_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  location text,
  start_date text NOT NULL,
  end_date text,
  is_current boolean DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_experiences_profile ON public.student_experiences(student_profile_id);

CREATE TABLE IF NOT EXISTS public.student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  level text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_skills_profile_name ON public.student_skills(student_profile_id, lower(name));

CREATE TABLE IF NOT EXISTS public.student_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  tech_stack text[],
  github_url text,
  live_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_projects_profile ON public.student_projects(student_profile_id);

CREATE TABLE IF NOT EXISTS public.student_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date text NOT NULL,
  credential_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_certifications_profile ON public.student_certifications(student_profile_id);

CREATE TABLE IF NOT EXISTS public.student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  date text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Company Profiles & Multi-Recruiter Memberships
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  company_name text NOT NULL,
  department text,
  designation text,
  website text,
  linkedin text,
  company_size text,
  is_verified boolean DEFAULT false,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_company_profiles_name ON public.company_profiles(lower(company_name));

CREATE TABLE IF NOT EXISTS public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'RECRUITER' CHECK (role IN ('OWNER', 'RECRUITER', 'MEMBER')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_company_user UNIQUE (company_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_company_members_lookup ON public.company_members(company_id, user_id, status);

CREATE TABLE IF NOT EXISTS public.company_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  work_email_domain text NOT NULL,
  document_url text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Employee Referrer Profiles
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  designation text NOT NULL,
  work_email text NOT NULL,
  is_verified boolean DEFAULT false,
  total_referrals integer DEFAULT 0 CHECK (total_referrals >= 0),
  successful_referrals integer DEFAULT 0 CHECK (successful_referrals >= 0),
  earnings numeric(10, 2) DEFAULT 0.00 CHECK (earnings >= 0.00),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_company ON public.employee_profiles(company_id, is_verified);

-- 4. Helper Functions for Company Membership & Verification
CREATE OR REPLACE FUNCTION public.is_company_member(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = cid AND user_id = auth.uid() AND status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = cid AND user_id = auth.uid() AND role = 'OWNER' AND status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_verified(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_verified FROM public.company_profiles WHERE id = cid),
    false
  );
$$;
