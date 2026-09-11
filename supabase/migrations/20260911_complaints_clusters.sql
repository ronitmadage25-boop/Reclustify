-- ==============================================================================
-- RECLUSTIFY: COMPLAINT & CLUSTER PERSISTENCE
-- Run this migration after 20260911_init_backend_foundation.sql
-- ==============================================================================

-- 1. CLUSTERS TABLE
--    A cluster is an algorithmically grouped set of related student complaints.
--    Admins manage clusters; students see which cluster their report joined.
CREATE TABLE IF NOT EXISTS public.clusters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id  UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    cluster_key     TEXT NOT NULL,          -- e.g. "C-104" – human-readable short ID
    title           TEXT NOT NULL,          -- e.g. "Lab 3 Wi-Fi Connectivity & Dropouts"
    department      TEXT,                   -- assigned campus department
    location        TEXT,                   -- campus location string
    category        TEXT,                   -- e.g. "IT & NETWORK"
    priority        TEXT DEFAULT 'LOW' CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    priority_score  INTEGER DEFAULT 0,      -- 0-100
    status          TEXT DEFAULT 'IN PROGRESS' CHECK (status IN ('IN PROGRESS','ASSIGNED','RESOLVED')),
    resolution_notes TEXT,                  -- admin-authored resolution summary
    reports_count   INTEGER DEFAULT 0,
    days_active     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. COMPLAINTS TABLE
--    Individual student-submitted problem reports.
CREATE TABLE IF NOT EXISTS public.complaints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id  UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    cluster_id      UUID REFERENCES public.clusters(id) ON DELETE SET NULL,
    ticket_number   TEXT NOT NULL,          -- e.g. "REP-4091"
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    category        TEXT NOT NULL,
    location        TEXT,
    severity        TEXT DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    status          TEXT DEFAULT 'IN PROGRESS' CHECK (status IN ('IN PROGRESS','ASSIGNED','RESOLVED')),
    similarity_score TEXT,                  -- e.g. "89%" – AI match score
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_clusters_institution   ON public.clusters(institution_id);
CREATE INDEX IF NOT EXISTS idx_clusters_status        ON public.clusters(status);
CREATE INDEX IF NOT EXISTS idx_complaints_user        ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_institution ON public.complaints(institution_id);
CREATE INDEX IF NOT EXISTS idx_complaints_cluster     ON public.complaints(cluster_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status      ON public.complaints(status);

-- 4. AUTO updated_at TRIGGERS
DROP TRIGGER IF EXISTS set_clusters_updated_at ON public.clusters;
CREATE TRIGGER set_clusters_updated_at
    BEFORE UPDATE ON public.clusters
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_complaints_updated_at ON public.complaints;
CREATE TRIGGER set_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.clusters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- CLUSTERS: Admins of the same institution can read/write; students can read their institution's clusters
DROP POLICY IF EXISTS "Admins can manage clusters in own institution"  ON public.clusters;
CREATE POLICY "Admins can manage clusters in own institution"
    ON public.clusters FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role = 'admin'
              AND institution_id = clusters.institution_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role = 'admin'
              AND institution_id = clusters.institution_id
        )
    );

DROP POLICY IF EXISTS "Students can read clusters in own institution" ON public.clusters;
CREATE POLICY "Students can read clusters in own institution"
    ON public.clusters FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND institution_id = clusters.institution_id
        )
    );

-- COMPLAINTS: Students own their rows; Admins of same institution can read all
DROP POLICY IF EXISTS "Students can insert own complaints" ON public.complaints;
CREATE POLICY "Students can insert own complaints"
    ON public.complaints FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own complaints" ON public.complaints;
CREATE POLICY "Students can view own complaints"
    ON public.complaints FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role = 'admin'
              AND institution_id = complaints.institution_id
        )
    );

DROP POLICY IF EXISTS "Students can update own complaints" ON public.complaints;
CREATE POLICY "Students can update own complaints"
    ON public.complaints FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update complaints in own institution" ON public.complaints;
CREATE POLICY "Admins can update complaints in own institution"
    ON public.complaints FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role = 'admin'
              AND institution_id = complaints.institution_id
        )
    );

-- ==============================================================================
-- SEED DATA
-- Pre-populate clusters and complaints so the admin dashboard is not empty.
-- These are attached to MIT (a0000000-0000-0000-0000-000000000001).
-- ==============================================================================

-- Seed clusters
INSERT INTO public.clusters
    (id, institution_id, cluster_key, title, department, location, category, priority, priority_score, status, reports_count, days_active)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'C-104',
        'Lab 3 Wi-Fi Connectivity & Dropouts',
        'IT INFRASTRUCTURE',
        'Science Complex, Lab 3',
        'IT & NETWORK',
        'HIGH', 82, 'IN PROGRESS', 4, 2
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'C-098',
        'Library 3rd Floor HVAC Overheating',
        'CAMPUS FACILITIES',
        'Central Library, Zone B',
        'CAMPUS FACILITIES',
        'MEDIUM', 64, 'ASSIGNED', 7, 4
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'C-095',
        'Lecture Hall 101 Microphone Feedback',
        'AUDIO-VISUAL SUPPORT',
        'Main Auditorium, LH 101',
        'CAMPUS FACILITIES',
        'LOW', 48, 'IN PROGRESS', 3, 1
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'C-092',
        'North Dorm Water Pressure Malfunction',
        'RESIDENTIAL HOUSING',
        'North Hall, Floors 2-4',
        'HOUSING & DORM',
        'HIGH', 78, 'RESOLVED', 5, 5
    ),
    (
        'b0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'C-089',
        'Chemistry Lab Fume Hood Airflow Fault',
        'HEALTH & SAFETY',
        'Chemistry Wing, Room 114',
        'CAMPUS SAFETY',
        'CRITICAL', 91, 'IN PROGRESS', 2, 1
    ),
    (
        'b0000000-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-000000000001',
        'C-084',
        'Campus Perimeter Pathway Lighting Outage',
        'CAMPUS FACILITIES',
        'West Gate Walkway',
        'CAMPUS SAFETY',
        'MEDIUM', 70, 'ASSIGNED', 6, 3
    )
ON CONFLICT DO NOTHING;

-- Seed demo complaints for cluster C-104 (no real user_id — anonymous demo rows)
-- These use a placeholder UUID for user_id that won't match any real user.
-- The RLS policy lets admins read all complaints in their institution regardless.
INSERT INTO public.complaints
    (id, user_id, institution_id, cluster_id, ticket_number, title, description, category, location, severity, status, similarity_score, created_at)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'REP-4091',
        'Wi-Fi keeps dropping during practical sessions',
        'Computers in row 2 and 4 cannot connect to the college network router. Multiple students cannot complete assignment uploads.',
        'IT & NETWORK', 'Science Block, Lab 3', 'HIGH', 'IN PROGRESS', '94%',
        NOW() - INTERVAL '2 days'
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'REP-4088',
        'Wi-Fi disconnects every 5 minutes in computer lab 3 during python practicals',
        'Cannot submit assignment due to constant Wi-Fi disconnections during Python lab session.',
        'IT & NETWORK', 'Science Block, Lab 3', 'HIGH', 'IN PROGRESS', '91%',
        NOW() - INTERVAL '2 days 3 hours'
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'REP-4081',
        'Cannot connect to campus Wi-Fi AP in science block lab 3',
        'All desktop workstations in rows 1-3 are showing DHCP timeout when connecting to campus network.',
        'IT & NETWORK', 'Science Block, Lab 3', 'MEDIUM', 'IN PROGRESS', '88%',
        NOW() - INTERVAL '3 days'
    ),
    (
        'c0000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'REP-4075',
        'Frequent internet timeouts on lab desktop workstations',
        'Every afternoon between 2-4 PM the lab internet becomes completely unusable. Multiple students affected.',
        'IT & NETWORK', 'Science Block, Lab 3', 'MEDIUM', 'IN PROGRESS', '85%',
        NOW() - INTERVAL '3 days 6 hours'
    )
ON CONFLICT DO NOTHING;
