import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PortalPageHeader } from "@/components/portal/PortalShell";
import { usePortalAuth } from "@/lib/portal/auth";
import { usePortalData } from "@/lib/portal/data";
import type { Report } from "@/lib/portal/mockData";

export const Route = createFileRoute("/cliente/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { session } = usePortalAuth();
  const { reports, loading, error } = usePortalData();
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);

  const folders = useMemo(() => {
    const map = new Map<string, Report[]>();
    for (const r of reports) {
      const key = r.folder ?? r.date ?? "Sem pasta";
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [reports]);

  const currentFolder = openFolder ? folders.find(([n]) => n === openFolder) : null;

  return (
    <div>
      <PortalPageHeader
        title="Relatórios"
        subtitle={openFolder ? `Pasta: ${openFolder}` : "Clique em uma pasta para abrir os relatórios em PDF."}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          Falha ao carregar relatórios: {error}
        </div>
      )}

      {openFolder && (
        <button type="button" onClick={() => setOpenFolder(null)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Voltar às pastas
        </button>
      )}

      {loading && reports.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Carregando relatórios...
        </div>
      )}

      {!loading && folders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Nenhum relatório disponível ainda.
        </div>
      )}

      {!openFolder && folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {folders.map(([name, items], i) => (
            <motion.button
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              type="button"
              onClick={() => setOpenFolder(name)}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-100 focus:bg-brand-light/10 focus:outline-none transition-colors"
            >
              <FolderIcon />
              <div className="text-center">
                <div className="text-sm font-medium text-slate-800 leading-tight truncate max-w-[160px]">{name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{items.length} {items.length === 1 ? "relatório" : "relatórios"}</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {currentFolder && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentFolder[1].map((r, i) => (
            <motion.li key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <button type="button" onClick={() => setSelected(r)} className="w-full text-left flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-light hover:shadow-sm transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-light/10 text-brand-light flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                  <div className="text-xs text-slate-500 truncate">{r.fileName ?? "Visualizar relatório"} · {r.date}</div>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {selected && <PdfViewer report={selected} company={session?.company ?? ""} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FolderIcon() {
  return (
    <div className="relative w-24 h-20 sm:w-28 sm:h-24 transition-transform group-hover:-translate-y-1 group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
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
        <path d="M8 18 Q8 12 14 12 H46 L54 22 H106 Q112 22 112 28 V44 H8 Z" fill="url(#folderBack)" />
        <rect x="20" y="30" width="80" height="55" rx="3" fill="#ffffff" opacity="0.95" />
        <rect x="26" y="38" width="50" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="26" y="46" width="65" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="26" y="54" width="40" height="3" rx="1.5" fill="#e2e8f0" />
        <path d="M8 40 H112 V88 Q112 94 106 94 H14 Q8 94 8 88 Z" fill="url(#folderFront)" />
        <path d="M8 40 H112 V46 H8 Z" fill="#ffffff" opacity="0.15" />
      </svg>
    </div>
  );
}

function PdfViewer({ report, company, onClose }: { report: Report; company: string; onClose: () => void }) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const filename = report.fileName ?? `Relatorio-${report.date.replace(/\s+/g, "-")}.pdf`;

  useEffect(() => {
    let alive = true;
    import("@/lib/admin/media").then(({ resolveMediaUrl }) => {
      if (report.fileDataUrl) {
        resolveMediaUrl("pdfs", report.fileDataUrl)
          .then((url) => { if (alive) setResolvedUrl(url); })
          .catch((err) => {
            console.error("PDF resolution error:", err);
            toast.error("Não foi possível carregar o arquivo PDF.");
          });
      }
    });
    return () => { alive = false; };
  }, [report.fileDataUrl]);

  async function download() {
    if (!resolvedUrl) return;
    try {
      const response = await fetch(resolvedUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    } catch (err) {
      console.error("Download error:", err);
      window.open(resolvedUrl, "_blank");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-800 border-b border-slate-700 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-slate-200 hover:text-white px-2 py-1 rounded-md hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-white shrink-0" />
            <span className="text-sm truncate text-white">{filename}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-md bg-brand-light hover:bg-brand-DEFAULT px-3 py-1.5 text-sm font-medium transition-colors">
            <Download className="h-4 w-4" /> Baixar PDF
          </button>
          <button type="button" onClick={onClose} className="h-10 w-10 rounded-md flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md" aria-label="Fechar">
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {resolvedUrl ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto max-w-5xl h-[calc(100vh-140px)] bg-white rounded-sm shadow-2xl overflow-hidden">
            <iframe 
              src={`${resolvedUrl}#toolbar=0`} 
              title={filename} 
              className="w-full h-full border-none" 
            />
          </motion.div>
        ) : report.fileDataUrl ? (
          <div className="flex flex-col items-center justify-center h-64 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p className="text-sm opacity-70">Carregando relatório...</p>
          </div>
        ) : (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mx-auto bg-white text-slate-900 shadow-2xl rounded-sm max-w-3xl aspect-[1/1.414] p-8 sm:p-14 flex flex-col"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-brand-light font-semibold">MAXEASE Digital</div>
                <h1 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">{report.name}</h1>
                <div className="text-sm text-slate-500 mt-1">Período: {report.period} • Cliente: {company}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase text-slate-400">Referência</div>
                <div className="text-sm font-semibold text-slate-700">{report.date}</div>
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>MAXEASE Digital • Relatório confidencial</span>
              <span>Página 1</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
