import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PortalSession {
  userId: string;
  email: string;
  name: string;
  company: string;
}

interface AuthContextValue {
  session: PortalSession | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadClientSession(userId: string, email: string): Promise<PortalSession | null> {
  // Must have 'client' role and matching row in clients table
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "client")
    .maybeSingle();
  if (!role) return null;
  const { data: client } = await supabase
    .from("clients")
    .select("email, name, company")
    .eq("id", userId)
    .maybeSingle();
  if (!client) return null;
  return {
    userId,
    email: client.email ?? email,
    name: client.name ?? email,
    company: client.company ?? "",
  };
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PortalSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (u) {
        const s = await loadClientSession(u.id, u.email ?? "");
        if (mounted) setSession(s);
      }
      if (mounted) setHydrated(true);
    }
    hydrate();
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        return;
      }
      if (s?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        const next = await loadClientSession(s.user.id, s.user.email ?? "");
        setSession(next);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalized, password });
    if (error || !data.user) {
      return { ok: false as const, error: "E-mail ou senha inválidos. Verifique suas credenciais." };
    }
    const s = await loadClientSession(data.user.id, data.user.email ?? normalized);
    if (!s) {
      await supabase.auth.signOut();
      return { ok: false as const, error: "Este usuário não tem acesso à área do cliente." };
    }
    setSession(s);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
