import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, FileText, Bell, Save, ChevronLeft, ChevronRight, X, Upload, Folder, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/lib/admin/store";
import type { ContentStatus, Platform, CalendarKind } from "@/lib/portal/mockData";

const STATUSES: ContentStatus[] = ["Planejado", "Em Produção", "Aguardando Aprovação", "Aprovado", "Agendado", "Publicado", "Solicitou Alteração"];
const PLATFORMS: Platform[] = ["Instagram", "Facebook", "TikTok"];
const KINDS: CalendarKind[] = ["Postagem", "Gravação"];
const TAG_COLORS = ["#1428FF", "#4F7CFF", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#0EA5E9", "#64748B"];

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
  const { data, updateClient, deleteClient, addCalendarItem, deleteCalendarItem, addReport, deleteReport, addNotice, deleteNotice } = useAdminStore();
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
          items={client.calendar}
          onAdd={(item) => { addCalendarItem(client.id, item); toast.success("Conteúdo adicionado."); }}
          onDelete={(id) => { deleteCalendarItem(client.id, id); toast.success("Conteúdo removido."); }}
        />
      )}

      {tab === "relatorios" && (
        <ReportsManager
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

type CalItem = { id: string; title: string; caption: string; script: string; date: string; time: string; status: ContentStatus; platforms: Platform[] };

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function toISODate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function CalendarManager({ items, onAdd, onDelete }: { items: CalItem[]; onAdd: (i: Omit<CalItem, "id">) => void; onDelete: (id: string) => void }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
                {evts.slice(0, 3).map((e) => (
                  <div key={e.id} className="truncate rounded-md bg-brand-light/10 border border-brand-light/20 px-1.5 py-0.5 text-[10px] font-medium text-brand-DEFAULT">
                    {e.time && <span className="text-brand-light">{e.time} </span>}{e.title}
                  </div>
                ))}
                {evts.length > 3 && <div className="text-[10px] text-slate-500">+{evts.length - 3} mais</div>}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <DayModal
            date={selectedDate}
            events={eventsByDate.get(selectedDate) ?? []}
            onClose={() => setSelectedDate(null)}
            onAdd={(item) => onAdd({ ...item, date: selectedDate })}
            onDelete={onDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DayModal({ date, events, onClose, onAdd, onDelete }: { date: string; events: CalItem[]; onClose: () => void; onAdd: (item: Omit<CalItem, "id" | "date">) => void; onDelete: (id: string) => void }) {
  const [showForm, setShowForm] = useState(events.length === 0);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [script, setScript] = useState("");
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<ContentStatus>("Planejado");
  const [platforms, setPlatforms] = useState<Platform[]>(["Instagram"]);

  const [y, m, d] = date.split("-").map(Number);
  const label = `${String(d).padStart(2, "0")} de ${MONTHS_PT[m - 1]} de ${y}`;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title) { toast.error("Informe o título."); return; }
    onAdd({ title, caption, script, time, status, platforms });
    toast.success("Evento criado.");
    setTitle(""); setCaption(""); setScript("");
    setShowForm(false);
  }

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
                {events.map((ev) => (
                  <li key={ev.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{ev.time} · {ev.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{ev.platforms.join(", ")} · {ev.status}</div>
                      {ev.caption && <div className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.caption}</div>}
                    </div>
                    <button type="button" onClick={() => onDelete(ev.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!showForm && (
            <button type="button" onClick={() => setShowForm(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-brand-light hover:text-brand-light px-4 py-3 text-sm font-medium">
              <Plus className="h-4 w-4" /> Adicionar novo evento
            </button>
          )}

          {showForm && (
            <form onSubmit={submit} className="space-y-3 border-t border-slate-100 pt-4">
              <TextField label="Título" value={title} onChange={setTitle} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Hora" value={time} onChange={setTime} type="time" />
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Status</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)} className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <TextField label="Legenda" value={caption} onChange={setCaption} multiline />
              <TextField label="Roteiro" value={script} onChange={setScript} multiline />
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
                  <Plus className="h-4 w-4" /> Salvar evento
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

function ReportsManager({ items, onAdd, onDelete }: { items: ReportItem[]; onAdd: (r: Omit<ReportItem, "id">) => void; onDelete: (id: string) => void }) {
  const existingFolders = useMemo(() => {
    const set = new Set<string>();
    for (const r of items) if (r.folder) set.add(r.folder);
    return Array.from(set).sort();
  }, [items]);

  const [title, setTitle] = useState("");
  const [folderMode, setFolderMode] = useState<"existing" | "new">(existingFolders.length ? "existing" : "new");
  const [folderSelect, setFolderSelect] = useState(existingFolders[0] ?? "");
  const [folderNew, setFolderNew] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Envie um arquivo PDF."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("PDF muito grande (máx 10MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => { setFileDataUrl(String(reader.result)); setFileName(file.name); };
    reader.readAsDataURL(file);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const folder = (folderMode === "new" ? folderNew : folderSelect).trim();
    if (!title.trim()) { toast.error("Informe o título."); return; }
    if (!folder) { toast.error("Selecione ou crie uma pasta."); return; }
    if (!fileDataUrl) { toast.error("Envie o arquivo PDF."); return; }
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    onAdd({
      name: title.trim(),
      period: folder,
      date: dateLabel,
      summary: "",
      highlights: [],
      folder,
      fileName,
      fileDataUrl,
    });
    setTitle(""); setFileName(""); setFileDataUrl("");
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

        <div>
          <span className="text-xs font-medium text-slate-600">Arquivo PDF</span>
          <label className="mt-1.5 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600 hover:border-brand-light hover:text-brand-light cursor-pointer">
            <Upload className="h-4 w-4" />
            <span className="truncate">{fileName || "Selecionar PDF"}</span>
            <input type="file" accept="application/pdf" onChange={onFile} className="hidden" />
          </label>
          {fileDataUrl && (
            <button type="button" onClick={() => { setFileDataUrl(""); setFileName(""); }} className="mt-1.5 text-xs text-red-600 hover:underline">Remover arquivo</button>
          )}
        </div>

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
