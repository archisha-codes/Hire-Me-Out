-- ============================================================================
-- Migration 03: Jobs, Referral Pipeline & Idempotent Financial Reward Ledger
-- ============================================================================

-- 1. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title text NOT NULL,
  domain text NOT NULL,
  role text NOT NULL,
  experience_level text NOT NULL,
  location text NOT NULL,
  type text DEFAULT 'FULL_TIME' CHECK (type IN ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT')),
  description text NOT NULL,
  required_skills text[] NOT NULL,
  preferred_skills text[],
  salary_range text NOT NULL,
  referral_bonus numeric(10, 2) DEFAULT 5000.00 CHECK (referral_bonus >= 0.00),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_active ON public.jobs(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_domain_role ON public.jobs(domain, role);

-- 2. Recruiter Shortlists
CREATE TABLE IF NOT EXISTS public.shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_company_candidate_shortlist UNIQUE (company_id, student_profile_id)
);

-- 3. Referral Requests (Core Pipeline)
CREATE TABLE IF NOT EXISTS public.referral_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'SHORTLISTED' CHECK (
    status IN (
      'SHORTLISTED',
      'INTERVIEW_REQUESTED',
      'REFERRAL_REQUESTED',
      'REFERRAL_SUBMITTED',
      'SCREENING',
      'INTERVIEWING',
      'OFFER_EXTENDED',
      'HIRED',
      'REJECTED',
      'WITHDRAWN'
    )
  ),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Prevent duplicate active referral requests for same candidate & job
  CONSTRAINT uq_student_job_referral UNIQUE (student_profile_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_requests_candidate ON public.referral_requests(student_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_referral_requests_company ON public.referral_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_referral_requests_employee ON public.referral_requests(employee_id, status);

-- 4. Referral Status Audit History
CREATE TABLE IF NOT EXISTS public.referral_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_request_id uuid NOT NULL REFERENCES public.referral_requests(id) ON DELETE CASCADE,
  status text NOT NULL,
  previous_status text,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  actor_role text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referral_history_request ON public.referral_status_history(referral_request_id, created_at DESC);

-- 5. Durable Idempotency Reward Ledger (Guarantees Single Payout Per Hire)
CREATE TABLE IF NOT EXISTS public.referral_reward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_request_id uuid NOT NULL REFERENCES public.referral_requests(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employee_profiles(id) ON DELETE RESTRICT,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
  bonus_amount numeric(10, 2) NOT NULL CHECK (bonus_amount >= 0),
  paid_at timestamptz NOT NULL DEFAULT now(),
  -- Unique constraint guarantees max 1 financial reward entry per referral_request_id
  CONSTRAINT uq_referral_reward_payout UNIQUE (referral_request_id)
);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_employee ON public.referral_reward_ledger(employee_id);

-- 6. Referral Pipeline State Machine & Idempotent Trigger Function
CREATE OR REPLACE FUNCTION public.enforce_referral_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_uid uuid;
  actor_profile_id uuid;
  bonus_to_pay numeric(10, 2);
  ledger_exists boolean;
BEGIN
  caller_uid := auth.uid();
  
  IF caller_uid IS NULL THEN
    caller_role := 'SYSTEM';
    SELECT user_id INTO actor_profile_id FROM public.student_profiles WHERE id = NEW.student_profile_id;
  ELSE
    caller_role := public.get_user_role(caller_uid);
    actor_profile_id := caller_uid;
  END IF;

  -- 1. Candidate Privilege Guard: Students cannot advance pipeline to HIRED, SCREENING, etc.
  IF caller_role = 'STUDENT' THEN
    IF NEW.status NOT IN ('WITHDRAWN', 'REFERRAL_REQUESTED') THEN
      RAISE EXCEPTION 'Unauthorized status transition: Students can only request referrals or withdraw applications.';
    END IF;
  END IF;

  -- 2. Non-Employee Referral Submission Guard
  IF NEW.status = 'REFERRAL_SUBMITTED' AND caller_role NOT IN ('EMPLOYEE', 'ADMIN', 'SYSTEM') THEN
    RAISE EXCEPTION 'Unauthorized status transition: Only verified employees can submit internal referrals.';
  END IF;

  -- 3. Idempotent Financial Reward Accounting on HIRED State
  IF NEW.status = 'HIRED' THEN
    IF NEW.employee_id IS NOT NULL THEN
      -- Check if reward was already paid for this referral request
      SELECT EXISTS (
        SELECT 1 FROM public.referral_reward_ledger WHERE referral_request_id = NEW.id
      ) INTO ledger_exists;

      IF NOT ledger_exists THEN
        -- Fetch job referral bonus
        SELECT COALESCE(referral_bonus, 5000.00) INTO bonus_to_pay 
        FROM public.jobs WHERE id = NEW.job_id;

        -- Record in durable reward ledger (will fail if duplicate due to UNIQUE constraint)
        INSERT INTO public.referral_reward_ledger (
          referral_request_id,
          employee_id,
          job_id,
          bonus_amount
        ) VALUES (
          NEW.id,
          NEW.employee_id,
          NEW.job_id,
          bonus_to_pay
        );

        -- Atomically credit employee metrics
        UPDATE public.employee_profiles
        SET 
          successful_referrals = successful_referrals + 1,
          earnings = earnings + bonus_to_pay,
          updated_at = now()
        WHERE id = NEW.employee_id;
      END IF;
    END IF;
  END IF;

  -- 4. Audit History Record
  INSERT INTO public.referral_status_history (
    referral_request_id,
    status,
    previous_status,
    actor_id,
    actor_role,
    notes
  ) VALUES (
    NEW.id,
    NEW.status,
    OLD.status,
    actor_profile_id,
    caller_role,
    NEW.notes
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_status_guard ON public.referral_requests;
CREATE TRIGGER trg_referral_status_guard
BEFORE UPDATE ON public.referral_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.enforce_referral_status_transition();
