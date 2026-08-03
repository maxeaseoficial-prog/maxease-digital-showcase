// Shared media constants and helpers for the admin/portal upload flows.
// Storage layout: bucket "videos" / "thumbnails" / "pdfs" hold the raw files;
// paths always start with the client_id so RLS ("client reads own files")
// authorizes signed reads for the owning cliente.

import { createSupabaseClient } from "@/lib/supabase-factory";

const supabase = createSupabaseClient('maxease-admin-auth');

export const MAX_VIDEO_BYTES = 1024 * 1024 * 1024; // 1 GB
export const MAX_COVER_BYTES = 10 * 1024 * 1024;   // 10 MB
export const MAX_PDF_BYTES   = 25 * 1024 * 1024;   // 25 MB

export const ACCEPT_VIDEO = ["video/mp4"];
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
      return VIDEO_COMPATIBILITY_USER_MESSAGE;
    }
    if (!isMp4Candidate(file)) {
      return VIDEO_COMPATIBILITY_USER_MESSAGE;
    }
    if (file.type && !ACCEPT_VIDEO.includes(file.type) && file.type !== "application/octet-stream") {
      return VIDEO_COMPATIBILITY_USER_MESSAGE;
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

const VIDEO_INCOMPATIBLE_MESSAGE = "Este vídeo não está em MP4 H.264 (AVC), que é o formato mais compatível com celulares. Exporte novamente como MP4 H.264 e reenvie.";
const VIDEO_UNKNOWN_CODEC_MESSAGE = "Não consegui confirmar que este MP4 está em H.264. Para evitar o problema de capa com áudio, exporte novamente como MP4 H.264 (AVC) e reenvie.";
const VIDEO_COMPATIBILITY_USER_MESSAGE = "O vídeo selecionado utiliza um codec que pode não funcionar em alguns dispositivos Android.\n\nPara garantir compatibilidade total, envie um vídeo exportado em MP4 (H.264 + AAC).";
const MP4_SCAN_BYTES = 8 * 1024 * 1024;
const MP4_MAX_MOOV_READ_BYTES = 32 * 1024 * 1024;

export type VideoCodec = "h264" | "hevc" | "av1" | "mpeg4" | "vp9" | "unknown";
export type AudioCodec = "aac" | "ac3" | "eac3" | "opus" | "mp3" | "unknown" | "none";

export interface VideoInspection {
  fileType: string;
  videoCodec: VideoCodec;
  audioCodec: AudioCodec;
  hasAudioTrack: boolean;
  compatible: boolean;
  message?: string;
}

function isMp4Candidate(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".mp4") || file.type === "video/mp4" || file.type === "application/octet-stream" || file.type === "";
}

function hasHevcMarker(text: string) {
  return /hvc1|hev1|hvcC|dvh1|dvhe/i.test(text);
}

function hasAvcMarker(text: string) {
  return /avc1|avc2|avc3|avc4|avcC/i.test(text);
}

function hasKnownUnsupportedMarker(text: string) {
  return /mp4v|av01|vp09/i.test(text);
}

function detectVideoCodec(text: string): VideoCodec {
  if (hasHevcMarker(text)) return "hevc";
  if (/av01/i.test(text)) return "av1";
  if (/vp09/i.test(text)) return "vp9";
  if (/mp4v/i.test(text)) return "mpeg4";
  if (hasAvcMarker(text)) return "h264";
  return "unknown";
}

function detectAudioCodec(text: string, hasAudioTrack: boolean): AudioCodec {
  if (!hasAudioTrack) return "none";
  if (/mp4a|aac|esds/i.test(text)) return "aac";
  if (/ec-3/i.test(text)) return "eac3";
  if (/ac-3/i.test(text)) return "ac3";
  if (/Opus/i.test(text)) return "opus";
  if (/.mp3/i.test(text)) return "mp3";
  return "unknown";
}

async function readFileText(file: File, start: number, length: number): Promise<string> {
  const safeStart = Math.max(0, Math.min(start, file.size));
  const safeEnd = Math.max(safeStart, Math.min(safeStart + length, file.size));
  const buf = await file.slice(safeStart, safeEnd).arrayBuffer();
  return new TextDecoder("latin1").decode(buf);
}

async function readBoxHeader(file: File, offset: number): Promise<{ type: string; size: number } | null> {
  if (offset + 8 > file.size) return null;
  const buf = await file.slice(offset, Math.min(offset + 16, file.size)).arrayBuffer();
  if (buf.byteLength < 8) return null;
  const view = new DataView(buf);
  const smallSize = view.getUint32(0);
  const type = String.fromCharCode(
    view.getUint8(4),
    view.getUint8(5),
    view.getUint8(6),
    view.getUint8(7),
  );
  if (smallSize === 1) {
    if (buf.byteLength < 16) return null;
    const high = view.getUint32(8);
    const low = view.getUint32(12);
    return { type, size: high * 2 ** 32 + low };
  }
  if (smallSize === 0) return { type, size: file.size - offset };
  return { type, size: smallSize };
}

async function readMp4CodecText(file: File): Promise<string> {
  let offset = 0;
  let boxesRead = 0;
  while (offset + 8 < file.size && boxesRead < 80) {
    boxesRead += 1;
    const box = await readBoxHeader(file, offset);
    if (!box || box.size < 8) break;
    if (box.type === "moov") {
      const readable = Math.min(box.size, MP4_MAX_MOOV_READ_BYTES);
      const head = await readFileText(file, offset, readable);
      if (box.size > readable) {
        const tailStart = offset + box.size - MP4_SCAN_BYTES;
        return `${head}\n${await readFileText(file, tailStart, MP4_SCAN_BYTES)}`;
      }
      return head;
    }
    offset += box.size;
  }

  const head = await readFileText(file, 0, MP4_SCAN_BYTES);
  const tail = file.size > MP4_SCAN_BYTES
    ? await readFileText(file, file.size - MP4_SCAN_BYTES, MP4_SCAN_BYTES)
    : "";
  return `${head}\n${tail}`;
}

// Detects the actual MP4 codec before upload. Older Android/iOS devices need
// H.264/AVC; HEVC/H.265 often plays as poster/cover + audio only.
export async function inspectVideoFile(file: File): Promise<VideoInspection> {
  const validationError = validateFile("video", file);
  if (validationError) {
    return {
      fileType: file.type || "desconhecido",
      videoCodec: "unknown",
      audioCodec: "unknown",
      hasAudioTrack: false,
      compatible: false,
      message: validationError,
    };
  }

  try {
    const codecText = await readMp4CodecText(file);
    const videoCodec = detectVideoCodec(codecText);
    const hasAudioTrack = /soun/i.test(codecText);
    const audioCodec = detectAudioCodec(codecText, hasAudioTrack);
    const audioCompatible = audioCodec === "aac" || audioCodec === "none";
    const compatible = videoCodec === "h264" && audioCompatible;

    return {
      fileType: file.type || "video/mp4",
      videoCodec,
      audioCodec,
      hasAudioTrack,
      compatible,
      message: compatible ? undefined : VIDEO_COMPATIBILITY_USER_MESSAGE,
    };
  } catch {
    return {
      fileType: file.type || "desconhecido",
      videoCodec: "unknown",
      audioCodec: "unknown",
      hasAudioTrack: false,
      compatible: false,
      message: VIDEO_UNKNOWN_CODEC_MESSAGE,
    };
  }
}

export async function probeVideoCompatibility(file: File): Promise<string | null> {
  if (file.type && !file.type.startsWith("video/") && file.type !== "application/octet-stream") return null;
  const inspection = await inspectVideoFile(file);
  if (inspection.compatible) return null;
  if (["hevc", "av1", "mpeg4", "vp9"].includes(inspection.videoCodec)) return VIDEO_INCOMPATIBLE_MESSAGE;
  return inspection.message ?? VIDEO_UNKNOWN_CODEC_MESSAGE;
}

export function extFor(file: File, kind: MediaKind): string {
  const fromName = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  if (kind === "video") return "mp4";
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
