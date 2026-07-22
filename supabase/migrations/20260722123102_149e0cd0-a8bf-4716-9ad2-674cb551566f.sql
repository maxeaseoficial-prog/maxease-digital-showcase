-- Push 3 — Media infrastructure
-- Enable extensions needed for scheduled cleanup of expired media
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove duplicate trigger left from earlier migrations (both fire same function)
DROP TRIGGER IF EXISTS trg_calendar_updated ON public.calendar_items;

-- Helpful index for admin listing of items pending purge, if not present
CREATE INDEX IF NOT EXISTS idx_calendar_purge_lookup
  ON public.calendar_items (files_purge_at)
  WHERE files_deleted_at IS NULL AND files_purge_at IS NOT NULL;
