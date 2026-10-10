# Step 5B Audit Report: Production Readiness Review & Migration Risk Audit

> **READ-ONLY AUDIT & VALIDATION CONFIRMATION**
> This document represents a strict, independent **Production Readiness Review and Migration Risk Audit** for Hire Me Out.
> - **No Supabase tables were created or modified.**
> - **No remote SQL commands or migrations were executed.**
> - **Prisma schema (`prisma/schema.prisma`) and SQLite database (`prisma/dev.db`) remain untouched.**
> - **No backend or frontend application code was modified.**
> - **No environment files were altered.**
> - **No Git commit or push was performed.**
> - **No passwords, tokens, or secret keys were requested or exposed.**

---

## 1. Executive Verdict

**EXECUTIVE VERDICT: NOT READY FOR IMMEDIATE IMPLEMENTATION**

While the proposed PostgreSQL schema in `HIRE_ME_OUT_SUPABASE_DATABASE_DESIGN.md` provides a commendable structural blueprint over the legacy SQLite model, a rigorous, line-by-line review against the codebase (`server/routes/`, `server/middleware/`, `src/context/`, `prisma/seed.ts`) reveals **critical financial vulnerabilities, broken state machine triggers, security definer scope flaws, invalid storage RLS array indexing, missing payment verification workflows, and unhandled authentication migration gaps**.

Executing `supabase db push` or running the proposed DDL as written will introduce severe financial exploitation vectors, allow unauthorized privilege escalation, leak confidential candidate/company assets, and break core frontend workflows. Mandatory corrections detailed in this report MUST be resolved prior to Step 6 database provisioning.

---

## 2. Summary of Findings by Severity

| Severity Level | Finding ID | Summary | Primary Affected File / Entity |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `CRIT-01` | Non-Idempotent Referral Payout Trigger Allows Infinite Reward Duplication | Trigger `enforce_referral_status_transition` / `referral_requests` |
| **CRITICAL** | `CRIT-02` | Client-Authoritative Payment & Entitlement Bypass | `server/routes/payments.ts` / `transactions` table |
| **CRITICAL** | `CRIT-03` | Flawed Storage RLS Policy Indexing & Path Impersonation | `storage.objects` / `resumes` bucket policy |
| **CRITICAL** | `CRIT-04` | Unconstrained Duplicate Referral Requests Allow Multi-Reward Payouts | `referral_requests` table schema |
| **HIGH** | `HIGH-01` | `user_roles` Bootstrap Gap & Null Role Trigger Crash | `get_user_role()` / `profiles` insert trigger |
| **HIGH** | `HIGH-02` | Candidate Discovery Privacy & Unverified Recruiter Access Leak | `student_profiles` RLS policy / `server/routes/discovery.ts` |
| **HIGH** | `HIGH-03` | Raw Assessment & Interview Answer Exposure to Recruiters | `assessment_attempts` / `interview_sessions` RLS |
| **HIGH** | `HIGH-04` | Express JWT `localStorage` & Supabase Auth Compatibility Fracture | `src/context/AuthContext.tsx` / `server/middleware/auth.ts` |
| **HIGH** | `HIGH-05` | Unverified Employee Registration & Company Matching Vulnerability | `server/routes/auth.ts` / `employee_profiles` |
| **MEDIUM** | `MED-01` | Broken `auth.uid()` Null Guard in Trigger Execution | `enforce_referral_status_transition()` |
| **MEDIUM** | `MED-02` | Unverified Company Job Posting & Referral Creation | `jobs` table RLS policy |
| **MEDIUM** | `MED-03` | Hardcoded Fallback Seed Scores & Fake Timeline Leak | `server/routes/auth.ts` / `server/routes/students.ts` |
| **MEDIUM** | `MED-04` | Missing Foreign Key Cascades & Deletion Deadlocks | `company_profiles` / `company_members` |
| **LOW** | `LOW-01` | Unused Legacy Models & Redundant Columns | `assessment_templates` / `questions` |
| **LOW** | `LOW-02` | Non-Standard Data Type Conversions (`numeric` vs `integer`) | `jobs.referral_bonus` |

---

## 3. Detailed Audit Findings & Attack Scenarios

### 3.1 Critical Blockers (`CRITICAL`)

#### `CRIT-01`: Non-Idempotent Referral Payout Trigger Allows Infinite Reward Duplication
- **Affected Target**: `enforce_referral_status_transition()` trigger function & `referral_requests` table.
- **Description**: Section 4.3 of the design doc defines a `BEFORE UPDATE` trigger that executes:
  ```sql
  IF OLD.status != 'HIRED' AND NEW.status = 'HIRED' THEN
    IF NEW.employee_id IS NOT NULL THEN
      UPDATE public.employee_profiles
      SET 
        successful_referrals = successful_referrals + 1,
        earnings = earnings + (SELECT COALESCE(j.referral_bonus, 5000.00) FROM public.jobs j WHERE j.id = NEW.job_id)
      WHERE id = NEW.employee_id;
    END IF;
  END IF;
  ```
- **Concrete Attack Scenario**:
  1. A recruiter marks candidate status as `HIRED`. The employee receives ₹5,000 reward.
  2. The recruiter (or candidate via current API bug) toggles status to `OFFER_EXTENDED` and back to `HIRED`.
  3. The trigger checks `OLD.status ('OFFER_EXTENDED') != 'HIRED' AND NEW.status ('HIRED') = 'HIRED'`.
  4. The employee receives another ₹5,000 credit. Repeating this 10 times inflates employee earnings by ₹50,000 without any new hire taking place.
- **Required Fix**: Add a boolean column `reward_paid boolean NOT NULL DEFAULT false` on `referral_requests`. Execute reward payout ONLY if `NEW.status = 'HIRED' AND NEW.reward_paid = false`, and set `NEW.reward_paid = true` within the trigger execution.

#### `CRIT-02`: Client-Authoritative Payment & Entitlement Bypass
- **Affected Target**: `server/routes/payments.ts` & `public.transactions` design.
- **Description**: The current route `/api/payments/create` reads `type` and `amount` directly from `req.body`, creates a `COMPLETED` transaction record, and sets `studentProfile.humanVerified = true`.
- **Concrete Attack Scenario**:
  1. An unverified student sends `POST /api/payments/create` with body `{ "type": "VERIFICATION_PREMIUM", "amount": 0 }`.
  2. The server creates a zero-rupee transaction and immediately updates `humanVerified = true`.
  3. The student obtains Verified Talent status and premium discovery placement without paying any platform fee.
- **Required Fix**: Eliminate client-submitted amounts and instant client-driven verification. Implement a 2-step Razorpay workflow (Server Order Creation -> Client Checkout -> HMAC Webhook Verification).

#### `CRIT-03`: Flawed Storage RLS Policy Indexing & Path Impersonation
- **Affected Target**: Storage Bucket `resumes` policy in Section 6.2.
- **Description**: The proposed policy SQL uses:
  ```sql
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.student_profiles WHERE user_id = auth.uid()
  )
  ```
- **Concrete Attack Scenario**:
  1. `storage.foldername(name)` in Supabase Storage returns a text array of directory levels. In Supabase Storage, the first element `[1]` of object name `resumes/STUDENT_ID/resume.pdf` is `resumes`, NOT `STUDENT_ID`.
  2. The policy evaluates `resumes IN (SELECT id::text...)`, which evaluates to `false` for ALL valid candidate uploads, completely breaking resume access for legitimate users.
  3. If path structure is `STUDENT_ID/resume.pdf`, `(storage.foldername(name))[1]` equals `STUDENT_ID`. However, if candidate path contains sub-folders (`STUDENT_ID/v1/resume.pdf`), indexing breaks. Furthermore, policy fails to check if recruiters requesting signed URLs have valid `company_members` status.
- **Required Fix**: Standardize bucket paths to `{student_profile_id}/{filename}` and use explicit path checking: `(storage.foldername(name))[1] = (SELECT id::text FROM public.student_profiles WHERE user_id = auth.uid())`. Require backend-generated short-lived Signed URLs for recruiter/employee access.

#### `CRIT-04`: Unconstrained Duplicate Referral Requests Allow Multi-Reward Payouts
- **Affected Target**: `public.referral_requests` table schema.
- **Description**: The DDL for `referral_requests` lacks a composite unique constraint on candidate and job (`student_profile_id, job_id`).
- **Concrete Attack Scenario**:
  1. A candidate or recruiter issues 3 separate referral requests for the exact same candidate and job posting.
  2. When candidate is hired, all 3 requests move to `HIRED`, triggering 3 separate reward payouts to the employee profile for a single hire.
- **Required Fix**: Add a composite unique constraint: `CONSTRAINT uq_student_job_referral UNIQUE (student_profile_id, job_id)`.

---

### 3.2 High-Priority Blockers (`HIGH`)

#### `HIGH-01`: `user_roles` Bootstrap Gap & Null Role Trigger Crash
- **Affected Target**: `public.get_user_role()`, `profiles` table, and `user_roles` table.
- **Description**: In Section 2.1, an `AFTER INSERT` trigger on `auth.users` creates a row in `public.profiles`. However, NO trigger is defined to populate `public.user_roles`. When a user registers, `user_roles` has 0 rows for that `user_id`.
- **Impact**: `get_user_role(auth.uid())` executes `SELECT role FROM public.user_roles...` and returns `NULL`. Subsequent calls to `is_admin()`, `is_company_member()`, or `enforce_referral_status_transition()` fail with null-pointer exceptions or default to access denied.
- **Required Fix**: Update the `AFTER INSERT` trigger on `auth.users` to read `raw_user_meta_data->>'role'` and insert initial records into BOTH `public.profiles` AND `public.user_roles` within an atomic transaction.

#### `HIGH-02`: Candidate Discovery Privacy & Unverified Recruiter Access Leak
- **Affected Target**: `public.student_profiles` RLS policy & `server/routes/discovery.ts`.
- **Description**: The proposed RLS matrix permits `COMPANY` role to `SELECT` candidate profiles where `privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS')`.
- **Concrete Attack Scenario**:
  1. A malicious user registers a company account with an unverified domain (`fake@gmail.com`).
  2. The company status is set to `is_verified = false` (or `company_verifications.status = 'PENDING'`).
  3. Under the proposed RLS policy, because the user possesses the `COMPANY` role, they can query and scrape candidate profiles marked `VERIFIED_EMPLOYERS` before an admin approves the company verification.
- **Required Fix**: Update `student_profiles` RLS policy to enforce company verification:
  ```sql
  USING (
    privacy_level = 'PUBLIC' 
    OR (
      privacy_level = 'VERIFIED_EMPLOYERS' 
      AND public.is_company_verified(auth.uid())
    )
  )
  ```

#### `HIGH-03`: Raw Assessment & Interview Answer Exposure to Recruiters
- **Affected Target**: `public.assessment_attempts` & `public.interview_sessions` RLS policies.
- **Description**: RLS policies in PostgreSQL operate on ROW level, not column level. The matrix grants `COMPANY` role `SELECT` permission on completed attempts and sessions.
- **Impact**: Recruiters querying `assessment_attempts` or `interview_sessions` can view raw student answers (`answers_jsonb`), dynamic AI prompts, and raw transcripts (`transcript_jsonb`), exposing candidate intellectual property and private conversational metadata.
- **Required Fix**: Restrict direct table `SELECT` on `assessment_attempts` and `interview_sessions` strictly to candidate owners (`student_profile_id = auth.uid()`) and admins. Create a PostgreSQL `SECURITY DEFINER` View `recruiter_candidate_assessments` that exposes ONLY summary metrics (`score`, `max_score`, `talent_tier`, `recommendation`).

#### `HIGH-04`: Express JWT `localStorage` & Supabase Auth Compatibility Fracture
- **Affected Target**: `src/context/AuthContext.tsx`, `server/middleware/auth.ts`, `server/routes/auth.ts`.
- **Description**: The current application relies on custom JWT tokens issued by Express (`jsonwebtoken`) signed with a static fallback secret (`super-secret-hiremeout-key-2026`) and saved as `hiremeout_token` in `localStorage`.
- **Impact**: Supabase Auth issues JWTs signed by Supabase's asymmetric JWT secret and stores sessions under Supabase SDK internal storage (`sb-<project-ref>-auth-token`). Standard Express middleware `jwt.verify(token, JWT_SECRET)` will fail for all Supabase Auth tokens unless configured with Supabase's JWKS public key or `@supabase/supabase-js` verification.
- **Required Fix**: Update `server/middleware/auth.ts` to validate Bearer tokens using `supabase.auth.getUser(token)` and refactor `AuthContext.tsx` to use `supabase.auth.onAuthStateChange()`.

#### `HIGH-05`: Unverified Employee Registration & Company Matching Vulnerability
- **Affected Target**: `server/routes/auth.ts` & `public.employee_profiles`.
- **Description**: `server/routes/auth.ts` creates `employeeProfile` with `isVerified: true` by default and matches company by plain string `companyName` (`'TechNova Solutions'`).
- **Concrete Attack Scenario**:
  1. A user signs up as `EMPLOYEE` entering `companyName: 'TechNova Solutions'` and `workEmail: 'attacker@gmail.com'`.
  2. Current code and preliminary DDL link employee to `company_profiles` via name matching without domain verification.
  3. The fake employee receives internal candidate referral requests intended for TechNova Solutions and intercepts candidate data.
- **Required Fix**: Require work email domain validation (`work_email LIKE '%@technova.com'`) matching `company_verifications.work_email_domain` before setting `employee_profiles.is_verified = true`.

---

### 3.3 Referral State Machine & Workflow Audit (`server/routes/referrals.ts` vs Design)

#### State Transition Matrix Validation

| Transition | Allowed Actor Roles | Required Scoping & Constraints | Evidence / Approval Required | Status in Code (`referrals.ts`) | Status in Proposed Design | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SHORTLISTED` $\to$ `INTERVIEW_REQUESTED` | `COMPANY`, `ADMIN` | Must belong to job's company (`is_company_member`) | Active job posting required | Allowed via `POST /interview-request` | Allowed via DDL matrix | **Valid** |
| `INTERVIEW_REQUESTED` $\to$ `REFERRAL_REQUESTED` | `STUDENT` | Must own `student_profile_id` (`auth.uid()`) | None | Implicit | Allowed via DDL matrix | **Gap**: Missing owner check |
| `REFERRAL_REQUESTED` $\to$ `REFERRAL_SUBMITTED` | `EMPLOYEE`, `ADMIN` | Employee company MUST match job company | Verification of candidate scores | Allowed via `POST /:id/accept` | Allowed via trigger guard | **Gap**: Company match unverified |
| `REFERRAL_SUBMITTED` $\to$ `SCREENING` | `COMPANY`, `ADMIN` | Must belong to candidate's target company | Company HR screening | Allowed via `PUT /:id/status` | Allowed via trigger guard | **CRITICAL**: `STUDENT` can execute |
| `SCREENING` $\to$ `INTERVIEWING` | `COMPANY`, `ADMIN` | Must belong to candidate's target company | Technical round scheduled | Allowed via `PUT /:id/status` | Allowed via trigger guard | **CRITICAL**: `STUDENT` can execute |
| `INTERVIEWING` $\to$ `OFFER_EXTENDED` | `COMPANY`, `ADMIN` | Must belong to candidate's target company | Offer letter generated | Allowed via `PUT /:id/status` | Allowed via trigger guard | **CRITICAL**: `STUDENT` can execute |
| `OFFER_EXTENDED` $\to$ `HIRED` | `COMPANY`, `ADMIN` | Must belong to candidate's target company | Signed offer acceptance | Allowed via `PUT /:id/status` | Allowed via trigger guard | **CRITICAL**: Infinite payout bug |
| *Any State* $\to$ `REJECTED` | `COMPANY`, `ADMIN` | Must belong to candidate's target company | Rejection note | Allowed via `PUT /:id/status` | Allowed via trigger guard | **Valid** |
| *Any State* $\to$ `WITHDRAWN` | `STUDENT` | Must own `student_profile_id` | Withdrawal note | Allowed via `PUT /:id/status` | Allowed via matrix | **Valid** |

---

### 3.4 Payments Architecture Audit (`server/routes/payments.ts` vs Design)

#### Proposed Production Payment Sequence

```
+-------------------+             +-----------------------+             +-----------------------+             +-----------------------+
|  CLIENT FRONTEND  |             |  EXPRESS BACKEND API  |             |   RAZORPAY GATEWAY    |             |  SUPABASE POSTGRESQL  |
+-------------------+             +-----------------------+             +-----------------------+             +-----------------------+
          |                                   |                                     |                                     |
          | 1. POST /payments/create-order    |                                     |                                     |
          |---------------------------------->| 2. Fetch price from commission_rules |                                     |
          |                                   |    amount = 499.00 INR              |                                     |
          |                                   | 3. Call Razorpay orders.create()    |                                     |
          |                                   |------------------------------------>|                                     |
          |                                   |<------------------------------------|                                     |
          |                                   | 4. Insert transactions              |                                     |
          |                                   |    status='PENDING', rzp_order_id    |                                     |
          |                                   |-------------------------------------------------------------------------->|
          | 5. Return order_id & amount       |                                     |                                     |
          |<----------------------------------|                                     |                                     |
          |                                                                         |                                     |
          | 6. Launch Razorpay Checkout Modal                                       |                                     |
          |------------------------------------------------------------------------>|                                     |
          |<------------------------------------------------------------------------|                                     |
          | 7. Return payment_id & signature                                        |                                     |
          |                                                                         |                                     |
          | 8. (Async) Razorpay Webhook Event: payment.captured                     |                                     |
          |------------------------------------------------------------------------>|                                     |
          |                                   | 9. Validate X-Razorpay-Signature    |                                     |
          |                                   | 10. Check payment_id idempotency    |                                     |
          |                                   | 11. Update transactions -> COMPLETED |                                     |
          |                                   |-------------------------------------------------------------------------->|
          |                                   | 12. Update student -> humanVerified = true                                |
          |                                   |-------------------------------------------------------------------------->|
```

---

### 3.5 Student, Company, and Employee Onboarding Trace

#### 1. Student Onboarding Flow Audit
- **Sequence**: Registration $\to$ Email Verification $\to$ Profile Creation $\to$ Onboarding Wizard $\to$ Resume Upload $\to$ Assessments $\to$ Interview $\to$ Discovery $\to$ Referral.
- **Identified Gaps**:
  1. `server/routes/auth.ts` creates default student profile with fake initial sub-scores (`techScore: 82`, `problemSolvingScore: 79`, `talentScore: 78`) prior to candidate taking any assessment!
  2. `server/routes/students.ts` `/resume` endpoint hardcodes resume URL `https://cdn.hiremeout.io/resumes/demo_resume.pdf` and returns mock parsed skills.
  3. `server/routes/students.ts` `/progress` endpoint returns hardcoded static dates (`March 2, 2026`, `March 7, 2026`).
  4. Privacy levels (`PUBLIC`, `VERIFIED_EMPLOYERS`, `PRIVATE`) do not filter nested child records (`student_educations`, `student_experiences`, `student_projects`).

#### 2. Company Onboarding Flow Audit
- **Sequence**: Registration $\to$ Company Profile $\to$ Domain Verification $\to$ Company Membership $\to$ Job Publishing $\to$ Candidate Discovery $\to$ Shortlisting $\to$ Interview Request.
- **Identified Gaps**:
  1. In `prisma/schema.prisma` line 45, `CompanyProfile.isVerified` defaults to `true`!
  2. Unverified companies can publish jobs immediately without domain verification.
  3. Multi-recruiter membership (`company_members`) is completely missing in current SQLite code; 1:1 user-to-company link is hardcoded.

#### 3. Employee Onboarding Flow Audit
- **Sequence**: Registration $\to$ Employment Verification $\to$ Referral Opportunities $\to$ Referral Submission $\to$ Hiring Outcome $\to$ Reward Accounting.
- **Identified Gaps**:
  1. Employee work email domain is never validated against company website domain.
  2. Endpoint `GET /api/referrals/opportunities` in `server/routes/referrals.ts` returns ALL candidate requests across ALL companies in the database without filtering by employee company!

---

### 3.6 Data Quality, Privacy & Demo Data Separation Audit

#### Demo Data Exposure Risks
- `prisma/seed.ts` seeds candidate profiles (Ananya Sharma, Rahul Sharma, Priya Patel) with fabricated CGPA (9.1, 9.4), artificial test scores, hardcoded social URLs, and fixed Unsplash avatars.
- If seeded records are imported into production PostgreSQL alongside real users, recruiters will attempt to contact demo profiles.

#### Candidate Privacy & GDPR / DPDP Compliance Gaps
1. **Candidate Contact Exposure**: Recruiter discovery routes (`server/routes/discovery.ts`) expose candidate `email` directly in the candidate list response (`select: { name: true, email: true, avatar: true }`).
2. **Missing Export / Deletion Workflows**: No API endpoints or database functions exist for exporting user data or executing soft/hard account deletion compliant with data protection laws.
3. **Demo Data Separation Requirement**: Demo accounts MUST be tagged with `is_demo boolean DEFAULT true` on `profiles`. RLS policies in production MUST exclude `is_demo = true` records from real recruiter discovery searches unless in demo mode.

---

### 3.7 RLS & Security Definer Audit: Attack Scenarios & Required Fixes

```
+--------------------------------------------------------------------------------------------------------------------------------+
| SCENARIO 1: SELF-ASSIGNMENT OF ADMIN ROLE                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------|
| Attack Vector | User passes {"role": "ADMIN"} to POST /api/auth/register or updates auth.users.raw_user_meta_data via API.      |
| Root Cause    | Initial DDL lacks RLS restrictions on public.user_roles INSERT/UPDATE operations.                             |
| Required Fix  | CREATE POLICY "Only Admins Modify Roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());|
+--------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------+
| SCENARIO 2: UNAUTHORIZED RESUME ACCESS                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------|
| Attack Vector | Candidate B fetches storage URL /storage/v1/object/authenticated/resumes/CANDIDATE_A_ID/resume.pdf.             |
| Root Cause    | Storage RLS policy array indexing (storage.foldername(name))[1] evaluates bucket name instead of folder ID.     |
| Required Fix  | Correct array indexing to [2] or standard path helper and require Signed URLs for recruiter downloads.        |
+--------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------+
| SCENARIO 3: CROSS-COMPANY CANDIDATE DISCOVERY LEAK                                                                             |
|--------------------------------------------------------------------------------------------------------------------------------|
| Attack Vector | Recruiter at Company X queries shortlists or interview requests belonging to Company Y.                         |
| Root Cause    | RLS policy for shortlists/referral_requests checks company role but omits is_company_member(company_id).        |
| Required Fix  | Add USING (public.is_company_member(company_id)) to shortlists and referral_requests SELECT/UPDATE policies.   |
+--------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------+
| SCENARIO 4: DIRECT PAYMENT STATUS MODIFICATION                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------|
| Attack Vector | Client executes INSERT INTO transactions (type, amount, status) VALUES ('VERIFICATION', 0, 'COMPLETED').       |
| Root Cause    | transactions table allows INSERT for authenticated users matching auth.uid() = user_id.                        |
| Required Fix  | DENY INSERT/UPDATE on public.transactions for standard authenticated users; allow ONLY service_role.            |
+--------------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Corrected DDL & RLS Policy Specifications

### 4.1 Corrected `enforce_referral_status_transition()` Trigger Function
```sql
-- Add reward_paid flag to referral_requests
ALTER TABLE public.referral_requests 
ADD COLUMN IF NOT EXISTS reward_paid boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.enforce_referral_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_uid uuid;
BEGIN
  caller_uid := auth.uid();
  
  -- Handle system / background execution
  IF caller_uid IS NULL THEN
    caller_role := 'SYSTEM';
  ELSE
    caller_role := public.get_user_role(caller_uid);
  END IF;

  -- 1. Student Status Advancement Restrictions
  IF caller_role = 'STUDENT' THEN
    IF NEW.status NOT IN ('WITHDRAWN', 'REFERRAL_REQUESTED') THEN
      RAISE EXCEPTION 'Unauthorized status update: Students cannot advance pipeline status to %', NEW.status;
    END IF;
  END IF;

  -- 2. Non-Employee Referral Submission Guard
  IF NEW.status = 'REFERRAL_SUBMITTED' AND caller_role NOT IN ('EMPLOYEE', 'ADMIN', 'SYSTEM') THEN
    RAISE EXCEPTION 'Unauthorized status update: Only verified employees can submit internal referrals.';
  END IF;

  -- 3. Idempotent Financial Credit on HIRED State
  IF NEW.status = 'HIRED' AND NEW.reward_paid = false THEN
    IF NEW.employee_id IS NOT NULL THEN
      UPDATE public.employee_profiles
      SET 
        successful_referrals = successful_referrals + 1,
        earnings = earnings + (
          SELECT COALESCE(j.referral_bonus, 5000.00) 
          FROM public.jobs j WHERE j.id = NEW.job_id
        )
      WHERE id = NEW.employee_id;
      
      -- Mark reward as paid to prevent duplicate triggers
      NEW.reward_paid := true;
    END IF;
  END IF;

  -- 4. Audit Log Entry
  INSERT INTO public.referral_status_history (
    referral_request_id,
    status,
    actor_id,
    actor_role,
    notes
  ) VALUES (
    NEW.id,
    NEW.status,
    COALESCE(caller_uid, NEW.student_profile_id),
    caller_role,
    NEW.notes
  );

  RETURN NEW;
END;
$$;
```

### 4.2 Corrected `auth.users` Auto-Profile & Role Sync Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role text;
BEGIN
  -- Extract role from metadata or default to STUDENT
  assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
  IF assigned_role NOT IN ('STUDENT', 'COMPANY', 'EMPLOYEE', 'ADMIN') THEN
    assigned_role := 'STUDENT';
  END IF;

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Insert into public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);

  -- Initialize role-specific profile
  IF assigned_role = 'STUDENT' THEN
    INSERT INTO public.student_profiles (user_id, target_domain)
    VALUES (NEW.id, 'Software Development');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_signup();
```

---

## 5. Required Test Plan & Acceptance Criteria

Prior to proceeding with Step 6 implementation, the following tests MUST be established:

### 1. State Machine & Trigger Idempotency Test
- **Test 1.1**: Advance referral status `OFFER_EXTENDED` $\to$ `HIRED`. Verify employee `earnings` increased by job referral bonus (e.g. +₹5,000) and `reward_paid` set to `true`.
- **Test 1.2**: Toggle referral status `HIRED` $\to$ `SCREENING` $\to$ `HIRED`. Verify employee `earnings` DOES NOT increment a second time.
- **Test 1.3**: Authenticate as `STUDENT` and call status update endpoint setting status `HIRED`. Verify database rejects update with 403 / exception.

### 2. Authentication & Role Security Test
- **Test 2.1**: Register new user via Supabase Auth. Verify records created atomically in `auth.users`, `public.profiles`, `public.user_roles`, and `public.student_profiles`.
- **Test 2.2**: Call `get_user_role()` for newly registered user. Verify returns `'STUDENT'` and `is_admin()` returns `false`.

### 3. Payment Verification Test
- **Test 3.1**: Submit mock `POST /api/payments/create` payload with `amount: 0`. Verify backend rejects request without Razorpay signature verification.
- **Test 3.2**: Send valid signed Razorpay webhook payload for `payment.captured`. Verify `transactions` status moves to `COMPLETED` and `humanVerified` set to `true`.

### 4. Storage Policy & Privacy Test
- **Test 4.1**: Candidate A requests download of Candidate B's private resume via direct storage URL. Verify storage RLS returns `403 Access Denied`.
- **Test 4.2**: Candidate B toggles `privacy_level` to `'PRIVATE'`. Verify unverified company cannot discover candidate in recruiter search.

---

## 6. Recommended Implementation Sequence

```
+-----------------------------------------------------------------------------------+
| PHASE 1: DDL & SECURITY SPECIFICATION CORRECTIONS                                 |
| - Update HIRE_ME_OUT_SUPABASE_DATABASE_DESIGN.md with corrected DDL & triggers   |
| - Add unique constraints (uq_student_job_referral) & reward_paid flag             |
| - Define recruiter_candidate_assessments security definer view                    |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 2: ENVIRONMENT & MIGRATION SCRIPT PREPARATION                               |
| - Prepare Supabase Auth import script for existing bcrypt hashes                  |
| - Create Razorpay HMAC webhook handler in Express server                          |
| - Configure Supabase Storage bucket policies & signed URL helper                  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 3: STEP 6 EXECUTION (DATABASE PROVISIONING)                                 |
| - Apply corrected DDL migration to Supabase PostgreSQL project                   |
| - Verify RLS policies, helper functions, and storage buckets                      |
+-----------------------------------------------------------------------------------+
```

---

## 7. Unresolved Architectural Decisions Requiring Approval

1. **Recruiter Assessment View Scoping**:
   - *Option A (Recommended)*: Expose summary scores (`techScore`, `interviewScore`, `talentTier`) to recruiters via Security Definer View, completely redacting raw question answers (`answers_jsonb`).
   - *Option B*: Allow recruiters to inspect full question-by-question candidate answers.
2. **Demo Data Management in Production**:
   - *Option A (Recommended)*: Exclude demo accounts (`is_demo = true`) from production recruiter discovery search results via RLS.
   - *Option B*: Retain demo profiles in production database for platform showcase purposes.
3. **Company Recruiter Authorization**:
   - *Option A (Recommended)*: Multi-recruiter company model using `company_members` table.
   - *Option B*: 1:1 Recruiter-to-Company relationship.

---

## 8. Final Boundary Confirmation

> **FINAL BOUNDARY CONFIRMATION**
> - **No Supabase tables were created or modified.**
> - **No SQL scripts or migrations were executed against remote databases.**
> - **Prisma schema (`prisma/schema.prisma`) and SQLite (`prisma/dev.db`) remain untouched.**
> - **No backend or frontend application code was altered.**
> - **No environment variables were changed.**
> - **No Git commit or push was performed.**

---
*Report compiled autonomously by Antigravity AI pair-programmer.*
