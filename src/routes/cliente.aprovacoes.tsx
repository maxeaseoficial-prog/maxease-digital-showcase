import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MessageSquare, ThumbsUp, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { PortalPageHeader, StatusBadge } from "@/components/portal/PortalShell";
import { STATUS_STYLES, type CalendarContent, type ContentStatus } from "@/lib/portal/mockData";
import { usePortalData } from "@/lib/portal/data";
import { clientDecideApproval } from "@/lib/portal/portal.functions";

export const Route = createFileRoute("/cliente/aprovacoes")({
  head: () => ({ meta: [{ title: "Aprovações — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: AprovacoesPage,
});

const APPROVAL_STATUSES: ContentStatus[] = [
  "Aguardando Aprovação",
  "Pendente de aprovação",
  "Aprovado",
  "Alteração solicitada",
  "Solicitou Alteração",
];

function AprovacoesPage() {
  const { calendar, loading, error } = usePortalData();
  const decide = useServerFn(clientDecideApproval);
  const [selected, setSelected] = useState<CalendarContent | null>(null);
  const [changeMode, setChangeMode] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(
    () => calendar.filter((c) => APPROVAL_STATUSES.includes(c.status)),
    [calendar],
  );

  async function handleApprove(it: CalendarContent) {
    setSubmitting(true);
    try {
      await decide({ data: { itemId: it.id, action: "approved" } });
      toast.success("Conteúdo aprovado com sucesso.");
      setSelected(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao aprovar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestChange(it: CalendarContent) {
    if (!changeMessage.trim()) return;
    setSubmitting(true);
    try {
      await decide({ data: { itemId: it.id, action: "changes_requested", message: changeMessage.trim() } });
      toast.success("Solicitação de alteração enviada.");
      setChangeMode(false);
      setChangeMessage("");
      setSelected(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao enviar solicitação.");
    } finally {
      setSubmitting(false);
    }
  }

  const isPending = (s: ContentStatus) => s === "Aguardando Aprovação" || s === "Pendente de aprovação";

  return (
    <div>
      <PortalPageHeader
        title="Aprovações"
        subtitle="Revise os roteiros e conteúdos enviados pela equipe MAXEASE."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm p-3">
          Falha ao carregar aprovações: {error}
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="text-sm text-white/60 py-6">Carregando aprovações...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/60">
          Nenhum conteúdo aguardando aprovação no momento.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {items.map((it, i) => (
          <motion.article
            key={it.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 glass p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <StatusBadge status={it.status} className={STATUS_STYLES[it.status]} />
                <h2 className="text-lg font-semibold mt-2">{it.title}</h2>
                <div className="text-xs text-white/50 mt-1">
                  {it.kind ?? "Postagem"} • {formatBr(it.date)}
                </div>
              </div>
            </div>
            <p className="text-sm text-white/70 line-clamp-2 mb-4">{it.caption}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setSelected(it); setChangeMode(false); }}
                className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-medium text-white/85 hover:bg-white/5 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Ver detalhes
              </button>
              {isPending(it.status) && (
                <button
                  type="button"
                  onClick={() => handleApprove(it)}
                  disabled={submitting}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-xs font-medium hover:scale-[1.02] transition-transform disabled:opacity-60"
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Aprovar
                </button>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelected(null); setChangeMode(false); }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-xl glass-strong rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-elegant p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <StatusBadge status={selected.status} className={STATUS_STYLES[selected.status]} />
                  <h2 className="text-xl font-bold mt-2">{selected.title}</h2>
                  <div className="text-xs text-white/50 mt-1">
                    {selected.kind ?? "Postagem"} • Publicação prevista {formatBr(selected.date)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setChangeMode(false); }}
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs uppercase text-white/50 mb-1">Legenda</div>
                  <p className="text-white/85 leading-relaxed">{selected.caption}</p>
                </div>
                <div>
                  <div className="text-xs uppercase text-white/50 mb-1">Roteiro</div>
                  <p className="text-white/85 leading-relaxed whitespace-pre-line">{selected.script}</p>
                </div>
                {selected.approvalHistory && selected.approvalHistory.length > 0 && (
                  <div>
                    <div className="text-xs uppercase text-white/50 mb-2">Histórico</div>
                    <ul className="space-y-2">
                      {selected.approvalHistory.map((h, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                          <Clock className="h-3 w-3 mt-0.5 text-white/40 shrink-0" />
                          <div>
                            <div className="text-white/50">{h.at}</div>
                            <div className="text-white/85">{h.message ?? (h.action === "approved" ? "Aprovado" : "Alteração solicitada")}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {isPending(selected.status) && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  {changeMode ? (
                    <div>
                      <label className="text-xs uppercase text-white/50 mb-2 block">
                        Descreva as alterações desejadas
                      </label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={changeMessage}
                        onChange={(e) => setChangeMessage(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm outline-none focus:border-brand-light"
                        placeholder="Ex: Ajustar a chamada final e trocar o CTA para agendamento pelo WhatsApp."
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setChangeMode(false)}
                          className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm hover:bg-white/5"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestChange(selected)}
                          disabled={!changeMessage.trim() || submitting}
                          className="flex-1 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                          Enviar solicitação
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setChangeMode(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/5"
                      >
                        <MessageSquare className="h-4 w-4" /> Solicitar alteração
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(selected)}
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Aprovar conteúdo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatBr(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
