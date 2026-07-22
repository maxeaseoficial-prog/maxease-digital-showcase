// Authenticated server functions for the Client Portal.
// The signed-in user must be the owner of the calendar item (auth.uid() == client_id).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function fmtStamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const clientDecideApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        itemId: z.string().uuid(),
        action: z.enum(["approved", "changes_requested"]),
        message: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("calendar_items")
      .select("id, client_id, status, approval_history, approved_at")
      .eq("id", data.itemId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Conteúdo não encontrado.");
    if (row.client_id !== userId) throw new Error("Sem permissão.");
    if (row.status === "Aprovado" || row.status === "Alteração solicitada") {
      return { ok: true as const, alreadyDecided: true };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stamp = fmtStamp();
    const history = Array.isArray(row.approval_history) ? row.approval_history : [];
    const entry = { at: stamp, action: data.action, message: data.message };
    const isApproved = data.action === "approved";
    const nowIso = new Date().toISOString();
    const purgeIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const patch = {
      status: isApproved ? "Aprovado" : "Alteração solicitada",
      approval_history: [...history, entry] as unknown as never,
      approved_at: isApproved ? nowIso : (row.approved_at ?? null),
      // Schedule automatic media purge 24h after approval. Change-requests keep files.
      files_purge_at: isApproved ? purgeIso : null,
    };
    const { error: uErr } = await supabaseAdmin
      .from("calendar_items")
      .update(patch)
      .eq("id", row.id);
    if (uErr) throw new Error(uErr.message);
    return { ok: true as const, alreadyDecided: false };
  });
