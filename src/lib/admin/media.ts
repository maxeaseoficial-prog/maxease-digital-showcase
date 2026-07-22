// Shared media constants and helpers for the admin/portal upload flows.
// Storage layout: bucket "videos" / "thumbnails" / "pdfs" hold the raw files;
// paths always start with the client_id so RLS ("client reads own files")
// authorizes signed reads for the owning cliente.

import { supabase } from "@/integrations/supabase/client";

export const MAX_VIDEO_BYTES = 1024 * 1024 * 1024; // 1 GB
export const MAX_COVER_BYTES = 10 * 1024 * 1024;   // 10 MB
export const MAX_PDF_BYTES   = 25 * 1024 * 1024;   // 25 MB

export const ACCEPT_VIDEO = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];
export const ACCEPT_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
export const ACCEPT_PDF   = ["application/pdf"];

export type MediaKind = "video" | "cover" | "pdf";

export const BUCKET_FOR: Record<MediaKind, "videos" | "thumbnails" | "pdfs"> = {
  video: "videos",
  cover: "thumbnails",
  pdf: "pdfs",
};

export function validateFile(kind: MediaKind, file: File): string | null {
  if (kind === "video") {
    if (!ACCEPT_VIDEO.includes(file.type) && !file.type.startsWith("video/")) {
      return "Formato de vídeo não suportado. Use MP4, MOV ou WEBM.";
    }
    if (file.size > MAX_VIDEO_BYTES) return "Vídeo excede o limite de 1 GB.";
  } else if (kind === "cover") {
    if (!ACCEPT_IMAGE.includes(file.type)) return "Formato de capa inválido. Use JPG, PNG ou WEBP.";
    if (file.size > MAX_COVER_BYTES) return "Capa excede o limite de 10 MB.";
  } else if (kind === "pdf") {
    if (!ACCEPT_PDF.includes(file.type)) return "Arquivo inválido. Envie um PDF.";
    if (file.size > MAX_PDF_BYTES) return "PDF excede o limite de 25 MB.";
  }
  return null;
}

export function extFor(file: File, kind: MediaKind): string {
  const fromName = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  if (kind === "video") return file.type === "video/quicktime" ? "mov" : "mp4";
  if (kind === "cover") return file.type === "image/png" ? "png" : "jpg";
  return "pdf";
}

export function buildObjectPath(clientId: string, kind: MediaKind, file: File): string {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${clientId}/${uuid}.${extFor(file, kind)}`;
}

// A path is a stored Storage path when it is not a data: URL and not an
// absolute http(s) URL. Legacy items still hold data URLs — we pass those
// through unchanged.
export function isStoragePath(value: string | undefined | null): value is string {
  if (!value) return false;
  return !value.startsWith("data:") && !/^https?:\/\//i.test(value);
}

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Returns a browser-usable URL for a stored file. For data: / http(s) URLs
// (legacy content) it returns the value as-is. Signed URLs are cached client
// side until 60 s before expiry, then automatically refreshed on next call.
export async function resolveMediaUrl(
  bucket: "videos" | "thumbnails" | "pdfs",
  pathOrUrl: string,
  ttlSeconds = 3600,
): Promise<string> {
  if (!isStoragePath(pathOrUrl)) return pathOrUrl;
  const cacheKey = `${bucket}:${pathOrUrl}`;
  const cached = signedUrlCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt - 60_000 > now) return cached.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, ttlSeconds);
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "Falha ao gerar URL do arquivo.");
  signedUrlCache.set(cacheKey, { url: data.signedUrl, expiresAt: now + ttlSeconds * 1000 });
  return data.signedUrl;
}
