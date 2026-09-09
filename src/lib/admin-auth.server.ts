import { createClient } from "@supabase/supabase-js";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

export const ADMIN_SESSION_COOKIE = "maxease_admin_session";
export const ADMIN_ROLE = "admin";

export type AdminSessionCookie = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email?: string | null;
  expires_at?: number | null;
};

export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, publishableKey };
}

export function getSupabasePublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: undefined,
    },
  });
}

export function getSupabaseClientWithToken(accessToken: string) {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient(url, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: undefined,
    },
  });
}

export function getSupabaseServerAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service-role environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: undefined,
    },
  });
}

export function getAdminSessionCookie(): AdminSessionCookie | null {
  const raw = getCookie(ADMIN_SESSION_COOKIE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSessionCookie>;
    if (!parsed.access_token || !parsed.refresh_token || !parsed.user_id) {
      return null;
    }
    return {
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
      user_id: parsed.user_id,
      email: parsed.email ?? null,
      expires_at: parsed.expires_at ?? null,
    };
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(session: AdminSessionCookie) {
  setCookie(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSessionCookie() {
  deleteCookie(ADMIN_SESSION_COOKIE, {
    path: "/",
  });
}
