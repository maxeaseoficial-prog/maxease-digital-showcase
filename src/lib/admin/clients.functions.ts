// Server functions for privileged client-management operations.
// Uses the Supabase Admin (service role) client to create/update/delete auth users.
// Callable only by an authenticated user with the 'admin' role.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin role required");
}

// Create a client: creates auth user, inserts into public.clients and user_roles.
export const adminCreateClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        company: z.string().min(1),
        activeProject: z.string().default(""),
        avatarUrl: z.string().optional(),
        tenantId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name, company: data.company },
    });
    if (cErr || !created.user) {
      throw new Error(cErr?.message ?? "Falha ao criar usuário.");
    }
    const uid = created.user.id;

    const { error: iErr } = await supabaseAdmin.from("clients").insert({
      id: uid,
      email,
      name: data.name,
      company: data.company,
      active_project: data.activeProject || null,
      avatar_url: data.avatarUrl ?? null,
      tenant_id: data.tenantId ?? null,
    });
    if (iErr) {
      await supabaseAdmin.auth.admin.deleteUser(uid).catch(() => {});
      throw new Error(iErr.message);
    }

    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: "client" })
      .throwOnError();

    return { id: uid };
  });

// Update auth email/password of an existing client. Admin-only.
export const adminUpdateClientAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        clientId: z.string().uuid(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { email?: string; password?: string } = {};
    if (data.email) patch.email = data.email.trim().toLowerCase();
    if (data.password) patch.password = data.password;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.clientId, patch);
    if (error) throw new Error(error.message);
    if (patch.email) {
      await supabaseAdmin.from("clients").update({ email: patch.email }).eq("id", data.clientId);
    }
    return { ok: true as const };
  });

// Delete a client (auth user + cascading rows).
export const adminDeleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ clientId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Best-effort cleanup of public rows (cascades from clients FK will handle most).
    await supabaseAdmin.from("clients").delete().eq("id", data.clientId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.clientId);
    if (error && !/not_found|User not found/i.test(error.message)) {
      throw new Error(error.message);
    }
    return { ok: true as const };
  });
