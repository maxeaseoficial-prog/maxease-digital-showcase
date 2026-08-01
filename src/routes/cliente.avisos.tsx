import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PortalPageHeader } from "@/components/portal/PortalShell";
import { usePortalData } from "@/lib/portal/data";

export const Route = createFileRoute("/cliente/avisos")({
  head: () => ({ meta: [{ title: "Avisos — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: AvisosPage,
});

function AvisosPage() {
  const { notices, loading, error, toggleNoticeRead, markAllNoticesRead } = usePortalData();
  const unread = notices.filter((n) => !n.read).length;

  async function toggle(id: string, current: boolean) {
    try {
      await toggleNoticeRead(id, !current);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível atualizar o aviso.");
    }
  }

  async function markAll() {
    try {
      await markAllNoticesRead();
      toast.success("Todos os avisos foram marcados como lidos.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível atualizar os avisos.");
    }
  }

  return (
    <div>
      <PortalPageHeader
        title="Avisos e Notificações"
        subtitle="Todas as atualizações e comunicados enviados pela equipe MAXEASE."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm p-3">
          Falha ao carregar avisos: {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-white/60">
          {loading && notices.length === 0
            ? "Carregando..."
            : unread > 0
            ? `${unread} não lida${unread > 1 ? "s" : ""}`
            : "Tudo em dia"}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/85"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {!loading && notices.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/60">
          Nenhum aviso disponível no momento.
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n, i) => (
          <motion.button
            key={n.id}
            type="button"
            onClick={() => toggle(n.id, n.read)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`w-full text-left rounded-2xl border p-5 transition-all ${
              n.read
                ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                : "border-brand-light/40 bg-brand-blue/10 hover:bg-brand-blue/15"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.read ? "bg-white/5 text-white/50" : "bg-slate-900 text-white"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-sm font-semibold ${n.read ? "text-white/70" : "text-white"}`}>{n.title}</h3>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-light" />}
                </div>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">{n.message}</p>
                <div className="text-[11px] text-white/40 mt-2">{n.date}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
