-- ============================================================
-- TalonHire — Storage Buckets Setup
-- Execute no SQL Editor do Supabase Dashboard quando o Storage estiver pronto
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('cvs', 'cvs', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('videos', 'videos', false, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('jds', 'jds', false, 10485760, ARRAY['application/pdf', 'text/plain']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('company-logos', 'company-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

-- Storage RLS Policies

-- Avatars: anyone can view, users upload their own
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_user_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_user_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_user_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Company logos: anyone can view, company owner uploads
CREATE POLICY "logos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "logos_owner_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' AND EXISTS (
    SELECT 1 FROM public.companies WHERE owner_id = auth.uid() AND id::text = (storage.foldername(name))[1]
  )
);

-- CVs: candidate uploads own, admins read all
CREATE POLICY "cvs_candidate_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "cvs_candidate_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "cvs_admin_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'cvs' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter')
  )
);

-- Videos: candidate uploads own, admins + matched companies read
CREATE POLICY "videos_candidate_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "videos_candidate_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "videos_admin_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'videos' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter')
  )
);

-- JDs: company owner uploads, admins read
CREATE POLICY "jds_company_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'jds' AND EXISTS (
    SELECT 1 FROM public.companies WHERE owner_id = auth.uid()
  )
);
CREATE POLICY "jds_company_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'jds' AND EXISTS (
    SELECT 1 FROM public.companies WHERE owner_id = auth.uid()
  )
);
CREATE POLICY "jds_admin_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'jds' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter')
  )
);
