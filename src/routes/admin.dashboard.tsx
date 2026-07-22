import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Settings, CalendarDays, FileText, ArrowRight } from "lucide-react";
import { AdminShell, AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Admin — MAXEASE" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  ),
});

function DashboardContent() {
  const { data } = useAdminStore();
  const totalCalendar = data.clients.reduce((s, c) => s + c.calendar.length, 0);
  const totalReports = data.clients.reduce((s, c) => s + c.reports.length, 0);

  const stats = [
    { label: "Clientes ativos", value: data.clients.length, icon: Users, to: "/admin/clientes" as const },
    { label: "Conteúdos programados", value: totalCalendar, icon: CalendarDays, to: "/admin/clientes" as const },
    { label: "Relatórios publicados", value: totalReports, icon: FileText, to: "/admin/clientes" as const },
    { label: "Configurações do site", value: "Editar", icon: Settings, to: "/admin/site" as const },
  ];

  return (
    <div>
      <AdminPageHeader title="Visão geral" subtitle="Gerencie seu site e a área de clientes em um só lugar." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-light/40 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-light group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4 text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-4">
        <Link to="/admin/clientes" className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm transition-all">
          <h2 className="text-base font-semibold text-slate-900">Gerenciar clientes</h2>
          <p className="mt-1 text-sm text-slate-500">Crie logins, personalize calendários e envie relatórios individuais.</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-light font-medium">
            Abrir clientes <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
        <Link to="/admin/site" className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm transition-all">
          <h2 className="text-base font-semibold text-slate-900">Configurações do site</h2>
          <p className="mt-1 text-sm text-slate-500">Atualize links de contato (WhatsApp, Instagram, YouTube, e-mail) e textos principais.</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-light font-medium">
            Abrir configurações <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
