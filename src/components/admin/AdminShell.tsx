import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/maxease-logo.png.asset.json";
import { useAdminAuth } from "@/lib/admin/auth";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/site", label: "Configurações do Site", icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, hydrated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !session) navigate({ to: "/admin/login" });
  }, [hydrated, session, navigate]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!hydrated || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white/60 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/[0.06] bg-[#0B1020] text-white">
          <div className="px-6 py-6 border-b border-white/[0.06]">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <img src={logoAsset.url} alt="MAXEASE" className="h-10 w-auto" />
            </Link>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
              <ShieldCheck className="h-3 w-3" /> Painel Admin
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] transition-colors duration-150 ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/[0.06]">
            <div className="text-xs text-white/50 mb-2">{session.email}</div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate({ to: "/admin/login" });
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13.5px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-4 px-4 py-3.5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <img src={logoAsset.url} alt="MAXEASE" className="h-8 w-auto" />
              </Link>
              <div className="w-10" />
            </div>
          </header>

          <main className="portal-surface flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 bg-slate-50">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1020] backdrop-blur-xl border-r border-white/[0.06] flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.06]">
                <img src={logoAsset.url} alt="MAXEASE" className="h-10 w-auto" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {NAV.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                        active ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate({ to: "/admin/login" });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] text-white/60 hover:text-white hover:bg-white/[0.04]"
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

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
