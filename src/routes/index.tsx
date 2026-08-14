import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Video, Globe, Cpu, Zap, Palette, ArrowRight, Megaphone,
  Instagram, Mail, MessageCircle, Star, ArrowUpRight, Sparkles, Youtube, Menu, X,
} from "lucide-react";
import { useQuoteModal } from "@/components/QuoteModal";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";


import logoAsset from "@/assets/maxease-logo.png.asset.json";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";
import heroBgMobileAsset from "@/assets/hero-bg-mobile.png.asset.json";
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
    // { label: "Clientes", kind: "hash", hash: "clientes" },
    { label: "Sobre", kind: "hash", hash: "sobre" },
  ];

  const linkClass =
    "text-sm text-white/75 hover:text-white transition-colors relative group";
  const underline = (
    <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-gradient transition-all duration-300 group-hover:w-full" />
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-4 bg-brand-deep/90 backdrop-blur-md border-b border-white/5" : "py-6 bg-brand-deep/20 backdrop-blur-sm"
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
    </header>
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
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 640px)" srcSet={heroBgMobileAsset.url} />
          <img 
            src={heroBgAsset.url} 
            alt="" 
            className="w-full h-full object-cover opacity-60" 
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-[#08111F]/20 via-[#08111F]/60 to-[#08111F]" />
      </div>
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
  const { open: openQuote } = useQuoteModal();
  const services = [
    { 
      num: "01", 
      icon: Video, 
      title: "Produção Audiovisual", 
      desc: "Vídeos institucionais e comerciais com edição cinematográfica.",
      to: "/audiovisual",
      rotation: -2
    },
    { 
      num: "02", 
      icon: Globe, 
      title: "Sites Profissionais", 
      desc: "Plataformas modernas desenvolvidas para alta performance e conversão.",
      to: "/sites",
      rotation: 1
    },
    { 
      num: "03", 
      icon: Cpu, 
      title: "Sistemas Personalizados", 
      desc: "Soluções robustas sob medida para automatizar e escalar operações.",
      rotation: -1
    },
    { 
      num: "04", 
      icon: Megaphone, 
      title: "Criativos para Campanhas", 
      desc: "Conteúdo focado em tráfego pago que gera resultados mensuráveis.",
      rotation: 2
    },
  ];

  return (
    <section id="servicos" className="relative py-32 sm:py-48 bg-[#071426] overflow-hidden">
      {/* Background Graphic Element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-bold text-white/[0.03] leading-none tracking-tighter">
          MAXEASE
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="text-center mb-20">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.25em] text-brand-blue font-bold mb-6">Expertise</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mx-auto">
              Soluções digitais completas para marcas de alto padrão.
            </h2>
            <p className="mt-8 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Unimos engenharia, design e estratégia para construir produtos que impulsionam o valor do seu negócio.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-2 items-stretch max-w-[1250px] mx-auto">
          {services.map((s, i) => {
            const Content = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  rotate: s.rotation
                }}
                whileHover={{ 
                  rotate: 0, 
                  y: -6,
                  backgroundColor: "rgba(11, 29, 51, 0.95)",
                  borderColor: "rgba(21, 94, 239, 0.4)"
                }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.4, 
                  delay: i * 0.1,
                  ease: [0.21, 0.45, 0.32, 0.9]
                }}
                className="group relative flex flex-col items-center text-center p-8 sm:p-10 h-full min-h-[320px] bg-[#0B1D33] border border-white/10 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition-all cursor-pointer overflow-hidden"
              >
                {/* Detail Bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-brand-blue" />
                
                <div className="w-full flex justify-between items-start mb-8">
                  <span className="text-xs font-bold text-white/20 tracking-widest">{s.num}</span>
                </div>

                <div className="mb-6 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                  <s.icon className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-bold text-white mb-4">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {s.desc}
                </p>
              </motion.div>
            );

            return s.to ? (
              <Link key={s.title} to={s.to as any} className="block h-full">
                {Content}
              </Link>
            ) : (
              <button key={s.title} onClick={openQuote} className="block w-full text-left h-full">
                {Content}
              </button>
            );
          })}
        </div>

        <Reveal delay={0.6}>
          <div className="mt-20 text-center">
            <button
              onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-white/80 hover:text-brand-blue font-medium transition-all group"
            >
              Falar com um especialista 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </Reveal>
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


/* ---------------- Website Showcase Component ---------------- */
function WebsiteShowcase({ 
  project,
  index
}: { 
  project: { name: string; url: string; category: string; description?: string; isEmbeddable?: boolean; fallbackImg?: string };
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [scales, setScales] = useState({ desktop: 0.29, mobile: 0.65 });

  useEffect(() => {
    const updateScales = () => {
      const desktopWrapper = containerRef.current?.querySelector('.lg\\:col-span-8 .aspect-\\[16\\/10\\]');
      const mobileWrapper = containerRef.current?.querySelector('.lg\\:col-span-8 .aspect-\\[9\\/19\\.5\\]');
      
      if (desktopWrapper && mobileWrapper) {
        setScales({
          desktop: desktopWrapper.clientWidth / 1440,
          mobile: mobileWrapper.clientWidth / 390
        });
      }
    };

    updateScales();
    window.addEventListener('resize', updateScales);
    return () => window.removeEventListener('resize', updateScales);
  }, []);

  const isEmbeddable = project.isEmbeddable ?? true;

  return (
    <div 
      ref={containerRef} 
      className="py-24 first:pt-0"
      style={{
        '--scale-desktop': scales.desktop,
        '--scale-mobile': scales.mobile
      } as any}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        {/* Project Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`lg:col-span-12 mb-12`}
        >
          <div>
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-brand-blue/5 border border-brand-blue/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-blue font-bold leading-none">
                {project.category}
              </span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              {project.name}
            </h3>
          </div>
          
          {project.description && (
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              {project.description}
            </p>
          )}
        </motion.div>

        {/* Visual Showcase */}
        <div className="lg:col-span-8 relative">
          <div className="relative flex flex-col lg:flex-row items-end lg:items-center justify-between gap-12 lg:gap-8">
            
            {/* Desktop Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full lg:w-[70%] z-10"
            >
              <div className="absolute -top-8 left-6 hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                <Monitor className="h-3 w-3" /> Desktop View
              </div>
              
              <div className="relative rounded-[2rem] p-3 sm:p-4 bg-[#1A1F2C] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 ring-1 ring-white/10 group overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#08111F]">
                  <iframe 
                    src={project.url}
                    title={`Visualização desktop do site ${project.name}`}
                    loading="lazy"
                    className="absolute border-0 top-0 left-0 w-[1440px] h-[900px]"
                    style={{ 
                      transform: 'scale(var(--scale-desktop, 0.29))',
                      transformOrigin: 'top left',
                      zIndex: 1
                    }}
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 pointer-events-none group-hover:bg-brand-blue/5 transition-colors z-20" />
                </div>
                {/* Monitor Stand Detail */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#1A1F2C] rounded-b-3xl border-x border-b border-white/5 z-0" />
              </div>
            </motion.div>

            {/* Mobile Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative w-[240px] sm:w-[280px] -mt-20 lg:mt-0 z-20"
            >
              <div className="absolute -top-8 left-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                <Smartphone className="h-3 w-3" /> Mobile
              </div>
              <div className="relative rounded-[2.5rem] p-2.5 sm:p-3 bg-[#1A1F2C] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-white/5 ring-1 ring-white/10 group overflow-hidden">
                {/* Speaker Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full z-30" />
                
                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.8rem] bg-[#08111F]">
                  <div className="absolute inset-0 right-[-20px] z-10">
                    <iframe 
                      src={project.url}
                      title={`Visualização mobile do site ${project.name}`}
                      loading="lazy"
                      className="absolute border-0 top-0 left-0 w-[410px] h-[844px]"
                      style={{ 
                        transform: 'scale(var(--scale-mobile, 0.65))',
                        transformOrigin: 'top left',
                        zIndex: 1
                      }}
                    />
                  </div>
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 pointer-events-none group-hover:bg-brand-blue/5 transition-colors z-20" />
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className={`mt-20 md:mt-28 flex flex-col items-center lg:items-start gap-4 ${index % 2 === 1 ? 'lg:items-end' : ''}`}>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                Portfólio Interativo / Explorar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const websiteProjects = [
  {
    name: "Jonathan Veículos",
    url: "https://jonathanveiculos.lovable.app/",
    category: "Marketplace Automotivo",
    description: "Plataforma otimizada para venda de veículos com interface intuitiva e alta conversão.",
    isEmbeddable: true
  },
  {
    name: "Kaylane Sales Method",
    url: "https://kaylane-sales-method.lovable.app",
    category: "Infoproduto / Educação",
    description: "Landing page estratégica para métodos de vendas, focada em autoridade e captura de leads.",
    isEmbeddable: true
  },
  {
    name: "Leonardo Froese",
    url: "https://leonardofroese.lovable.app",
    category: "Portfólio Profissional",
    description: "Presença digital sofisticada para profissional liberal, destacando expertise e projetos.",
    isEmbeddable: true
  },
  {
    name: "Kora Gestão Inteligente",
    url: "https://www.koragestaointeligente.com.br/",
    category: "SaaS / Tecnologia",
    description: "Interface moderna para sistema de gestão inteligente, priorizando clareza e funcionalidade.",
    isEmbeddable: true
  }
];

export function Sites() {
  return (
    <section id="sites" className="relative py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <Reveal>
          <div className="max-w-3xl mx-auto mb-32 text-center">
            <div className="text-[10px] uppercase tracking-[0.4em] text-brand-blue font-bold mb-8">Showcase</div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-8">
              Projetos que performam tão bem quanto parecem.
            </h2>
            <div className="h-px w-24 bg-brand-blue/30 mx-auto" />
          </div>
        </Reveal>

        <div className="space-y-48">
          {websiteProjects.map((project, idx) => (
            <WebsiteShowcase key={project.name} project={project} index={idx} />
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

function Counter({ to, label }: { to: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * to));
      if (current >= steps) clearInterval(timer);
    }, stepDuration);
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <div ref={ref} className="relative group flex flex-col items-center justify-center p-8 overflow-hidden bg-white rounded-3xl transition-all duration-500">
      {/* Ghost Number Shadow */}
      <span className="absolute -bottom-8 -right-4 text-[12rem] font-bold text-brand-blue/5 leading-none select-none pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-1000">
        +{to}
      </span>
      
      <div className="relative z-10 text-center">
        <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-brand-blue tracking-tighter mb-4">
          +{count}
        </div>
        <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
          {label}
        </div>
      </div>
    </div>
  );
}

function Clients() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <section id="clientes" className="relative py-32 sm:py-48 bg-white overflow-hidden border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-24">
            <div className="text-[10px] uppercase tracking-[0.4em] text-brand-blue font-bold mb-8">Confiança</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] max-w-3xl">
              A confiança de marcas que buscam resultados reais.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal delay={0.2}>
            <Counter to={1000} label="Conteúdos entregues" />
          </Reveal>
          <Reveal delay={0.3}>
            <Counter to={10} label="Empresas atendidas" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}


/* ---------------- About ---------------- */
function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="sobre" ref={containerRef} className="relative py-32 sm:py-48 bg-white overflow-hidden">
      {/* Background Typographic Element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.03, scale: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[30vw] font-bold text-brand-blue leading-none tracking-tighter whitespace-nowrap"
        >
          MAXEASE
        </motion.span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-xs uppercase tracking-[0.3em] text-brand-blue font-bold">Nossa História</div>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#071426] leading-[1.1] tracking-tight">
                Unimos <span className="text-brand-blue">criatividade</span>, tecnologia e estratégia em cada entrega.
              </h2>
            </motion.div>

            <div className="space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium"
              >
                A MAXEASE Digital nasceu com um propósito simples: transformar boas ideias em soluções digitais que geram resultados.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg text-slate-600 leading-relaxed"
              >
                Fundada por Henrique Castro, a empresa une estratégia e design para desenvolver sites de alto padrão e produções audiovisuais que fortalecem marcas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="relative pl-8 border-l-2 border-brand-blue/30 py-2"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />
                <p className="text-lg text-slate-800 font-semibold italic leading-relaxed">
                  Acreditamos que cada detalhe deve ter um objetivo claro: transmitir credibilidade e contribuir para o crescimento das empresas que confiam no nosso trabalho.
                </p>
              </motion.div>
            </div>
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
    <footer className="relative bg-brand-deep py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/30 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <img src={logoAsset.url} alt="MAXEASE Digital" className="h-10 w-auto brightness-0 invert" />
            <p className="mt-8 text-base text-white/60 max-w-sm leading-relaxed">
              Estúdio criativo e tecnológico especializado em interfaces digitais de alto desempenho e produções audiovisuais estratégicas.
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-white font-bold mb-8">Navegação</div>
            <ul className="space-y-4 text-sm font-semibold text-white/50">
              <li><Link to="/" hash="inicio" className="hover:text-brand-light transition-colors">Início</Link></li>
              <li><Link to="/audiovisual" className="hover:text-brand-light transition-colors">Audiovisual</Link></li>
              <li><Link to="/sites" className="hover:text-brand-light transition-colors">Sites</Link></li>
              <li><Link to="/" hash="sobre" className="hover:text-brand-light transition-colors">Sobre</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-widest text-white font-bold mb-8">Redes Sociais</div>
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/max.ease/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/40 hover:text-brand-light transition-colors"><Instagram className="h-6 w-6" /></a>
              <a href="https://wa.me/5542988377640" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white/40 hover:text-brand-light transition-colors">
                <svg role="img" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.2-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
              <a href="https://www.youtube.com/@MaxEase" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/40 hover:text-brand-light transition-colors"><Youtube className="h-6 w-6" /></a>
              <a href="mailto:maxeaseoficial@gmail.com" aria-label="Email" className="text-white/40 hover:text-brand-light transition-colors"><Mail className="h-6 w-6" /></a>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-xs font-bold uppercase tracking-widest text-white/20">
          <div>© {new Date().getFullYear()} MAXEASE Digital.</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Page ---------------- */
function Index() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-brand-blue/10 selection:text-brand-blue">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Clients />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
