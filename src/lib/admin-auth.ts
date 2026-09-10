/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_ROLE = "admin";
const ADMIN_SESSION_COOKIE = "maxease_admin_session";

export type AdminSessionCookie = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email?: string | null;
  expires_at?: number | null;
};

export const bootstrapAdminSchema = z
  .object({
    email: z.string().trim().email("E-mail inválido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(8, "A confirmação da senha deve ter pelo menos 8 caracteres."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export const loginAdminSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

const getServerCookieApi = createServerOnlyFn(async () => {
  const mod = await import("@tanstack/react-start/server");
  return mod;
});

const readAdminSessionCookie = createServerOnlyFn(async (): Promise<AdminSessionCookie | null> => {
  const { getCookie } = await getServerCookieApi();
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
});

const writeAdminSessionCookie = createServerOnlyFn(async (session: AdminSessionCookie) => {
  const { setCookie, getRequestHeader, getRequestUrl } = await getServerCookieApi();

  // Browsers drop a `Secure` cookie over http (local/dev) and drop a `Lax`
  // cookie when the app is rendered inside the editor preview iframe.
  let isHttps = true;
  try {
    const forwardedProto = getRequestHeader("x-forwarded-proto");
    if (forwardedProto) {
      isHttps = forwardedProto.split(",")[0].trim() === "https";
    } else {
      isHttps = getRequestUrl().protocol !== "http:";
    }
  } catch {
    isHttps = true;
  }

  setCookie(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? "none" : "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
});

const clearAdminSessionCookie = createServerOnlyFn(async () => {
  const { deleteCookie } = await getServerCookieApi();
  deleteCookie(ADMIN_SESSION_COOKIE, {
    path: "/",
  });
});

export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

export async function adminExists() {
  const supabase = getSupabasePublicClient();
  const { data, error } = await (supabase as any).rpc("admin_exists");

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
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

export const getCurrentAdminUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await readAdminSessionCookie();
  if (!session) {
    return null;
  }

  const supabase = getSupabaseClientWithToken(session.access_token);
  const { data, error } = await supabase.auth.getUser(session.access_token);

  if (error || !data.user) {
    await clearAdminSessionCookie();
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roleData, error: roleError } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", ADMIN_ROLE)
    .maybeSingle();

  if (roleError || !roleData) {
    await clearAdminSessionCookie();
    return null;
  }

  return {
    ...data.user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
});

export const requireAdminAccess = createServerFn({ method: "GET" }).handler(async () => {
  const session = await readAdminSessionCookie();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await getCurrentAdminUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
});

export const getAdminBootstrapStatus = createServerFn({ method: "GET" }).handler(async () => {
  const currentUser = await getCurrentAdminUser();
  if (currentUser) {
    return {
      isBootstrapped: true,
      isAuthenticated: true,
      email: currentUser.email ?? null,
    };
  }

  const isBootstrapped = await adminExists();

  return {
    isBootstrapped,
    isAuthenticated: false,
    email: null,
  };
});

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .validator((data) => bootstrapAdminSchema.parse(data))
  .handler(async ({ data }) => {
    const currentUser = await getCurrentAdminUser();
    if (currentUser) {
      return { ok: true, isBootstrapped: true, email: currentUser.email ?? null };
    }

    const isBootstrapped = await adminExists();
    if (isBootstrapped) {
      return { ok: true, isBootstrapped: true, email: null };
    }

    const adminClient = getSupabaseServerAdminClient();

    const { count: adminCount, error: countError } = await (adminClient as any)
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", ADMIN_ROLE);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((adminCount ?? 0) > 0) {
      throw new Error("Já existe um administrador cadastrado. Faça login.");
    }

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: ADMIN_ROLE },
    });

    if (createError || !createdUser.user) {
      throw new Error(
        createError?.message?.toLowerCase().includes("already")
          ? "Este e-mail já está cadastrado."
          : "Não foi possível criar o administrador inicial.",
      );
    }

    const { error: roleError } = await (adminClient as any)
      .from("user_roles")
      .insert({ user_id: createdUser.user.id, role: ADMIN_ROLE });

    if (roleError) {
      await adminClient.auth.admin.deleteUser(createdUser.user.id);
      throw new Error("Não foi possível ativar o primeiro administrador.");
    }

    const loginClient = getSupabasePublicClient();
    const { data: sessionData, error: signInError } = await loginClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError || !sessionData.session) {
      throw new Error("Usuário ou senha inválidos.");
    }

    await writeAdminSessionCookie({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user_id: sessionData.user.id,
      email: sessionData.user.email,
      expires_at: sessionData.session.expires_at,
    });

    return {
      ok: true,
      isBootstrapped: true,
      email: sessionData.user.email ?? data.email,
    };
  });

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data) => loginAdminSchema.parse(data))
  .handler(async ({ data }) => {
    const client = getSupabasePublicClient();
    const { data: sessionData, error } = await client.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !sessionData.session || !sessionData.user) {
      throw new Error("Usuário ou senha inválidos.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: roleData, error: roleError } = await (client as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", sessionData.user.id)
      .eq("role", ADMIN_ROLE)
      .maybeSingle();

    if (roleError || !roleData) {
      await client.auth.signOut();
      throw new Error("Acesso administrativo indisponível.");
    }

    await writeAdminSessionCookie({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user_id: sessionData.user.id,
      email: sessionData.user.email,
      expires_at: sessionData.session.expires_at,
    });

    return { ok: true, email: sessionData.user.email ?? data.email };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await readAdminSessionCookie();
  if (session) {
    try {
      const client = getSupabaseClientWithToken(session.access_token);
      await client.auth.signOut();
    } catch {
      // no-op
    }
  }

  await clearAdminSessionCookie();
  return { ok: true };
});
