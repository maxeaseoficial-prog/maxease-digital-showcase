// Scheduled endpoint invoked by pg_cron every 15 min.
// Deletes the raw media files (video + cover) of calendar items that were
// approved more than 24 h ago, while keeping every metadata field (title,
// caption, status, history, dates) intact — exactly as specified in Push 3.
// Auth: the caller must present the project's anon key in the "apikey"
// header, matching the pattern documented for /api/public/* cron routes.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/purge-media")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;
        const provided = request.headers.get("apikey") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!publishable || !provided || provided !== publishable) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const nowIso = new Date().toISOString();

        const { data: expired, error: selErr } = await supabaseAdmin
          .from("calendar_items")
          .select("id, video_path, cover_path")
          .lte("files_purge_at", nowIso)
          .is("files_deleted_at", null);
        if (selErr) {
          return new Response(JSON.stringify({ error: selErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const rows = expired ?? [];
        const videoPaths: string[] = [];
        const coverPaths: string[] = [];
        for (const r of rows) {
          if (r.video_path && !r.video_path.startsWith("data:") && !/^https?:\/\//i.test(r.video_path)) {
            videoPaths.push(r.video_path);
          }
          if (r.cover_path && !r.cover_path.startsWith("data:") && !/^https?:\/\//i.test(r.cover_path)) {
            coverPaths.push(r.cover_path);
          }
        }

        const errors: string[] = [];
        if (videoPaths.length) {
          const { error } = await supabaseAdmin.storage.from("videos").remove(videoPaths);
          if (error) errors.push(`videos: ${error.message}`);
        }
        if (coverPaths.length) {
          const { error } = await supabaseAdmin.storage.from("thumbnails").remove(coverPaths);
          if (error) errors.push(`thumbnails: ${error.message}`);
        }

        if (rows.length) {
          // Clear only the media pointers — everything else (title, caption,
          // status, history, dates, approval token, script/PDF) is preserved.
          const ids = rows.map((r) => r.id);
          const { error: updErr } = await supabaseAdmin
            .from("calendar_items")
            .update({
              video_path: null,
              video_name: null,
              video_type: null,
              cover_path: null,
              cover_name: null,
              files_deleted_at: nowIso,
            })
            .in("id", ids);
          if (updErr) errors.push(`update: ${updErr.message}`);
        }

        return new Response(
          JSON.stringify({ purged: rows.length, errors: errors.length ? errors : undefined }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
