import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { type FormEvent, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      toast.error(error instanceof Error ? error.message : "Usuário ou senha inválidos.");
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b18] px-4 py-10 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(96,165,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.06)_1px,transparent_1px)] [background-size:44px_44px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <Card className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#091327]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />
          <CardHeader className="space-y-5 px-6 pb-4 pt-7 sm:px-8 sm:pt-8">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                <LockKeyhole className="h-3.5 w-3.5" />
                Acesso restrito
              </div>
              <span className="text-xs font-semibold tracking-[0.22em] text-white/70">MAXEASE</span>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                {isBootstrap ? "Configurar administrador" : "Painel Administrativo"}
              </CardTitle>
              <p className="text-sm leading-6 text-slate-300">
                {isBootstrap
                  ? "Crie o primeiro acesso administrativo da MAXEASE."
                  : "Gerencie páginas e conteúdos exclusivos da MAXEASE."}
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-7 pt-2 sm:px-8 sm:pb-8">
            {isBootstrap ? (
              <form onSubmit={onBootstrapSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="bootstrap-email" className="text-sm font-medium text-slate-200">
                    E-mail
                  </Label>
                  <Input
                    id="bootstrap-email"
                    type="email"
                    autoComplete="email"
                    value={bootstrapForm.email}
                    onChange={(event) =>
                      setBootstrapForm({ ...bootstrapForm, email: event.target.value })
                    }
                    className="h-11 border-white/15 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    placeholder="admin@maxease.com.br"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bootstrap-password" className="text-sm font-medium text-slate-200">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="bootstrap-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={bootstrapForm.password}
                      onChange={(event) =>
                        setBootstrapForm({ ...bootstrapForm, password: event.target.value })
                      }
                      className="h-11 border-white/15 bg-white/[0.04] pr-11 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bootstrap-confirm" className="text-sm font-medium text-slate-200">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="bootstrap-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={bootstrapForm.confirmPassword}
                      onChange={(event) =>
                        setBootstrapForm({ ...bootstrapForm, confirmPassword: event.target.value })
                      }
                      className="h-11 border-white/15 bg-white/[0.04] pr-11 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? "Criando..." : "Criar administrador"}
                </Button>
              </form>
            ) : (
              <form onSubmit={onLoginSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-slate-200">
                    E-mail
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                    className="h-11 border-white/15 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-slate-200">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm({ ...loginForm, password: event.target.value })
                      }
                      className="h-11 border-white/15 bg-white/[0.04] pr-11 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            )}

            <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-slate-400">
              Acesso exclusivo para administradores
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">MAXEASE</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-500">Administração</span>
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
              Painel Administrativo
            </h1>
            {loaderData.email ? (
              <p className="mt-1 truncate text-sm text-slate-500">Conectado como {loaderData.email}</p>
            ) : null}
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </header>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Páginas
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Gerencie os links exclusivos publicados.</p>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
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
                    setDesktopFileName("");
                    setMobileFileName("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova página
                </Button>
              </div>
            </CardHeader>

            <CardContent className="min-w-0 p-4 sm:p-5">
              {pages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center">
                  <p className="font-semibold text-slate-900">Nenhuma página criada.</p>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                    Crie sua primeira página para gerar um link exclusivo.
                  </p>
                  <Button
                    className="mt-5 bg-blue-600 text-white hover:bg-blue-500"
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
                      setDesktopFileName("");
                      setMobileFileName("");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira página
                  </Button>
                </div>
              ) : (
                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
                  <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(130px,0.8fr)_90px_minmax(310px,1.2fr)] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                    <span>Nome</span>
                    <span>URL</span>
                    <span>Status</span>
                    <span className="text-right">Ações</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="min-w-0 bg-white px-4 py-4 transition-colors hover:bg-slate-50/60 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(130px,0.8fr)_90px_minmax(310px,1.2fr)] lg:items-center lg:gap-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-950">{page.name}</div>
                          <div className="mt-1 truncate text-xs text-slate-400 lg:hidden">/{page.slug}</div>
                        </div>

                        <div className="mt-3 hidden min-w-0 lg:block">
                          <span className="block truncate text-sm text-slate-500">/{page.slug}</span>
                        </div>

                        <div className="mt-3 lg:mt-0">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                              page.active
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                                : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
                            )}
                          >
                            {page.active ? "Ativa" : "Inativa"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:mt-0 lg:justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-w-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            onClick={() => onCopyLink(page.slug)}
                            aria-label={`Copiar link de ${page.name}`}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="truncate">Copiar link</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-w-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setFormMode("edit");
                              setEditingId(page.id);
                              setDesktopFileName(page.desktop_file_path ? "Arquivo HTML atual" : "");
                              setMobileFileName(page.mobile_file_path ? "Arquivo HTML atual" : "");
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
                            aria-label={`Editar ${page.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-w-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            onClick={() => onToggle(page.id, !page.active)}
                            aria-label={`${page.active ? "Desativar" : "Ativar"} ${page.name}`}
                          >
                            {page.active ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="min-w-0"
                            onClick={() => onDelete(page.id)}
                            aria-label={`Excluir ${page.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm xl:sticky xl:top-6 xl:self-start">
            <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-950">
                    {formMode === "edit" ? "Editar página" : "Nova página"}
                  </CardTitle>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {formMode === "edit"
                      ? "Atualize os dados ou substitua os arquivos HTML."
                      : "Preencha os dados e selecione os arquivos HTML."}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                  {formMode === "edit" ? "Edição" : "Criação"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="min-w-0 space-y-5 p-4 sm:p-5">
              <div className="space-y-2">
                <Label htmlFor="page-name" className="font-medium text-slate-800">
                  Nome
                </Label>
                <Input
                  id="page-name"
                  value={pageForm.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Apresentação Cliente ABC"
                  className="h-10 border-slate-200 bg-white focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-slug" className="font-medium text-slate-800">
                  Slug
                </Label>
                <Input
                  id="page-slug"
                  value={pageForm.slug}
                  onChange={(event) => setPageForm({ ...pageForm, slug: event.target.value })}
                  placeholder="cliente-abc"
                  className="h-10 border-slate-200 bg-white focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15"
                />
                <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Preview:</span>{" "}
                  <span className="break-all">{previewUrl}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="desktop-html" className="font-medium text-slate-800">
                    HTML Desktop
                  </Label>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                    Obrigatório
                  </span>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3">
                  <div className="mb-3 flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                      <UploadCloud className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">Selecionar arquivo</p>
                      <p className="truncate text-xs text-slate-500" title={desktopFileName || undefined}>
                        {desktopFileName ||
                          (formMode === "edit"
                            ? "Mantenha o arquivo atual ou selecione outro .html"
                            : "Selecione um arquivo .html")}
                      </p>
                    </div>
                  </div>
                  <Input
                    id="desktop-html"
                    type="file"
                    accept=".html,text/html"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] ?? null;
                      await setHtmlFile("desktop", file);
                      event.target.value = "";
                    }}
                    className="h-auto min-w-0 cursor-pointer border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 shadow-none file:mr-2 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    aria-describedby="desktop-html-help"
                  />
                  <p id="desktop-html-help" className="mt-2 text-xs leading-5 text-slate-500">
                    Arquivo principal exibido em desktop e usado como fallback no mobile.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="mobile-html" className="font-medium text-slate-800">
                    HTML Mobile
                  </Label>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Opcional
                  </span>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3">
                  <div className="mb-3 flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                      <UploadCloud className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">Selecionar arquivo</p>
                      <p className="truncate text-xs text-slate-500" title={mobileFileName || undefined}>
                        {mobileFileName ||
                          (formMode === "edit"
                            ? "Mantenha o arquivo atual ou selecione outro .html"
                            : "Sem arquivo, o Desktop será utilizado")}
                      </p>
                    </div>
                  </div>
                  <Input
                    id="mobile-html"
                    type="file"
                    accept=".html,text/html"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] ?? null;
                      await setHtmlFile("mobile", file);
                      event.target.value = "";
                    }}
                    className="h-auto min-w-0 cursor-pointer border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 shadow-none file:mr-2 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    aria-describedby="mobile-html-help"
                  />
                  <p id="mobile-html-help" className="mt-2 text-xs leading-5 text-slate-500">
                    Opcional. Se não houver versão mobile, a página Desktop continua sendo utilizada.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Status</div>
                  <div className="text-xs text-slate-500">Ativa por padrão.</div>
                </div>
                <Button
                  type="button"
                  variant={pageForm.active ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "shrink-0",
                    pageForm.active
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
                  )}
                  onClick={() => setPageForm({ ...pageForm, active: !pageForm.active })}
                  aria-pressed={pageForm.active}
                >
                  {pageForm.active ? "Ativa" : "Inativa"}
                </Button>
              </div>

              <Button
                className="h-10 w-full bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                onClick={onSavePage}
                disabled={saving}
              >
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
