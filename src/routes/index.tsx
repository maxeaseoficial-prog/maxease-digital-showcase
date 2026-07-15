import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Video, Globe, Cpu, Zap, Palette, ArrowRight, Megaphone,
  Instagram, Mail, MessageCircle, Star, ArrowUpRight, Sparkles,
} from "lucide-react";

import logoAsset from "@/assets/maxease-logo.png.asset.json";
import heroMockup from "@/assets/hero-mockup.jpg";
import aboutImg from "@/assets/henrique-castro.jpg.asset.json";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------------- Building blocks ---------------- */

function Reveal({ children, delay = 0, y = 24 }: { children: ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function GradientOrb({ className = "", size = 500 }: { className?: string; size?: number }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-40 ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(30,64,255,0.55), transparent 65%)",
      }}
    />
  );
}

function Particles() {
  const dots = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const dur = 6 + Math.random() * 8;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-brand-light"
            style={{ width: size, height: size, left: `${left}%`, top: `${top}%`, opacity: 0.6 }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 4 }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- Cursor glow ---------------- */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 200, damping: 25 });
  const sy = useSpring(y, { stiffness: 200, damping: 25 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);
  return (
    <motion.div
      className="pointer-events-none fixed z-[100] h-[400px] w-[400px] rounded-full mix-blend-screen hidden md:block"
      style={{
        x: sx, y: sy, translateX: "-50%", translateY: "-50%",
        background: "radial-gradient(circle, rgba(30,64,255,0.15), transparent 60%)",
      }}
    />
  );
}

/* ---------------- Navbar ---------------- */
type NavLink =
  | { label: string; kind: "hash"; hash: string }
  | { label: string; kind: "route"; to: "/audiovisual" | "/sites" };

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-elegant" : ""
          }`}
        >
          <Link to="/" hash="inicio" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="MAXEASE Digital" className="h-14 sm:h-16 w-auto" />
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
          <Link
            to="/"
            hash="contato"
            className="group relative inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_-8px_rgba(30,64,255,0.6)] transition-transform hover:scale-[1.03]"
          >
            Solicitar orçamento
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
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

  return (
    <section id="inicio" ref={ref} className="relative min-h-screen w-full overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <GradientOrb className="left-[-10%] top-[10%]" size={600} />
      <GradientOrb className="right-[-10%] bottom-[10%]" size={700} />
      <Particles />

      {/* connecting lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop offset="0%" stopColor="#4F7CFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#4F7CFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4F7CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="10%" y1="20%" x2="45%" y2="60%" stroke="url(#line)" strokeWidth="1" />
        <line x1="60%" y1="15%" x2="90%" y2="50%" stroke="url(#line)" strokeWidth="1" />
        <line x1="20%" y1="80%" x2="70%" y2="90%" stroke="url(#line)" strokeWidth="1" />
      </svg>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 sm:px-6 pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div style={{ y: y2 }}>
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-white">
                Criamos experiências <span className="text-brand-gradient">digitais</span> que fazem empresas crescer.
              </h1>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-white/70 leading-relaxed">
                Sites profissionais, sistemas personalizados e produções audiovisuais desenvolvidas para posicionar marcas e gerar resultados.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-9 flex flex-wrap gap-4 justify-center">
                <a
                  href="#contato"
                  className="group relative inline-flex items-center gap-2 rounded-full bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_-15px_rgba(30,64,255,0.8)] transition-transform hover:scale-[1.03] overflow-hidden"
                >
                  <span className="relative z-10">Solicitar orçamento</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute inset-0 -translate-x-full bg-white/20 blur-xl transition-transform duration-700 group-hover:translate-x-full" />
                </a>
                <a
                  href="#sites"
                  className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Ver projetos
                </a>
              </div>
            </Reveal>
          </motion.div>
        </div>


      </motion.div>
    </section>
  );
}

function HeroComposition() {
  return (
    <div className="relative h-full w-full">
      {/* main mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -8 }}
        animate={{ opacity: 1, y: 0, rotateY: -6 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: 1200 }}
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[92%] rounded-2xl overflow-hidden shadow-elegant ring-1 ring-white/10"
          style={{ transform: "rotateY(-6deg) rotateX(4deg)" }}
        >
          <img src={heroMockup} alt="Dashboard mockup" className="w-full h-auto" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 via-transparent to-transparent" />
        </motion.div>
      </motion.div>

      {/* floating card top-right */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="absolute top-4 right-0 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="glass-strong rounded-xl p-4 w-52 shadow-elegant"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/70">Conversão</span>
          </div>
          <div className="text-2xl font-bold text-white">+184%</div>
          <div className="text-[11px] text-brand-light mt-1">↑ vs. mês anterior</div>
        </motion.div>
      </motion.div>

      {/* floating card bottom-left */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="absolute bottom-6 -left-2 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="glass-strong rounded-xl p-4 w-56 shadow-elegant"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Site publicado</div>
              <div className="text-[11px] text-white/60">Performance 98/100</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* small orb */}
      <div className="absolute top-1/2 -left-8 h-32 w-32 rounded-full bg-brand-blue/40 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-brand-light/30 blur-3xl animate-pulse-glow" />
    </div>
  );
}

/* ---------------- Services ---------------- */
function Services() {
  const services = [
    { icon: Video, title: "Produção Audiovisual", desc: "Vídeos institucionais, comerciais, Reels e campanhas com direção criativa e edição cinematográfica." },
    { icon: Globe, title: "Sites Profissionais", desc: "Sites modernos, rápidos e desenvolvidos para converter visitantes em clientes." },
    { icon: Cpu, title: "Sistemas Personalizados", desc: "Desenvolvimento de sistemas sob medida para automatizar e escalar o seu negócio." },
    { icon: Megaphone, title: "Criativos para campanhas", desc: "Vídeos para tráfego pago, vídeos de divulgação e edição de vídeos que geram resultado." },
  ];
  return (
    <section id="servicos" className="relative py-28 sm:py-36">
      <GradientOrb className="right-[-15%] top-1/4" size={500} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-4">O que fazemos</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Soluções digitais completas <br /> para marcas de <span className="text-brand-gradient">alto padrão</span>.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <ServiceCard {...s} />
            </Reveal>
          ))}
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
    <section id="audiovisual" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-blue/5 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <Reveal>
          <div className="flex flex-col items-center text-center gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-4">Produção Audiovisual</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Projetos que <span className="text-brand-gradient">transformaram</span> marcas
              </h2>
            </div>
            
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {shorts.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08}>
              <div className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-elegant bg-black">
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
    <section id="sites" className="relative py-28 sm:py-36">
      <GradientOrb className="left-[-10%] top-1/3" size={500} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-4">Sites Desenvolvidos</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Projetos que <span className="text-brand-gradient">performam</span> tão bem quanto parecem.
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <a href="#" className="group relative block rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-elegant aspect-[4/3]">
                <img src={p.img} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/30 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-brand-blue/20 via-transparent to-brand-light/20" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-brand-light">{p.category}</div>
                    <div className="text-white text-xl sm:text-2xl font-semibold mt-1">{p.name}</div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full glass-strong px-4 py-2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    Ver Projeto <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Clients + counters ---------------- */
const clientLogos = [
  "AURORA", "NIMBUS", "BELLAVISTA", "FRENIT", "ORBIS", "LUMEN",
  "VERTEX", "NOVA", "ATLAS", "PRISMA", "HORIZON", "ECHELON",
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
    <section id="clientes" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-4">Clientes &amp; Números</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              A confiança de marcas que <span className="text-brand-gradient">buscam resultado.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 mb-16 rounded-2xl glass">
            <Counter to={1000} label="Conteúdos entregues" />
            <Counter to={10} label="Empresas atendidas" />
            <Counter to={2} label="Anos de experiência" />
          </div>
        </Reveal>
      </div>

      {/* área reservada para logos das empresas atendidas */}

    </section>
  );
}

/* ---------------- Testimonials ---------------- */
const testimonials = [
  { name: "Carolina Meireles", company: "CEO · Aurora Commerce", text: "A MAXEASE transformou completamente nossa presença digital. Nosso e-commerce triplicou em conversões após o novo site." },
  { name: "Rafael Andrade", company: "CMO · Nimbus SaaS", text: "Uma agência que entende de estratégia, design e código. Entregam com padrão internacional." },
  { name: "Juliana Prado", company: "Fundadora · Bellavista", text: "Os vídeos institucionais elevaram nossa marca a outro patamar. Trabalho impecável do início ao fim." },
  { name: "Diego Salles", company: "Diretor · Frenit Fitness", text: "Automatizaram processos que consumiam horas do meu time. Ganhamos escala real com o sistema deles." },
  { name: "Marina Costa", company: "Head de Marketing · Orbis", text: "Profissionais atentos aos detalhes. O resultado final superou todas as expectativas do board." },
];

function Testimonials() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden">
      <GradientOrb className="right-[-10%] top-0" size={500} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-14">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-4">Depoimentos</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              O que dizem quem já <span className="text-brand-gradient">trabalhou</span> com a gente.
            </h2>
          </div>
        </Reveal>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]">
        <div className="flex gap-6 animate-marquee w-max">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="w-[360px] sm:w-[420px] shrink-0 glass rounded-2xl p-7">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-brand-light text-brand-light" />
                ))}
              </div>
              <p className="text-white/80 leading-relaxed text-sm">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-brand-gradient flex items-center justify-center text-white font-semibold">
                  {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/55">{t.company}</div>
                </div>
              </div>
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
    <section id="sobre" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-elegant max-w-md mx-auto lg:mx-0">
              <img src={aboutImg.url} alt="Henrique Castro, fundador da MAXEASE Digital" loading="lazy" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-deep/40 via-transparent to-brand-blue/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-transparent">
                <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-1">Fundador</div>
                <div className="text-xl font-semibold text-white">Henrique Castro</div>
                <div className="text-sm text-white/70">CEO & Fundador · MAXEASE Digital</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div>

              <div className="text-xs uppercase tracking-[0.25em] text-brand-light mb-4">Sobre a MAXEASE</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Unimos <span className="text-brand-gradient">criatividade, tecnologia e estratégia</span> em cada entrega.
              </h2>
              <p className="mt-6 text-white/70 leading-relaxed">
                A MAXEASE Digital nasceu com um propósito simples: transformar boas ideias em soluções digitais que geram resultados.
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                Fundada por <span className="text-white font-medium">Henrique Castro</span>, a empresa une estratégia, design e tecnologia para desenvolver sites de alto padrão, sistemas personalizados e produções audiovisuais que fortalecem marcas e impulsionam negócios.
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                Mais do que entregar projetos bonitos, acreditamos que cada detalhe deve ter um objetivo: transmitir credibilidade, melhorar a experiência do usuário e contribuir para o crescimento das empresas que confiam no nosso trabalho.
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                Hoje, a MAXEASE Digital reúne criatividade, inovação e tecnologia para criar experiências digitais modernas, funcionais e memoráveis, sempre com foco em qualidade, performance e resultados reais.
              </p>
            </div>
          </Reveal>


        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return (
    <section id="contato" className="relative py-24 sm:py-32">
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
                <a
                  href="https://wa.me/5542988377640"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-brand-deep hover:scale-[1.03] transition-transform shadow-[0_20px_50px_-15px_rgba(255,255,255,0.4)]"
                >
                  Solicitar orçamento
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
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
    <footer className="relative border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img src={logoAsset.url} alt="MAXEASE Digital" className="h-10 w-auto" />
            <p className="mt-5 text-sm text-white/60 max-w-sm leading-relaxed">
              Estúdio criativo e tecnológico. Sites, sistemas e produções audiovisuais para marcas que buscam crescer.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-4">Links rápidos</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/" hash="inicio" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/audiovisual" className="hover:text-white transition-colors">Audiovisual</Link></li>
              <li><Link to="/sites" className="hover:text-white transition-colors">Sites</Link></li>
              <li><Link to="/" hash="sobre" className="hover:text-white transition-colors">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-4">Contato</div>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="https://wa.me/5542988377640" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><MessageCircle className="h-4 w-4" /> WhatsApp</a></li>
              <li><a href="https://www.instagram.com/max.ease/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><Instagram className="h-4 w-4" /> @max.ease</a></li>
              <li><a href="mailto:maxeaseoficial@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="h-4 w-4" /> maxeaseoficial@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40">
          <div>© {new Date().getFullYear()} MAXEASE Digital. Todos os direitos reservados.</div>
          <div>Feito com precisão e cafeína.</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Page ---------------- */
function Index() {
  return (
    <div className="relative min-h-screen bg-brand-deep text-white">
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Clients />
        <Testimonials />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
