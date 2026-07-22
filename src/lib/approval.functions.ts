// Public server functions for the approval-token flow (no auth).
// Uses the Supabase Admin client to bypass RLS safely, restricted by the
// unpredictable token in the URL.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function fmtStamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function isStoragePath(v: string | null | undefined): v is string {
  return !!v && !v.startsWith("data:") && !/^https?:\/\//i.test(v);
}

// Signed URLs are cheap to generate; 6h is enough to leave the page open
// without renewing while short enough to keep sharing pointless.
const READ_TTL_SECONDS = 60 * 60 * 6;

export const getApprovalByToken = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ token: z.string().min(8).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("calendar_items")
      .select(
        "id, client_id, title, caption, script, platforms, date, time, status, kind, tag_color, script_name, script_path, video_name, video_path, video_type, cover_name, cover_path, approval_token, approval_history, approved_at, files_purge_at, files_deleted_at",
      )
      .eq("approval_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { found: false as const };

    const [videoUrl, coverUrl, scriptUrl] = await Promise.all([
      isStoragePath(row.video_path)
        ? supabaseAdmin.storage.from("videos").createSignedUrl(row.video_path, READ_TTL_SECONDS).then((r) => r.data?.signedUrl ?? null)
        : Promise.resolve(row.video_path ?? null),
      isStoragePath(row.cover_path)
        ? supabaseAdmin.storage.from("thumbnails").createSignedUrl(row.cover_path, READ_TTL_SECONDS).then((r) => r.data?.signedUrl ?? null)
        : Promise.resolve(row.cover_path ?? null),
      isStoragePath(row.script_path)
        ? supabaseAdmin.storage.from("pdfs").createSignedUrl(row.script_path, READ_TTL_SECONDS).then((r) => r.data?.signedUrl ?? null)
        : Promise.resolve(row.script_path ?? null),
    ]);

    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("name, company")
      .eq("id", row.client_id)
      .maybeSingle();

    // Re-shape media fields so the existing render code (item.videoFile.dataUrl etc.)
    // works against signed URLs when the row already lost the raw paths.
    const item = {
      ...row,
      video_path: videoUrl,
      cover_path: coverUrl,
      script_path: scriptUrl,
    };

    return {
      found: true as const,
      item,
      client: client ?? { name: "", company: "" },
      filesDeleted: !!row.files_deleted_at,
    };
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
    const isApproved = data.action === "approved";
    const nowIso = new Date().toISOString();
    const purgeIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const patch = {
      status: isApproved ? "Aprovado" : "Alteração solicitada",
      approval_history: [...history, entry] as unknown as never,
      approved_at: isApproved ? nowIso : (row.approved_at ?? null),
      // Only schedule purge on approval; a change request keeps files.
      files_purge_at: isApproved ? purgeIso : null,
    };
    const { error: uErr } = await supabaseAdmin
      .from("calendar_items")
      .update(patch)
      .eq("id", row.id);
    if (uErr) throw new Error(uErr.message);
    return { ok: true as const, alreadyDecided: false };
  });
