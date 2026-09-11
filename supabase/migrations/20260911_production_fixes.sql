-- ==============================================================================
-- RECLUSTIFY: PRODUCTION FIXES
-- 1. Secure account deletion via SECURITY DEFINER RPC (no Edge Function needed)
-- 2. Expanded complaint/cluster status lifecycle
-- 3. Admin ALL complaints view (not just clusters)
-- 4. Fix RLS for admin to see ALL institution complaints
-- ==============================================================================

-- ============================================================
-- FIX 1: SECURE ACCOUNT DELETION FUNCTION
-- Uses SECURITY DEFINER so it runs with postgres privileges,
-- allowing deletion from auth.users.
-- The function checks auth.uid() = the ID being deleted,
-- preventing any user from deleting another account.
-- The service-role key is NEVER needed in the browser.
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  calling_user_id UUID;
BEGIN
  -- Get the authenticated user's ID from the JWT
  calling_user_id := auth.uid();

  IF calling_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Explicit cleanup of user data in child tables before auth.users deletion
  DELETE FROM public.complaint_timeline WHERE actor_id = calling_user_id;
  DELETE FROM public.complaint_attachments WHERE uploader_id = calling_user_id;
  DELETE FROM public.complaints WHERE user_id = calling_user_id;
  DELETE FROM public.student_profiles WHERE user_id = calling_user_id;
  DELETE FROM public.admin_requests WHERE user_id = calling_user_id;
  DELETE FROM public.profiles WHERE id = calling_user_id;

  -- Delete from auth.users (runs with postgres superuser privileges)
  DELETE FROM auth.users WHERE id = calling_user_id;

  RETURN json_build_object('success', true, 'deleted_user_id', calling_user_id::text);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users only
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- FIX 2: EXPAND STATUS VALUES TO MATCH REAL LIFECYCLE
-- Old: IN PROGRESS, ASSIGNED, RESOLVED
-- New: SUBMITTED, UNDER REVIEW, ASSIGNED, IN PROGRESS, RESOLVED, CLOSED
-- ============================================================

-- Migrate complaints table status column
ALTER TABLE public.complaints
  DROP CONSTRAINT IF EXISTS complaints_status_check;

ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_status_check
  CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'));

-- Update existing complaints to use new status values
UPDATE public.complaints
  SET status = 'SUBMITTED'
  WHERE status NOT IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED');

-- Migrate clusters table status column
ALTER TABLE public.clusters
  DROP CONSTRAINT IF EXISTS clusters_status_check;

ALTER TABLE public.clusters
  ADD CONSTRAINT clusters_status_check
  CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'));

-- Update existing clusters to use new status values
UPDATE public.clusters
  SET status = 'IN PROGRESS'
  WHERE status NOT IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED');

-- ============================================================
-- FIX 3: ADD priority + resolution_notes TO complaints
-- (So admin can set priority/resolution on individual complaints)
-- ============================================================

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS department TEXT;

-- ============================================================
-- FIX 4: RLS — Ensure admins can manage ALL complaints
--         in their institution (UPDATE policy fix)
-- ============================================================

-- Drop old restrictive update policy and replace with comprehensive one
DROP POLICY IF EXISTS "Admins can update complaints in own institution" ON public.complaints;
CREATE POLICY "Admins can update complaints in own institution"
    ON public.complaints FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = complaints.institution_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = complaints.institution_id
        )
    );

-- ============================================================
-- FIX 5: Allow anonymous/demo complaint rows to be seen by admins
-- The seed data has user_id = '00000000-0000-0000-0000-000000000001' (no real user)
-- Admins should still see them
-- ============================================================

-- The existing "Students can view own complaints" policy already covers this
-- because it checks: auth.uid() = user_id OR admin of same institution
-- No change needed for this.

-- ============================================================
-- FIX 6: Update seed complaints to use new status values
-- ============================================================
UPDATE public.complaints
  SET status = 'IN PROGRESS'
  WHERE id IN (
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004'
  );

-- ============================================================
-- FIX 7: Add missing index for faster status queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_user_institution
  ON public.complaints(user_id, institution_id);

CREATE INDEX IF NOT EXISTS idx_clusters_priority_score
  ON public.clusters(priority_score DESC);
