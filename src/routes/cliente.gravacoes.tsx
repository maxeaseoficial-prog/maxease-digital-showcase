import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  FileText,
  Info,
  ChevronDown,
  Download,
  Eye,
  Users,
  Camera,
} from "lucide-react";
import { PortalPageHeader, StatusBadge } from "@/components/portal/PortalShell";
import { mockRecordings } from "@/lib/portal/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/gravacoes")({
  head: () => ({ meta: [{ title: "Próximas Gravações — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: GravacoesPage,
});

const STATUS: Record<string, string> = {
  "Confirmada": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "A Confirmar": "bg-amber-100 text-amber-800 border-amber-300",
  "Reagendada": "bg-orange-100 text-orange-800 border-orange-300",
};

function GravacoesPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <PortalPageHeader
        title="Próximas Gravações"
        subtitle="Acompanhe os detalhes das próximas gravações agendadas para o seu projeto."
      />

      <div className="space-y-3">
        {mockRecordings.map((r, i) => {
          const isOpen = openId === r.id;
          return (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Compact header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-gradient flex flex-col items-center justify-center shrink-0 text-white leading-none">
                    <span className="text-[9px] uppercase opacity-80">
                      {monthAbbr(r.date)}
                    </span>
                    <span className="text-lg font-bold">{r.date.split("/")[0]}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-slate-900 truncate">
                        Gravação {r.date}
                      </h2>
                      <StatusBadge status={r.status} className={STATUS[r.status]} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {r.time} • {r.estimated}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {r.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" /> {r.videos.length} vídeos
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenId(isOpen ? null : r.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light hover:text-brand-DEFAULT px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-light/40 hover:bg-brand-light/5 transition-colors shrink-0"
                  >
                    {isOpen ? "Ocultar" : "Ver mais"}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Expandable details */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-200 bg-slate-50/60"
                  >
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InfoTile icon={CalendarDays} label="Data" value={r.date} />
                        <InfoTile icon={Clock} label="Horário / Duração" value={`${r.time} • ${r.estimated}`} />
                        <InfoTile icon={MapPin} label="Local" value={r.location} />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <Section icon={Video} title={`Vídeos previstos (${r.videos.length})`}>
                          <ul className="space-y-1.5">
                            {r.videos.map((v) => (
                              <li key={v} className="text-sm text-slate-700 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-light" /> {v}
                              </li>
                            ))}
                          </ul>
                        </Section>

                        <Section icon={FileText} title="Resumo do roteiro">
                          <p className="text-sm text-slate-700 leading-relaxed">{r.scriptSummary}</p>
                        </Section>

                        {r.team && r.team.length > 0 && (
                          <Section icon={Users} title="Equipe">
                            <ul className="space-y-1 text-sm text-slate-700">
                              {r.team.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                          </Section>
                        )}

                        {r.equipment && r.equipment.length > 0 && (
                          <Section icon={Camera} title="Equipamentos">
                            <ul className="space-y-1 text-sm text-slate-700">
                              {r.equipment.map((e) => <li key={e}>{e}</li>)}
                            </ul>
                          </Section>
                        )}
                      </div>

                      {r.scripts && r.scripts.length > 0 && (
                        <Section icon={FileText} title={`Roteiros em PDF (${r.scripts.length})`}>
                          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
                            {r.scripts.map((s) => (
                              <li key={s.name} className="flex items-center gap-3 p-3">
                                <div className="h-9 w-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4 text-rose-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-slate-900 truncate">{s.name}</div>
                                  <div className="text-xs text-slate-500">PDF • {s.size}</div>
                                </div>
                                <button
                                  onClick={() => toast.info(`Abrindo ${s.name}`)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-brand-light px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Visualizar
                                </button>
                                <button
                                  onClick={() => toast.success(`Download iniciado: ${s.name}`)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-brand-light hover:bg-brand-DEFAULT px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" /> Baixar
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Section>
                      )}

                      <Section icon={Info} title="Observações">
                        <p className="text-sm text-slate-700 leading-relaxed">{r.notes}</p>
                      </Section>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 flex items-center gap-3">
      <Icon className="h-4 w-4 text-brand-light shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-slate-500 tracking-wide">{label}</div>
        <div className="text-sm font-medium text-slate-900 truncate">{value}</div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CalendarDays;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs uppercase text-slate-500 tracking-wide mb-2">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
function monthAbbr(date: string) {
  const parts = date.split("/");
  const m = parseInt(parts[1] ?? "0", 10);
  return MONTHS[m - 1] ?? "";
}
