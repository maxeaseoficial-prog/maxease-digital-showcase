// Public server functions for the approval-token flow (no auth).
// Uses the Supabase Admin client to bypass RLS safely, restricted by the token in URL.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function fmtStamp(d = new Date()) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const getApprovalByToken = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: z.string().min(8).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("calendar_items")
      .select(
        "id, client_id, title, caption, script, platforms, date, time, status, kind, tag_color, script_name, script_path, video_name, video_path, video_type, cover_name, cover_path, approval_token, approval_history, approved_at",
      )
      .eq("approval_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { found: false as const };
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("name, company")
      .eq("id", row.client_id)
      .maybeSingle();
    return { found: true as const, item: row, client: client ?? { name: "", company: "" } };
  });

export const submitApproval = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().min(8).max(80),
        action: z.enum(["approved", "changes_requested"]),
        message: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("calendar_items")
      .select("id, status, approval_history, approved_at")
      .eq("approval_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Token inválido.");
    if (row.status === "Aprovado" || row.status === "Alteração solicitada") {
      return { ok: true as const, alreadyDecided: true };
    }
    const stamp = fmtStamp();
    const history = Array.isArray(row.approval_history) ? row.approval_history : [];
    const entry = { at: stamp, action: data.action, message: data.message };
    const patch: Record<string, unknown> = {
      status: data.action === "approved" ? "Aprovado" : "Alteração solicitada",
      approval_history: [...history, entry],
    };
    if (data.action === "approved") patch.approved_at = new Date().toISOString();
    const { error: uErr } = await supabaseAdmin
      .from("calendar_items")
      .update(patch)
      .eq("id", row.id);
    if (uErr) throw new Error(uErr.message);
    return { ok: true as const, alreadyDecided: false };
  });
