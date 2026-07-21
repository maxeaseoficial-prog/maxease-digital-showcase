import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Video, FileText, Info } from "lucide-react";
import { PortalPageHeader, StatusBadge } from "@/components/portal/PortalShell";
import { mockRecordings } from "@/lib/portal/mockData";

export const Route = createFileRoute("/cliente/gravacoes")({
  head: () => ({ meta: [{ title: "Próximas Gravações — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: GravacoesPage,
});

const STATUS: Record<string, string> = {
  "Confirmada": "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  "A Confirmar": "bg-yellow-500/15 text-yellow-300 border-yellow-400/30",
  "Reagendada": "bg-orange-500/15 text-orange-300 border-orange-400/30",
};

function GravacoesPage() {
  return (
    <div>
      <PortalPageHeader
        title="Próximas Gravações"
        subtitle="Acompanhe os detalhes das próximas gravações agendadas para o seu projeto."
      />

      <div className="space-y-5">
        {mockRecordings.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-white/10 glass p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-brand-gradient flex flex-col items-center justify-center shrink-0 shadow-[0_10px_25px_-10px_rgba(30,64,255,0.7)]">
                  <span className="text-[10px] text-white/80 leading-none">{r.date.split("/")[1]}/{r.date.split("/")[2]}</span>
                  <span className="text-xl font-bold leading-tight">{r.date.split("/")[0]}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Gravação {r.date}</h2>
                  <p className="text-sm text-white/60 mt-0.5">{r.objective}</p>
                </div>
              </div>
              <StatusBadge status={r.status} className={STATUS[r.status]} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <InfoTile icon={CalendarDays} label="Data" value={r.date} />
              <InfoTile icon={Clock} label="Horário / Duração" value={`${r.time} • ${r.estimated}`} />
              <InfoTile icon={MapPin} label="Local" value={r.location} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-white/50 mb-2">
                  <Video className="h-3.5 w-3.5" /> Vídeos previstos
                </div>
                <ul className="space-y-1.5">
                  {r.videos.map((v) => (
                    <li key={v} className="text-sm text-white/85 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-light" /> {v}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-white/50 mb-2">
                  <FileText className="h-3.5 w-3.5" /> Roteiro
                </div>
                <p className="text-sm text-white/85 leading-relaxed">{r.scriptSummary}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-white/50 mb-2">
                  <Info className="h-3.5 w-3.5" /> Observações
                </div>
                <p className="text-sm text-white/85 leading-relaxed">{r.notes}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3">
      <Icon className="h-4 w-4 text-brand-light shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-white/50">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
