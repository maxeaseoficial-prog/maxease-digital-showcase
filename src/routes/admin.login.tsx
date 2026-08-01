import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/maxease-logo.png.asset.json";
import { useAdminAuth } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Login Admin — MAXEASE" }, { name: "robots", content: "noindex" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, session, hydrated } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && session) navigate({ to: "/admin/dashboard" });
  }, [hydrated, session, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    if (result.ok) navigate({ to: "/admin/dashboard" });
    else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient text-white relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-blue/30 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-light/20 blur-3xl animate-pulse-glow" />

      <header className="relative z-10 px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="MAXEASE Digital" className="h-12 w-auto" />
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="glass-strong shadow-elegant rounded-3xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-light font-semibold mb-3">
                <ShieldCheck className="h-3 w-3" /> Área Restrita
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Painel Administrativo</h1>
              <p className="mt-2 text-sm text-white/60">Acesse para gerenciar o site e os clientes.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-white/70 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@maxease.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-brand-light focus:bg-white/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 mb-2 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-brand-light focus:bg-white/10 transition-all" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                {loading ? "Entrando..." : "Entrar no painel"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[11px] text-white/40">Acesso restrito à equipe MAXEASE Digital.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
