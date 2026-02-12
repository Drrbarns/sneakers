-- Create site-assets bucket for store logo, favicon, etc.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for site-assets
CREATE POLICY "Public read access for site-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Admin/staff upload and update/delete
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin upload access for site-assets') THEN
    CREATE POLICY "Admin upload access for site-assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'site-assets' AND (auth.role() = 'service_role' OR public.is_admin_or_staff() = true));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin update access for site-assets') THEN
    CREATE POLICY "Admin update access for site-assets"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'site-assets' AND (auth.role() = 'service_role' OR public.is_admin_or_staff() = true));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin delete access for site-assets') THEN
    CREATE POLICY "Admin delete access for site-assets"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'site-assets' AND (auth.role() = 'service_role' OR public.is_admin_or_staff() = true));
  END IF;
END $$;
