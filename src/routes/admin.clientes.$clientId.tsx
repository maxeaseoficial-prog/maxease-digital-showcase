import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, FileText, Bell, Save, ChevronLeft, ChevronRight, X, Upload, Folder, FolderPlus, Link2, Copy, Video, Image as ImageIcon, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/lib/admin/store";
import { statusChipColor, type ContentStatus, type Platform, type CalendarKind } from "@/lib/portal/mockData";
import { uploadMedia, removeUploaded, type UploadHandle } from "@/lib/admin/upload";
import { validateFile, type MediaKind } from "@/lib/admin/media";

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))} className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))} className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center">
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 ml-1">
            {MONTHS_PT[cursor.m]} {cursor.y}
          </h2>
        </div>
        <button type="button" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })} className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
          Hoje
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-slate-50 py-2 text-center">{w}</div>
        ))}
        {grid.map((cell) => {
          const evts = eventsByDate.get(cell.date) ?? [];
          const isToday = cell.date === todayISO;
          return (
            <button
              key={cell.date + (cell.inMonth ? "" : "o")}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`min-h-[92px] sm:min-h-[110px] bg-white p-1.5 text-left flex flex-col hover:bg-brand-light/5 transition-colors ${cell.inMonth ? "" : "opacity-40"}`}
            >
              <div className={`text-xs font-semibold mb-1 flex items-center justify-center h-6 w-6 rounded-full ${isToday ? "bg-brand-gradient text-white" : "text-slate-700"}`}>
                {cell.day}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {evts.slice(0, 3).map((e) => {
                  const color = statusChipColor(e.status) ?? e.tagColor ?? "#1428FF";
                  return (
                    <div
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onContextMenu={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        setMenu({ x: ev.clientX, y: ev.clientY, item: e });
                      }}
                      className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium border cursor-context-menu"
                      style={{ backgroundColor: `${color}1A`, borderColor: `${color}40`, color }}
                      title="Clique com o botão direito para editar ou excluir"
                    >
                      {e.kind === "Gravação" ? "● " : ""}{e.time && <span className="opacity-70">{e.time} </span>}{e.title}
                    </div>
                  );
                })}
                {evts.length > 3 && <div className="text-[10px] text-slate-500">+{evts.length - 3} mais</div>}
              </div>
            </button>
          );
        })}
      </div>

      {menu && (
        <div
          className="fixed z-[60] min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl py-1 text-sm"
          style={{ left: Math.min(menu.x, (typeof window !== "undefined" ? window.innerWidth : 1000) - 200), top: Math.min(menu.y, (typeof window !== "undefined" ? window.innerHeight : 1000) - 100) }}
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
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" /> Editar evento
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
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Excluir evento
          </button>
        </div>
      )}

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
          />
        )}
      </AnimatePresence>
    </div>
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

function DayModal({ clientId, date, events, editing, onClose, onAdd, onUpdate, onDelete }: { clientId: string; date: string; events: CalItem[]; editing?: CalItem | null; onClose: () => void; onAdd: (item: Omit<CalItem, "id" | "date">) => void; onUpdate: (id: string, patch: Partial<CalItem>) => void; onDelete: (id: string) => void }) {
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
  const [lastLink, setLastLink] = useState<string | null>(null);
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
    startUpload("video", file, setVideoUpload);
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
      ? { name: slot.file.name, dataUrl: slot.path, type: slot.file.type }
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
    toast.success("Gravação criada.");
    resetForm();
    setShowForm(false);
  }

  function submitPostagem(e: FormEvent) {
    e.preventDefault();
    if (!title) { toast.error("Informe o título."); return; }
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
    const link = `${window.location.origin}/aprovacao/${token}`;
    setLastLink(link);
    try { navigator.clipboard?.writeText(link); } catch { /* ignore */ }
    toast.success("Conteúdo salvo. Link de aprovação copiado.");
    resetForm();
  }

  const useStatuses = kind === "Postagem" ? POST_STATUSES : STATUSES;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <div className="text-xs uppercase tracking-wide text-brand-light font-semibold">Agenda</div>
            <div className="text-lg font-semibold text-slate-900">{label}</div>
          </div>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {events.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Eventos do dia</div>
              <ul className="space-y-2">
                {events.map((ev) => {
                  const color = ev.tagColor ?? "#1428FF";
                  return (
                    <li key={ev.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <div className="text-sm font-medium text-slate-900 truncate">{ev.time} · {ev.title}</div>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {(ev.kind ?? "Postagem")} · {ev.platforms.join(", ")} · {ev.status}
                        </div>
                        {ev.caption && <div className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.caption}</div>}
                        {ev.approvalToken && (
                          <button
                            type="button"
                            onClick={() => {
                              const link = `${window.location.origin}/aprovacao/${ev.approvalToken}`;
                              try { navigator.clipboard?.writeText(link); toast.success("Link copiado."); } catch { toast.error("Não foi possível copiar."); }
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-brand-light hover:underline"
                          >
                            <Link2 className="h-3 w-3" /> Copiar link de aprovação
                          </button>
                        )}
                        {ev.scriptFile && (
                          <a href={ev.scriptFile.dataUrl} download={ev.scriptFile.name} className="mt-1 ml-3 inline-flex items-center gap-1 text-xs text-brand-light hover:underline">
                            <FileText className="h-3 w-3" /> {ev.scriptFile.name}
                          </a>
                        )}
                      </div>
                      <button type="button" onClick={() => onDelete(ev.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {lastLink && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-semibold text-emerald-800 mb-1">Link de aprovação gerado</div>
              <div className="flex items-center gap-2">
                <input readOnly value={lastLink} className="flex-1 min-w-0 rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-xs text-slate-700" />
                <button type="button" onClick={() => { try { navigator.clipboard?.writeText(lastLink); toast.success("Copiado."); } catch { /* ignore */ } }} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                  <Copy className="h-3 w-3" /> Copiar
                </button>
              </div>
            </div>
          )}

          {!showForm && (
            <button type="button" onClick={() => setShowForm(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-brand-light hover:text-brand-light px-4 py-3 text-sm font-medium">
              <Plus className="h-4 w-4" /> Adicionar novo evento
            </button>
          )}

          {showForm && (
            <form onSubmit={kind === "Postagem" ? submitPostagem : submitGravacao} className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <span className="text-xs font-medium text-slate-600">Tipo</span>
                <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  {KINDS.map((k) => (
                    <button key={k} type="button" onClick={() => { setKind(k); setStatus(k === "Postagem" ? "Planejado" : "Planejado"); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${kind === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                      {k === "Postagem" ? "Conteúdo a postar" : "Dia de gravação"}
                    </button>
                  ))}
                </div>
              </div>
              <TextField label="Título do conteúdo" value={title} onChange={setTitle} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Horário" value={time} onChange={setTime} type="time" />
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Status</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)} className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900">
                    {useStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-600">Cor da tag</span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {TAG_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setTagColor(c)} aria-label={c}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${tagColor === c ? "scale-110 border-slate-900" : "border-white shadow-sm"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <label className="inline-flex items-center gap-1.5 ml-1 text-xs text-slate-500 cursor-pointer">
                    <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} className="h-7 w-7 rounded border border-slate-200 bg-white cursor-pointer" />
                    Personalizada
                  </label>
                </div>
              </div>

              <TextField label="Legenda" value={caption} onChange={setCaption} multiline />

              {kind === "Postagem" ? (
                <>
                  <UploadSlotField
                    label="Vídeo (preferencialmente 9:16, até 1 GB)"
                    icon={<Video className="h-4 w-4" />}
                    placeholder="Selecionar vídeo"
                    accept="video/*"
                    slot={videoUpload}
                    onFile={onVideoFile}
                    onRemove={() => clearSlot(videoUpload, setVideoUpload)}
                  />
                  <UploadSlotField
                    label="Capa do vídeo"
                    icon={<ImageIcon className="h-4 w-4" />}
                    placeholder="Selecionar imagem de capa"
                    accept="image/*"
                    slot={coverUpload}
                    onFile={onCoverFile}
                    onRemove={() => clearSlot(coverUpload, setCoverUpload)}
                    preview
                  />
                  <UploadSlotField
                    label="Roteiro em PDF (opcional)"
                    icon={<Upload className="h-4 w-4" />}
                    placeholder="Selecionar PDF do roteiro"
                    accept="application/pdf"
                    slot={scriptUpload}
                    onFile={onScriptFile}
                    onRemove={() => clearSlot(scriptUpload, setScriptUpload)}
                  />
                </>
              ) : (
                <>
                  <TextField label="Roteiro (texto)" value={script} onChange={setScript} multiline />
                  <UploadSlotField
                    label="Roteiro em PDF"
                    icon={<Upload className="h-4 w-4" />}
                    placeholder="Selecionar PDF do roteiro"
                    accept="application/pdf"
                    slot={scriptUpload}
                    onFile={onScriptFile}
                    onRemove={() => clearSlot(scriptUpload, setScriptUpload)}
                  />
                </>
              )}

              <div>
                <span className="text-xs font-medium text-slate-600">Plataformas</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const active = platforms.includes(p);
                    return (
                      <button key={p} type="button" onClick={() => setPlatforms((prev) => active ? prev.filter((x) => x !== p) : [...prev, p])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${active ? "bg-brand-gradient text-white border-transparent" : "bg-white border-slate-200 text-slate-600"}`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {events.length > 0 && (
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                )}
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm text-white font-medium">
                  {kind === "Postagem" ? (<><Link2 className="h-4 w-4" /> Salvar e gerar link de aprovação</>) : (<><Plus className="h-4 w-4" /> Salvar evento</>)}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
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
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20" />
      )}
    </label>
  );
}

function UploadSlotField({
  label, icon, placeholder, accept, slot, onFile, onRemove, preview,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  accept: string;
  slot: UploadSlot | undefined;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  preview?: boolean;
}) {
  const status = slot?.status;
  const percent = Math.min(100, Math.round(slot?.progress ?? 0));
  const displayName = slot?.file.name ?? placeholder;

  return (
    <div>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <label className="mt-1.5 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:border-brand-light hover:text-brand-light cursor-pointer">
        {icon}
        <span className="truncate flex-1">{displayName}</span>
        <input type="file" accept={accept} onChange={onFile} className="hidden" />
      </label>

      {slot && status === "uploading" && (
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-gradient transition-[width] duration-200" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Enviando… {percent}%</span>
            <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-red-600 hover:underline">
              <XCircle className="h-3 w-3" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {slot && status === "done" && (
        <div className="mt-2 flex items-center gap-2">
          {preview && slot.previewUrl && (
            <img src={slot.previewUrl} alt="Preview" className="h-14 w-14 object-cover rounded-md border border-slate-200" />
          )}
          <span className="text-[11px] text-emerald-600">Upload concluído</span>
          <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">Remover</button>
        </div>
      )}

      {slot && status === "error" && (
        <div className="mt-2 text-xs text-red-600">
          Falha no upload: {slot.errorMessage ?? "erro desconhecido"}
          <button type="button" onClick={onRemove} className="ml-2 underline">Remover</button>
        </div>
      )}
    </div>
  );
}
