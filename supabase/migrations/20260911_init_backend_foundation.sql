-- ==============================================================================
-- RECLUSTIFY: MULTI-COLLEGE DATABASE FOUNDATION & ONBOARDING PERSISTENCE
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. INSTITUTIONS TABLE (Multi-College Partitioning)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT,
    domain TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROFILES TABLE (Associated with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    contact_number TEXT,
    role TEXT CHECK (role IN ('student', 'admin')),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    enrollment_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    division_class TEXT,
    degree_program TEXT,
    graduation_year TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ADMIN REQUESTS TABLE (Administrator verification & clearance)
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

-- Indexes for performance & partitioning
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_user ON public.admin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_institution ON public.admin_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON public.admin_requests(status);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER set_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Automatic user profile creation on auth.users signup
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Institutions: Authenticated users can view active institutions
DROP POLICY IF EXISTS "Anyone authenticated can view active institutions" ON public.institutions;
CREATE POLICY "Anyone authenticated can view active institutions"
    ON public.institutions
    FOR SELECT
    TO authenticated
    USING (status = 'active');

DROP POLICY IF EXISTS "Anon can view active institutions for onboarding selection" ON public.institutions;
CREATE POLICY "Anon can view active institutions for onboarding selection"
    ON public.institutions
    FOR SELECT
    TO anon
    USING (status = 'active');

-- Profiles: Users can view, insert, and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Student Profiles: Students manage own profile; Admins of the same institution can view
DROP POLICY IF EXISTS "Students can view own student profile" ON public.student_profiles;
CREATE POLICY "Students can view own student profile"
    ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND institution_id = student_profiles.institution_id
        )
    );

DROP POLICY IF EXISTS "Students can insert own student profile" ON public.student_profiles;
CREATE POLICY "Students can insert own student profile"
    ON public.student_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update own student profile" ON public.student_profiles;
CREATE POLICY "Students can update own student profile"
    ON public.student_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admin Requests: Users manage own requests
DROP POLICY IF EXISTS "Users can view own admin requests" ON public.admin_requests;
CREATE POLICY "Users can view own admin requests"
    ON public.admin_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own admin request" ON public.admin_requests;
CREATE POLICY "Users can insert own admin request"
    ON public.admin_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own admin request" ON public.admin_requests;
CREATE POLICY "Users can update own admin request"
    ON public.admin_requests
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- SEED DATA: INITIAL CAMPUS INSTITUTIONS
-- ==============================================================================

INSERT INTO public.institutions (id, name, code, city, domain, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Massachusetts Institute of Technology', 'MIT', 'Cambridge, MA', 'mit.edu', 'active'),
    ('a0000000-0000-0000-0000-000000000002', 'Stanford University', 'STANFORD', 'Stanford, CA', 'stanford.edu', 'active'),
    ('a0000000-0000-0000-0000-000000000003', 'Harvard University', 'HARVARD', 'Cambridge, MA', 'harvard.edu', 'active'),
    ('a0000000-0000-0000-0000-000000000004', 'UC Berkeley', 'UCB', 'Berkeley, CA', 'berkeley.edu', 'active'),
    ('a0000000-0000-0000-0000-000000000005', 'Indian Institute of Technology Bombay', 'IITB', 'Mumbai, IN', 'iitb.ac.in', 'active'),
    ('a0000000-0000-0000-0000-000000000006', 'University of Oxford', 'OXON', 'Oxford, UK', 'ox.ac.uk', 'active'),
    ('a0000000-0000-0000-0000-000000000007', 'University of Washington', 'UW', 'Seattle, WA', 'uw.edu', 'active'),
    ('a0000000-0000-0000-0000-000000000008', 'Carnegie Mellon University', 'CMU', 'Pittsburgh, PA', 'cmu.edu', 'active')
ON CONFLICT (code) DO NOTHING;
