import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { portalSupabase as supabase } from "@/integrations/supabase/client";
import { calRowToContent } from "@/lib/admin/store";
import { usePortalAuth } from "@/lib/portal/auth";
import type { CalendarContent, Notice, Report } from "@/lib/portal/mockData";

type CalRow = Parameters<typeof calRowToContent>[0];
type NoticeRow = {
  id: string;
  client_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};
type ReportRow = {
  id: string;
  client_id: string;
  title: string;
  pdf_name: string | null;
  pdf_path: string;
  folder_id: string | null;
  created_at: string;
};
type FolderRow = { id: string; client_id: string; name: string; created_at: string };

const CAL_COLS =
  "id, client_id, title, caption, script, platforms, date, time, status, kind, tag_color, script_name, script_path, video_name, video_path, video_type, cover_name, cover_path, approval_token, approval_history, approved_at";

function fmtDateBr(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function noticeRowToNotice(r: NoticeRow): Notice {
  return { id: r.id, title: r.title, message: r.message, date: fmtDateBr(r.created_at), read: r.read };
}
function reportRowToReport(r: ReportRow, folderName?: string): Report {
  return {
    id: r.id,
    name: r.title,
    period: folderName ?? "",
    date: fmtDateBr(r.created_at),
    highlights: [],
    summary: "",
    folder: folderName,
    fileName: r.pdf_name ?? undefined,
    fileDataUrl: r.pdf_path,
  };
}

export interface PortalDataValue {
  loading: boolean;
  error: string | null;
  calendar: CalendarContent[];
  notices: Notice[];
  reports: Report[];
  refresh: () => Promise<void>;
  toggleNoticeRead: (id: string, read: boolean) => Promise<void>;
  markAllNoticesRead: () => Promise<void>;
}

const Ctx = createContext<PortalDataValue | null>(null);

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const { session } = usePortalAuth();
  const clientId = session?.userId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<CalendarContent[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const foldersRef = useRef<FolderRow[]>([]);

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const [calRes, notRes, folRes, repRes] = await Promise.all([
        supabase.from("calendar_items").select(CAL_COLS).eq("client_id", clientId).order("date", { ascending: false }),
        supabase.from("notices").select("id, client_id, title, message, read, created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
        supabase.from("report_folders").select("id, client_id, name, created_at").eq("client_id", clientId),
        supabase.from("reports").select("id, client_id, title, pdf_name, pdf_path, folder_id, created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
      ]);
      if (calRes.error) throw calRes.error;
      if (notRes.error) throw notRes.error;
      if (folRes.error) throw folRes.error;
      if (repRes.error) throw repRes.error;
      foldersRef.current = (folRes.data ?? []) as FolderRow[];
      const folderById = new Map(foldersRef.current.map((f) => [f.id, f]));
      setCalendar(((calRes.data ?? []) as CalRow[]).map(calRowToContent));
      setNotices(((notRes.data ?? []) as NoticeRow[]).map(noticeRowToNotice));
      setReports(
        ((repRes.data ?? []) as ReportRow[]).map((r) =>
          reportRowToReport(r, r.folder_id ? folderById.get(r.folder_id)?.name : undefined),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { void load(); }, [load]);

  // Realtime — scoped to this client's rows
  useEffect(() => {
    if (!clientId) return;
    const filter = `client_id=eq.${clientId}`;
    const channel = supabase
      .channel(`portal:${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_items", filter }, (payload) => {
        setCalendar((prev) => applyChange(prev, payload, (r) => calRowToContent(r as CalRow)));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notices", filter }, (payload) => {
        setNotices((prev) => applyChange(prev, payload, (r) => noticeRowToNotice(r as NoticeRow)));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter }, (payload) => {
        setReports((prev) => {
          const folderById = new Map(foldersRef.current.map((f) => [f.id, f]));
          return applyChange(prev, payload, (r) => {
            const row = r as ReportRow;
            return reportRowToReport(row, row.folder_id ? folderById.get(row.folder_id)?.name : undefined);
          });
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "report_folders", filter }, (payload) => {
        const rec = (payload.new ?? payload.old) as FolderRow | undefined;
        if (!rec?.id) return;
        if (payload.eventType === "DELETE") {
          foldersRef.current = foldersRef.current.filter((f) => f.id !== rec.id);
        } else {
          foldersRef.current = [...foldersRef.current.filter((f) => f.id !== rec.id), payload.new as FolderRow];
        }
        // Re-derive folder names on existing reports
        setReports((prev) => prev.map((r) => ({ ...r }))); // trigger effect consumers; folder name may not change often
        void load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, load]);

  const toggleNoticeRead = useCallback<PortalDataValue["toggleNoticeRead"]>(async (id, read) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
    const { error } = await supabase.from("notices").update({ read }).eq("id", id);
    if (error) {
      // rollback
      setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, read: !read } : n)));
      throw new Error(error.message);
    }
  }, []);

  const markAllNoticesRead = useCallback(async () => {
    if (!clientId) return;
    const targets = notices.filter((n) => !n.read).map((n) => n.id);
    if (targets.length === 0) return;
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
    const { error } = await supabase
      .from("notices")
      .update({ read: true })
      .in("id", targets);
    if (error) throw new Error(error.message);
  }, [clientId, notices]);

  const value = useMemo<PortalDataValue>(
    () => ({ loading, error, calendar, notices, reports, refresh: load, toggleNoticeRead, markAllNoticesRead }),
    [loading, error, calendar, notices, reports, load, toggleNoticeRead, markAllNoticesRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortalData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortalData must be used inside PortalDataProvider");
  return ctx;
}

type PgPayload = { eventType: "INSERT" | "UPDATE" | "DELETE"; new: unknown; old: unknown };
function applyChange<T extends { id: string }>(prev: T[], payload: PgPayload, map: (row: unknown) => T): T[] {
  const rec = (payload.new ?? payload.old) as { id?: string } | undefined;
  if (!rec?.id) return prev;
  if (payload.eventType === "DELETE") return prev.filter((x) => x.id !== rec.id);
  const mapped = map(payload.new);
  const idx = prev.findIndex((x) => x.id === rec.id);
  if (idx === -1) return [mapped, ...prev];
  const next = prev.slice();
  next[idx] = mapped;
  return next;
}
