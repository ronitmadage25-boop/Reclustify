-- ==============================================================================
-- RECLUSTIFY: MASTER PRODUCTION SCHEMA & SECURITY MIGRATION
-- Run this migration in Supabase Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. INSTITUTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    city TEXT,
    domain TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed production institutions
INSERT INTO public.institutions (name, code, city, domain, status)
VALUES
    ('Sardar Patel Institute of Technology', 'SPIT', 'Mumbai, IN', 'spit.ac.in', 'active'),
    ('Thadomal Shahani Engineering College', 'TSEC', 'Mumbai, IN', 'tsec.edu', 'active'),
    ('Dwarkadas J. Sanghvi College of Engineering', 'DJSCE', 'Mumbai, IN', 'djsce.ac.in', 'active'),
    ('Vivekanand Education Society Institute of Technology', 'VESIT', 'Mumbai, IN', 'ves.ac.in', 'active'),
    ('National Institute of Technology', 'NIT', 'Various, IN', 'nit.ac.in', 'active'),
    ('Delhi Technological University', 'DTU', 'Delhi, IN', 'dtu.ac.in', 'active'),
    ('Massachusetts Institute of Technology', 'MIT', 'Cambridge, MA', 'mit.edu', 'active'),
    ('Stanford University', 'STANFORD', 'Stanford, CA', 'stanford.edu', 'active')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    domain = EXCLUDED.domain,
    status = EXCLUDED.status;

-- ============================================================
-- 2. PROFILES TABLE (Associated with auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('student', 'admin')),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    onboarding_complete BOOLEAN DEFAULT false,
    contact_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. STUDENT PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    enrollment_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    division_class TEXT,
    degree_program TEXT,
    graduation_year TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. ADMIN REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,
    staff_id TEXT,
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    office_location TEXT,
    jurisdiction_scope TEXT,
    years_associated TEXT,
    association_type TEXT,
    proof_document TEXT,
    reason TEXT,
    domain TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    institution_code TEXT DEFAULT '882910',
    created_at TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ
);

-- ============================================================
-- 5. CLUSTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    cluster_key TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM',
    priority_score INTEGER DEFAULT 50,
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED')),
    resolution_notes TEXT,
    reports_count INTEGER DEFAULT 0,
    days_active INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL,
    ticket_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT,
    severity TEXT DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    department TEXT,
    resolution_notes TEXT,
    similarity_score TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alter complaints to ensure columns and status checks match even on existing tables
DO $$
BEGIN
    -- Ensure department column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'department') THEN
        ALTER TABLE public.complaints ADD COLUMN department TEXT;
    END IF;

    -- Ensure priority column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'priority') THEN
        ALTER TABLE public.complaints ADD COLUMN priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
    END IF;

    -- Ensure resolution_notes column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'resolution_notes') THEN
        ALTER TABLE public.complaints ADD COLUMN resolution_notes TEXT;
    END IF;

    -- Relax status check constraint to include all lifecycle statuses
    ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
    ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check
        CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'));

    ALTER TABLE public.clusters DROP CONSTRAINT IF EXISTS clusters_status_check;
    ALTER TABLE public.clusters ADD CONSTRAINT clusters_status_check
        CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END;
$$;

-- ============================================================
-- 7. COMPLAINT TIMELINE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaint_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. COMPLAINT ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_user ON public.admin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_institution ON public.admin_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_institution ON public.complaints(institution_id);
CREATE INDEX IF NOT EXISTS idx_complaints_cluster ON public.complaints(cluster_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_clusters_institution ON public.clusters(institution_id);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint ON public.complaint_attachments(complaint_id);

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

-- Institutions policies
DROP POLICY IF EXISTS "Anyone can view institutions" ON public.institutions;
CREATE POLICY "Anyone can view institutions"
    ON public.institutions FOR SELECT
    TO public
    USING (true);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT TO authenticated
    USING (
        auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM public.profiles admin_p
            WHERE admin_p.id = auth.uid()
              AND admin_p.role = 'admin'
              AND admin_p.institution_id = profiles.institution_id
        )
    );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- Student Profiles policies
DROP POLICY IF EXISTS "Students can view own student profile" ON public.student_profiles;
CREATE POLICY "Students can view own student profile"
    ON public.student_profiles FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = student_profiles.institution_id
        )
    );

DROP POLICY IF EXISTS "Students can insert own student profile" ON public.student_profiles;
CREATE POLICY "Students can insert own student profile"
    ON public.student_profiles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update own student profile" ON public.student_profiles;
CREATE POLICY "Students can update own student profile"
    ON public.student_profiles FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can delete own student profile" ON public.student_profiles;
CREATE POLICY "Students can delete own student profile"
    ON public.student_profiles FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Admin Requests policies
DROP POLICY IF EXISTS "Users can view own admin requests" ON public.admin_requests;
CREATE POLICY "Users can view own admin requests"
    ON public.admin_requests FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own admin requests" ON public.admin_requests;
CREATE POLICY "Users can insert own admin requests"
    ON public.admin_requests FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own admin requests" ON public.admin_requests;
CREATE POLICY "Users can update own admin requests"
    ON public.admin_requests FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own admin requests" ON public.admin_requests;
CREATE POLICY "Users can delete own admin requests"
    ON public.admin_requests FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Complaints policies
DROP POLICY IF EXISTS "Students can view own complaints" ON public.complaints;
CREATE POLICY "Students can view own complaints"
    ON public.complaints FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = complaints.institution_id
        )
    );

DROP POLICY IF EXISTS "Students can insert own complaints" ON public.complaints;
CREATE POLICY "Students can insert own complaints"
    ON public.complaints FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update complaints" ON public.complaints;
CREATE POLICY "Users can update complaints"
    ON public.complaints FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = complaints.institution_id
        )
    );

DROP POLICY IF EXISTS "Users can delete own complaints" ON public.complaints;
CREATE POLICY "Users can delete own complaints"
    ON public.complaints FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Clusters policies
DROP POLICY IF EXISTS "Authenticated can read clusters in own institution" ON public.clusters;
CREATE POLICY "Authenticated can read clusters in own institution"
    ON public.clusters FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.institution_id = clusters.institution_id
        )
    );

DROP POLICY IF EXISTS "Admins can manage clusters in own institution" ON public.clusters;
CREATE POLICY "Admins can manage clusters in own institution"
    ON public.clusters FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = clusters.institution_id
        )
    );

-- Complaint Attachments policies
DROP POLICY IF EXISTS "Students can insert own attachments" ON public.complaint_attachments;
CREATE POLICY "Students can insert own attachments"
    ON public.complaint_attachments FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Students and admins can view attachments" ON public.complaint_attachments;
CREATE POLICY "Students and admins can view attachments"
    ON public.complaint_attachments FOR SELECT TO authenticated
    USING (
        auth.uid() = uploaded_by
        OR EXISTS (
            SELECT 1 FROM public.complaints c
            JOIN public.profiles p ON p.id = auth.uid()
            WHERE c.id = complaint_attachments.complaint_id
              AND p.role = 'admin'
              AND p.institution_id = c.institution_id
        )
    );

DROP POLICY IF EXISTS "Students can delete own attachments" ON public.complaint_attachments;
CREATE POLICY "Students can delete own attachments"
    ON public.complaint_attachments FOR DELETE TO authenticated
    USING (auth.uid() = uploaded_by);

-- Complaint Timeline policies
DROP POLICY IF EXISTS "Users can view complaint timeline" ON public.complaint_timeline;
CREATE POLICY "Users can view complaint timeline"
    ON public.complaint_timeline FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_timeline.complaint_id
              AND (
                  c.user_id = auth.uid()
                  OR EXISTS (
                      SELECT 1 FROM public.profiles p
                      WHERE p.id = auth.uid()
                        AND p.role = 'admin'
                        AND p.institution_id = c.institution_id
                  )
              )
        )
    );

DROP POLICY IF EXISTS "Users can insert timeline" ON public.complaint_timeline;
CREATE POLICY "Users can insert timeline"
    ON public.complaint_timeline FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can delete own timeline" ON public.complaint_timeline;
CREATE POLICY "Users can delete own timeline"
    ON public.complaint_timeline FOR DELETE TO authenticated
    USING (auth.uid() = actor_id);

-- ============================================================
-- 11. STORAGE BUCKET POLICIES FOR complaint-evidence
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Students can upload evidence" ON storage.objects;
CREATE POLICY "Students can upload evidence"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can read own evidence" ON storage.objects;
CREATE POLICY "Students can read own evidence"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Admins can read all evidence" ON storage.objects;
CREATE POLICY "Admins can read all evidence"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'complaint-evidence'
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Students delete own evidence" ON storage.objects;
CREATE POLICY "Students delete own evidence"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================
-- 12. RPC FUNCTION: delete_own_account()
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
    calling_user_id := auth.uid();

    IF calling_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- 1. Explicitly clean up all records owned by the calling user
    DELETE FROM public.complaint_timeline WHERE actor_id = calling_user_id;
    DELETE FROM public.complaint_attachments WHERE uploaded_by = calling_user_id;
    DELETE FROM public.complaints WHERE user_id = calling_user_id;
    DELETE FROM public.student_profiles WHERE user_id = calling_user_id;
    DELETE FROM public.admin_requests WHERE user_id = calling_user_id;
    DELETE FROM public.profiles WHERE id = calling_user_id;

    -- 2. Delete user from auth.users (cascades sessions, identities, etc.)
    BEGIN
        DELETE FROM auth.users WHERE id = calling_user_id;
    EXCEPTION WHEN OTHERS THEN
        -- If auth.users deletion is restricted by Supabase host permissions,
        -- the public profiles and child tables are already completely deleted.
        RETURN json_build_object('success', true, 'note', 'Profiles deleted, auth cascade deferred', 'user_id', calling_user_id::text);
    END;

    RETURN json_build_object('success', true, 'deleted_user_id', calling_user_id::text);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- ============================================================
-- 13. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, onboarding_complete)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        NULL,
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 14. COMPLAINT INSTITUTION & USER ENFORCEMENT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_complaint_institution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    real_inst_id UUID;
BEGIN
    NEW.user_id := auth.uid();

    -- Check if student profile has institution
    SELECT institution_id INTO real_inst_id
    FROM public.student_profiles
    WHERE user_id = auth.uid();

    -- Otherwise check main profiles
    IF real_inst_id IS NULL THEN
        SELECT institution_id INTO real_inst_id
        FROM public.profiles
        WHERE id = auth.uid();
    END IF;

    -- If database has a verified institution for this user, enforce it
    IF real_inst_id IS NOT NULL THEN
        NEW.institution_id := real_inst_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_complaint_institution_trigger ON public.complaints;
CREATE TRIGGER enforce_complaint_institution_trigger
    BEFORE INSERT ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_complaint_institution();

-- ============================================================
-- 15. ENABLE SUPABASE REALTIME ON COMPLAINTS
-- ============================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END;
$$;

NOTIFY pgrst, 'reload schema';
