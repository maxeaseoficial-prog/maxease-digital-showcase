import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Video, Globe, Cpu, Zap, Palette, ArrowRight, Megaphone,
  Instagram, Mail, MessageCircle, Star, ArrowUpRight, Sparkles, Youtube, Menu, X,
} from "lucide-react";
import { useQuoteModal } from "@/components/QuoteModal";


import logoAsset from "@/assets/maxease-logo.png.asset.json";
import heroMockup from "@/assets/hero-mockup.jpg";
import aboutImg from "@/assets/henrique-castro.jpg.asset.json";
import client1 from "@/assets/clients/client-1.png.asset.json";
import client2 from "@/assets/clients/client-2.png.asset.json";
import client3 from "@/assets/clients/client-3.png.asset.json";
import client4 from "@/assets/clients/client-4.png.asset.json";
import client5 from "@/assets/clients/client-5.png.asset.json";
import client6 from "@/assets/clients/client-6.png.asset.json";
import client7 from "@/assets/clients/client-7.png.asset.json";
import client8 from "@/assets/clients/client-8.png.asset.json";
import client9 from "@/assets/clients/client-9.png.asset.json";
import client10 from "@/assets/clients/client-10.png.asset.json";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------------- Building blocks ---------------- */

function Reveal({ children, delay = 0, y = 16 }: { children: ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.45, 0.32, 0.9] }}
    >
      {children}
    </motion.div>
  );
}

function GradientOrb({ className = "", size = 400 }: { className?: string; size?: number }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-[100px] opacity-20 ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, var(--brand-blue), transparent 70%)",
      }}
    />
  );
}

function Particles() {
  return null;
}

/* ---------------- Cursor glow ---------------- */
function CursorGlow() {
  return null;
}

/* ---------------- Navbar ---------------- */
type NavLink =
  | { label: string; kind: "hash"; hash: string }
  | { label: string; kind: "route"; to: "/audiovisual" | "/sites" };

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: openQuote } = useQuoteModal();
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const links: NavLink[] = [
    { label: "Início", kind: "hash", hash: "inicio" },
    { label: "Produção Audiovisual", kind: "route", to: "/audiovisual" },
    { label: "Sites", kind: "route", to: "/sites" },
    { label: "Clientes", kind: "hash", hash: "clientes" },
    { label: "Sobre", kind: "hash", hash: "sobre" },
  ];

  const linkClass =
    "text-sm text-white/75 hover:text-white transition-colors relative group";
  const underline = (
    <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-gradient transition-all duration-300 group-hover:w-full" />
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-4 bg-brand-deep/80 backdrop-blur-md border-b border-white/5" : "py-6 bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" hash="inicio" className="flex items-center gap-2 shrink-0 min-w-0">
            <img src={logoAsset.url} alt="MAXEASE Digital" className="h-9 sm:h-16 w-auto" />
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) =>
              l.kind === "route" ? (
                <Link key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                  {underline}
                </Link>
              ) : (
                <Link key={l.hash} to="/" hash={l.hash} className={linkClass}>
                  {l.label}
                  {underline}
                </Link>
              )
            )}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openQuote}
              className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-gradient px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap shadow-[0_10px_30px_-8px_rgba(30,64,255,0.6)] transition-transform hover:scale-[1.03]"
            >
              <span className="hidden sm:inline">Solicitar orçamento</span>
              <span className="sm:hidden">Orçamento</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>


        </div>

        {/* Mobile menu panel */}
        <div className="lg:hidden overflow-hidden px-1">
          <motion.div
            initial={false}
            animate={mobileOpen ? { height: "auto", opacity: 1, marginTop: 8 } : { height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <nav className="glass-strong shadow-elegant rounded-2xl p-3 flex flex-col">
              {links.map((l) => {
                const cls = "px-4 py-3 rounded-xl text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors";
                return l.kind === "route" ? (
                  <Link key={l.to} to={l.to} className={cls} onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ) : (
                  <Link key={l.hash} to="/" hash={l.hash} className={cls} onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}


/* ---------------- Hero ---------------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { open: openQuote } = useQuoteModal();
  const [projectsOpen, setProjectsOpen] = useState(false);

  useEffect(() => {
    if (!projectsOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProjectsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [projectsOpen]);


  return (
    <section id="inicio" ref={ref} className="relative min-h-screen w-full overflow-hidden bg-[#08111F] flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(21,94,239,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(21,94,239,0.05),transparent_40%)]" />
      <GradientOrb className="left-[-10%] top-[10%]" size={600} />
      <GradientOrb className="right-[-10%] bottom-[10%]" size={700} />
      
      {/* connecting lines - removed as they look like "AI decor" */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div style={{ opacity }}>
              <Reveal delay={0.2}>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-white tracking-tight">
                  Criamos experiências <span className="text-brand-blue">digitais</span> que fazem sua empresa crescer.
                </h1>
              </Reveal>
              <Reveal delay={0.3}>
                <p className="mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl">
                  Sites profissionais, sistemas personalizados e produções audiovisuais desenvolvidas para posicionar marcas e gerar resultados reais.
                </p>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={openQuote}
                    className="group relative inline-flex items-center gap-2 rounded-lg bg-brand-blue px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-brand-bright hover:scale-[1.02] shadow-lg shadow-brand-blue/20"
                  >
                    Solicitar orçamento
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('trabalhos-selecionados');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                  >
                    Conhecer projetos
                  </button>
                </div>
              </Reveal>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <Reveal delay={0.5}>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 aspect-[4/3]">
                <img src={heroMockup} alt="Projetos MaxEase" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                
                {/* Editorial overlays */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-[10px] text-white/50 uppercase block mb-0.5">Selected Work</span>
                    <span className="text-xs font-semibold text-white">Digital Interface Design</span>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center">
                    <ArrowUpRight className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </Reveal>
            
            {/* Small offset floating element for editorial feel */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 glass rounded-2xl border border-white/10 hidden xl:block" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {projectsOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-choice-title"
          >
            <button
              type="button"
              aria-label="Fechar"
              className="absolute inset-0 bg-brand-deep/80 backdrop-blur-md"
              onClick={() => setProjectsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative w-full max-w-lg glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setProjectsOpen(false)}
                aria-label="Fechar"
                className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full glass hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 id="projects-choice-title" className="text-xl sm:text-2xl font-semibold text-white">
                Qual portfólio você quer ver?
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Escolha a área para conhecer nossos projetos.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/sites"
                  onClick={() => setProjectsOpen(false)}
                  className="group relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.07] transition-colors"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue">
                    <Globe className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-base font-semibold text-white">Sites</span>
                  <span className="text-xs text-white/60">Projetos desenvolvidos</span>
                  <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  to="/audiovisual"
                  onClick={() => setProjectsOpen(false)}
                  className="group relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.07] transition-colors"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue">
                    <Video className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-base font-semibold text-white">Produção Audiovisual</span>
                  <span className="text-xs text-white/60">Vídeos e campanhas</span>
                  <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function HeroComposition() {
  return null;
}

/* ---------------- Services ---------------- */
function Services() {
  const services = [
    { num: "01", icon: Video, title: "Audiovisual", desc: "Produção cinematográfica de alto impacto para marcas líderes." },
    { num: "02", icon: Globe, title: "Software", desc: "Sistemas robustos e escaláveis desenvolvidos sob medida." },
    { num: "03", icon: Palette, title: "Design", desc: "Interfaces autorais com foco em usabilidade e conversão." },
    { num: "04", icon: Megaphone, title: "Marketing", desc: "Estratégias digitais orientadas a dados e crescimento." },
  ];
  return (
    <section id="servicos" className="relative py-32 sm:py-48 bg-slate-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-8">Capabilities</div>
              <h2 className="text-5xl sm:text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                Digital <br /><span className="text-brand-blue">Solutions</span>
              </h2>
              <p className="mt-10 text-xl text-white/50 leading-tight max-w-md font-medium">
                Unimos engenharia, design e estratégia para construir produtos que impulsionam o valor do seu negócio.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
              {services.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1} y={20}>
                  <div className="group relative p-12 bg-slate-900 hover:bg-brand-blue transition-all duration-700 min-h-[320px] flex flex-col">
                    <div className="flex justify-between items-start mb-auto">
                      <div className="text-sm font-bold text-white/20 group-hover:text-white/40 transition-colors uppercase tracking-widest">{s.num}</div>
                      <s.icon className="h-8 w-8 text-brand-blue group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-none">{s.title}</h3>
                      <p className="text-white/40 group-hover:text-white/80 text-sm leading-snug transition-colors">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon: Icon, title, desc }: { icon: typeof Video; title: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="group relative h-full rounded-2xl glass p-7 overflow-hidden transition-all duration-500 hover:ring-1 hover:ring-brand-light/40"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(30,64,255,0.25), transparent 40%)" }}
      />
      <div className="relative">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient shadow-[0_10px_30px_-10px_rgba(30,64,255,0.8)] mb-6">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">{desc}</p>
        <div className="mt-6 inline-flex items-center gap-1 text-sm text-brand-light opacity-0 group-hover:opacity-100 transition-opacity">
          Saiba mais <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Audiovisual grid ---------------- */
type ShortItem = { id: string; title: string; category: string };
const shorts: ShortItem[] = [
  { id: "0c42C7rYKoY", title: "Short 01", category: "YouTube Shorts" },
  { id: "YFRgK7pabS4", title: "Short 02", category: "YouTube Shorts" },
  { id: "TWkDV1Oeos4", title: "Short 03", category: "YouTube Shorts" },
  { id: "kqanqFyoBeI", title: "Short 04", category: "YouTube Shorts" },
  { id: "6JbGj6CleGk", title: "Short 05", category: "YouTube Shorts" },
  { id: "JOD-D7bYBW4", title: "Short 06", category: "YouTube Shorts" },
  { id: "k1oztLse6Dc", title: "Short 07", category: "YouTube Shorts" },
  { id: "OQTEr7nsqbw", title: "Short 08", category: "YouTube Shorts" },
];

export function Audiovisual() {
  return (
    <section id="audiovisual" className="relative py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-blue font-bold mb-6">Audiovisual</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Projetos que transformaram marcas.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shorts.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08}>
              <div className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-slate-100 ring-1 ring-slate-200 transition-transform duration-500 hover:scale-[1.02]">
                <iframe
                  src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1&playsinline=1`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------------- Sites showcase ---------------- */
const projects = [
  { img: project1, name: "Aurora Commerce", category: "E-commerce" },
  { img: project2, name: "Nimbus SaaS", category: "Landing Page" },
  { img: project3, name: "Bellavista", category: "Restaurante" },
  { img: project4, name: "Frenit Fitness", category: "Marca esportiva" },
];

export function Sites() {
  return (
    <section id="sites" className="relative py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <Reveal>
          <div className="max-w-2xl mx-auto mb-20 text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-blue font-bold mb-6">Desenvolvimento Web</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Sites Desenvolvidos
            </h2>
            <p className="mt-6 text-lg text-slate-500">Projetos que performam tão bem quanto parecem.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { id: "gXNVFlzfNd4", title: "Site desenvolvido pela MAXEASE — Projeto 1" },
            { id: "IH9RYsiYAd4", title: "Site desenvolvido pela MAXEASE — Projeto 2" },
          ].map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-100 ring-1 ring-slate-200 aspect-video transition-transform duration-500 hover:scale-[1.01]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Clients + counters ---------------- */
const clientLogos = [
  { src: client1.url, name: "Stella Espaço dos Uniformes" },
  { src: client2.url, name: "Estofados do Porto" },
  { src: client3.url, name: "Hotel Aris" },
  { src: client4.url, name: "Academia Borgo" },
  { src: client5.url, name: "Venésse Estética" },
  { src: client6.url, name: "União Restaurante" },
  { src: client7.url, name: "BMS Life Insurance" },
  { src: client8.url, name: "Alpha Academia" },
  { src: client9.url, name: "For Action Academia" },
  { src: client10.url, name: "Perdun Investimentos Imobiliários" },
];

function Counter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl sm:text-6xl font-bold text-brand-gradient">+{n}{suffix}</div>
      <div className="mt-2 text-sm text-white/60">{label}</div>
    </div>
  );
}

function Clients() {
  return (
    <section id="clientes" className="relative py-32 sm:py-48 bg-slate-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-blue font-bold mb-6">Confiança</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              A confiança de marcas que buscam resultados reais.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 py-0 mb-24 border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl">
            <div className="text-center py-16 border-b sm:border-b-0 sm:border-r border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase">+1000</div>
              <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Conteúdos</div>
            </div>
            <div className="text-center py-16 border-b sm:border-b-0 sm:border-r border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase">+10</div>
              <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Marcas</div>
            </div>
            <div className="text-center py-16 hover:bg-slate-50 transition-colors">
              <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase">+2</div>
              <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Anos</div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
          {clientLogos.map((c, i) => (
            <div key={i} className="flex justify-center grayscale hover:grayscale-0 transition-all duration-500">
              <img
                src={c.src}
                alt={c.name}
                loading="lazy"
                className="max-h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}


/* ---------------- About ---------------- */
function About() {
  return (
    <section id="sobre" className="relative py-32 sm:py-48 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch border border-slate-100 rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-2xl">
          <div className="lg:col-span-5 relative min-h-[500px]">
            <img 
              src={aboutImg.url} 
              alt="Henrique Castro" 
              loading="lazy" 
              className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
            />
            <div className="absolute inset-0 bg-brand-blue/10 mix-blend-multiply" />
            <div className="absolute bottom-10 left-10 text-white">
              <div className="text-[10px] uppercase tracking-[0.4em] font-black mb-2 opacity-70">Fundador</div>
              <div className="text-4xl font-black uppercase tracking-tighter">Henrique <br />Castro</div>
            </div>
          </div>
          
          <div className="lg:col-span-7 flex flex-col justify-center p-12 sm:p-20 bg-white">
            <Reveal delay={0.2}>
              <div className="text-[10px] uppercase tracking-[0.4em] text-brand-blue font-bold mb-10">Manifesto</div>
              <h2 className="text-5xl sm:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase mb-12">
                Estratégia <br />que gera <br /><span className="text-brand-blue">Valor</span>
              </h2>
              <div className="space-y-6 text-xl text-slate-500 font-medium leading-tight">
                <p>
                  A MAXEASE Digital nasceu com um propósito simples: transformar boas ideias em soluções digitais que geram resultados.
                </p>
                <p>
                  Unimos estratégia e design para desenvolver sites de alto padrão e produções audiovisuais que fortalecem marcas globais.
                </p>
                <p>
                  Cada pixel e cada frame são pensados para transmitir credibilidade e contribuir para o crescimento exponencial do seu negócio.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  const { open: openQuote } = useQuoteModal();
  return (
    <section id="contato" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center ring-1 ring-white/10"
            style={{ background: "radial-gradient(ellipse at top, rgba(79,124,255,0.4), transparent 60%), linear-gradient(135deg, #1428FF, #0A0F2D)" }}
          >
            <div className="absolute inset-0 bg-grid opacity-30" />
            <Particles />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Vamos criar algo <span className="italic font-light">incrível</span> para sua empresa?
              </h2>
              <p className="mt-5 text-white/75 max-w-xl mx-auto">
                Conte seu projeto. Retornamos com uma proposta sob medida em até 48 horas.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={openQuote}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-brand-deep hover:scale-[1.03] transition-transform shadow-[0_20px_50px_-15px_rgba(255,255,255,0.4)]"
                >
                  Solicitar orçamento
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
export function Footer() {
  return (
    <footer className="relative bg-slate-900 pt-32 pb-16 overflow-hidden">
      {/* Background watermark */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-5">
        <span className="text-[20vw] font-black text-white leading-none tracking-tighter absolute -bottom-10 left-0">MAXEASE</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-6">
            <img src={logoAsset.url} alt="MAXEASE Digital" className="h-10 w-auto invert brightness-0" />
            <p className="mt-10 text-xl text-white/40 max-w-md font-medium leading-tight">
              Estúdio de design e tecnologia especializado em interfaces de alto desempenho e produções audiovisuais estratégicas.
            </p>
            <div className="mt-12 flex items-center gap-6">
              <a href="https://www.instagram.com/max.ease/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"><Instagram className="h-5 w-5" /></a>
              <a href="https://wa.me/5542988377640" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"><MessageCircle className="h-5 w-5" /></a>
              <a href="https://www.youtube.com/@MaxEase" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"><Youtube className="h-5 w-5" /></a>
              <a href="mailto:maxeaseoficial@gmail.com" aria-label="Email" className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold mb-10">Navegação</div>
            <ul className="space-y-4 text-sm font-bold text-white/60">
              <li><Link to="/" hash="inicio" className="hover:text-white transition-colors">INÍCIO</Link></li>
              <li><Link to="/audiovisual" className="hover:text-white transition-colors">AUDIOVISUAL</Link></li>
              <li><Link to="/sites" className="hover:text-white transition-colors">SITES</Link></li>
              <li><Link to="/" hash="sobre" className="hover:text-white transition-colors">SOBRE</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold mb-10">Legal</div>
            <ul className="space-y-4 text-sm font-bold text-white/60">
              <li><span className="cursor-not-allowed opacity-50">PRIVACIDADE</span></li>
              <li><span className="cursor-not-allowed opacity-50">TERMOS</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} MAXEASE DIGITAL. TODOS OS DIREITOS RESERVADOS.
          </div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            DESIGNED BY MAXEASE
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Page ---------------- */
function Index() {
  return (
    <div className="relative min-h-screen bg-off-white selection:bg-brand-blue selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Audiovisual />
        <Sites />
        <Clients />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
