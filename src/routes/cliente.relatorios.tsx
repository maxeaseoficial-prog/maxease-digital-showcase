import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FileBarChart, Download, X, TrendingUp } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/PortalShell";
import { mockReports, type Report } from "@/lib/portal/mockData";

export const Route = createFileRoute("/cliente/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [selected, setSelected] = useState<Report | null>(null);

  return (
    <div>
      <PortalPageHeader
        title="Relatórios"
        subtitle="Acompanhe o desempenho mensal das suas campanhas e conteúdos."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {mockReports.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            type="button"
            onClick={() => setSelected(r)}
            className="group text-left rounded-2xl border border-white/10 glass p-5 hover:border-white/25 hover:scale-[1.02] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(30,64,255,0.7)]">
                <FileBarChart className="h-5 w-5" />
              </div>
              <span className="text-[11px] text-white/50">{r.period}</span>
            </div>
            <div className="text-lg font-semibold">{r.date}</div>
            <div className="text-sm text-white/60 mt-1 line-clamp-2">{r.summary}</div>
            <div className="mt-4 flex items-center text-xs text-brand-light group-hover:text-white transition-colors">
              Ver detalhes <TrendingUp className="h-3.5 w-3.5 ml-1.5" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-xl glass-strong rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-elegant p-6 sm:p-7 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-xs text-white/50">{selected.period}</div>
                  <h2 className="text-2xl font-bold mt-1">{selected.name}</h2>
                  <div className="text-sm text-white/70 mt-1">{selected.date}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {selected.highlights.map((h) => (
                  <div key={h.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase text-white/50">{h.label}</div>
                    <div className="text-xl font-bold mt-1">{h.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-5">
                <div className="text-xs uppercase text-white/50 mb-2">Resumo</div>
                <p className="text-sm text-white/85 leading-relaxed">{selected.summary}</p>
              </div>

              <button
                type="button"
                onClick={() => alert("Download em breve. Entre em contato para receber o PDF completo.")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-medium shadow-[0_10px_30px_-8px_rgba(30,64,255,0.6)] hover:scale-[1.02] transition-transform"
              >
                <Download className="h-4 w-4" /> Baixar relatório em PDF
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
