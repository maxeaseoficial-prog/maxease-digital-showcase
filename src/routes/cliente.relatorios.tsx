import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText, ArrowLeft } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/PortalShell";
import { mockReports, mockClient, type Report } from "@/lib/portal/mockData";
import { toast } from "sonner";

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
        subtitle="Clique em uma pasta para abrir o relatório em PDF."
      />

      {/* Finder-style folder grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
        {mockReports.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            type="button"
            onClick={() => setSelected(r)}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-100 focus:bg-brand-light/10 focus:outline-none transition-colors"
          >
            <FolderIcon />
            <div className="text-center">
              <div className="text-sm font-medium text-slate-800 leading-tight">{r.date}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{r.period}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && <PdfViewer report={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FolderIcon() {
  return (
    <div className="relative w-24 h-20 sm:w-28 sm:h-24 transition-transform group-hover:-translate-y-1 group-hover:scale-105 drop-shadow-[0_8px_16px_rgba(30,64,255,0.25)]">
      <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#1E40FF" />
          </linearGradient>
          <linearGradient id="folderFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B93FF" />
            <stop offset="100%" stopColor="#1428FF" />
          </linearGradient>
        </defs>
        {/* Back tab */}
        <path
          d="M8 18 Q8 12 14 12 H46 L54 22 H106 Q112 22 112 28 V44 H8 Z"
          fill="url(#folderBack)"
        />
        {/* Paper sheet peeking */}
        <rect x="20" y="30" width="80" height="55" rx="3" fill="#ffffff" opacity="0.95" />
        <rect x="26" y="38" width="50" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="26" y="46" width="65" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="26" y="54" width="40" height="3" rx="1.5" fill="#e2e8f0" />
        {/* Front */}
        <path
          d="M8 40 H112 V88 Q112 94 106 94 H14 Q8 94 8 88 Z"
          fill="url(#folderFront)"
        />
        {/* Highlight */}
        <path d="M8 40 H112 V46 H8 Z" fill="#ffffff" opacity="0.15" />
      </svg>
    </div>
  );
}

function PdfViewer({ report, onClose }: { report: Report; onClose: () => void }) {
  const filename = `Relatorio-${report.date.replace(/\s+/g, "-")}.pdf`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-800 border-b border-slate-700 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm text-slate-200 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-white shrink-0" />
            <span className="text-sm truncate text-white">{filename}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success(`Download iniciado: ${filename}`)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-light hover:bg-brand-DEFAULT px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" /> Baixar PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-md flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* PDF page area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mx-auto bg-white text-slate-900 shadow-2xl rounded-sm max-w-3xl aspect-[1/1.414] p-8 sm:p-14 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-light font-semibold">
                MAXEASE Digital
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">
                {report.name}
              </h1>
              <div className="text-sm text-slate-500 mt-1">
                Período: {report.period} • Cliente: {mockClient.company}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase text-slate-400">Referência</div>
              <div className="text-sm font-semibold text-slate-700">{report.date}</div>
            </div>
          </div>

          {/* KPIs */}
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">
              Destaques do período
            </div>
            <div className="grid grid-cols-2 gap-3">
              {report.highlights.map((h) => (
                <div
                  key={h.label}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="text-[10px] uppercase text-slate-500 tracking-wide">
                    {h.label}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{h.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Resumo executivo
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{report.summary}</p>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span>MAXEASE Digital • Relatório confidencial</span>
            <span>Página 1</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
