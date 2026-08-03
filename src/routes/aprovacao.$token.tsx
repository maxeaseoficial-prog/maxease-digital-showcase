import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, Clock, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getApprovalByToken, submitApproval } from "@/lib/approval.functions";
import { calRowToContent } from "@/lib/admin/store";
import type { CalendarContent } from "@/lib/portal/mockData";

export const Route = createFileRoute("/aprovacao/$token")({
  head: () => ({
    meta: [
      { title: "Aprovação de Conteúdo — MAXEASE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ApprovacaoPage,
});

function ApprovacaoPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<{ item: CalendarContent; clientName: string } | null | undefined>(undefined);
  const [mode, setMode] = useState<"idle" | "confirm-approve" | "request">("idle");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getApprovalByToken({ data: { token } });
        if (!alive) return;
        if (!res.found) { setState(null); return; }
        setState({ item: calRowToContent(res.item as never), clientName: res.client.name });
      } catch {
        if (alive) setState(null);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  if (state === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">Carregando…</div>;
  }
  if (state === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center">
          <div className="text-2xl font-bold text-slate-900 mb-2">Link inválido</div>
          <p className="text-sm text-slate-600">Este link de aprovação não foi encontrado ou expirou. Solicite um novo link à equipe MAXEASE.</p>
        </div>
      </div>
    );
  }

  const { item, clientName } = state;
  const decided = item.status === "Aprovado" || item.status === "Alteração solicitada";

  async function approve() {
    setSubmitting(true);
    try {
      await submitApproval({ data: { token, action: "approved" } });
      const refreshed = await getApprovalByToken({ data: { token } });
      if (refreshed.found) {
        setState((prev) => (prev ? { ...prev, item: calRowToContent(refreshed.item as never) } : prev));
      }
      setMode("idle");
      toast.success("Conteúdo aprovado. Obrigado!");
    } catch {
      toast.error("Não foi possível registrar a aprovação.");
    } finally {
      setSubmitting(false);
    }
  }

  async function requestChanges() {
    const trimmed = message.trim();
    if (!trimmed) { toast.error("Descreva o ajuste desejado."); return; }
    setSubmitting(true);
    try {
      await submitApproval({ data: { token, action: "changes_requested", message: trimmed } });
      const refreshed = await getApprovalByToken({ data: { token } });
      if (refreshed.found) {
        setState((prev) => (prev ? { ...prev, item: calRowToContent(refreshed.item as never) } : prev));
      }
      setMessage("");
      setMode("idle");
      toast.success("Solicitação enviada. A equipe MAXEASE já foi notificada.");
    } catch {
      toast.error("Não foi possível registrar a solicitação.");
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient" />
            <div>
              <div className="text-sm font-semibold text-slate-900">MAXEASE Digital</div>
              <div className="text-[11px] text-slate-500">Aprovação de conteúdo · {clientName}</div>
            </div>
          </div>
          <StatusPill status={item.status} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className={`bg-slate-900 flex items-center justify-center relative ${item.videoFile ? "aspect-[9/16] md:aspect-auto md:min-h-[520px]" : "aspect-video"}`}>
              {item.videoFile ? (
                <div className="relative h-full w-full">
                  <video
                    key={item.videoFile.dataUrl}
                    poster={item.coverFile?.dataUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-black object-contain"
                    onCanPlay={() => setVideoFailed(false)}
                    onError={() => setVideoFailed(true)}
                  >
                    <source src={item.videoFile.dataUrl} type={item.videoFile.type || "video/mp4"} />
                    Seu navegador não suporta a reprodução deste vídeo.
                  </video>
                  {videoFailed && (
                    <div className="absolute inset-x-4 bottom-4 rounded-xl border border-red-200 bg-white/95 p-3 text-xs text-red-700 shadow-lg">
                      Não foi possível reproduzir este vídeo neste dispositivo. Solicite à equipe MAXEASE um novo envio em MP4 H.264 com áudio AAC.
                    </div>
                  )}
                </div>
              ) : item.coverFile ? (
                <img src={item.coverFile.dataUrl} alt="Capa" className="w-full h-full object-contain" />
              ) : (
                <div className="text-white/50 text-sm">Sem vídeo disponível</div>
              )}
            </div>

            <div className="p-6 sm:p-7 flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{item.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {formatDateBr(item.date)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.time}</span>
                <span>{item.platforms.join(" · ")}</span>
              </div>

              <div className="mt-5">
                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Legenda</div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.caption || "—"}</p>
              </div>

              {item.approvalHistory && item.approvalHistory.length > 0 && (
                <div className="mt-5">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Histórico</div>
                  <ul className="space-y-2">
                    {item.approvalHistory.map((h, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-2">
                        <span className="text-slate-400 shrink-0">{h.at}</span>
                        <span>
                          {h.action === "created" && "Conteúdo enviado para aprovação."}
                          {h.action === "approved" && "Cliente aprovou o conteúdo."}
                          {h.action === "changes_requested" && (<>Alteração solicitada{h.message ? `: “${h.message}”` : "."}</>)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50">
            {decided ? (
              <div className="text-sm text-slate-600 text-center">
                {item.status === "Aprovado"
                  ? "Este conteúdo já foi aprovado. Obrigado!"
                  : "Uma solicitação de alteração já foi registrada. A equipe MAXEASE está trabalhando nela."}
              </div>
            ) : mode === "request" ? (
              <div>
                <label className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Descreva o ajuste desejado</label>
                <textarea
                  rows={4}
                  maxLength={800}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-brand-light"
                  placeholder="Ex: Trocar o CTA final para agendamento pelo WhatsApp."
                />
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={() => { setMode("idle"); setMessage(""); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </button>
                  <button type="button" onClick={requestChanges} disabled={!message.trim()} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                    Enviar solicitação
                  </button>
                </div>
              </div>
            ) : mode === "confirm-approve" ? (
              <div className="text-center">
                <div className="text-sm text-slate-700 mb-3">Confirmar aprovação deste conteúdo?</div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button type="button" onClick={() => setMode("idle")} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                    Cancelar
                  </button>
                  <button type="button" onClick={approve} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Sim, aprovar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" onClick={() => setMode("request")} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                  <MessageSquare className="h-4 w-4" /> Solicitar alteração
                </button>
                <button type="button" onClick={() => setMode("confirm-approve")} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white hover:brightness-110">
                  <CheckCircle2 className="h-4 w-4" /> Aprovar conteúdo
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Link privado gerado pela MAXEASE Digital. Não compartilhe.
        </p>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: CalendarContent["status"] }) {
  const map: Record<string, string> = {
    "Pendente de aprovação": "bg-amber-100 text-amber-800 border-amber-200",
    "Alteração solicitada": "bg-red-100 text-red-800 border-red-200",
    "Aprovado": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Publicado": "bg-violet-100 text-violet-800 border-violet-200",
    "Planejado": "bg-slate-100 text-slate-700 border-slate-200",
  };
  const cls = map[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}>{status}</span>;
}

function formatDateBr(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
