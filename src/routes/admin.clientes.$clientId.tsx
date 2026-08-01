import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, FileText, Bell, Save, ChevronLeft, ChevronRight, Upload, Folder, FolderPlus, Link2, Video, Image as ImageIcon, Pencil, Clock } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { UIButton, Field, SelectField, Segmented, Chip, Panel, FormBlock, Modal, SuccessModal, UploadField, EmptyState, FieldLabel } from "@/components/admin/ui";
import { useAdminStore } from "@/lib/admin/store";
import { statusChipColor, type ContentStatus, type Platform, type CalendarKind } from "@/lib/portal/mockData";
import { uploadMedia, removeUploaded, type UploadHandle } from "@/lib/admin/upload";
import { inspectVideoFile, validateFile, type MediaKind } from "@/lib/admin/media";


const STATUSES: ContentStatus[] = ["Planejado", "Em Produção", "Aguardando Aprovação", "Aprovado", "Agendado", "Publicado", "Solicitou Alteração"];
const POST_STATUSES: ContentStatus[] = ["Planejado", "Pendente de aprovação", "Alteração solicitada", "Aprovado", "Publicado"];
const PLATFORMS: Platform[] = ["Instagram", "Facebook", "TikTok"];
const KINDS: CalendarKind[] = ["Postagem", "Gravação"];
const TAG_COLORS = ["#1428FF", "#4F7CFF", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#0EA5E9", "#64748B"];

function generateToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export const Route = createFileRoute("/admin/clientes/$clientId")({
  head: () => ({ meta: [{ title: "Gerenciar cliente — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <ClientDetail />
    </AdminShell>
  ),
});

function ClientDetail() {
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  const { data, updateClient, deleteClient, addCalendarItem, updateCalendarItem, deleteCalendarItem, addReport, deleteReport, addNotice, deleteNotice } = useAdminStore();
  const client = data.clients.find((c) => c.id === clientId);
  const [tab, setTab] = useState<"perfil" | "calendario" | "relatorios" | "avisos">("perfil");

  if (!client) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-600">Cliente não encontrado.</p>
        <Link to="/admin/clientes" className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-light">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/clientes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar aos clientes
      </Link>

      <AdminPageHeader
        title={client.company}
        subtitle={`${client.name} · ${client.email}`}
        action={
          <button
            type="button"
            onClick={() => {
              if (confirm(`Excluir cliente ${client.company}? Essa ação não pode ser desfeita.`)) {
                deleteClient(client.id);
                toast.success("Cliente excluído.");
                navigate({ to: "/admin/clientes" });
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {(["perfil", "calendario", "relatorios", "avisos"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-brand-gradient text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>
            {t === "perfil" ? "Perfil & Login" : t === "calendario" ? "Calendário" : t === "relatorios" ? "Relatórios" : "Avisos"}
          </button>
        ))}
      </div>

      {tab === "perfil" && (
        <ProfileEditor
          initial={client}
          onSave={(patch) => {
            updateClient(client.id, patch);
            toast.success("Perfil atualizado.");
          }}
        />
      )}

      {tab === "calendario" && (
        <CalendarManager
          clientId={client.id}
          items={client.calendar}
          onAdd={(item) => { addCalendarItem(client.id, item); toast.success("Conteúdo adicionado."); }}
          onUpdate={(id, patch) => { updateCalendarItem(client.id, id, patch); toast.success("Evento atualizado."); }}
          onDelete={(id) => { deleteCalendarItem(client.id, id); toast.success("Conteúdo removido."); }}
        />
      )}

      {tab === "relatorios" && (
        <ReportsManager
          clientId={client.id}
          items={client.reports}
          onAdd={(r) => { addReport(client.id, r); toast.success("Relatório publicado."); }}
          onDelete={(id) => { deleteReport(client.id, id); toast.success("Relatório removido."); }}
        />
      )}

      {tab === "avisos" && (
        <NoticesManager
          items={client.notices}
          onAdd={(n) => { addNotice(client.id, n); toast.success("Aviso enviado."); }}
          onDelete={(id) => { deleteNotice(client.id, id); toast.success("Aviso removido."); }}
        />
      )}
    </div>
  );
}

function ProfileEditor({ initial, onSave }: { initial: { name: string; company: string; email: string; password: string; activeProject: string; avatarUrl?: string }; onSave: (patch: { name: string; company: string; email: string; password: string; activeProject: string; avatarUrl?: string }) => void }) {
  const [name, setName] = useState(initial.name);
  const [company, setCompany] = useState(initial.company);
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState(initial.password);
  const [project, setProject] = useState(initial.activeProject);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initial.avatarUrl);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Imagem muito grande (máx 2MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-slate-900">Dados do cliente</h2>
      <div className="mt-5 flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-brand-gradient text-white flex items-center justify-center overflow-hidden text-2xl font-semibold shrink-0">
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (company.charAt(0).toUpperCase() || "?")}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
            Enviar foto
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          {avatarUrl && (
            <button type="button" onClick={() => setAvatarUrl(undefined)} className="text-xs text-red-600 hover:underline text-left">
              Remover foto
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <TextField label="Empresa" value={company} onChange={setCompany} />
        <TextField label="Responsável" value={name} onChange={setName} />
        <TextField label="E-mail (login)" value={email} onChange={setEmail} type="email" />
        <TextField label="Senha" value={password} onChange={setPassword} />
        <div className="sm:col-span-2">
          <TextField label="Projeto ativo" value={project} onChange={setProject} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={() => onSave({ name, company, email: email.trim().toLowerCase(), password, activeProject: project, avatarUrl })}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white">
          <Save className="h-4 w-4" /> Salvar alterações
        </button>
      </div>
    </div>
  );
}

import type { CalendarContent, ApprovalHistoryEntry } from "@/lib/portal/mockData";
type CalItem = CalendarContent;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function toISODate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function CalendarManager({ clientId, items, onAdd, onUpdate, onDelete }: { clientId: string; items: CalItem[]; onAdd: (i: Omit<CalItem, "id">) => void; onUpdate: (id: string, patch: Partial<CalItem>) => void; onDelete: (id: string) => void }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<CalItem | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; item: CalItem } | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);


  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const grid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const prevMonthDays = new Date(cursor.y, cursor.m, 0).getDate();
    const cells: { date: string; day: number; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const d = new Date(cursor.y, cursor.m - 1, day);
      cells.push({ date: toISODate(d.getFullYear(), d.getMonth(), day), day, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: toISODate(cursor.y, cursor.m, day), day, inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const idx = cells.length - (startWeekday + daysInMonth);
      const day = idx + 1;
      const d = new Date(cursor.y, cursor.m + 1, day);
      cells.push({ date: toISODate(d.getFullYear(), d.getMonth(), day), day, inMonth: false });
      if (cells.length >= 42) break;
    }
    return cells;
  }, [cursor]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalItem[]>();
    for (const it of items) {
      const arr = map.get(it.date) ?? [];
      arr.push(it);
      map.set(it.date, arr);
    }
    return map;
  }, [items]);

  const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
            {MONTHS_PT[cursor.m]} <span className="font-normal text-slate-400">{cursor.y}</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <UIButton variant="ghost" size="sm" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}>
            Hoje
          </UIButton>
          <div className="flex items-center rounded-lg border border-slate-200">
            <button type="button" aria-label="Mês anterior"
              onClick={() => setCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))}
              className="grid h-8 w-8 place-items-center rounded-l-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="h-5 w-px bg-slate-200" />
            <button type="button" aria-label="Próximo mês"
              onClick={() => setCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))}
              className="grid h-8 w-8 place-items-center rounded-r-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-y border-slate-100 bg-slate-50/50">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((cell, i) => {
          const evts = eventsByDate.get(cell.date) ?? [];
          const isToday = cell.date === todayISO;
          return (
            <button
              key={cell.date + (cell.inMonth ? "" : "o")}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`group relative flex min-h-[104px] flex-col gap-1.5 p-2 text-left transition-colors duration-150 sm:min-h-[124px] sm:p-2.5 ${
                i % 7 !== 6 ? "border-r" : ""
              } border-b border-slate-100 ${cell.inMonth ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/40"}`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[12px] tabular-nums transition-colors ${
                  isToday
                    ? "bg-slate-900 font-semibold text-white"
                    : cell.inMonth
                      ? "font-medium text-slate-600"
                      : "text-slate-300"
                }`}
              >
                {cell.day}
              </span>
              <span className="flex-1 space-y-1 overflow-hidden">
                {evts.slice(0, 3).map((e) => {
                  const color = statusChipColor(e.status) ?? e.tagColor ?? "#64748B";
                  return (
                    <span
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onContextMenu={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        setMenu({ x: ev.clientX, y: ev.clientY, item: e });
                      }}
                      className="flex items-center gap-1.5 truncate rounded-md bg-slate-50 px-1.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100"
                      title="Clique com o botão direito para editar ou excluir"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      {e.time && <span className="shrink-0 tabular-nums text-slate-400">{e.time}</span>}
                      <span className="truncate">{e.title}</span>
                    </span>
                  );
                })}
                {evts.length > 3 && (
                  <span className="block pl-1.5 text-[11px] text-slate-400">+{evts.length - 3} mais</span>
                )}
              </span>
              <span className="pointer-events-none absolute right-2 top-2 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[60] min-w-[184px] overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.28)]"
            style={{
              left: Math.min(menu.x, (typeof window !== "undefined" ? window.innerWidth : 1000) - 200),
              top: Math.min(menu.y, (typeof window !== "undefined" ? window.innerHeight : 1000) - 110),
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              type="button"
              onClick={() => {
                setEditing(menu.item);
                setSelectedDate(menu.item.date);
                setMenu(null);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-400" /> Editar conteúdo
            </button>
            <button
              type="button"
              onClick={() => {
                const item = menu.item;
                setMenu(null);
                if (confirm(`Excluir "${item.title}"? Essa ação não pode ser desfeita.`)) {
                  onDelete(item.id);
                }
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDate && (
          <DayModal
            key={editing?.id ?? `new-${selectedDate}`}
            clientId={clientId}
            date={selectedDate}
            events={eventsByDate.get(selectedDate) ?? []}
            editing={editing}
            onClose={() => { setSelectedDate(null); setEditing(null); }}
            onAdd={(item) => onAdd({ ...item, date: selectedDate })}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onGenerated={(link) => {
              setSelectedDate(null);
              setEditing(null);
              setSuccessLink(link);
            }}
          />
        )}
      </AnimatePresence>

      <SuccessModal
        open={!!successLink}
        onClose={() => setSuccessLink(null)}
        title="Conteúdo criado com sucesso"
        message="Seu conteúdo foi salvo e o link de aprovação já está disponível."
        link={successLink ?? undefined}
        onCopy={() => {
          try {
            navigator.clipboard?.writeText(successLink ?? "");
            toast.success("Link copiado");
          } catch {
            toast.error("Não foi possível copiar o link.");
          }
        }}
      />
    </Panel>
  );
}


interface UploadSlot {
  file: File;
  previewUrl?: string;                    // blob URL for local preview (cover only)
  progress: number;                       // 0..100
  status: "uploading" | "done" | "error";
  errorMessage?: string;
  bucket?: "videos" | "thumbnails" | "pdfs";
  path?: string;                          // storage path once upload completes
  handle: UploadHandle;
}

function DayModal({ clientId, date, events, editing, onClose, onAdd, onUpdate, onDelete, onGenerated }: { clientId: string; date: string; events: CalItem[]; editing?: CalItem | null; onClose: () => void; onAdd: (item: Omit<CalItem, "id" | "date">) => void; onUpdate: (id: string, patch: Partial<CalItem>) => void; onDelete: (id: string) => void; onGenerated: (link: string) => void }) {
  const isEditing = !!editing;
  const [showForm, setShowForm] = useState(events.length === 0 || isEditing);
  const [kind, setKind] = useState<CalendarKind>(editing?.kind ?? "Postagem");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [caption, setCaption] = useState(editing?.caption ?? "");
  const [script, setScript] = useState(editing?.script ?? "");
  const [time, setTime] = useState(editing?.time ?? "09:00");
  const [status, setStatus] = useState<ContentStatus>(editing?.status ?? "Planejado");
  const [platforms, setPlatforms] = useState<Platform[]>(editing?.platforms ?? ["Instagram"]);
  const [tagColor, setTagColor] = useState<string>(editing?.tagColor ?? TAG_COLORS[0]);
  const [videoUpload, setVideoUpload] = useState<UploadSlot | undefined>();
  const [coverUpload, setCoverUpload] = useState<UploadSlot | undefined>();
  const [scriptUpload, setScriptUpload] = useState<UploadSlot | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const uploadsRef = useRef<UploadSlot[]>([]);


  // Track live uploads so a modal close can cancel + clean up
  uploadsRef.current = [videoUpload, coverUpload, scriptUpload].filter(Boolean) as UploadSlot[];

  useEffect(() => {
    return () => {
      for (const u of uploadsRef.current) {
        if (u.status === "uploading") u.handle.cancel();
        if (u.previewUrl) URL.revokeObjectURL(u.previewUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [y, m, d] = date.split("-").map(Number);
  const label = `${String(d).padStart(2, "0")} de ${MONTHS_PT[m - 1]} de ${y}`;

  function startUpload(
    mediaKind: MediaKind,
    file: File,
    setSlot: (u: UploadSlot | undefined) => void,
    withPreview = false,
  ) {
    const validationError = validateFile(mediaKind, file);
    if (validationError) { toast.error(validationError); return; }
    const previewUrl = withPreview ? URL.createObjectURL(file) : undefined;
    const handle = uploadMedia({
      kind: mediaKind,
      clientId,
      file,
      onProgress: (percent) => {
        setSlot({
          file, previewUrl, progress: percent, status: "uploading", handle,
        });
      },
    });
    setSlot({ file, previewUrl, progress: 0, status: "uploading", handle });
    handle.promise.then(({ bucket, path }) => {
      setSlot({ file, previewUrl, progress: 100, status: "done", handle, bucket, path });
    }).catch((err: Error) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSlot({ file, progress: 0, status: "error", errorMessage: err.message, handle });
    });
  }

  function clearSlot(slot: UploadSlot | undefined, setSlot: (u: UploadSlot | undefined) => void) {
    if (!slot) return;
    if (slot.status === "uploading") slot.handle.cancel();
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
    if (slot.status === "done" && slot.bucket && slot.path) {
      void removeUploaded(slot.bucket, slot.path);
    }
    setSlot(undefined);
  }

  function onScriptFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    startUpload("pdf", file, setScriptUpload);
  }
  function onVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    // Inspect the real MP4 tracks. The file extension alone does not prove
    // Android-safe playback; HEVC/H.265 often shows only the poster + audio.
    inspectVideoFile(file).then((inspection) => {
      if (!inspection.compatible) {
        toast.error(inspection.message ?? "Vídeo incompatível.", {
          description: `Detectado: vídeo ${inspection.videoCodec.toUpperCase()} · áudio ${inspection.audioCodec.toUpperCase()}`,
          duration: 9000,
        });
        return;
      }
      startUpload("video", file, setVideoUpload);
    });
  }
  function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    startUpload("cover", file, setCoverUpload, true);
  }

  function resetForm() {
    setTitle(""); setCaption(""); setScript("");
    setScriptUpload(undefined); setVideoUpload(undefined); setCoverUpload(undefined);
  }

  function anyUploading(): boolean {
    return [videoUpload, coverUpload, scriptUpload].some((u) => u?.status === "uploading");
  }

  function toStoredFile(slot: UploadSlot | undefined, includeType = false): { name: string; dataUrl: string; type?: string } | undefined {
    if (!slot || slot.status !== "done" || !slot.path) return undefined;
    return includeType
      ? { name: slot.file.name, dataUrl: slot.path, type: "video/mp4" }
      : { name: slot.file.name, dataUrl: slot.path };
  }

  function submitGravacao(e: FormEvent) {
    e.preventDefault();
    if (!title) { toast.error("Informe o título."); return; }
    if (isEditing && editing) {
      onUpdate(editing.id, { title, caption, script, time, status, platforms, kind, tagColor });
      onClose();
      return;
    }
    if (anyUploading()) { toast.error("Aguarde os uploads finalizarem."); return; }
    if (scriptUpload && scriptUpload.status !== "done") { toast.error("O upload do PDF falhou. Reenvie ou remova."); return; }
    onAdd({
      title, caption, script, time, status, platforms, kind, tagColor,
      scriptFile: toStoredFile(scriptUpload),
    });
    resetForm();
    setShowForm(false);
  }

  function submitPostagem(e: FormEvent) {
    e.preventDefault();
    if (!title) { toast.error("Informe o título."); return; }
    if (isEditing && editing) {
      if (anyUploading()) { toast.error("Aguarde os uploads finalizarem."); return; }
      if (videoUpload && videoUpload.status !== "done") { toast.error("O upload do vídeo não concluiu."); return; }
      if (coverUpload && coverUpload.status !== "done") { toast.error("O upload da capa não concluiu."); return; }
      if (scriptUpload && scriptUpload.status !== "done") { toast.error("O PDF do roteiro não concluiu o upload."); return; }
      const patch: Partial<CalItem> = { title, caption, time, status, platforms, kind, tagColor };
      if (videoUpload?.status === "done") {
        patch.videoFile = toStoredFile(videoUpload, true);
        if (editing.videoFile?.dataUrl) void removeUploaded("videos", editing.videoFile.dataUrl);
      }
      if (coverUpload?.status === "done") {
        patch.coverFile = toStoredFile(coverUpload);
        if (editing.coverFile?.dataUrl) void removeUploaded("thumbnails", editing.coverFile.dataUrl);
      }
      if (scriptUpload?.status === "done") {
        patch.scriptFile = toStoredFile(scriptUpload);
        if (editing.scriptFile?.dataUrl) void removeUploaded("pdfs", editing.scriptFile.dataUrl);
      }
      onUpdate(editing.id, patch);
      onClose();
      return;
    }
    if (anyUploading()) { toast.error("Aguarde os uploads finalizarem."); return; }
    if (!videoUpload || videoUpload.status !== "done") { toast.error("Envie o vídeo (upload deve concluir)."); return; }
    if (!coverUpload || coverUpload.status !== "done") { toast.error("Envie a capa (upload deve concluir)."); return; }

    if (scriptUpload && scriptUpload.status !== "done") { toast.error("O PDF do roteiro não concluiu o upload."); return; }
    const token = generateToken();
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const history: ApprovalHistoryEntry[] = [{ at: stamp, action: "created", message: "Link de aprovação gerado." }];
    onAdd({
      title, caption, script: "", time,
      status: "Pendente de aprovação",
      platforms, kind: "Postagem", tagColor,
      scriptFile: toStoredFile(scriptUpload),
      videoFile: toStoredFile(videoUpload, true),
      coverFile: toStoredFile(coverUpload),
      approvalToken: token, approvalHistory: history,
    });
    resetForm();
    onGenerated(`${window.location.origin}/aprovacao/${token}`);
  }

  const useStatuses = kind === "Postagem" ? POST_STATUSES : STATUSES;
  const isPost = kind === "Postagem";

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={isEditing ? "Editando conteúdo" : "Agenda"}
      title={label}
      size="lg"
      footer={
        showForm ? (
          <>
            {events.length > 0 && !isEditing && (
              <UIButton variant="ghost" onClick={() => setShowForm(false)}>Cancelar</UIButton>
            )}
            {(events.length === 0 || isEditing) && (
              <UIButton variant="ghost" onClick={onClose}>Cancelar</UIButton>
            )}
            <UIButton
              variant="primary"
              onClick={() => formRef.current?.requestSubmit()}
            >
              {isEditing ? (<><Save className="h-4 w-4" /> Salvar alterações</>)
                : isPost ? (<><Link2 className="h-4 w-4" /> Salvar e gerar link</>)
                : (<><Plus className="h-4 w-4" /> Salvar evento</>)}
            </UIButton>
          </>
        ) : (
          <>
            <UIButton variant="ghost" onClick={onClose}>Fechar</UIButton>
            <UIButton variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Novo conteúdo
            </UIButton>
          </>
        )
      }
    >
      <div className="space-y-8 pt-1">
        {events.length > 0 && !isEditing && (
          <section>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Conteúdos deste dia
            </h3>
            <ul className="space-y-2">
              {events.map((ev) => {
                const color = ev.tagColor ?? "#64748B";
                return (
                  <li key={ev.id} className="group flex items-start gap-3 rounded-lg border border-slate-200/80 px-3.5 py-3 transition-colors hover:bg-slate-50/70">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-slate-900">{ev.title}</div>
                      <div className="mt-0.5 text-[12px] text-slate-400">
                        {ev.time} · {(ev.kind ?? "Postagem")} · {ev.status}
                      </div>
                      {ev.caption && <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">{ev.caption}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {ev.approvalToken && (
                          <button
                            type="button"
                            onClick={() => {
                              const link = `${window.location.origin}/aprovacao/${ev.approvalToken}`;
                              try { navigator.clipboard?.writeText(link); toast.success("Link copiado"); } catch { toast.error("Não foi possível copiar."); }
                            }}
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Copiar link
                          </button>
                        )}
                        {ev.scriptFile && (
                          <a href={ev.scriptFile.dataUrl} download={ev.scriptFile.name} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900">
                            <FileText className="h-3.5 w-3.5" /> Roteiro
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(ev.id)}
                      aria-label="Excluir"
                      className="shrink-0 rounded-md p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {showForm && (
          <form ref={formRef} onSubmit={isPost ? submitPostagem : submitGravacao} className="space-y-8">
            <FormBlock title="Informações">
              <div className="space-y-2">
                <FieldLabel>Tipo de conteúdo</FieldLabel>
                <Segmented
                  value={kind}
                  onChange={(k) => { setKind(k); setStatus("Planejado"); }}
                  options={KINDS.map((k) => ({ value: k, label: k === "Postagem" ? "Conteúdo a postar" : "Dia de gravação" }))}
                />
              </div>
              <Field label="Título" value={title} onChange={setTitle} placeholder="Ex: Reels institucional" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Horário" value={time} onChange={setTime} type="time" />
                <SelectField label="Status" value={status} onChange={(v) => setStatus(v as ContentStatus)} options={useStatuses} />
              </div>
              <div className="space-y-2">
                <FieldLabel hint="usada no calendário">Cor da etiqueta</FieldLabel>
                <div className="flex flex-wrap items-center gap-2">
                  {TAG_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setTagColor(c)} aria-label={c}
                      className={`h-6 w-6 rounded-full transition-transform duration-150 ${tagColor === c ? "scale-110 ring-2 ring-slate-900 ring-offset-2" : "ring-1 ring-slate-200 hover:scale-105"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} aria-label="Cor personalizada"
                    className="ml-1 h-6 w-6 cursor-pointer rounded-full border border-slate-200 bg-white p-0" />
                </div>
              </div>
            </FormBlock>

            <FormBlock title="Conteúdo">
              <Field label="Legenda" value={caption} onChange={setCaption} multiline rows={4} placeholder="Texto que acompanha a publicação" />
              {!isPost && <Field label="Roteiro" value={script} onChange={setScript} multiline rows={5} placeholder="Cenas, falas e orientações da gravação" />}
            </FormBlock>

            <FormBlock title="Arquivos" description={isEditing ? "Envie um novo arquivo para substituir. Deixe em branco para manter o atual." : undefined}>
              {isEditing && (editing?.videoFile || editing?.coverFile) && (
                <div className="rounded-lg bg-slate-50 px-3.5 py-3 text-[12.5px] text-slate-500">
                  <div className="mb-1 font-medium text-slate-700">Arquivos atuais</div>
                  {editing?.videoFile && <div className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> {editing.videoFile.name}</div>}
                  {editing?.coverFile && <div className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> {editing.coverFile.name}</div>}
                </div>
              )}
              {isPost && (
                <>
                  <UploadSlotField
                    label="Vídeo"
                    hint="MP4 até 1 GB"
                    icon={<Video className="h-4 w-4" />}
                    placeholder="Selecionar vídeo"
                    accept="video/mp4,.mp4"
                    slot={videoUpload}
                    onFile={onVideoFile}
                    onRemove={() => clearSlot(videoUpload, setVideoUpload)}
                  />
                  <UploadSlotField
                    label="Capa"
                    hint="imagem"
                    icon={<ImageIcon className="h-4 w-4" />}
                    placeholder="Selecionar imagem de capa"
                    accept="image/*"
                    slot={coverUpload}
                    onFile={onCoverFile}
                    onRemove={() => clearSlot(coverUpload, setCoverUpload)}
                    preview
                  />
                </>
              )}
              <UploadSlotField
                label="Roteiro em PDF"
                hint="opcional"
                icon={<Upload className="h-4 w-4" />}
                placeholder="Selecionar PDF"
                accept="application/pdf"
                slot={scriptUpload}
                onFile={onScriptFile}
                onRemove={() => clearSlot(scriptUpload, setScriptUpload)}
              />
            </FormBlock>

            <FormBlock title="Plataformas">
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <Chip key={p} active={platforms.includes(p)}
                    onClick={() => setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}>
                    {p}
                  </Chip>
                ))}
              </div>
            </FormBlock>
          </form>
        )}
      </div>
    </Modal>
  );
}


type ReportItem = { id: string; name: string; period: string; date: string; summary: string; highlights: { label: string; value: string }[]; folder?: string; fileName?: string; fileDataUrl?: string };

function ReportsManager({ clientId, items, onAdd, onDelete }: { clientId: string; items: ReportItem[]; onAdd: (r: Omit<ReportItem, "id">) => void; onDelete: (id: string) => void }) {
  const existingFolders = useMemo(() => {
    const set = new Set<string>();
    for (const r of items) if (r.folder) set.add(r.folder);
    return Array.from(set).sort();
  }, [items]);

  const [title, setTitle] = useState("");
  const [folderMode, setFolderMode] = useState<"existing" | "new">(existingFolders.length ? "existing" : "new");
  const [folderSelect, setFolderSelect] = useState(existingFolders[0] ?? "");
  const [folderNew, setFolderNew] = useState("");
  const [pdfUpload, setPdfUpload] = useState<UploadSlot | undefined>();

  useEffect(() => {
    return () => {
      if (pdfUpload?.status === "uploading") pdfUpload.handle.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    const err = validateFile("pdf", file);
    if (err) { toast.error(err); return; }
    const handle = uploadMedia({
      kind: "pdf", clientId, file,
      onProgress: (percent) => setPdfUpload({ file, progress: percent, status: "uploading", handle }),
    });
    setPdfUpload({ file, progress: 0, status: "uploading", handle });
    handle.promise
      .then(({ bucket, path }) => setPdfUpload({ file, progress: 100, status: "done", bucket, path, handle }))
      .catch((error: Error) => setPdfUpload({ file, progress: 0, status: "error", errorMessage: error.message, handle }));
  }

  function removePdf() {
    if (!pdfUpload) return;
    if (pdfUpload.status === "uploading") pdfUpload.handle.cancel();
    if (pdfUpload.status === "done" && pdfUpload.bucket && pdfUpload.path) {
      void removeUploaded(pdfUpload.bucket, pdfUpload.path);
    }
    setPdfUpload(undefined);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const folder = (folderMode === "new" ? folderNew : folderSelect).trim();
    if (!title.trim()) { toast.error("Informe o título."); return; }
    if (!folder) { toast.error("Selecione ou crie uma pasta."); return; }
    if (!pdfUpload || pdfUpload.status !== "done" || !pdfUpload.path) {
      toast.error("Envie o arquivo PDF (aguarde o upload concluir).");
      return;
    }
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    onAdd({
      name: title.trim(),
      period: folder,
      date: dateLabel,
      summary: "",
      highlights: [],
      folder,
      fileName: pdfUpload.file.name,
      fileDataUrl: pdfUpload.path,
    });
    setTitle(""); setPdfUpload(undefined);
    setFolderNew("");
    if (folderMode === "new") { setFolderMode("existing"); setFolderSelect(folder); }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, ReportItem[]>();
    for (const r of items) {
      const key = r.folder ?? "Sem pasta";
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Pastas e relatórios</h2>
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
            <FileText className="h-5 w-5 text-slate-300 mx-auto mb-2" />
            Nenhum relatório enviado ainda.
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([folder, reports]) => (
              <div key={folder}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Folder className="h-4 w-4 text-brand-light" />
                  {folder}
                  <span className="text-xs font-normal text-slate-500">({reports.length})</span>
                </div>
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {reports.map((r) => (
                    <li key={r.id} className="py-2.5 px-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                          <div className="text-xs text-slate-500 truncate">{r.fileName ?? "Sem arquivo"} · Enviado em {r.date}</div>
                        </div>
                      </div>
                      <button type="button" onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 h-fit">
        <h2 className="text-sm font-semibold text-slate-900">Novo relatório</h2>
        <TextField label="Título" value={title} onChange={setTitle} placeholder="Ex: Relatório de Julho" />

        <div>
          <span className="text-xs font-medium text-slate-600">Pasta</span>
          <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button type="button" onClick={() => setFolderMode("existing")} disabled={!existingFolders.length}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${folderMode === "existing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"} disabled:opacity-40 disabled:cursor-not-allowed`}>
              <Folder className="h-3.5 w-3.5 inline mr-1" /> Existente
            </button>
            <button type="button" onClick={() => setFolderMode("new")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${folderMode === "new" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              <FolderPlus className="h-3.5 w-3.5 inline mr-1" /> Nova
            </button>
          </div>
          {folderMode === "existing" ? (
            <select value={folderSelect} onChange={(e) => setFolderSelect(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900">
              {existingFolders.length === 0 && <option value="">Nenhuma pasta criada</option>}
              {existingFolders.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          ) : (
            <input value={folderNew} onChange={(e) => setFolderNew(e.target.value)} placeholder="Ex: 2026 · Julho"
              className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20" />
          )}
        </div>

        <UploadSlotField
          label="Arquivo PDF"
          icon={<Upload className="h-4 w-4" />}
          placeholder="Selecionar PDF"
          accept="application/pdf"
          slot={pdfUpload}
          onFile={onFile}
          onRemove={removePdf}
        />

        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm text-white font-medium">
          <Plus className="h-4 w-4" /> Publicar relatório
        </button>
      </form>
    </div>
  );
}


function NoticesManager({ items, onAdd, onDelete }: { items: { id: string; title: string; message: string; date: string }[]; onAdd: (n: { title: string; message: string; date: string }) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title) { toast.error("Título obrigatório."); return; }
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    onAdd({ title, message, date });
    setTitle(""); setMessage("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Avisos enviados</h2>
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
            <Bell className="h-5 w-5 text-slate-300 mx-auto mb-2" />
            Nenhum aviso enviado.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{n.date}</div>
                  {n.message && <div className="text-xs text-slate-600 mt-1">{n.message}</div>}
                </div>
                <button type="button" onClick={() => onDelete(n.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 h-fit">
        <h2 className="text-sm font-semibold text-slate-900">Novo aviso</h2>
        <TextField label="Título" value={title} onChange={setTitle} />
        <TextField label="Mensagem" value={message} onChange={setMessage} multiline />
        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm text-white font-medium">
          <Plus className="h-4 w-4" /> Enviar aviso
        </button>
      </form>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text", multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean }) {
  return (
    <Field label={label} value={value} onChange={onChange} placeholder={placeholder} type={type} multiline={multiline} />
  );
}


function UploadSlotField({
  label, icon, placeholder, accept, slot, onFile, onRemove, preview, hint,
}: {
  label: string;
  icon?: React.ReactNode;
  placeholder: string;
  accept: string;
  slot: UploadSlot | undefined;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  preview?: boolean;
  hint?: string;
}) {
  return (
    <UploadField
      label={label}
      hint={hint}
      icon={icon}
      placeholder={placeholder}
      accept={accept}
      onFile={onFile}
      onRemove={onRemove}
      slot={
        slot
          ? {
              name: slot.file.name,
              progress: slot.progress,
              status: slot.status,
              errorMessage: slot.errorMessage,
              previewUrl: preview ? slot.previewUrl : undefined,
            }
          : undefined
      }
    />
  );
}

