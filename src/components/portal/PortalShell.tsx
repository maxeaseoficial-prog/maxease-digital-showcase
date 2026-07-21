import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Video,
  BarChart3,
  CheckCircle2,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import logoAsset from "@/assets/maxease-logo.png.asset.json";
import { usePortalAuth } from "@/lib/portal/auth";
import { mockClient, mockNotices } from "@/lib/portal/mockData";

const NAV = [
  { to: "/cliente/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cliente/calendario", label: "Calendário de Conteúdo", icon: CalendarDays },
  { to: "/cliente/gravacoes", label: "Próximas Gravações", icon: Video },
  { to: "/cliente/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/cliente/aprovacoes", label: "Aprovações", icon: CheckCircle2 },
  { to: "/cliente/avisos", label: "Avisos", icon: Bell },
] as const;

export function PortalShell({ children }: { children: ReactNode }) {
  const { session, hydrated, logout } = usePortalAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !session) navigate({ to: "/login" });
  }, [hydrated, session, navigate]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!hydrated || !session) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-white/60 text-sm">Carregando...</div>
      </div>
    );
  }

  const unread = mockNotices.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar desktop (navigation kept dark on purpose) */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-[rgba(6,8,26,0.95)] text-white">
          <div className="px-6 py-6 border-b border-white/10">
            <Link to="/cliente/dashboard" className="flex items-center gap-2">
              <img src={logoAsset.url} alt="MAXEASE" className="h-10 w-auto" />
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    active
                      ? "bg-brand-gradient text-white shadow-[0_10px_30px_-12px_rgba(30,64,255,0.7)]"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="flex-1">{item.label}</span>
                  {item.to === "/cliente/avisos" && unread > 0 ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/20">{unread}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} /> Sair
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link to="/cliente/dashboard" className="lg:hidden flex items-center gap-2">
                  <img src={logoAsset.url} alt="MAXEASE" className="h-8 w-auto" />
                </Link>
                <div className="hidden sm:block min-w-0">
                  <div className="text-xs text-slate-500 truncate">{mockClient.company}</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">{session.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/cliente/avisos"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  aria-label="Avisos"
                >
                  <Bell className="h-4 w-4" strokeWidth={2} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-gradient text-[10px] font-bold text-white flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-sm font-semibold text-white shrink-0">
                  {session.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <main className="portal-surface flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 bg-slate-50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>


      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[rgba(6,8,26,0.95)] backdrop-blur-xl border-r border-white/10 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
                <img src={logoAsset.url} alt="MAXEASE" className="h-10 w-auto" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {NAV.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        active ? "bg-brand-gradient text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate({ to: "/login" });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PortalPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
