// Shared media constants and helpers for the admin/portal upload flows.
// Storage layout: bucket "videos" / "thumbnails" / "pdfs" hold the raw files;
// paths always start with the client_id so RLS ("client reads own files")
// authorizes signed reads for the owning cliente.

import { supabase } from "@/integrations/supabase/client";

export const MAX_VIDEO_BYTES = 1024 * 1024 * 1024; // 1 GB
export const MAX_COVER_BYTES = 10 * 1024 * 1024;   // 10 MB
export const MAX_PDF_BYTES   = 25 * 1024 * 1024;   // 25 MB

export const ACCEPT_VIDEO = ["video/mp4", "video/webm"];
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
    const name = file.name.toLowerCase();
    // Reject .mov / quicktime up front: iPhone MOV files are usually HEVC,
    // which is not supported by Android/older devices — audio plays but the
    // video stays black. Force uploaders to export as MP4 (H.264).
    if (file.type === "video/quicktime" || name.endsWith(".mov")) {
      return "Formato .MOV não é compatível com todos os celulares. Exporte o vídeo como MP4 (H.264) e envie novamente.";
    }
    if (!ACCEPT_VIDEO.includes(file.type)) {
      return "Formato de vídeo não suportado. Envie MP4 (H.264) ou WEBM.";
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

// Probes the first ~1 MB of an MP4 to detect HEVC (hvc1/hev1) codec, which
// many Android devices decode as audio-only. Returns an error message when
// the file is HEVC, or null when it's safe (H.264/AVC or unknown box).
export async function probeVideoCompatibility(file: File): Promise<string | null> {
  if (!file.type.startsWith("video/")) return null;
  try {
    const slice = file.slice(0, 1024 * 1024);
    const buf = new Uint8Array(await slice.arrayBuffer());
    const text = new TextDecoder("latin1").decode(buf);
    if (/hvc1|hev1|hvcC/.test(text)) {
      return "Este vídeo está em HEVC (H.265) e não abre em vários celulares. Exporte como MP4 H.264 (AVC) e envie novamente.";
    }
    return null;
  } catch {
    return null;
  }
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
