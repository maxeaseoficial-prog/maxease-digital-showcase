// Direct XHR upload to Supabase Storage's REST endpoint so we get real
// progress events and a working AbortSignal — the JS SDK's upload() does
// not expose progress. RLS on storage.objects gates the write:
// "admin all buckets insert" allows any authenticated admin to write.
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_FOR, buildObjectPath, validateFile, type MediaKind } from "./media";

export interface UploadHandle {
  promise: Promise<{ bucket: "videos" | "thumbnails" | "pdfs"; path: string }>;
  cancel: () => void;
}

export interface UploadOptions {
  kind: MediaKind;
  clientId: string;
  file: File;
  onProgress?: (percent: number) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export function uploadMedia({ kind, clientId, file, onProgress }: UploadOptions): UploadHandle {
  const validationError = validateFile(kind, file);
  if (validationError) {
    return {
      promise: Promise.reject(new Error(validationError)),
      cancel: () => {},
    };
  }

  const bucket = BUCKET_FOR[kind];
  const path = buildObjectPath(clientId, kind, file);
  const xhr = new XMLHttpRequest();

  const promise = new Promise<{ bucket: typeof bucket; path: string }>((resolve, reject) => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        reject(new Error("Sessão expirada. Faça login novamente."));
        return;
      }

      const endpoint = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path).replace(/%2F/g, "/")}`;
      xhr.open("POST", endpoint, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader("cache-control", "3600");
      if (kind === "video") {
        xhr.setRequestHeader("content-type", "video/mp4");
      } else if (file.type) {
        xhr.setRequestHeader("content-type", file.type);
      }

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable || !onProgress) return;
        onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve({ bucket, path });
        } else {
          let msg = `Falha no upload (${xhr.status}).`;
          try {
            const parsed = JSON.parse(xhr.responseText) as { message?: string; error?: string };
            msg = parsed.message || parsed.error || msg;
          } catch { /* ignore */ }
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error("Erro de rede durante o upload."));
      xhr.onabort = () => reject(new Error("Upload cancelado."));
      xhr.send(file);
    })().catch(reject);
  });

  return { promise, cancel: () => { try { xhr.abort(); } catch { /* ignore */ } } };
}

// Best-effort cleanup used when an item creation aborts after some files
// were uploaded. Failures are swallowed — the scheduled purge job would
// catch orphans if we later track them.
export async function removeUploaded(
  bucket: "videos" | "thumbnails" | "pdfs",
  path: string,
): Promise<void> {
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch { /* ignore */ }
}
