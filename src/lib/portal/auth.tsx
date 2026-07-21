import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "maxease.portal.session";

const DEMO_USER = {
  email: "teste@gmail.com",
  password: "teste123",
  name: "Academia For Action",
  company: "For Action",
};

export interface PortalSession {
  email: string;
  name: string;
  company: string;
}

interface AuthContextValue {
  session: PortalSession | null;
  hydrated: boolean;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PortalSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as PortalSession);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === DEMO_USER.email && password === DEMO_USER.password) {
      const next: PortalSession = { email: DEMO_USER.email, name: DEMO_USER.name, company: DEMO_USER.company };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setSession(next);
      return { ok: true as const };
    }
    return { ok: false as const, error: "E-mail ou senha inválidos. Verifique suas credenciais." };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, hydrated, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used inside PortalAuthProvider");
  return ctx;
}
