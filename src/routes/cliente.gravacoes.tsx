import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Video,
  FileText,
  Info,
  ChevronDown,
  Download,
  Eye,
} from "lucide-react";
import { PortalPageHeader, StatusBadge } from "@/components/portal/PortalShell";
import { usePortalData } from "@/lib/portal/data";
import type { CalendarContent } from "@/lib/portal/mockData";

export const Route = createFileRoute("/cliente/gravacoes")({
  head: () => ({ meta: [{ title: "Próximas Gravações — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: GravacoesPage,
});

function GravacoesPage() {
  const { calendar, loading, error } = usePortalData();
  const [openId, setOpenId] = useState<string | null>(null);

  const recordings = useMemo(
    () =>
      calendar
        .filter((c) => c.kind === "Gravação")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [calendar],
  );

  return (
    <div>
      <PortalPageHeader
        title="Próximas Gravações"
        subtitle="Acompanhe os detalhes das próximas gravações agendadas para o seu projeto."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          Falha ao carregar gravações: {error}
        </div>
      )}

      {loading && recordings.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Carregando gravações...
        </div>
      )}

      {!loading && recordings.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Nenhuma gravação agendada no momento.
        </div>
      )}

      <div className="space-y-3">
        {recordings.map((r, i) => {
          const isOpen = openId === r.id;
          const status = r.status === "Agendado" || r.status === "Planejado" ? "Confirmada" : "A Confirmar";
          const [yy, mm, dd] = r.date.split("-");
          const dateBr = `${dd}/${mm}/${yy}`;
          return (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 flex flex-col items-center justify-center shrink-0 text-white leading-none">
                    <span className="text-[9px] uppercase opacity-80">{monthAbbr(mm)}</span>
                    <span className="text-lg font-bold">{dd}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-slate-900 truncate">{r.title || `Gravação ${dateBr}`}</h2>
                      <StatusBadge status={status} className={status === "Confirmada" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {r.time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {r.time}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" /> {r.kind}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenId(isOpen ? null : r.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light hover:text-brand-DEFAULT px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-light/40 hover:bg-brand-light/5 transition-colors shrink-0"
                  >
                    {isOpen ? "Ocultar" : "Ver mais"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoTile icon={CalendarDays} label="Data" value={dateBr} />
                        {r.time && <InfoTile icon={Clock} label="Horário" value={r.time} />}
                      </div>

                      {r.script && (
                        <Section icon={FileText} title="Resumo do roteiro">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{r.script}</p>
                        </Section>
                      )}

                      {r.scriptFile && (
                        <Section icon={FileText} title="Roteiro em PDF">
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                            <div className="h-9 w-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-900 truncate">{r.scriptFile.name}</div>
                              <div className="text-xs text-slate-500">PDF</div>
                            </div>
                            <a href={r.scriptFile.dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-brand-light px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
                              <Eye className="h-3.5 w-3.5" /> Visualizar
                            </a>
                            <a href={r.scriptFile.dataUrl} download={r.scriptFile.name} className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-brand-light hover:bg-brand-DEFAULT px-2.5 py-1.5 rounded-md transition-colors">
                              <Download className="h-3.5 w-3.5" /> Baixar
                            </a>
                          </div>
                        </Section>
                      )}

                      {r.caption && (
                        <Section icon={Info} title="Observações">
                          <p className="text-sm text-slate-700 leading-relaxed">{r.caption}</p>
                        </Section>
                      )}
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

function Section({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
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
function monthAbbr(mm: string) {
  const m = parseInt(mm, 10);
  return MONTHS[m - 1] ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Ref = CalendarContent;
