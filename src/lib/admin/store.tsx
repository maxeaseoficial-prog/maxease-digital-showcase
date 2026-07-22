import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CalendarContent, Notice, Report } from "@/lib/portal/mockData";

const STORAGE_KEY = "maxease.admin.data.v1";

export interface SiteConfig {
  contact: {
    email: string;
    whatsapp: string;
    instagram: string;
    youtube: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
}

export interface AdminClient {
  id: string;
  email: string;
  password: string;
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

const DEFAULT_DATA: AdminData = {
  site: {
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
  },
  clients: [],
};

function readStorage(): AdminData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<AdminData>;
    return {
      site: { ...DEFAULT_DATA.site, ...(parsed.site ?? {}), contact: { ...DEFAULT_DATA.site.contact, ...(parsed.site?.contact ?? {}) }, hero: { ...DEFAULT_DATA.site.hero, ...(parsed.site?.hero ?? {}) } },
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function writeStorage(data: AdminData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function findClientByCredentials(email: string, password: string): AdminClient | null {
  if (typeof window === "undefined") return null;
  const data = readStorage();
  const normalized = email.trim().toLowerCase();
  return data.clients.find((c) => c.email.toLowerCase() === normalized && c.password === password) ?? null;
}

export function findClientByEmail(email: string): AdminClient | null {
  if (typeof window === "undefined") return null;
  const data = readStorage();
  const normalized = email.trim().toLowerCase();
  return data.clients.find((c) => c.email.toLowerCase() === normalized) ?? null;
}

interface AdminStoreContextValue {
  data: AdminData;
  hydrated: boolean;
  updateSite: (patch: Partial<SiteConfig> | ((s: SiteConfig) => SiteConfig)) => void;
  createClient: (input: Omit<AdminClient, "id" | "createdAt" | "calendar" | "reports" | "notices"> & Partial<Pick<AdminClient, "calendar" | "reports" | "notices">>) => AdminClient;
  updateClient: (id: string, patch: Partial<AdminClient>) => void;
  deleteClient: (id: string) => void;
  addCalendarItem: (clientId: string, item: Omit<CalendarContent, "id">) => void;
  updateCalendarItem: (clientId: string, itemId: string, patch: Partial<CalendarContent>) => void;
  deleteCalendarItem: (clientId: string, itemId: string) => void;
  addReport: (clientId: string, report: Omit<Report, "id">) => void;
  deleteReport: (clientId: string, reportId: string) => void;
  addNotice: (clientId: string, notice: Omit<Notice, "id" | "read">) => void;
  deleteNotice: (clientId: string, noticeId: string) => void;
}

const Ctx = createContext<AdminStoreContextValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData>(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(readStorage());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: AdminData) => {
    setData(next);
    writeStorage(next);
  }, []);

  const value = useMemo<AdminStoreContextValue>(() => ({
    data,
    hydrated,
    updateSite: (patch) => {
      persist({
        ...data,
        site: typeof patch === "function" ? patch(data.site) : { ...data.site, ...patch, contact: { ...data.site.contact, ...(patch.contact ?? {}) }, hero: { ...data.site.hero, ...(patch.hero ?? {}) } },
      });
    },
    createClient: (input) => {
      const id = `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const client: AdminClient = {
        id,
        createdAt: new Date().toISOString(),
        calendar: [],
        reports: [],
        notices: [],
        ...input,
      };
      persist({ ...data, clients: [...data.clients, client] });
      return client;
    },
    updateClient: (id, patch) => {
      persist({ ...data, clients: data.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
    },
    deleteClient: (id) => {
      persist({ ...data, clients: data.clients.filter((c) => c.id !== id) });
    },
    addCalendarItem: (clientId, item) => {
      const withId: CalendarContent = { ...item, id: `cal_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}` };
      persist({
        ...data,
        clients: data.clients.map((c) => (c.id === clientId ? { ...c, calendar: [...c.calendar, withId] } : c)),
      });
    },
    updateCalendarItem: (clientId, itemId, patch) => {
      persist({
        ...data,
        clients: data.clients.map((c) =>
          c.id === clientId ? { ...c, calendar: c.calendar.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) } : c,
        ),
      });
    },
    deleteCalendarItem: (clientId, itemId) => {
      persist({
        ...data,
        clients: data.clients.map((c) => (c.id === clientId ? { ...c, calendar: c.calendar.filter((it) => it.id !== itemId) } : c)),
      });
    },
    addReport: (clientId, report) => {
      const withId: Report = { ...report, id: `rep_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}` };
      persist({
        ...data,
        clients: data.clients.map((c) => (c.id === clientId ? { ...c, reports: [withId, ...c.reports] } : c)),
      });
    },
    deleteReport: (clientId, reportId) => {
      persist({
        ...data,
        clients: data.clients.map((c) => (c.id === clientId ? { ...c, reports: c.reports.filter((r) => r.id !== reportId) } : c)),
      });
    },
    addNotice: (clientId, notice) => {
      const withId: Notice = { ...notice, id: `not_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, read: false };
      persist({
        ...data,
        clients: data.clients.map((c) => (c.id === clientId ? { ...c, notices: [withId, ...c.notices] } : c)),
      });
    },
    deleteNotice: (clientId, noticeId) => {
      persist({
        ...data,
        clients: data.clients.map((c) => (c.id === clientId ? { ...c, notices: c.notices.filter((n) => n.id !== noticeId) } : c)),
      });
    },
  }), [data, hydrated, persist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}
