import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, CalendarDays, FileText, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/lib/admin/store";
import type { ContentStatus, Platform } from "@/lib/portal/mockData";

const STATUSES: ContentStatus[] = ["Planejado", "Em Produção", "Aguardando Aprovação", "Aprovado", "Agendado", "Publicado", "Solicitou Alteração"];
const PLATFORMS: Platform[] = ["Instagram", "Facebook", "TikTok"];

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

function ProfileEditor({ initial, onSave }: { initial: { name: string; company: string; email: string; password: string; activeProject: string }; onSave: (patch: { name: string; company: string; email: string; password: string; activeProject: string }) => void }) {
  const [name, setName] = useState(initial.name);
  const [company, setCompany] = useState(initial.company);
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState(initial.password);
  const [project, setProject] = useState(initial.activeProject);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-slate-900">Dados do cliente</h2>
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
        <button type="button" onClick={() => onSave({ name, company, email: email.trim().toLowerCase(), password, activeProject: project })}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white">
          <Save className="h-4 w-4" /> Salvar alterações
        </button>
      </div>
    </div>
  );
}

function CalendarManager({ items, onAdd, onDelete }: { items: { id: string; title: string; caption: string; script: string; date: string; time: string; status: ContentStatus; platforms: Platform[] }[]; onAdd: (i: { title: string; caption: string; script: string; date: string; time: string; status: ContentStatus; platforms: Platform[] }) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [script, setScript] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<ContentStatus>("Planejado");
  const [platforms, setPlatforms] = useState<Platform[]>(["Instagram"]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title || !date) { toast.error("Preencha título e data."); return; }
    onAdd({ title, caption, script, date, time, status, platforms });
    setTitle(""); setCaption(""); setScript("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Conteúdos programados</h2>
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
            <CalendarDays className="h-5 w-5 text-slate-300 mx-auto mb-2" />
            Nenhum conteúdo adicionado ainda.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.slice().sort((a, b) => a.date.localeCompare(b.date)).map((c) => (
              <li key={c.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.date} · {c.time} · {c.platforms.join(", ")}</div>
                  <div className="mt-1 inline-flex text-[10px] uppercase tracking-wide font-semibold text-slate-500">{c.status}</div>
                </div>
                <button type="button" onClick={() => onDelete(c.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 h-fit">
        <h2 className="text-sm font-semibold text-slate-900">Novo conteúdo</h2>
        <TextField label="Título" value={title} onChange={setTitle} />
        <TextField label="Legenda" value={caption} onChange={setCaption} multiline />
        <TextField label="Roteiro" value={script} onChange={setScript} multiline />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Data" value={date} onChange={setDate} type="date" />
          <TextField label="Hora" value={time} onChange={setTime} type="time" />
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)}
            className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
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
        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm text-white font-medium">
          <Plus className="h-4 w-4" /> Adicionar conteúdo
        </button>
      </form>
    </div>
  );
}

function ReportsManager({ items, onAdd, onDelete }: { items: { id: string; name: string; period: string; date: string; summary: string; highlights: { label: string; value: string }[] }[]; onAdd: (r: { name: string; period: string; date: string; summary: string; highlights: { label: string; value: string }[] }) => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState("Relatório de Marketing");
  const [period, setPeriod] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [h1, setH1] = useState(""); const [h2, setH2] = useState("");
  const [h3, setH3] = useState(""); const [h4, setH4] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!date) { toast.error("Preencha o período (ex: Julho 2026)."); return; }
    onAdd({
      name, period, date, summary,
      highlights: [
        { label: "Alcance", value: h1 || "—" },
        { label: "Engajamento", value: h2 || "—" },
        { label: "Novos seguidores", value: h3 || "—" },
        { label: "Conteúdos publicados", value: h4 || "—" },
      ],
    });
    setPeriod(""); setDate(""); setSummary(""); setH1(""); setH2(""); setH3(""); setH4("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Relatórios publicados</h2>
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
            <FileText className="h-5 w-5 text-slate-300 mx-auto mb-2" />
            Nenhum relatório publicado.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{r.name} · {r.date}</div>
                  <div className="text-xs text-slate-500">{r.period}</div>
                </div>
                <button type="button" onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 h-fit">
        <h2 className="text-sm font-semibold text-slate-900">Novo relatório</h2>
        <TextField label="Nome" value={name} onChange={setName} />
        <TextField label="Período" value={period} onChange={setPeriod} placeholder="01/07 a 31/07" />
        <TextField label="Mês/Ano de referência" value={date} onChange={setDate} placeholder="Julho 2026" />
        <TextField label="Resumo executivo" value={summary} onChange={setSummary} multiline />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Alcance" value={h1} onChange={setH1} />
          <TextField label="Engajamento" value={h2} onChange={setH2} />
          <TextField label="Novos seguidores" value={h3} onChange={setH3} />
          <TextField label="Publicados" value={h4} onChange={setH4} />
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
