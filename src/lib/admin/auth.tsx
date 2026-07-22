import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "maxease.admin.session";

// Hardcoded admin credentials (frontend-only mock).
const ADMIN_EMAIL = "maxeaseoficial@gmail.com";
const ADMIN_PASSWORD = "maxease@2026";
const ADMIN_NAME = "Henrique Castro";

export interface AdminSession {
  email: string;
  name: string;
}

interface AdminAuthContextValue {
  session: AdminSession | null;
  hydrated: boolean;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const Ctx = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as AdminSession);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const next: AdminSession = { email: ADMIN_EMAIL, name: ADMIN_NAME };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setSession(next);
      return { ok: true as const };
    }
    return { ok: false as const, error: "Credenciais de administrador inválidas." };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSession(null);
  }, []);

  return <Ctx.Provider value={{ session, hydrated, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
