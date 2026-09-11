-- ==============================================================================
-- RECLUSTIFY: COMPLAINT ATTACHMENTS + STORAGE BUCKET SETUP
-- Run this after the previous two migrations.
-- ==============================================================================

-- 1. COMPLAINT ATTACHMENTS TABLE
--    Stores metadata for files uploaded to Supabase Storage.
--    The actual binary is in the 'complaint-evidence' bucket.
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path    TEXT NOT NULL,   -- e.g. "{user_id}/{complaint_id}/evidence.jpg"
    file_name       TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,  -- bytes
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_complaint ON public.complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader  ON public.complaint_attachments(uploaded_by);

-- 2. ROW LEVEL SECURITY
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

-- Students: can insert/view attachments for their own complaints
DROP POLICY IF EXISTS "Students can insert own attachments"  ON public.complaint_attachments;
CREATE POLICY "Students can insert own attachments"
    ON public.complaint_attachments FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Students can view own attachments" ON public.complaint_attachments;
CREATE POLICY "Students can view own attachments"
    ON public.complaint_attachments FOR SELECT TO authenticated
    USING (
        auth.uid() = uploaded_by
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.complaints c ON c.id = complaint_attachments.complaint_id
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
              AND p.institution_id = c.institution_id
        )
    );

-- 3. STORAGE BUCKET
--    Create the complaint-evidence bucket if it doesn't exist.
--    NOTE: Supabase Storage buckets can also be created in the Dashboard > Storage.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'complaint-evidence',
    'complaint-evidence',
    false,           -- private bucket: no public URLs
    5242880,         -- 5 MB max per file
    ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. STORAGE RLS POLICIES
--    Students: upload to their own folder; read own files
--    Admins: read files belonging to complaints in their institution

-- Allow authenticated students to upload into their own user folder
DROP POLICY IF EXISTS "Students upload own evidence" ON storage.objects;
CREATE POLICY "Students upload own evidence"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Students can read their own files
DROP POLICY IF EXISTS "Students read own evidence" ON storage.objects;
CREATE POLICY "Students read own evidence"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Students can delete their own files (needed for account deletion cleanup)
DROP POLICY IF EXISTS "Students delete own evidence" ON storage.objects;
CREATE POLICY "Students delete own evidence"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'complaint-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Admins can read evidence for complaints in their institution
DROP POLICY IF EXISTS "Admins read institution evidence" ON storage.objects;
CREATE POLICY "Admins read institution evidence"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'complaint-evidence'
        AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
        )
    );
