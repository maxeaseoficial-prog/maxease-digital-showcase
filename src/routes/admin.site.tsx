import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/site")({
  head: () => ({ meta: [{ title: "Configurações do Site — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <SiteConfigContent />
    </AdminShell>
  ),
});

function SiteConfigContent() {
  const { data, updateSite, hydrated } = useAdminStore();
  const [form, setForm] = useState(data.site);

  useEffect(() => {
    if (hydrated) setForm(data.site);
  }, [hydrated, data.site]);

  function save() {
    updateSite(form);
    toast.success("Configurações atualizadas.");
  }

  return (
    <div>
      <AdminPageHeader
        title="Configurações do Site"
        subtitle="Atualize links de contato e textos principais exibidos no site institucional."
        action={
          <button type="button" onClick={save}
            className="inline-flex items-center gap-2 h-9 rounded-lg bg-slate-900 px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-slate-800">
            <Save className="h-4 w-4" /> Salvar alterações
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Links de contato</h2>
          <p className="text-xs text-slate-500 mt-1">Aparecem no rodapé, na navbar e nos CTAs do site.</p>
          <div className="mt-5 space-y-4">
            <Field label="E-mail" value={form.contact.email} onChange={(v) => setForm((f) => ({ ...f, contact: { ...f.contact, email: v } }))} />
            <Field label="WhatsApp (URL)" value={form.contact.whatsapp} onChange={(v) => setForm((f) => ({ ...f, contact: { ...f.contact, whatsapp: v } }))} placeholder="https://wa.me/..." />
            <Field label="Instagram (URL)" value={form.contact.instagram} onChange={(v) => setForm((f) => ({ ...f, contact: { ...f.contact, instagram: v } }))} />
            <Field label="YouTube (URL)" value={form.contact.youtube} onChange={(v) => setForm((f) => ({ ...f, contact: { ...f.contact, youtube: v } }))} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Textos da Hero</h2>
          <p className="text-xs text-slate-500 mt-1">Título e subtítulo exibidos na primeira dobra da home.</p>
          <div className="mt-5 space-y-4">
            <Field label="Título principal" value={form.hero.title} onChange={(v) => setForm((f) => ({ ...f, hero: { ...f.hero, title: v } }))} />
            <Field label="Subtítulo" value={form.hero.subtitle} onChange={(v) => setForm((f) => ({ ...f, hero: { ...f.hero, subtitle: v } }))} multiline />
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        As alterações são salvas localmente neste navegador. Para propagar para o site publicado em produção com persistência real, conecte o backend (Lovable Cloud).
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
        />
      )}
    </label>
  );
}
