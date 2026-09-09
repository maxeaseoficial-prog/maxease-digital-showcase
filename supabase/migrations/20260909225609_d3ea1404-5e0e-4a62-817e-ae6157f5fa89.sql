CREATE TABLE IF NOT EXISTS public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean NOT NULL DEFAULT true,
  desktop_file_path text,
  mobile_file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT SELECT ON public.custom_pages TO anon;
GRANT ALL ON public.custom_pages TO service_role;

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_pages_admin_all" ON public.custom_pages;
CREATE POLICY "custom_pages_admin_all" ON public.custom_pages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "custom_pages_public_read_active" ON public.custom_pages;
CREATE POLICY "custom_pages_public_read_active" ON public.custom_pages FOR SELECT TO anon, authenticated
USING (active = true);

CREATE INDEX IF NOT EXISTS idx_custom_pages_active_slug ON public.custom_pages (active, slug);

DROP TRIGGER IF EXISTS trg_custom_pages_updated_at ON public.custom_pages;
CREATE TRIGGER trg_custom_pages_updated_at BEFORE UPDATE ON public.custom_pages
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP POLICY IF EXISTS "storage_custom_pages_admin_all" ON storage.objects;
CREATE POLICY "storage_custom_pages_admin_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'custom-pages' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'custom-pages' AND public.has_role(auth.uid(), 'admin'::app_role));