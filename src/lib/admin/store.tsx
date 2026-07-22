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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCreateClient,
  adminDeleteClient,
  adminUpdateClientAuth,
} from "./clients.functions";
import type {
  CalendarContent,
  Notice,
  Report,
  ApprovalHistoryEntry,
  Platform,
  CalendarKind,
  ContentStatus,
} from "@/lib/portal/mockData";

// ------------------ Public types (unchanged from prior version) ------------------

export interface SiteConfig {
  contact: {
    email: string;
    whatsapp: string;
    instagram: string;
    youtube: string;
  };
  hero: { title: string; subtitle: string };
}

export interface AdminClient {
  id: string;
  email: string;
  password: string; // ephemeral: not persisted; used only when admin changes it
  name: string;
  company: string;
  activeProject: string;
  avatarUrl?: string;
  createdAt: string;
  calendar: CalendarContent[];
  reports: Report[];
  notices: Notice[];
}

interface AdminData {
  site: SiteConfig;
  clients: AdminClient[];
}

const DEFAULT_SITE: SiteConfig = {
  contact: {
    email: "maxeaseoficial@gmail.com",
    whatsapp: "https://wa.me/5542988377640",
    instagram: "https://www.instagram.com/max.ease/",
    youtube: "https://www.youtube.com/@MaxEase",
  },
  hero: {
    title: "Criamos experiências digitais que fazem sua empresa crescer.",
    subtitle: "Sites profissionais, sistemas sob medida e produções audiovisuais premium.",
  },
};

// Legacy export retained for backward compatibility with older imports.
export const STORAGE_KEY = "maxease.admin.data.v1";

// ------------------ DB row → domain-model mappers ------------------

type CalRow = {
  id: string;
  client_id: string;
  title: string;
  caption: string | null;
  script: string | null;
  platforms: string[] | null;
  date: string;
  time: string | null;
  status: string;
  kind: string;
  tag_color: string | null;
  script_name: string | null;
  script_path: string | null;
  video_name: string | null;
  video_path: string | null;
  video_type: string | null;
  cover_name: string | null;
  cover_path: string | null;
  approval_token: string | null;
  approval_history: unknown;
  approved_at: string | null;
};

export function calRowToContent(r: CalRow): CalendarContent {
  return {
    id: r.id,
    title: r.title,
    caption: r.caption ?? "",
    script: r.script ?? "",
    platforms: (r.platforms ?? []) as Platform[],
    date: r.date,
    time: r.time ?? "",
    status: (r.status as ContentStatus) ?? "Planejado",
    kind: (r.kind as CalendarKind) ?? "Postagem",
    tagColor: r.tag_color ?? undefined,
    scriptFile: r.script_path ? { name: r.script_name ?? "roteiro.pdf", dataUrl: r.script_path } : undefined,
    videoFile: r.video_path
      ? { name: r.video_name ?? "video.mp4", dataUrl: r.video_path, type: r.video_type ?? undefined }
      : undefined,
    coverFile: r.cover_path ? { name: r.cover_name ?? "cover.jpg", dataUrl: r.cover_path } : undefined,
    approvalToken: r.approval_token ?? undefined,
    approvalHistory: (Array.isArray(r.approval_history) ? (r.approval_history as ApprovalHistoryEntry[]) : []),
    approvedAt: r.approved_at ?? undefined,
  };
}

function contentToCalInsert(c: Omit<CalendarContent, "id">, client_id: string) {
  return {
    client_id,
    title: c.title,
    caption: c.caption || null,
    script: c.script || null,
    platforms: c.platforms ?? [],
    date: c.date,
    time: c.time || null,
    status: c.status,
    kind: c.kind ?? "Postagem",
    tag_color: c.tagColor ?? null,
    script_name: c.scriptFile?.name ?? null,
    script_path: c.scriptFile?.dataUrl ?? null,
    video_name: c.videoFile?.name ?? null,
    video_path: c.videoFile?.dataUrl ?? null,
    video_type: c.videoFile?.type ?? null,
    cover_name: c.coverFile?.name ?? null,
    cover_path: c.coverFile?.dataUrl ?? null,
    approval_token: c.approvalToken ?? null,
    approval_history: (c.approvalHistory ?? []) as unknown as never,
    approved_at: c.approvedAt ?? null,
  };
}

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

function reportRowToReport(r: ReportRow, folderName?: string): Report {
  const d = new Date(r.created_at);
  const dateBr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return {
    id: r.id,
    name: r.title,
    period: folderName ?? "",
    date: dateBr,
    highlights: [],
    summary: "",
    folder: folderName,
    fileName: r.pdf_name ?? undefined,
    fileDataUrl: r.pdf_path,
  };
}

type NoticeRow = { id: string; client_id: string; title: string; message: string; read: boolean; created_at: string };

function noticeRowToNotice(r: NoticeRow): Notice {
  const d = new Date(r.created_at);
  const dateBr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return { id: r.id, title: r.title, message: r.message, date: dateBr, read: r.read };
}

type ClientRow = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  active_project: string | null;
  avatar_url: string | null;
  created_at: string;
};

function clientRowToAdminClient(c: ClientRow): AdminClient {
  return {
    id: c.id,
    email: c.email,
    password: "",
    name: c.name,
    company: c.company ?? "",
    activeProject: c.active_project ?? "",
    avatarUrl: c.avatar_url ?? undefined,
    createdAt: c.created_at,
    calendar: [],
    reports: [],
    notices: [],
  };
}

// ------------------ Public utilities (retained API) ------------------

export function findClientByCredentials(): AdminClient | null {
  // Legacy no-op: authentication is now handled by Supabase Auth.
  return null;
}

export async function findClientByEmail(email: string): Promise<AdminClient | null> {
  const { data } = await supabase
    .from("clients")
    .select("id, email, name, company, active_project, avatar_url, created_at")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return data ? clientRowToAdminClient(data as ClientRow) : null;
}

// Legacy: no longer used (approval flow is via server functions).
// Kept as a null-return stub so any lingering import does not crash builds.
export function findCalendarItemByToken(): null {
  return null;
}

export function submitApprovalDecision(): { ok: false } {
  return { ok: false };
}

// ------------------ Context ------------------

interface AdminStoreContextValue {
  data: AdminData;
  hydrated: boolean;
  updateSite: (patch: Partial<SiteConfig> | ((s: SiteConfig) => SiteConfig)) => Promise<void>;
  createClient: (input: {
    email: string;
    password: string;
    name: string;
    company: string;
    activeProject: string;
    avatarUrl?: string;
  }) => Promise<AdminClient>;
  updateClient: (id: string, patch: Partial<AdminClient>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addCalendarItem: (clientId: string, item: Omit<CalendarContent, "id">) => Promise<void>;
  updateCalendarItem: (
    clientId: string,
    itemId: string,
    patch: Partial<CalendarContent>,
  ) => Promise<void>;
  deleteCalendarItem: (clientId: string, itemId: string) => Promise<void>;
  addReport: (clientId: string, report: Omit<Report, "id">) => Promise<void>;
  deleteReport: (clientId: string, reportId: string) => Promise<void>;
  addNotice: (clientId: string, notice: Omit<Notice, "id" | "read">) => Promise<void>;
  deleteNotice: (clientId: string, noticeId: string) => Promise<void>;
}

const Ctx = createContext<AdminStoreContextValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData>({ site: DEFAULT_SITE, clients: [] });
  const [hydrated, setHydrated] = useState(false);
  const foldersRef = useRef<FolderRow[]>([]);

  // -------- initial hydration --------
  useEffect(() => {
    let alive = true;
    async function load() {
      const [siteRes, clientsRes, calRes, repRes, folRes, notRes] = await Promise.all([
        supabase.from("site_config").select("data").eq("id", 1).maybeSingle(),
        supabase.from("clients").select("id, email, name, company, active_project, avatar_url, created_at").order("created_at", { ascending: false }),
        supabase.from("calendar_items").select("id, client_id, title, caption, script, platforms, date, time, status, kind, tag_color, script_name, script_path, video_name, video_path, video_type, cover_name, cover_path, approval_token, approval_history, approved_at").order("date", { ascending: false }),
        supabase.from("reports").select("id, client_id, title, pdf_name, pdf_path, folder_id, created_at").order("created_at", { ascending: false }),
        supabase.from("report_folders").select("id, client_id, name, created_at"),
        supabase.from("notices").select("id, client_id, title, message, read, created_at").order("created_at", { ascending: false }),
      ]);
      if (!alive) return;

      const site: SiteConfig =
        siteRes.data && typeof siteRes.data.data === "object" && siteRes.data.data !== null
          ? mergeSite(DEFAULT_SITE, siteRes.data.data as Partial<SiteConfig>)
          : DEFAULT_SITE;

      const clients = ((clientsRes.data ?? []) as ClientRow[]).map(clientRowToAdminClient);
      const clientById = new Map(clients.map((c) => [c.id, c]));

      for (const row of (calRes.data ?? []) as CalRow[]) {
        clientById.get(row.client_id)?.calendar.push(calRowToContent(row));
      }
      foldersRef.current = (folRes.data ?? []) as FolderRow[];
      const folderById = new Map(foldersRef.current.map((f) => [f.id, f]));
      for (const row of (repRes.data ?? []) as ReportRow[]) {
        const folder = row.folder_id ? folderById.get(row.folder_id)?.name : undefined;
        clientById.get(row.client_id)?.reports.push(reportRowToReport(row, folder));
      }
      for (const row of (notRes.data ?? []) as NoticeRow[]) {
        clientById.get(row.client_id)?.notices.push(noticeRowToNotice(row));
      }

      setData({ site, clients });
      setHydrated(true);
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  // -------- realtime --------
  useEffect(() => {
    const channel = supabase
      .channel("admin-store")
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_items" }, (payload) => {
        setData((d) => applyCalendarChange(d, payload));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notices" }, (payload) => {
        setData((d) => applyNoticeChange(d, payload));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, (payload) => {
        setData((d) => applyReportChange(d, payload, foldersRef.current));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "report_folders" }, (payload) => {
        const rec = (payload.new ?? payload.old) as FolderRow | undefined;
        if (!rec) return;
        if (payload.eventType === "DELETE") {
          foldersRef.current = foldersRef.current.filter((f) => f.id !== rec.id);
        } else {
          const next = foldersRef.current.filter((f) => f.id !== rec.id);
          next.push(payload.new as FolderRow);
          foldersRef.current = next;
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, (payload) => {
        setData((d) => applyClientChange(d, payload));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "site_config" }, (payload) => {
        const row = payload.new as { data: Partial<SiteConfig> } | undefined;
        if (row?.data) setData((d) => ({ ...d, site: mergeSite(DEFAULT_SITE, row.data) }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -------- mutations --------

  const updateSite = useCallback<AdminStoreContextValue["updateSite"]>(async (patch) => {
    setData((d) => {
      const nextSite = typeof patch === "function" ? patch(d.site) : mergeSite(d.site, patch);
      // fire-and-forget persistence
      void supabase
        .from("site_config")
        .upsert({ id: 1, data: nextSite as unknown as never, updated_at: new Date().toISOString() });
      return { ...d, site: nextSite };
    });
  }, []);

  const createClient = useCallback<AdminStoreContextValue["createClient"]>(async (input) => {
    const res = await adminCreateClient({ data: input });
    const created: AdminClient = {
      id: res.id,
      email: input.email.trim().toLowerCase(),
      password: "",
      name: input.name,
      company: input.company,
      activeProject: input.activeProject,
      avatarUrl: input.avatarUrl,
      createdAt: new Date().toISOString(),
      calendar: [],
      reports: [],
      notices: [],
    };
    setData((d) => ({ ...d, clients: [created, ...d.clients] }));
    return created;
  }, []);

  const updateClient = useCallback<AdminStoreContextValue["updateClient"]>(async (id, patch) => {
    // Split: auth-side (email/password) via server fn; profile-side directly.
    if (patch.email !== undefined || (patch.password && patch.password.length > 0)) {
      await adminUpdateClientAuth({
        data: {
          clientId: id,
          email: patch.email,
          password: patch.password && patch.password.length > 0 ? patch.password : undefined,
        },
      });
    }
    const profile: Record<string, unknown> = {};
    if (patch.name !== undefined) profile.name = patch.name;
    if (patch.company !== undefined) profile.company = patch.company;
    if (patch.activeProject !== undefined) profile.active_project = patch.activeProject;
    if (patch.avatarUrl !== undefined) profile.avatar_url = patch.avatarUrl ?? null;
    if (Object.keys(profile).length > 0) {
      const { error } = await supabase.from("clients").update(profile as never).eq("id", id);
      if (error) throw new Error(error.message);
    }
    // Optimistic local update
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch, password: "" } : c)),
    }));
  }, []);

  const deleteClient = useCallback<AdminStoreContextValue["deleteClient"]>(async (id) => {
    await adminDeleteClient({ data: { clientId: id } });
    setData((d) => ({ ...d, clients: d.clients.filter((c) => c.id !== id) }));
  }, []);

  const addCalendarItem = useCallback<AdminStoreContextValue["addCalendarItem"]>(async (clientId, item) => {
    const { data: inserted, error } = await supabase
      .from("calendar_items")
      .insert(contentToCalInsert(item, clientId))
      .select("id, client_id, title, caption, script, platforms, date, time, status, kind, tag_color, script_name, script_path, video_name, video_path, video_type, cover_name, cover_path, approval_token, approval_history, approved_at")
      .single();
    if (error) throw new Error(error.message);
    const content = calRowToContent(inserted as CalRow);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) =>
        c.id === clientId ? { ...c, calendar: [content, ...c.calendar] } : c,
      ),
    }));
  }, []);

  const updateCalendarItem = useCallback<AdminStoreContextValue["updateCalendarItem"]>(async (clientId, itemId, patch) => {
    const upd: Record<string, unknown> = {};
    if (patch.title !== undefined) upd.title = patch.title;
    if (patch.caption !== undefined) upd.caption = patch.caption;
    if (patch.script !== undefined) upd.script = patch.script;
    if (patch.platforms !== undefined) upd.platforms = patch.platforms;
    if (patch.date !== undefined) upd.date = patch.date;
    if (patch.time !== undefined) upd.time = patch.time;
    if (patch.status !== undefined) upd.status = patch.status;
    if (patch.kind !== undefined) upd.kind = patch.kind;
    if (patch.tagColor !== undefined) upd.tag_color = patch.tagColor;
    if (patch.approvalToken !== undefined) upd.approval_token = patch.approvalToken;
    if (patch.approvalHistory !== undefined) upd.approval_history = patch.approvalHistory as unknown;
    if (patch.approvedAt !== undefined) upd.approved_at = patch.approvedAt;
    if (patch.scriptFile !== undefined) {
      upd.script_name = patch.scriptFile?.name ?? null;
      upd.script_path = patch.scriptFile?.dataUrl ?? null;
    }
    if (patch.videoFile !== undefined) {
      upd.video_name = patch.videoFile?.name ?? null;
      upd.video_path = patch.videoFile?.dataUrl ?? null;
      upd.video_type = patch.videoFile?.type ?? null;
    }
    if (patch.coverFile !== undefined) {
      upd.cover_name = patch.coverFile?.name ?? null;
      upd.cover_path = patch.coverFile?.dataUrl ?? null;
    }
    const { error } = await supabase.from("calendar_items").update(upd as never).eq("id", itemId);
    if (error) throw new Error(error.message);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) =>
        c.id !== clientId
          ? c
          : { ...c, calendar: c.calendar.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) },
      ),
    }));
  }, []);

  const deleteCalendarItem = useCallback<AdminStoreContextValue["deleteCalendarItem"]>(async (clientId, itemId) => {
    const { error } = await supabase.from("calendar_items").delete().eq("id", itemId);
    if (error) throw new Error(error.message);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) =>
        c.id !== clientId ? c : { ...c, calendar: c.calendar.filter((it) => it.id !== itemId) },
      ),
    }));
  }, []);

  const addReport = useCallback<AdminStoreContextValue["addReport"]>(async (clientId, report) => {
    // Resolve folder: use report.folder as folder name; create it if missing.
    let folderId: string | null = null;
    if (report.folder) {
      const existing = foldersRef.current.find(
        (f) => f.client_id === clientId && f.name.toLowerCase() === report.folder!.toLowerCase(),
      );
      if (existing) folderId = existing.id;
      else {
        const { data: fol, error: fErr } = await supabase
          .from("report_folders")
          .insert({ client_id: clientId, name: report.folder })
          .select("id, client_id, name, created_at")
          .single();
        if (fErr) throw new Error(fErr.message);
        folderId = fol!.id;
        foldersRef.current = [...foldersRef.current, fol as FolderRow];
      }
    }
    const { data: rep, error } = await supabase
      .from("reports")
      .insert({
        client_id: clientId,
        title: report.name,
        pdf_name: report.fileName ?? null,
        pdf_path: report.fileDataUrl ?? "",
        folder_id: folderId,
      })
      .select("id, client_id, title, pdf_name, pdf_path, folder_id, created_at")
      .single();
    if (error) throw new Error(error.message);
    const folderName = folderId ? foldersRef.current.find((f) => f.id === folderId)?.name : undefined;
    const mapped = reportRowToReport(rep as ReportRow, folderName);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) => (c.id === clientId ? { ...c, reports: [mapped, ...c.reports] } : c)),
    }));
  }, []);

  const deleteReport = useCallback<AdminStoreContextValue["deleteReport"]>(async (clientId, reportId) => {
    const { error } = await supabase.from("reports").delete().eq("id", reportId);
    if (error) throw new Error(error.message);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) =>
        c.id !== clientId ? c : { ...c, reports: c.reports.filter((r) => r.id !== reportId) },
      ),
    }));
  }, []);

  const addNotice = useCallback<AdminStoreContextValue["addNotice"]>(async (clientId, notice) => {
    const { data: inserted, error } = await supabase
      .from("notices")
      .insert({ client_id: clientId, title: notice.title, message: notice.message })
      .select("id, client_id, title, message, read, created_at")
      .single();
    if (error) throw new Error(error.message);
    const mapped = noticeRowToNotice(inserted as NoticeRow);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) => (c.id === clientId ? { ...c, notices: [mapped, ...c.notices] } : c)),
    }));
  }, []);

  const deleteNotice = useCallback<AdminStoreContextValue["deleteNotice"]>(async (clientId, noticeId) => {
    const { error } = await supabase.from("notices").delete().eq("id", noticeId);
    if (error) throw new Error(error.message);
    setData((d) => ({
      ...d,
      clients: d.clients.map((c) =>
        c.id !== clientId ? c : { ...c, notices: c.notices.filter((n) => n.id !== noticeId) },
      ),
    }));
  }, []);

  const value = useMemo<AdminStoreContextValue>(
    () => ({
      data,
      hydrated,
      updateSite,
      createClient,
      updateClient,
      deleteClient,
      addCalendarItem,
      updateCalendarItem,
      deleteCalendarItem,
      addReport,
      deleteReport,
      addNotice,
      deleteNotice,
    }),
    [
      data,
      hydrated,
      updateSite,
      createClient,
      updateClient,
      deleteClient,
      addCalendarItem,
      updateCalendarItem,
      deleteCalendarItem,
      addReport,
      deleteReport,
      addNotice,
      deleteNotice,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}

// ------------------ Helpers ------------------

function mergeSite(base: SiteConfig, patch: Partial<SiteConfig>): SiteConfig {
  return {
    contact: { ...base.contact, ...(patch.contact ?? {}) },
    hero: { ...base.hero, ...(patch.hero ?? {}) },
  };
}

type Payload<T> = { eventType: "INSERT" | "UPDATE" | "DELETE"; new: T | null; old: T | null };

function applyCalendarChange(d: AdminData, payload: Payload<CalRow>): AdminData {
  const row = (payload.new ?? payload.old) as CalRow | null;
  if (!row) return d;
  return {
    ...d,
    clients: d.clients.map((c) => {
      if (c.id !== row.client_id) return c;
      if (payload.eventType === "DELETE") {
        return { ...c, calendar: c.calendar.filter((it) => it.id !== row.id) };
      }
      const content = calRowToContent(payload.new as CalRow);
      const exists = c.calendar.some((it) => it.id === content.id);
      const next = exists
        ? c.calendar.map((it) => (it.id === content.id ? content : it))
        : [content, ...c.calendar];
      return { ...c, calendar: next };
    }),
  };
}

function applyNoticeChange(d: AdminData, payload: Payload<NoticeRow>): AdminData {
  const row = (payload.new ?? payload.old) as NoticeRow | null;
  if (!row) return d;
  return {
    ...d,
    clients: d.clients.map((c) => {
      if (c.id !== row.client_id) return c;
      if (payload.eventType === "DELETE") {
        return { ...c, notices: c.notices.filter((n) => n.id !== row.id) };
      }
      const mapped = noticeRowToNotice(payload.new as NoticeRow);
      const exists = c.notices.some((n) => n.id === mapped.id);
      return {
        ...c,
        notices: exists ? c.notices.map((n) => (n.id === mapped.id ? mapped : n)) : [mapped, ...c.notices],
      };
    }),
  };
}

function applyReportChange(d: AdminData, payload: Payload<ReportRow>, folders: FolderRow[]): AdminData {
  const row = (payload.new ?? payload.old) as ReportRow | null;
  if (!row) return d;
  return {
    ...d,
    clients: d.clients.map((c) => {
      if (c.id !== row.client_id) return c;
      if (payload.eventType === "DELETE") {
        return { ...c, reports: c.reports.filter((r) => r.id !== row.id) };
      }
      const folderName = row.folder_id ? folders.find((f) => f.id === row.folder_id)?.name : undefined;
      const mapped = reportRowToReport(payload.new as ReportRow, folderName);
      const exists = c.reports.some((r) => r.id === mapped.id);
      return {
        ...c,
        reports: exists ? c.reports.map((r) => (r.id === mapped.id ? mapped : r)) : [mapped, ...c.reports],
      };
    }),
  };
}

function applyClientChange(d: AdminData, payload: Payload<ClientRow>): AdminData {
  const row = (payload.new ?? payload.old) as ClientRow | null;
  if (!row) return d;
  if (payload.eventType === "DELETE") {
    return { ...d, clients: d.clients.filter((c) => c.id !== row.id) };
  }
  const mapped = clientRowToAdminClient(payload.new as ClientRow);
  const exists = d.clients.some((c) => c.id === mapped.id);
  return {
    ...d,
    clients: exists
      ? d.clients.map((c) => (c.id === mapped.id ? { ...mapped, calendar: c.calendar, reports: c.reports, notices: c.notices } : c))
      : [mapped, ...d.clients],
  };
}
