import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { type FormEvent, useMemo, useState } from "react";
import { Copy, FileText, Loader2, LogOut, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { bootstrapAdmin, getAdminBootstrapStatus, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import {
  createCustomPage,
  deleteCustomPage,
  getCustomPageById,
  listCustomPages,
  normalizeSlug,
  toggleCustomPageStatus,
  updateCustomPage,
} from "@/lib/custom-pages.functions";

type AdminPageItem = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  desktop_file_path?: string | null;
  mobile_file_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AdminLoaderData = {
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  email?: string | null;
  pages: AdminPageItem[];
};

export const Route = createFileRoute("/_authenticated/admin")({
  loader: async () => {
    const bootState = await getAdminBootstrapStatus();
    const pages = bootState.isAuthenticated ? await listCustomPages() : [];
    return { ...bootState, pages };
  },
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const loaderData = Route.useLoaderData() as AdminLoaderData;
  const [pages, setPages] = useState<AdminPageItem[]>(loaderData.pages ?? []);
  const [bootstrapForm, setBootstrapForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState({
    name: "",
    slug: "",
    active: true,
    desktopHtml: "",
    mobileHtml: "",
  });
  const [desktopFileName, setDesktopFileName] = useState("");
  const [mobileFileName, setMobileFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useMemo(() => {
    const slug = normalizeSlug(pageForm.slug || "slug");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://example.com";
    return `${origin}/${slug || "slug"}`;
  }, [pageForm.slug]);

  const isAuthView = loaderData.isAuthenticated;

  const readHtmlFile = async (file: File | null | undefined) => {
    if (!file) return null;

    const fileName = file.name.toLowerCase();
    const isHtmlExtension = /\.html?$/i.test(fileName);
    const contentType = file.type?.toLowerCase();
    const isHtmlMime =
      !contentType || contentType === "text/html" || contentType === "application/xhtml+xml";

    if (!isHtmlExtension || !isHtmlMime || file.size === 0) {
      throw new Error("Selecione um arquivo HTML válido.");
    }

    return await file.text();
  };

  const setHtmlFile = async (variant: "desktop" | "mobile", file: File | null | undefined) => {
    if (!file) {
      if (variant === "desktop") {
        setDesktopFileName("");
      } else {
        setMobileFileName("");
      }
      return;
    }

    try {
      const html = await readHtmlFile(file);
      if (!html) {
        throw new Error("Selecione um arquivo HTML válido.");
      }

      setPageForm((current) => ({
        ...current,
        ...(variant === "desktop" ? { desktopHtml: html } : { mobileHtml: html }),
      }));

      if (variant === "desktop") {
        setDesktopFileName(file.name);
      } else {
        setMobileFileName(file.name);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Selecione um arquivo HTML válido.");
      if (variant === "desktop") {
        setPageForm((current) => ({ ...current, desktopHtml: current.desktopHtml }));
      } else {
        setPageForm((current) => ({ ...current, mobileHtml: current.mobileHtml }));
      }
    }
  };

  const onBootstrapSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await bootstrapAdmin({
        data: {
          email: bootstrapForm.email,
          password: bootstrapForm.password,
          confirmPassword: bootstrapForm.confirmPassword,
        },
      });
      toast.success("Administrador criado.");
      navigate({ to: "/admin", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível criar o administrador.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onLoginSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await loginAdmin({ data: { email: loginForm.email, password: loginForm.password } });
      toast.success("Login realizado.");
      await router.invalidate();
      await navigate({ to: "/admin", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Usuário ou senha inválidos.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onLogout = async () => {
    try {
      await logoutAdmin();
      navigate({ to: "/admin", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível sair.");
    }
  };

  const onSavePage = async () => {
    try {
      setSaving(true);

      if (!pageForm.desktopHtml?.trim() && formMode === "create") {
        throw new Error("Selecione um arquivo HTML Desktop.");
      }

      const payload = {
        id: editingId ?? undefined,
        name: pageForm.name,
        slug: pageForm.slug,
        active: pageForm.active,
        desktopHtml: pageForm.desktopHtml || undefined,
        mobileHtml: pageForm.mobileHtml || undefined,
      };

      if (formMode === "edit" && editingId) {
        const updated = await updateCustomPage({ data: payload });
        setPages((current) => current.map((page) => (page.id === updated.id ? updated : page)));
        toast.success("Página atualizada.");
      } else {
        const created = await createCustomPage({ data: payload });
        setPages((current) => [created, ...current]);
        toast.success("Página criada.");
      }

      setPageForm({ name: "", slug: "", active: true, desktopHtml: "", mobileHtml: "" });
      setDesktopFileName("");
      setMobileFileName("");
      setEditingId(null);
      setFormMode("create");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a página.");
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (value: string) => {
    const generatedSlug = normalizeSlug(value);
    setPageForm((current) => ({
      ...current,
      name: value,
      slug: current.slug && current.slug !== generatedSlug ? current.slug : generatedSlug,
    }));
  };

  const onToggle = async (id: string, nextValue: boolean) => {
    try {
      const updated = await toggleCustomPageStatus({ data: { id, active: nextValue } });
      setPages((current) => current.map((page) => (page.id === updated.id ? updated : page)));
      toast.success(nextValue ? "Página ativada." : "Página desativada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a página.");
    }
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Excluir esta página?\n\nEsta ação removerá o acesso público a esta URL.",
    );
    if (!confirmed) return;

    try {
      await deleteCustomPage({ data: { id } });
      setPages((current) => current.filter((page) => page.id !== id));
      toast.success("Página removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a página.");
    }
  };

  const onCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
  };

  if (!isAuthView) {
    const isBootstrap = !loaderData.isBootstrapped;
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
        <Card className="w-full max-w-md border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isBootstrap ? "MAXEASE\nConfigurar administrador" : "MAXEASE\nPainel Administrativo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isBootstrap ? (
              <form onSubmit={onBootstrapSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bootstrap-email">E-mail</Label>
                  <Input
                    id="bootstrap-email"
                    type="email"
                    value={bootstrapForm.email}
                    onChange={(event) =>
                      setBootstrapForm({ ...bootstrapForm, email: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bootstrap-password">Senha</Label>
                  <Input
                    id="bootstrap-password"
                    type="password"
                    value={bootstrapForm.password}
                    onChange={(event) =>
                      setBootstrapForm({ ...bootstrapForm, password: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bootstrap-confirm">Confirmar senha</Label>
                  <Input
                    id="bootstrap-confirm"
                    type="password"
                    value={bootstrapForm.confirmPassword}
                    onChange={(event) =>
                      setBootstrapForm({ ...bootstrapForm, confirmPassword: event.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? "Criando..." : "Criar administrador"}
                </Button>
              </form>
            ) : (
              <form onSubmit={onLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm({ ...loginForm, password: event.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              MAXEASE
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Páginas
              </CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setFormMode("create");
                  setEditingId(null);
                  setPageForm({
                    name: "",
                    slug: "",
                    active: true,
                    desktopHtml: "",
                    mobileHtml: "",
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova página
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-slate-600">Nenhuma página criada.</p>
                    <Button className="mt-4" onClick={() => setFormMode("create")}>
                      Criar primeira página
                    </Button>
                  </div>
                ) : (
                  pages.map((page) => (
                    <div key={page.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{page.name}</div>
                          <div className="text-sm text-slate-500">/{page.slug}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-xs font-medium",
                              page.active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-700",
                            )}
                          >
                            {page.active ? "Ativa" : "Inativa"}
                          </span>
                          <Button size="sm" variant="outline" onClick={() => onCopyLink(page.slug)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFormMode("edit");
                              setEditingId(page.id);
                              void (async () => {
                                const fullPage = await getCustomPageById({ data: { id: page.id } });
                                if (!fullPage) return;
                                setPageForm({
                                  name: fullPage.name ?? page.name,
                                  slug: fullPage.slug ?? page.slug,
                                  active: fullPage.active ?? page.active,
                                  desktopHtml: fullPage.desktopHtml ?? "",
                                  mobileHtml: fullPage.mobileHtml ?? "",
                                });
                              })();
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onToggle(page.id, !page.active)}
                          >
                            {page.active ? "Desativar" : "Ativar"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(page.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{formMode === "edit" ? "Editar página" : "Nova página"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-name">Nome</Label>
                <Input
                  id="page-name"
                  value={pageForm.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Apresentação Cliente ABC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-slug">Slug</Label>
                <Input
                  id="page-slug"
                  value={pageForm.slug}
                  onChange={(event) => setPageForm({ ...pageForm, slug: event.target.value })}
                  placeholder="cliente-abc"
                />
                <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Preview: {previewUrl}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktop-html">HTML Desktop</Label>
                {(formMode === "edit" && pageForm.desktopHtml) || desktopFileName ? (
                  <div className="text-xs text-slate-500">
                    {desktopFileName || "Arquivo atual disponível"}
                  </div>
                ) : null}
                <Input
                  id="desktop-html"
                  type="file"
                  accept=".html,text/html"
                  onChange={async (event) => {
                    const file = event.target.files?.[0] ?? null;
                    await setHtmlFile("desktop", file);
                    event.target.value = "";
                  }}
                  className="block w-full max-w-full truncate rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-html">HTML Mobile</Label>
                {(formMode === "edit" && pageForm.mobileHtml) || mobileFileName ? (
                  <div className="text-xs text-slate-500">
                    {mobileFileName || "Arquivo atual disponível"}
                  </div>
                ) : null}
                <Input
                  id="mobile-html"
                  type="file"
                  accept=".html,text/html"
                  onChange={async (event) => {
                    const file = event.target.files?.[0] ?? null;
                    await setHtmlFile("mobile", file);
                    event.target.value = "";
                  }}
                  className="block w-full max-w-full truncate rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">Status</div>
                  <div className="text-xs text-slate-500">Ativa por padrão.</div>
                </div>
                <Button
                  variant={pageForm.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPageForm({ ...pageForm, active: !pageForm.active })}
                >
                  {pageForm.active ? "Ativa" : "Inativa"}
                </Button>
              </div>

              <Button className="w-full" onClick={onSavePage} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {saving ? "Salvando..." : "Salvar página"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
