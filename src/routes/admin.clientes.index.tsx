import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Users, Trash2, ArrowRight, X, Building2, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/clientes/")({
  head: () => ({ meta: [{ title: "Clientes — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <ClientesContent />
    </AdminShell>
  ),
});

function ClientesContent() {
  const { data, createClient, deleteClient } = useAdminStore();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <AdminPageHeader
        title="Clientes"
        subtitle="Crie logins e gerencie a área de cada cliente."
        action={
          <button type="button" onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> Novo cliente
          </button>
        }
      />

      {data.clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Nenhum cliente cadastrado</h3>
          <p className="mt-1 text-sm text-slate-500">Crie o primeiro cliente para gerar login e liberar a área exclusiva.</p>
          <button type="button" onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> Criar cliente
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.clients.map((c) => (
            <div key={c.id} className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-semibold overflow-hidden">
                  {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" /> : c.company.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Excluir cliente ${c.company}?`)) {
                      deleteClient(c.id);
                      toast.success("Cliente excluído.");
                    }
                  }}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4">
                <div className="text-base font-semibold text-slate-900">{c.company}</div>
                <div className="text-sm text-slate-500">{c.name}</div>
              </div>
              <div className="mt-3 text-xs text-slate-500 break-all">{c.email}</div>
              <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500">
                <span>{c.calendar.length} conteúdos</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{c.reports.length} relatórios</span>
              </div>
              <Link to="/admin/clientes/$clientId" params={{ clientId: c.id }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-light font-medium">
                Gerenciar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {open && <NewClientModal onClose={() => setOpen(false)} onCreate={(input) => {
        const c = createClient(input);
        toast.success(`Cliente ${c.company} criado.`);
        setOpen(false);
      }} />}
    </div>
  );
}

function NewClientModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: { email: string; password: string; name: string; company: string; activeProject: string }) => void }) {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [project, setProject] = useState("Gestão de Redes Sociais");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!company || !email || !password) {
      toast.error("Preencha empresa, e-mail e senha.");
      return;
    }
    onCreate({ company, name: name || company, email: email.trim().toLowerCase(), password, activeProject: project });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Novo cliente</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <IconField icon={Building2} label="Empresa" value={company} onChange={setCompany} placeholder="Ex: For Action" />
          <IconField icon={UserIcon} label="Nome do responsável" value={name} onChange={setName} placeholder="Ex: Marina Silva" />
          <IconField icon={Mail} label="E-mail (login)" value={email} onChange={setEmail} placeholder="cliente@empresa.com" type="email" />
          <IconField icon={Lock} label="Senha" value={password} onChange={setPassword} placeholder="mín. 6 caracteres" type="text" />
          <IconField icon={Building2} label="Projeto ativo" value={project} onChange={setProject} />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gradient text-sm text-white font-medium">
              <Plus className="h-4 w-4" /> Criar cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IconField({ icon: Icon, label, value, onChange, placeholder, type = "text" }: { icon: typeof Mail; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
        />
      </div>
    </label>
  );
}
