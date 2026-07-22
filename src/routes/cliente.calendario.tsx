import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Instagram, Facebook, Music2 } from "lucide-react";
import { PortalPageHeader, StatusBadge } from "@/components/portal/PortalShell";
import { mockCalendar, STATUS_STYLES, STATUS_DOT, statusChipColor, type CalendarContent, type Platform } from "@/lib/portal/mockData";

export const Route = createFileRoute("/cliente/calendario")({
  head: () => ({ meta: [{ title: "Calendário — Portal do Cliente" }, { name: "robots", content: "noindex" }] }),
  component: CalendarioPage,
});

const PLATFORM_ICON: Record<Platform, typeof Instagram> = {
  Instagram: Instagram,
  Facebook: Facebook,
  TikTok: Music2,
};

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function CalendarioPage() {
  const [cursor, setCursor] = useState(new Date(2026, 6, 1)); // Julho 2026
  const [selected, setSelected] = useState<CalendarContent | null>(null);

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarContent[]>();
    for (const c of mockCalendar) {
      const arr = map.get(c.date) ?? [];
      arr.push(c);
      map.set(c.date, arr);
    }
    return map;
  }, []);

  return (
    <div>
      <PortalPageHeader
        title="Calendário de Conteúdo"
        subtitle="Acompanhe todos os conteúdos previstos, em produção e publicados."
      />

      <div className="rounded-2xl border border-white/10 glass p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="h-9 w-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="h-9 w-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm sm:text-base font-semibold">
            {MONTHS[cursor.getMonth()]} <span className="text-white/50">{cursor.getFullYear()}</span>
          </div>
          <button
            type="button"
            onClick={() => setCursor(new Date(2026, 6, 1))}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
          >
            Hoje
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-[10px] sm:text-xs uppercase text-white/40 text-center py-2">
              {d}
            </div>
          ))}
          {grid.map((day, idx) => {
            const iso = day ? isoDate(cursor.getFullYear(), cursor.getMonth(), day) : "";
            const items = iso ? byDate.get(iso) ?? [] : [];
            return (
              <div
                key={idx}
                className={`min-h-[70px] sm:min-h-[110px] rounded-lg sm:rounded-xl p-1.5 sm:p-2 border transition-colors ${
                  day ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]" : "border-transparent"
                }`}
              >
                {day && (
                  <>
                    <div className="text-[10px] sm:text-xs text-white/50 mb-1">{day}</div>
                    <div className="space-y-1">
                      {items.slice(0, 2).map((it) => {
                        const PIcon = PLATFORM_ICON[it.platforms[0]];
                        const color = statusChipColor(it.status) ?? it.tagColor;
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => setSelected(it)}
                            className="w-full text-left flex items-center gap-1.5 text-[10px] sm:text-[11px] px-1.5 py-1 rounded-md border transition-colors hover:brightness-110"
                            style={color
                              ? { backgroundColor: `${color}1A`, borderColor: `${color}55`, color }
                              : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#334155" }}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[it.status]}`} />
                            <span className="truncate font-medium flex-1">{it.kind === "Gravação" ? "🎬 " : ""}{it.title}</span>
                            <PIcon className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} />
                          </button>
                        );
                      })}
                      {items.length > 2 && (
                        <div className="text-[9px] sm:text-[10px] text-slate-400 px-1">
                          +{items.length - 2} mais
                        </div>
                      )}
                    </div>

                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(STATUS_STYLES) as (keyof typeof STATUS_STYLES)[]).map((s) => (
          <StatusBadge key={s} status={s} className={STATUS_STYLES[s]} />
        ))}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-elegant p-6 sm:p-7 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <StatusBadge status={selected.status} className={STATUS_STYLES[selected.status]} />
                  <h2 className="text-xl font-bold mt-2">{selected.title}</h2>
                  <p className="text-xs text-white/50 mt-1">
                    {formatDateBr(selected.date)} às {selected.time}
                  </p>
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

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs uppercase text-white/50 mb-1">Plataformas</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.platforms.map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-full text-[11px] bg-white/10 border border-white/10">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-white/50 mb-1">Legenda</div>
                  <p className="text-white/85 leading-relaxed">{selected.caption}</p>
                </div>
                {selected.kind && (
                  <div>
                    <div className="text-xs uppercase text-white/50 mb-1">Tipo</div>
                    <p className="text-white/85">{selected.kind === "Gravação" ? "Dia de gravação" : "Conteúdo a postar"}</p>
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase text-white/50 mb-1">Roteiro</div>
                  <p className="text-white/85 leading-relaxed whitespace-pre-line">{selected.script}</p>
                </div>
                {selected.scriptFile && (
                  <div>
                    <div className="text-xs uppercase text-white/50 mb-1">Roteiro em PDF</div>
                    <a href={selected.scriptFile.dataUrl} download={selected.scriptFile.name} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm">
                      📄 {selected.scriptFile.name}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function buildMonthGrid(cursor: Date): (number | null)[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDateBr(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
