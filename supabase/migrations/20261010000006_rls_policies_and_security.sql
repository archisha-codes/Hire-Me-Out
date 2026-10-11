-- ============================================================================
-- Migration 06: Comprehensive Row Level Security (RLS) Policies & Grants
-- ============================================================================

-- Enable RLS on ALL public schema tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_interview_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Profiles Read" ON public.profiles;
CREATE POLICY "Public Profiles Read"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Profiles Owner Update" ON public.profiles;
CREATE POLICY "Profiles Owner Update"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Roles Self Select" ON public.user_roles;
CREATE POLICY "Roles Self Select"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Roles Admin All" ON public.user_roles;
CREATE POLICY "Roles Admin All"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. STUDENT PROFILES & NESTED
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Student Profile Self All" ON public.student_profiles;
CREATE POLICY "Student Profile Self All"
ON public.student_profiles FOR ALL TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Student Profile Recruiter Verified Select" ON public.student_profiles;
CREATE POLICY "Student Profile Recruiter Verified Select"
ON public.student_profiles FOR SELECT TO authenticated
USING (
  (
    privacy_level = 'PUBLIC'
    OR (
      privacy_level = 'VERIFIED_EMPLOYERS'
      AND EXISTS (
        SELECT 1 FROM public.company_members cm
        JOIN public.company_profiles cp ON cp.id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cp.is_verified = true AND cm.status = 'ACTIVE'
      )
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = student_profiles.user_id AND p.is_demo = false
  )
);

DROP POLICY IF EXISTS "Student Profile Admin All" ON public.student_profiles;
CREATE POLICY "Student Profile Admin All"
ON public.student_profiles FOR ALL TO authenticated
USING (public.is_admin());

-- Child candidate tables RLS helper macro/policies
DROP POLICY IF EXISTS "Student Skills Self All" ON public.student_skills;
CREATE POLICY "Student Skills Self All"
ON public.student_skills FOR ALL TO authenticated
USING (
  student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Student Skills Recruiter Select" ON public.student_skills;
CREATE POLICY "Student Skills Recruiter Select"
ON public.student_skills FOR SELECT TO authenticated
USING (
  student_profile_id IN (
    SELECT id FROM public.student_profiles 
    WHERE privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS')
  )
);

DROP POLICY IF EXISTS "Student Projects Self All" ON public.student_projects;
CREATE POLICY "Student Projects Self All"
ON public.student_projects FOR ALL TO authenticated
USING (
  student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Student Projects Recruiter Select" ON public.student_projects;
CREATE POLICY "Student Projects Recruiter Select"
ON public.student_projects FOR SELECT TO authenticated
USING (
  student_profile_id IN (
    SELECT id FROM public.student_profiles 
    WHERE privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS')
  )
);

-- ----------------------------------------------------------------------------
-- 3. COMPANY & RECRUITER MEMBERSHIP
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Company Profiles Public Select" ON public.company_profiles;
CREATE POLICY "Company Profiles Public Select"
ON public.company_profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Company Profiles Active Members All" ON public.company_profiles;
CREATE POLICY "Company Profiles Active Members All"
ON public.company_profiles FOR ALL TO authenticated
USING (public.is_company_member(id) OR public.is_admin());

DROP POLICY IF EXISTS "Company Members Active Members Select" ON public.company_members;
CREATE POLICY "Company Members Active Members Select"
ON public.company_members FOR SELECT TO authenticated
USING (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company Members Owner All" ON public.company_members;
CREATE POLICY "Company Members Owner All"
ON public.company_members FOR ALL TO authenticated
USING (public.is_company_owner(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company Verifications Member Select" ON public.company_verifications;
CREATE POLICY "Company Verifications Member Select"
ON public.company_verifications FOR SELECT TO authenticated
USING (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company Verifications Admin All" ON public.company_verifications;
CREATE POLICY "Company Verifications Admin All"
ON public.company_verifications FOR ALL TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. EMPLOYEE PROFILES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Employee Profile Self All" ON public.employee_profiles;
CREATE POLICY "Employee Profile Self All"
ON public.employee_profiles FOR ALL TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Employee Profile Company Member Select" ON public.employee_profiles;
CREATE POLICY "Employee Profile Company Member Select"
ON public.employee_profiles FOR SELECT TO authenticated
USING (public.is_company_member(company_id) OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. JOBS & SHORTLISTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Jobs Public Active Select" ON public.jobs;
CREATE POLICY "Jobs Public Active Select"
ON public.jobs FOR SELECT TO authenticated
USING (is_active = true OR public.is_company_member(company_id));

DROP POLICY IF EXISTS "Jobs Verified Recruiter All" ON public.jobs;
CREATE POLICY "Jobs Verified Recruiter All"
ON public.jobs FOR ALL TO authenticated
USING (public.is_company_member(company_id) AND public.is_company_verified(company_id));

DROP POLICY IF EXISTS "Shortlists Member All" ON public.shortlists;
CREATE POLICY "Shortlists Member All"
ON public.shortlists FOR ALL TO authenticated
USING (public.is_company_member(company_id));

-- ----------------------------------------------------------------------------
-- 6. REFERRAL REQUESTS & REWARD LEDGER
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Referrals Candidate Candidate Select Update" ON public.referral_requests;
CREATE POLICY "Referrals Candidate Candidate Select Update"
ON public.referral_requests FOR SELECT TO authenticated
USING (
  student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  OR public.is_company_member(company_id)
  OR employee_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid())
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Referrals Candidate Insert" ON public.referral_requests;
CREATE POLICY "Referrals Candidate Insert"
ON public.referral_requests FOR INSERT TO authenticated
WITH CHECK (
  student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  OR public.is_company_member(company_id)
);

DROP POLICY IF EXISTS "Referrals Recruiter Update" ON public.referral_requests;
CREATE POLICY "Referrals Recruiter Update"
ON public.referral_requests FOR UPDATE TO authenticated
USING (
  public.is_company_member(company_id)
  OR employee_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid())
  OR student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Referral History Participant Select" ON public.referral_status_history;
CREATE POLICY "Referral History Participant Select"
ON public.referral_status_history FOR SELECT TO authenticated
USING (
  referral_request_id IN (
    SELECT id FROM public.referral_requests
    WHERE student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
       OR public.is_company_member(company_id)
       OR employee_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid())
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Reward Ledger Employee Select" ON public.referral_reward_ledger;
CREATE POLICY "Reward Ledger Employee Select"
ON public.referral_reward_ledger FOR SELECT TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 7. ASSESSMENTS & INTERVIEWS (Recruiter Raw Data Access Denied)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Assessment Attempts Candidate Owner All" ON public.assessment_attempts;
CREATE POLICY "Assessment Attempts Candidate Owner All"
ON public.assessment_attempts FOR ALL TO authenticated
USING (
  student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Interview Sessions Candidate Owner All" ON public.interview_sessions;
CREATE POLICY "Interview Sessions Candidate Owner All"
ON public.interview_sessions FOR ALL TO authenticated
USING (
  student_profile_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- Note: Recruiters DO NOT have direct SELECT on raw assessment_attempts or interview_sessions.
-- Recruiters MUST query recruiter_candidate_assessment_summaries & recruiter_candidate_interview_summaries.

-- ----------------------------------------------------------------------------
-- 8. DEFERRED PAYMENTS (Transactions Client Write DENIED)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Transactions User Self Select" ON public.transactions;
CREATE POLICY "Transactions User Self Select"
ON public.transactions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Explicitly NO INSERT or UPDATE policy for authenticated users on transactions.
-- Writes MUST be performed via service_role / webhook processor only.

DROP POLICY IF EXISTS "Commission Rules Public Select" ON public.commission_rules;
CREATE POLICY "Commission Rules Public Select"
ON public.commission_rules FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Commission Rules Admin All" ON public.commission_rules;
CREATE POLICY "Commission Rules Admin All"
ON public.commission_rules FOR ALL TO authenticated
USING (public.is_admin());
