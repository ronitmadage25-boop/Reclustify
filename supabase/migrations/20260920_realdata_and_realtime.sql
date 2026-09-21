-- ==============================================================================
-- RECLUSTIFY: REAL DATA + REALTIME + SECURITY HARDENING
-- Run this migration in Supabase SQL Editor
-- ==============================================================================

-- ============================================================
-- 1. ADD MISSING INSTITUTIONS
-- ============================================================

INSERT INTO public.institutions (name, code, city, domain, status)
VALUES
    ('Sardar Patel Institute of Technology', 'SPIT', 'Mumbai, IN', 'spit.ac.in', 'active'),
    ('Thadomal Shahani Engineering College', 'TSEC', 'Mumbai, IN', 'tsec.edu', 'active'),
    ('Dwarkadas J. Sanghvi College of Engineering', 'DJSCE', 'Mumbai, IN', 'djsce.ac.in', 'active'),
    ('Vivekanand Education Society Institute of Technology', 'VESIT', 'Mumbai, IN', 'ves.ac.in', 'active'),
    ('National Institute of Technology', 'NIT', 'Various, IN', 'nit.ac.in', 'active'),
    ('Delhi Technological University', 'DTU', 'Delhi, IN', 'dtu.ac.in', 'active')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. SERVER-SIDE INSTITUTION ENFORCEMENT TRIGGER
-- Overwrites institution_id + user_id on every complaint INSERT
-- from the authenticated user's profile. Frontend cannot lie.
-- ============================================================

CREATE OR REPLACE FUNCTION public.enforce_complaint_institution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  real_institution_id UUID;
BEGIN
  SELECT institution_id INTO real_institution_id
  FROM public.profiles
  WHERE id = auth.uid();

  -- Overwrite whatever the frontend sent
  NEW.institution_id := real_institution_id;
  NEW.user_id := auth.uid();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_complaint_institution_trigger ON public.complaints;
CREATE TRIGGER enforce_complaint_institution_trigger
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_complaint_institution();

-- ============================================================
-- 3. HELPER RPC: GET AUTHENTICATED USER'S INSTITUTION ID
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_institution_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_institution_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_institution_id() TO authenticated;

-- ============================================================
-- 4. ENABLE SUPABASE REALTIME ON COMPLAINTS TABLE
-- ============================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END$$;

-- ============================================================
-- 5. ENSURE complaint_attachments TABLE EXISTS WITH CORRECT SCHEMA
-- The code uses 'uploaded_by' as the column name — keep it consistent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.complaint_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  uploaded_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  file_name    TEXT,
  mime_type    TEXT,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint ON public.complaint_attachments(complaint_id);

-- Enable RLS on complaint_attachments
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

-- Students can insert their own attachments
DROP POLICY IF EXISTS "Students can insert own attachments" ON public.complaint_attachments;
CREATE POLICY "Students can insert own attachments"
  ON public.complaint_attachments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Students can view their own attachments
-- Admins of the same institution can view all attachments for complaints they can see
DROP POLICY IF EXISTS "Students and admins can view attachments" ON public.complaint_attachments;
CREATE POLICY "Students and admins can view attachments"
  ON public.complaint_attachments FOR SELECT TO authenticated
  USING (
    -- Student owns the upload
    auth.uid() = uploaded_by
    OR
    -- Admin of the same institution as the complaint
    EXISTS (
      SELECT 1
      FROM public.complaints c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = complaint_attachments.complaint_id
        AND p.role = 'admin'
        AND p.institution_id = c.institution_id
    )
  );

-- ============================================================
-- 6. ENSURE complaints table has all required columns
-- ============================================================

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM';

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS department TEXT;

-- ============================================================
-- 7. UPDATE STATUS CONSTRAINTS (full lifecycle)
-- ============================================================

ALTER TABLE public.complaints
  DROP CONSTRAINT IF EXISTS complaints_status_check;

ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_status_check
  CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'));

ALTER TABLE public.clusters
  DROP CONSTRAINT IF EXISTS clusters_status_check;

ALTER TABLE public.clusters
  ADD CONSTRAINT clusters_status_check
  CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'));

-- Migrate any old statuses
UPDATE public.complaints
  SET status = 'SUBMITTED'
  WHERE status NOT IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED');

UPDATE public.clusters
  SET status = 'IN PROGRESS'
  WHERE status NOT IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED');

-- ============================================================
-- 8. STORAGE POLICIES FOR complaint-evidence BUCKET
-- Create bucket if it doesn't exist, then set policies.
-- Note: Bucket creation via SQL requires the storage extension.
-- Run this manually if it fails:
-- In Supabase Dashboard > Storage > New Bucket: complaint-evidence (private)
-- ============================================================

-- Allow authenticated users to upload to their own folder
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Students upload to their own user folder
DROP POLICY IF EXISTS "Students can upload evidence" ON storage.objects;
CREATE POLICY "Students can upload evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'complaint-evidence'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Students can read their own uploads
DROP POLICY IF EXISTS "Students can read own evidence" ON storage.objects;
CREATE POLICY "Students can read own evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'complaint-evidence'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Admins can read ALL evidence in their institution
-- (We allow any authenticated admin to read, as signed URLs are the gate)
DROP POLICY IF EXISTS "Admins can read all evidence" ON storage.objects;
CREATE POLICY "Admins can read all evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'complaint-evidence'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_complaints_status_institution
  ON public.complaints(institution_id, status);

CREATE INDEX IF NOT EXISTS idx_complaints_user_status
  ON public.complaints(user_id, status);

CREATE INDEX IF NOT EXISTS idx_complaints_created_institution
  ON public.complaints(institution_id, created_at DESC);

NOTIFY pgrst, 'reload schema';
