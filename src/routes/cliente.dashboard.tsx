import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Package,
  FileVideo,
  CheckCircle2,
  CalendarClock,
  FileBarChart,
  Megaphone,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { PortalPageHeader, StatusBadge } from "@/components/portal/PortalShell";
import { usePortalAuth } from "@/lib/portal/auth";
import { usePortalData } from "@/lib/portal/data";

export const Route = createFileRoute("/cliente/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = usePortalAuth();
  const { calendar, notices, reports, loading, error } = usePortalData();

  const stats = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const thisMonth = calendar.filter((c) => {
      const [yy, mm] = c.date.split("-").map(Number);
      return yy === y && (mm - 1) === m;
    });
    const published = thisMonth.filter((c) => c.status === "Publicado").length;
    const monthly = thisMonth.length;
    const pending = calendar.filter((c) => c.status === "Aguardando Aprovação" || c.status === "Pendente de aprovação").length;
    const upcomingRec = calendar
      .filter((c) => c.kind === "Gravação" && c.date >= `${y}-${String(m + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const nextPost = calendar
      .filter((c) => c.kind !== "Gravação" && (c.status === "Agendado" || c.status === "Aprovado" || c.status === "Planejado"))
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const lastReport = reports[0];
    return { published, monthly, pending, upcomingRec, nextPost, lastReport };
  }, [calendar, reports]);

  const cards = [
    {
      icon: Package, label: "Projeto ativo",
      value: session?.company || "—",
      accent: "from-brand-blue/30 to-transparent", to: "/cliente/calendario" as const,
    },
    {
      icon: FileVideo, label: "Conteúdos do mês",
      value: `${stats.published} / ${stats.monthly}`,
      accent: "from-brand-light/25 to-transparent", to: "/cliente/calendario" as const,
    },
    {
      icon: CheckCircle2, label: "Aguardando aprovação",
      value: String(stats.pending),
      accent: "from-yellow-400/20 to-transparent", to: "/cliente/aprovacoes" as const,
    },
    {
      icon: CalendarClock, label: "Próxima gravação",
      value: stats.upcomingRec ? `${formatBr(stats.upcomingRec.date)} • ${stats.upcomingRec.time || ""}` : "Nenhuma agendada",
      accent: "from-sky-400/25 to-transparent", to: "/cliente/gravacoes" as const,
    },
    {
      icon: FileBarChart, label: "Último relatório",
      value: stats.lastReport?.name ?? "—",
      subtitle: stats.lastReport?.date,
      accent: "from-emerald-400/20 to-transparent", to: "/cliente/relatorios" as const,
    },
    {
      icon: Megaphone, label: "Avisos não lidos",
      value: String(notices.filter((n) => !n.read).length),
      accent: "from-fuchsia-400/20 to-transparent", to: "/cliente/avisos" as const,
    },
    {
      icon: Rocket, label: "Próximo post",
      value: stats.nextPost?.title ?? "Nenhum agendado",
      subtitle: stats.nextPost ? `${formatBr(stats.nextPost.date)} às ${stats.nextPost.time || ""}` : undefined,
      accent: "from-brand-bright/30 to-transparent", to: "/cliente/calendario" as const,
    },
  ];

  const recent = useMemo(() => {
    const items: { id: string; text: string; date: string }[] = [];
    for (const n of notices.slice(0, 3)) items.push({ id: `n-${n.id}`, text: n.title, date: n.date });
    for (const c of calendar.slice(0, 3)) items.push({ id: `c-${c.id}`, text: `${c.title} • ${c.status}`, date: formatBr(c.date) });
    return items.slice(0, 6);
  }, [notices, calendar]);

  return (
    <div>
      <PortalPageHeader
        title={`Olá, ${session?.name ?? ""}`}
        subtitle="Aqui está o resumo geral do seu projeto com a MAXEASE Digital."
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <Link
                to={c.to}
                className="group relative block overflow-hidden rounded-2xl border border-white/10 p-5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 glass opacity-90 -z-10" />
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900">
                    <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-white/70" />
                </div>
                <div className="mt-6">
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">{c.label}</div>
                  <div className="mt-1.5 text-[17px] font-semibold tracking-[-0.01em]">{loading ? "…" : c.value}</div>
                  {"subtitle" in c && c.subtitle && <div className="mt-1 text-[12.5px] text-white/60">{c.subtitle}</div>}
                </div>
              </Link>
            </motion.div>
          );
        })}


        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 glass p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/50">Status geral</div>
              <div className="mt-1 text-lg font-semibold">Últimas atualizações do projeto</div>
            </div>
            <StatusBadge status="Em andamento" className="bg-emerald-500/15 text-emerald-300 border-emerald-400/30" />
          </div>
          {loading ? (
            <div className="text-sm text-white/60 py-6 text-center">Carregando...</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-white/50 py-6 text-center">Nenhuma atividade recente.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-brand-light shrink-0" />
                    <span className="text-sm text-white/85 truncate">{a.text}</span>
                  </div>
                  <span className="text-xs text-white/50 shrink-0 ml-3">{a.date}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function formatBr(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm p-3">
      Não foi possível carregar todos os dados. {message}
    </div>
  );
}
