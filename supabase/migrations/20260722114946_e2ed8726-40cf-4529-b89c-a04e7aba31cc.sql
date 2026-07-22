
-- 1) Add 'operator' to app_role enum (Postgres 17 allows use in same tx)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operator';

-- 2) tenants table (multi-empresa preparation)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated reads tenants" ON public.tenants;
CREATE POLICY "authenticated reads tenants" ON public.tenants
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin manages tenants" ON public.tenants;
CREATE POLICY "admin manages tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_tenants_updated ON public.tenants;
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) tenant_id column on clients (nullable for now — enable per-tenant scoping later)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS clients_tenant_id_idx ON public.clients(tenant_id);

-- 4) Default MAXEASE tenant
INSERT INTO public.tenants (id, name, slug)
VALUES ('11111111-1111-1111-1111-111111111111', 'MAXEASE Digital', 'maxease')
ON CONFLICT (slug) DO NOTHING;

-- 5) Seed admin auth user (Henrique Castro)
DO $$
DECLARE
  v_admin_id uuid;
  v_client_id uuid;
BEGIN
  -- Admin user
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'maxeaseoficial@gmail.com';
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'maxeaseoficial@gmail.com', crypt('maxease@2026', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Henrique Castro"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_admin_id, v_admin_id,
      jsonb_build_object('sub', v_admin_id::text, 'email', 'maxeaseoficial@gmail.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

  -- Demo client (For Action)
  SELECT id INTO v_client_id FROM auth.users WHERE email = 'teste@gmail.com';
  IF v_client_id IS NULL THEN
    v_client_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      v_client_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'teste@gmail.com', crypt('teste123', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Academia For Action"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_client_id, v_client_id,
      jsonb_build_object('sub', v_client_id::text, 'email', 'teste@gmail.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  END IF;
  INSERT INTO public.clients (id, email, name, company, active_project, tenant_id)
  VALUES (v_client_id, 'teste@gmail.com', 'Academia For Action', 'For Action', 'Gestão de Redes Sociais',
          '11111111-1111-1111-1111-111111111111')
  ON CONFLICT (id) DO UPDATE
    SET tenant_id = COALESCE(public.clients.tenant_id, EXCLUDED.tenant_id);
  INSERT INTO public.user_roles (user_id, role) VALUES (v_client_id, 'client')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;
