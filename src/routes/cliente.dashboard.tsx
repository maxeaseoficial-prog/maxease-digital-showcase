import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
import { mockActivities, mockClient } from "@/lib/portal/mockData";

export const Route = createFileRoute("/cliente/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

const cards = [
  {
    icon: Package,
    label: "Projeto ativo",
    value: mockClient.activeProject,
    accent: "from-brand-blue/30 to-transparent",
    to: "/cliente/calendario" as const,
  },
  {
    icon: FileVideo,
    label: "Conteúdos do mês",
    value: `${mockClient.publishedContent} / ${mockClient.monthlyContent}`,
    accent: "from-brand-light/25 to-transparent",
    to: "/cliente/calendario" as const,
  },
  {
    icon: CheckCircle2,
    label: "Aguardando aprovação",
    value: String(mockClient.pendingApproval),
    accent: "from-yellow-400/20 to-transparent",
    to: "/cliente/aprovacoes" as const,
  },
  {
    icon: CalendarClock,
    label: "Próxima gravação",
    value: `${mockClient.nextRecording.date} • ${mockClient.nextRecording.time}`,
    accent: "from-sky-400/25 to-transparent",
    to: "/cliente/gravacoes" as const,
  },
  {
    icon: FileBarChart,
    label: "Último relatório",
    value: mockClient.lastReport,
    accent: "from-emerald-400/20 to-transparent",
    to: "/cliente/relatorios" as const,
  },
  {
    icon: Megaphone,
    label: "Campanha ativa",
    value: mockClient.activeCampaign,
    accent: "from-fuchsia-400/20 to-transparent",
    to: "/cliente/calendario" as const,
  },
  {
    icon: Rocket,
    label: "Próximo post",
    value: `${mockClient.nextPost.title}`,
    subtitle: `${mockClient.nextPost.date} às ${mockClient.nextPost.time}`,
    accent: "from-brand-bright/30 to-transparent",
    to: "/cliente/calendario" as const,
  },
];

function DashboardPage() {
  return (
    <div>
      <PortalPageHeader
        title={`Olá, ${mockClient.name}`}
        subtitle="Aqui está o resumo geral do seu projeto com a MAXEASE Digital."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={c.to}
                className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${c.accent} p-5 hover:border-white/25 transition-all hover:scale-[1.02]`}
              >
                <div className="absolute inset-0 glass opacity-90 -z-10" />
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(30,64,255,0.7)]">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wider text-white/50">{c.label}</div>
                  <div className="mt-1 text-lg font-semibold">{c.value}</div>
                  {c.subtitle && <div className="text-xs text-white/60 mt-1">{c.subtitle}</div>}
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
            <StatusBadge status={mockClient.overallStatus} className="bg-emerald-500/15 text-emerald-300 border-emerald-400/30" />
          </div>
          <ul className="divide-y divide-white/5">
            {mockActivities.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-brand-light shrink-0" />
                  <span className="text-sm text-white/85 truncate">{a.text}</span>
                </div>
                <span className="text-xs text-white/50 shrink-0 ml-3">{a.date}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
