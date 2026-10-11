-- ============================================================================
-- Migration 04: Assessments, AI Mock Interviews & Recruiter Privacy Summary Views
-- ============================================================================

-- 1. Assessment Templates & Questions
CREATE TABLE IF NOT EXISTS public.assessment_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  role text NOT NULL,
  experience_level text DEFAULT 'Fresher',
  title text NOT NULL,
  description text NOT NULL,
  time_limit_minutes integer DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_template_id uuid REFERENCES public.assessment_templates(id) ON DELETE CASCADE,
  type text DEFAULT 'MCQ' CHECK (type IN ('MCQ', 'CODING', 'DEBUGGING', 'SCENARIO', 'WRITTEN')),
  text text NOT NULL,
  code_snippet text,
  options_jsonb jsonb,
  correct_answer text NOT NULL,
  explanation text,
  difficulty text DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  domain text NOT NULL,
  role text NOT NULL,
  skill_category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Assessment Attempts
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  assessment_template_id uuid REFERENCES public.assessment_templates(id) ON DELETE SET NULL,
  domain text DEFAULT 'Software Development',
  role text DEFAULT 'Full Stack Developer',
  score integer DEFAULT 0,
  max_score integer DEFAULT 100,
  time_taken_seconds integer DEFAULT 0,
  time_left_seconds integer DEFAULT 1200,
  correct_answers integer DEFAULT 0,
  total_questions integer DEFAULT 5,
  status text DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'EXPIRED')),
  answers_jsonb jsonb, -- PRIVATE Candidate Data
  feedback_jsonb jsonb, -- PRIVATE Candidate Data
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_profile_id, status);

-- 3. AI Technical Interview Sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  type text DEFAULT 'AI' CHECK (type IN ('AI', 'HUMAN')),
  role text NOT NULL,
  domain text NOT NULL,
  status text DEFAULT 'COMPLETED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  overall_score integer DEFAULT 0,
  comm_score integer DEFAULT 0,
  tech_depth_score integer DEFAULT 0,
  confidence_score integer DEFAULT 0,
  accuracy_score integer DEFAULT 0,
  behavioral_score integer DEFAULT 0,
  answers_jsonb jsonb, -- PRIVATE Candidate Data
  strengths text[],
  weaknesses text[],
  recommendation text DEFAULT 'RECOMMENDED',
  transcript_jsonb jsonb, -- PRIVATE Candidate Data
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_student ON public.interview_sessions(student_profile_id, status);

-- 4. Human Verification Interview Requests
CREATE TABLE IF NOT EXISTS public.human_interview_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  interviewer_name text,
  scheduled_at text NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED')),
  notes text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- CANDIDATE PRIVACY: Security Definer Views for Recruiter Candidate Summaries
-- Explicitly Redacts raw assessment answers, raw transcripts, and internal prompts
-- ============================================================================

CREATE OR REPLACE VIEW public.recruiter_candidate_assessment_summaries
WITH (security_invoker = true)
AS
SELECT
  a.id,
  a.student_profile_id,
  a.assessment_template_id,
  a.domain,
  a.role,
  a.score,
  a.max_score,
  a.correct_answers,
  a.total_questions,
  a.status,
  a.created_at
FROM public.assessment_attempts a
JOIN public.student_profiles sp ON sp.id = a.student_profile_id
JOIN public.profiles p ON p.id = sp.user_id
WHERE sp.privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS')
  AND sp.onboarding_complete = true
  AND p.is_demo = false;

CREATE OR REPLACE VIEW public.recruiter_candidate_interview_summaries
WITH (security_invoker = true)
AS
SELECT
  i.id,
  i.student_profile_id,
  i.type,
  i.role,
  i.domain,
  i.status,
  i.overall_score,
  i.comm_score,
  i.tech_depth_score,
  i.confidence_score,
  i.accuracy_score,
  i.behavioral_score,
  i.strengths,
  i.weaknesses,
  i.recommendation,
  i.created_at
FROM public.interview_sessions i
JOIN public.student_profiles sp ON sp.id = i.student_profile_id
JOIN public.profiles p ON p.id = sp.user_id
WHERE sp.privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS')
  AND sp.onboarding_complete = true
  AND p.is_demo = false;
