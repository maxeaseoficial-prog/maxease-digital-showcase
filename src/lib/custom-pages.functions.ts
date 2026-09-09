/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireAdminAccess,
  getSupabaseClientWithToken,
  getSupabasePublicClient,
  getSupabaseServerAdminClient,
} from "@/lib/admin-auth";

export const RESERVED_CUSTOM_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "assets",
  "sites",
  "silviometodopsv",
]);

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const pageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Informe o nome da página.").max(120),
  slug: z.string().trim().min(1, "Informe o slug da página."),
  active: z.boolean().default(true),
  desktopHtml: z.string().nullable().optional(),
  mobileHtml: z.string().nullable().optional(),
});

export function normalizeSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-]+|[-]+$/g, "")
    .replace(/\/+|\\+|\.{2,}/g, "")
    .replace(/[#?].*$/g, "");

  return slug;
}

export function assertValidPublicSlug(slug: string) {
  if (!slug || !slugRegex.test(slug)) {
    throw new Error("Slug inválido.");
  }

  if (RESERVED_CUSTOM_PAGE_SLUGS.has(slug)) {
    throw new Error("Este slug não está disponível.");
  }
}

async function ensureCustomPageStorageBucket(client: any) {
  const { data, error } = await client.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.some((bucket: { name: string }) => bucket.name === "custom-pages")) {
    const { error: createError } = await client.storage.createBucket("custom-pages", {
      public: false,
      allowedMimeTypes: ["text/html", "application/xhtml+xml"],
      fileSizeLimit: 2 * 1024 * 1024,
    });

    if (createError) {
      throw new Error(createError.message);
    }
  }
}

async function uploadHtmlVariant(
  client: any,
  pageId: string,
  variant: "desktop" | "mobile",
  html: string | null | undefined,
) {
  if (!html || !html.trim()) {
    return null;
  }

  const filePath = `${pageId}/${variant}.html`;
  const blob = new Blob([html], { type: "text/html; charset=utf-8" });
  const { error } = await client.storage.from("custom-pages").upload(filePath, blob, {
    contentType: "text/html; charset=utf-8",
    upsert: true,
  });

  if (error) {
    throw new Error(`Falha ao enviar o HTML ${variant}.`);
  }

  return filePath;
}

async function deleteHtmlVariants(client: any, pageId: string) {
  const { error } = await client.storage
    .from("custom-pages")
    .remove([`${pageId}/desktop.html`, `${pageId}/mobile.html`]);
  if (error) {
    throw new Error("Falha ao remover os arquivos armazenados da página.");
  }
}

async function readHtmlVariant(client: any, path: string | null) {
  if (!path) return null;

  const { data, error } = await client.storage.from("custom-pages").download(path);
  if (error || !data) {
    return null;
  }

  const text = await data.text();
  return text || null;
}

export const listCustomPages = createServerFn({ method: "GET" }).handler(async () => {
  const { accessToken } = await requireAdminAccess();
  const client = getSupabaseClientWithToken(accessToken);

  const { data, error } = await (client as any)
    .from("custom_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
});

export const getCustomPageById = createServerFn({ method: "GET" })
  .validator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { accessToken } = await requireAdminAccess();
    const client = getSupabaseClientWithToken(accessToken);

    const { data: page, error } = await (client as any)
      .from("custom_pages")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return page ?? null;
  });

export const createCustomPage = createServerFn({ method: "POST" })
  .validator((data) => pageSchema.parse(data))
  .handler(async ({ data }) => {
    const { accessToken } = await requireAdminAccess();
    const client = getSupabaseClientWithToken(accessToken);
    await ensureCustomPageStorageBucket(client);

    const slug = normalizeSlug(data.slug);
    if (!slug) {
      throw new Error("O slug informado é inválido.");
    }
    assertValidPublicSlug(slug);

    const { data: existing, error: existingError } = await (client as any)
      .from("custom_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      throw new Error("Já existe uma página com este slug.");
    }

    const pageId = crypto.randomUUID();
    const desktopFilePath = await uploadHtmlVariant(client, pageId, "desktop", data.desktopHtml);
    const mobileFilePath = await uploadHtmlVariant(client, pageId, "mobile", data.mobileHtml);

    const { data: page, error } = await (client as any)
      .from("custom_pages")
      .insert({
        id: pageId,
        name: data.name,
        slug,
        active: data.active ?? true,
        desktop_file_path: desktopFilePath,
        mobile_file_path: mobileFilePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      await deleteHtmlVariants(client, pageId);
      throw new Error(error.message);
    }

    return page;
  });

export const updateCustomPage = createServerFn({ method: "POST" })
  .validator((data) => pageSchema.parse(data))
  .handler(async ({ data }) => {
    if (!data.id) {
      throw new Error("Página inválida para edição.");
    }

    const { accessToken } = await requireAdminAccess();
    const client = getSupabaseClientWithToken(accessToken);
    await ensureCustomPageStorageBucket(client);

    const current = await (client as any)
      .from("custom_pages")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (!current.data) {
      throw new Error("Página não encontrada.");
    }

    const nextSlug = normalizeSlug(data.slug);
    if (!nextSlug) {
      throw new Error("O slug informado é inválido.");
    }
    assertValidPublicSlug(nextSlug);

    const { data: conflictingPage, error: conflictingError } = await (client as any)
      .from("custom_pages")
      .select("id")
      .eq("slug", nextSlug)
      .neq("id", data.id)
      .maybeSingle();

    if (conflictingError) {
      throw new Error(conflictingError.message);
    }

    if (conflictingPage) {
      throw new Error("Já existe uma página com este slug.");
    }

    const desktopFilePath =
      data.desktopHtml === undefined || data.desktopHtml === null
        ? current.data.desktop_file_path
        : await uploadHtmlVariant(client, data.id, "desktop", data.desktopHtml);

    const mobileFilePath =
      data.mobileHtml === undefined || data.mobileHtml === null
        ? current.data.mobile_file_path
        : await uploadHtmlVariant(client, data.id, "mobile", data.mobileHtml);

    const { data: updatedPage, error } = await (client as any)
      .from("custom_pages")
      .update({
        name: data.name,
        slug: nextSlug,
        active: data.active ?? true,
        desktop_file_path: desktopFilePath,
        mobile_file_path: mobileFilePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedPage;
  });

export const deleteCustomPage = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { accessToken } = await requireAdminAccess();
    const client = getSupabaseClientWithToken(accessToken);

    const { data: page, error: pageError } = await (client as any)
      .from("custom_pages")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (pageError) {
      throw new Error(pageError.message);
    }

    if (!page) {
      throw new Error("Página não encontrada.");
    }

    const { error: deleteError } = await (client as any)
      .from("custom_pages")
      .delete()
      .eq("id", data.id);
    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const storagePaths = [page.desktop_file_path, page.mobile_file_path].filter(
      Boolean,
    ) as string[];
    if (storagePaths.length > 0) {
      const { error: storageError } = await client.storage
        .from("custom-pages")
        .remove(storagePaths);
      if (storageError) {
        throw new Error(storageError.message);
      }
    }

    return { ok: true };
  });

export const toggleCustomPageStatus = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const { accessToken } = await requireAdminAccess();
    const client = getSupabaseClientWithToken(accessToken);

    const { data: page, error } = await (client as any)
      .from("custom_pages")
      .update({ active: data.active, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return page;
  });

export const getPublicCustomPageBySlug = createServerFn({ method: "GET" })
  .validator((data) => z.object({ slug: z.string().trim().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const slug = normalizeSlug(data.slug);
    if (!slug) {
      return null;
    }

    if (RESERVED_CUSTOM_PAGE_SLUGS.has(slug)) {
      return null;
    }

    const readClient = getSupabaseServerAdminClient();
    const { data: page, error } = await (readClient as any)
      .from("custom_pages")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error || !page) {
      return null;
    }

    const desktopHtml = await readHtmlVariant(readClient, page.desktop_file_path);
    const mobileHtml = await readHtmlVariant(readClient, page.mobile_file_path);

    return {
      ...page,
      desktopHtml,
      mobileHtml,
    };
  });
