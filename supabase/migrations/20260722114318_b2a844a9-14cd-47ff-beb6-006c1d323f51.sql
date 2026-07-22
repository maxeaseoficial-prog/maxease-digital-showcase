
-- ============= Roles =============
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============= updated_at helper =============
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============= Site config (singleton) =============
CREATE TABLE public.site_config (
  id int PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_config_singleton CHECK (id = 1)
);
GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT ALL ON public.site_config TO service_role;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site config" ON public.site_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage site config" ON public.site_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_config_updated BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
INSERT INTO public.site_config (id, data) VALUES (1, '{}'::jsonb);

-- ============= Clients =============
CREATE TABLE public.clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  company text,
  active_project text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client reads self" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admin manages clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============= Calendar items =============
CREATE TABLE public.calendar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  kind text NOT NULL, -- 'Postagem' | 'Gravação'
  title text NOT NULL,
  date date NOT NULL,
  time text,
  status text NOT NULL DEFAULT 'Planejado',
  tag_color text,
  platforms text[] NOT NULL DEFAULT '{}',
  caption text,
  script text,
  video_path text,
  video_name text,
  video_type text,
  cover_path text,
  cover_name text,
  script_path text,
  script_name text,
  approval_token text UNIQUE,
  approved_at timestamptz,
  files_purge_at timestamptz,
  files_deleted_at timestamptz,
  approval_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_calendar_client_date ON public.calendar_items(client_id, date);
CREATE INDEX idx_calendar_purge ON public.calendar_items(files_purge_at) WHERE files_deleted_at IS NULL AND files_purge_at IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_items TO authenticated;
GRANT ALL ON public.calendar_items TO service_role;
ALTER TABLE public.calendar_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client reads own calendar" ON public.calendar_items FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "admin manages calendar" ON public.calendar_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_calendar_updated BEFORE UPDATE ON public.calendar_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============= Report folders =============
CREATE TABLE public.report_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_folders TO authenticated;
GRANT ALL ON public.report_folders TO service_role;
ALTER TABLE public.report_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client reads own folders" ON public.report_folders FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "admin manages folders" ON public.report_folders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= Reports =============
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.report_folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  pdf_path text NOT NULL,
  pdf_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_client ON public.reports(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client reads own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "admin manages reports" ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= Notices =============
CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client reads own notices" ON public.notices FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "client updates own notices" ON public.notices FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "admin manages notices" ON public.notices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= Realtime =============
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
