-- ============================================================================
-- Migration 05: Social Proof Feed, Notifications, Audit Logs & Payments (Deferred)
-- ============================================================================

-- 1. Social Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'GENERAL' CHECK (type IN ('PROJECT', 'CERTIFICATION', 'ASSESSMENT', 'MILESTONE', 'GENERAL')),
  media_url text,
  privacy text DEFAULT 'PUBLIC' CHECK (privacy IN ('PUBLIC', 'VERIFIED_EMPLOYERS', 'PRIVATE')),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_privacy_created ON public.posts(privacy, created_at DESC);

-- 2. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at ASC);

-- 3. Post Likes
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_post_user_like UNIQUE (post_id, user_id)
);

-- 4. User Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'INFO' CHECK (type IN ('INFO', 'SHORTLIST', 'INTERVIEW_REQUEST', 'REFERRAL', 'SCORE', 'PAYMENT')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

-- 5. Deferred Payments & Financial Transactions Table
-- Note: Real Razorpay payment integration is DEFERRED in Step 6A.
-- Direct client writes (INSERT/UPDATE) will be strictly DENIED in RLS.
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'INR',
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id, created_at DESC);

-- 6. Platform Commission & Monetization Rules
CREATE TABLE IF NOT EXISTS public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT 'Default Pricing Config',
  student_fee numeric(10, 2) DEFAULT 499.00,
  company_sub_monthly numeric(10, 2) DEFAULT 9999.00,
  employee_reward_amount numeric(10, 2) DEFAULT 3000.00,
  platform_commission_percent numeric(5, 2) DEFAULT 20.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Resume Files Metadata
CREATE TABLE IF NOT EXISTS public.resume_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size_bytes integer NOT NULL,
  mime_type text DEFAULT 'application/pdf',
  parsed_data_jsonb jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_files_student ON public.resume_files(student_profile_id, is_active);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  payload_jsonb jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON public.audit_logs(actor_id, created_at DESC);
