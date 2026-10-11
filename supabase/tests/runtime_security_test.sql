-- ============================================================================
-- Step 6B Runtime Security & Trigger Integration Test Suite (PostgreSQL 16)
-- ============================================================================

BEGIN;

-- 1. TEST IDENTITY & ROLE PROVISIONING SECURITY
-- Simulate new signup requesting ADMIN role in metadata
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000001', 'attacker@test.com', '{"role": "ADMIN", "name": "Attacker"}'::jsonb);

-- Verify that the trigger assigned STUDENT role instead of ADMIN
DO $$
DECLARE
  assigned_role text;
BEGIN
  SELECT role::text INTO assigned_role FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000001';
  IF assigned_role != 'STUDENT' THEN
    RAISE EXCEPTION 'TEST FAILED: Role injection vulnerability! Assigned role was % instead of STUDENT', assigned_role;
  ELSE
    RAISE NOTICE 'TEST PASSED: Role injection blocked. Default assigned role is STUDENT.';
  END IF;
END $$;

-- 2. TEST SETUP: Seed test candidate, company, employee, job, and referral
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'student@test.com', '{"role": "STUDENT", "name": "Test Student"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'recruiter@test.com', '{"role": "COMPANY", "name": "Test Recruiter"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'employee@test.com', '{"role": "EMPLOYEE", "name": "Test Employee"}'::jsonb);

-- Create company profile & recruiter membership
INSERT INTO public.company_profiles (id, created_by, company_name, is_verified)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'Acme Corp', true);

INSERT INTO public.company_members (company_id, user_id, role, status)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'OWNER', 'ACTIVE');

-- Create employee profile
INSERT INTO public.employee_profiles (id, user_id, company_id, company_name, designation, work_email, is_verified)
VALUES ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Acme Corp', 'Lead Engineer', 'employee@acme.com', true);

-- Fetch student profile ID & test status transitions
DO $$
DECLARE
  student_prof_id uuid;
  job_uuid uuid;
  ref_req_uuid uuid;
  emp_earnings numeric;
  ledger_count integer;
BEGIN
  SELECT id INTO student_prof_id FROM public.student_profiles WHERE user_id = '00000000-0000-0000-0000-000000000002';
  
  -- Create Job
  INSERT INTO public.jobs (id, company_id, created_by, title, domain, role, experience_level, location, description, required_skills, salary_range, referral_bonus)
  VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'Backend Engineer', 'Software Development', 'Backend Developer', 'Fresher', 'Remote', 'Node.js & SQL', ARRAY['Node.js', 'SQL'], '12-15 LPA', 5000.00)
  RETURNING id INTO job_uuid;

  -- Create Referral Request
  INSERT INTO public.referral_requests (id, student_profile_id, job_id, company_id, employee_id, status)
  VALUES ('44444444-4444-4444-4444-444444444444', student_prof_id, job_uuid, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'SHORTLISTED')
  RETURNING id INTO ref_req_uuid;

  -- 3. TEST REFERRAL REWARD IDEMPOTENCY
  -- Simulate transition to HIRED
  UPDATE public.referral_requests SET status = 'HIRED' WHERE id = ref_req_uuid;
  
  -- Re-trigger transition HIRED -> SCREENING -> HIRED
  UPDATE public.referral_requests SET status = 'SCREENING' WHERE id = ref_req_uuid;
  UPDATE public.referral_requests SET status = 'HIRED' WHERE id = ref_req_uuid;

  -- Verify ledger entries count and employee earnings
  SELECT COUNT(*) INTO ledger_count FROM public.referral_reward_ledger WHERE referral_request_id = ref_req_uuid;
  SELECT earnings INTO emp_earnings FROM public.employee_profiles WHERE id = '22222222-2222-2222-2222-222222222222';

  IF ledger_count != 1 OR emp_earnings != 5000.00 THEN
    RAISE EXCEPTION 'TEST FAILED: Payout idempotency bug! Ledger count: %, Earnings: %', ledger_count, emp_earnings;
  ELSE
    RAISE NOTICE 'TEST PASSED: Reward payout idempotency verified. Ledger entries: %, Employee earnings: %', ledger_count, emp_earnings;
  END IF;

  -- 4. TEST DUPLICATE REFERRAL REQUEST REJECTION
  BEGIN
    INSERT INTO public.referral_requests (student_profile_id, job_id, company_id, status)
    VALUES (student_prof_id, job_uuid, '11111111-1111-1111-1111-111111111111', 'SHORTLISTED');
    RAISE EXCEPTION 'TEST FAILED: Duplicate referral request was allowed!';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'TEST PASSED: Duplicate referral request rejected by uq_student_job_referral constraint.';
  END;

END $$;

-- 5. TEST CANDIDATE PRIVACY VIEW
DO $$
DECLARE
  student_prof_id uuid;
  view_cols text;
BEGIN
  SELECT id INTO student_prof_id FROM public.student_profiles WHERE user_id = '00000000-0000-0000-0000-000000000002';
  
  INSERT INTO public.assessment_attempts (student_profile_id, domain, role, score, answers_jsonb, feedback_jsonb)
  VALUES (student_prof_id, 'Software Development', 'Full Stack', 90, '{"q1": "A", "secret": "answer"}'::jsonb, '{"eval": "top candidate"}'::jsonb);

  -- Verify view columns do NOT include answers_jsonb or feedback_jsonb
  SELECT string_agg(column_name, ', ') INTO view_cols 
  FROM information_schema.columns 
  WHERE table_name = 'recruiter_candidate_assessment_summaries';

  IF view_cols LIKE '%answers_jsonb%' OR view_cols LIKE '%feedback_jsonb%' THEN
    RAISE EXCEPTION 'TEST FAILED: Recruiter assessment summary view leaks raw answers or feedback!';
  ELSE
    RAISE NOTICE 'TEST PASSED: Recruiter summary view redacts raw answers and feedback JSON.';
  END IF;
END $$;

ROLLBACK;
