import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { adminSupabase as supabase } from "@/integrations/supabase/client";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
}

interface AdminAuthContextValue {
  session: AdminSession | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AdminAuthContextValue | null>(null);

async function loadAdminSession(userId: string, email: string): Promise<AdminSession | null> {
  // Verify admin role
  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !role) return null;
  const { data: userRes } = await supabase.auth.getUser();
  const name =
    (userRes.user?.user_metadata?.name as string | undefined) ||
    email.split("@")[0] ||
    "Administrador";
  return { userId, email, name };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (u) {
        const adm = await loadAdminSession(u.id, u.email ?? "");
        if (mounted) setSession(adm);
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
        const adm = await loadAdminSession(s.user.id, s.user.email ?? "");
        setSession(adm);
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
      return { ok: false as const, error: "Credenciais de administrador inválidas." };
    }
    const adm = await loadAdminSession(data.user.id, data.user.email ?? normalized);
    if (!adm) {
      await supabase.auth.signOut();
      return { ok: false as const, error: "Este usuário não tem permissão de administrador." };
    }
    setSession(adm);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  return <Ctx.Provider value={{ session, hydrated, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
