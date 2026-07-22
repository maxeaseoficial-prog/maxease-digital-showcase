
-- Índice para busca por token de aprovação (rota pública)
CREATE INDEX IF NOT EXISTS calendar_items_approval_token_idx
  ON public.calendar_items (approval_token)
  WHERE approval_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS calendar_items_client_date_idx
  ON public.calendar_items (client_id, date DESC);

CREATE INDEX IF NOT EXISTS notices_client_created_idx
  ON public.notices (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS reports_client_created_idx
  ON public.reports (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS report_folders_client_idx
  ON public.report_folders (client_id);

-- Habilitar realtime nas tabelas que a UI precisa observar em tempo real
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.report_folders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_config;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- REPLICA IDENTITY FULL para atualizações incrementais completas
ALTER TABLE public.calendar_items REPLICA IDENTITY FULL;
ALTER TABLE public.notices REPLICA IDENTITY FULL;
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.report_folders REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;

-- Triggers de updated_at nas tabelas que possuem a coluna
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_clients_updated_at') THEN
    CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_calendar_updated_at') THEN
    CREATE TRIGGER trg_calendar_updated_at BEFORE UPDATE ON public.calendar_items
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_tenants_updated_at') THEN
    CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON public.tenants
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;
