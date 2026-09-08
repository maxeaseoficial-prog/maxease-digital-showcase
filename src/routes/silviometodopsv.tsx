import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  Instagram,
  Linkedin,
  Target,
  TrendingUp,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, type CSSProperties, type ReactNode } from "react";

const problems = [
  "Cada vendedor trabalha de uma forma",
  "Oportunidades se perdem por falta de acompanhamento",
  "O gestor não consegue identificar onde a venda trava",
  "Metas existem, mas o processo para alcançá-las não está claro",
  "O resultado depende excessivamente de pessoas específicas",
  "Falta previsibilidade comercial",
];

const pillars = [
  {
    number: "01",
    title: "Processo",
    text: "Estrutura, etapas, responsabilidades e padrões claros para a operação comercial.",
    icon: Workflow,
  },
  {
    number: "02",
    title: "Sistema",
    text: "Organização, acompanhamento, indicadores e gestão da execução.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Vendas",
    text: "Transformar processo e gestão em execução comercial orientada a resultado.",
    icon: Target,
  },
];

const before = [
  "Operação dependente de pessoas",
  "Processos pouco claros",
  "Gestão reativa",
  "Baixa previsibilidade",
  "Dificuldade para escalar",
];

const after = [
  "Processo comercial definido",
  "Papéis e responsabilidades claros",
  "Gestão baseada em acompanhamento",
  "Equipe orientada à execução",
  "Maior previsibilidade operacional",
];

const structure = [
  { title: "Diagnóstico comercial", icon: Target },
  { title: "Estruturação do processo", icon: Workflow },
  { title: "Organização da operação", icon: Building2 },
  { title: "Gestão da equipe", icon: Users },
  { title: "Indicadores e acompanhamento", icon: BarChart3 },
  { title: "Evolução da execução comercial", icon: TrendingUp },
];

const audiences = [
  { icon: Building2, text: "Empresários" },
  { icon: Target, text: "Gestores comerciais" },
  { icon: Users, text: "Empresas formando uma equipe de vendas" },
  { icon: Users, text: "Empresas reorganizando uma equipe existente" },
  { icon: Building2, text: "Operações que cresceram sem estruturar o comercial" },
  { icon: Target, text: "Negócios que querem reduzir improvisação na gestão de vendas" },
];

const objections = [
  ["Processo", "Para deixar claro como a operação comercial deve funcionar."],
  ["Sistema", "Para transformar acompanhamento e gestão em rotina."],
  ["Vendas", "Para fazer a estrutura chegar até a execução comercial."],
];

const faqs = [
  {
    question: "Para quem é o Método PSV?",
    answer:
      "Para empresas, empresários e gestores que precisam organizar, formar ou reorganizar sua operação comercial.",
  },
  {
    question: "Como funciona o processo?",
    answer:
      "O formato detalhado será apresentado após a definição final da entrega. A estrutura parte de processo, sistema e execução em vendas.",
  },
  {
    question: "O método serve para equipes comerciais já existentes?",
    answer:
      "Sim. A proposta contempla operações que precisam organizar processos, responsabilidades, acompanhamento e execução.",
  },
  {
    question: "Também funciona para quem está montando uma nova equipe?",
    answer:
      "Sim. O método também foi pensado para empresas que precisam estruturar a operação desde a formação da equipe.",
  },
  {
    question: "Como saber se minha operação comercial precisa ser estruturada?",
    answer:
      "Falta de clareza no processo, gestão reativa, dependência de pessoas específicas e pouca previsibilidade são sinais relevantes.",
  },
];

const css = `
  .psv-page {
    color: #edf5ff;
    background: #020b18;
    font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;
  }
  .psv-page * { box-sizing: border-box; }
  .psv-page img, .psv-page svg { display: block; }
  .psv-page a { color: inherit; text-decoration: none; }
  .psv-page p { margin: 0; }
  .psv-page .page-shell {
    width: min(100% - 2rem, 76rem);
    margin-inline: auto;
  }
  .psv-page .section {
    position: relative;
    padding-block: clamp(5rem, 8vw, 8rem);
  }
  .psv-page .section-light {
    background: linear-gradient(180deg, color-mix(in oklab, #121b2b 82%, black), #020b18);
  }
  .psv-page .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.4rem;
    color: #7fc8ff;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-transform: uppercase;
  }
  .psv-page .section-label span:first-child {
    color: #a5c0de;
  }
  .psv-page .section-label::after {
    content: "";
    width: 4rem;
    height: 1px;
    background: rgba(143, 170, 210, 0.4);
  }
  .psv-page .eyebrow {
    color: #7fc8ff;
    font-size: clamp(0.7rem, 1.6vw, 0.78rem);
    font-weight: 800;
    letter-spacing: 0.16em;
    line-height: 1.35;
    text-transform: uppercase;
  }
  .psv-page .cta-link {
    position: relative;
    display: inline-flex;
    min-height: 3.6rem;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    border: 1px solid rgba(127, 200, 255, 0.6);
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #3d7dff 0%, #1d7af8 100%);
    color: white;
    padding: 1rem 1.25rem;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1.25;
    text-transform: uppercase;
    overflow: hidden;
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  .psv-page .cta-link::before {
    position: absolute;
    top: -45%;
    bottom: -45%;
    left: -35%;
    width: 20%;
    content: "";
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.44), transparent);
    transform: skewX(-18deg);
    pointer-events: none;
  }
  .psv-page .cta-link:hover { transform: translateY(-1px); box-shadow: 0 0.7rem 2.2rem rgba(0, 132, 255, 0.28); }
  .psv-page .cta-link svg { transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1); }
  .psv-page .cta-link:hover svg { transform: translateX(0.3rem); }
  .psv-page .cta-link-secondary { background: transparent; color: #edf5ff; }
  .psv-page .cta-link-secondary:hover { background: rgba(127, 200, 255, 0.14); }
  .psv-page .hero {
    position: relative;
    min-height: 100svh;
    overflow: clip;
    background: #020b18;
    isolation: isolate;
  }
  .psv-page .hero-backdrop,
  .psv-page .hero-shade {
    position: absolute;
    inset: 0;
  }
  .psv-page .hero-backdrop { z-index: -2; }
  .psv-page .hero-backdrop img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .psv-page .hero-shade {
    z-index: -1;
    background: linear-gradient(90deg, rgba(1, 8, 19, 0.97) 0%, rgba(1, 8, 19, 0.84) 34%, transparent 68%), linear-gradient(180deg, rgba(1, 8, 19, 0.14) 55%, rgba(1, 8, 19, 0.76) 100%);
  }
  .psv-page .hero-native {
    display: flex;
    min-height: 100svh;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-block: clamp(3rem, 7vh, 5rem);
  }
  .psv-page .hero-presenter {
    margin: 0 0 1.8rem;
    color: rgba(224, 237, 255, 0.88);
    font-size: clamp(0.68rem, 1vw, 0.84rem);
    font-weight: 700;
    letter-spacing: 0.32em;
    line-height: 1.4;
    text-transform: uppercase;
  }
  .psv-page .hero-presenter::after { display: block; width: 3.4rem; height: 2px; margin-top: 1.25rem; content: ""; background: #7fc8ff; }
  .psv-page .hero-native h1 { margin: 0; line-height: 0.82; text-transform: uppercase; }
  .psv-page .hero-method {
    display: block;
    margin-bottom: 0.8rem;
    color: white;
    font-size: clamp(1.35rem, 2.4vw, 2.35rem);
    font-weight: 650;
    letter-spacing: 0.34em;
    line-height: 1;
  }
  .psv-page .hero-psv {
    display: block;
    color: white;
    font-size: clamp(5rem, 10.8vw, 9.2rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 0.76;
  }
  .psv-page .hero-psv > span { color: #7fc8ff; }
  .psv-page .hero-psv b {
    margin-left: 0.06em;
    color: rgba(241, 247, 255, 0.94);
    font-size: 0.72em;
    font-weight: 800;
  }
  .psv-page .hero-signature {
    margin: 1.5rem 0 0;
    color: #edf5ff;
    font-size: clamp(1.3rem, 2.6vw, 2.25rem);
    font-weight: 700;
    line-height: 1.08;
  }
  .psv-page .hero-signature strong { color: #7fc8ff; }
  .psv-page .hero-description {
    max-width: 34rem;
    margin: 1.35rem 0 1.6rem;
    color: rgba(207,220,238,0.78);
    font-size: clamp(0.94rem, 1.35vw, 1.08rem);
    line-height: 1.65;
  }
  .psv-page .hero-native .cta-link {
    min-width: min(100%, 33rem);
    border-color: rgba(80, 218, 255, 0.82);
    border-radius: 0.85rem;
    box-shadow: 0 0.85rem 2.6rem rgba(0,126,255,0.32), inset 0 1px rgba(255,255,255,0.34);
    padding: 1.05rem 1.7rem;
  }
  .psv-page .hero-proofline {
    display: flex; flex-wrap: wrap; gap: 0.35rem 0; margin-top: 1.5rem; color: rgba(185,204,229,0.66); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  }
  .psv-page .hero-proofline span { display: inline-flex; align-items: center; }
  .psv-page .hero-proofline span:not(:last-child)::after { width: 1.8rem; height: 1px; margin-inline: 0.65rem; content: ""; background: rgba(143, 170, 210, 0.4); }
  .psv-page .portrait { display: block; width: 100%; height: auto; }
  .psv-page .problem-heading {
    display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(16rem, 0.7fr); gap: clamp(2rem, 5vw, 5rem); align-items: end; border-bottom: 1px solid rgba(143,170,210,0.4); padding-bottom: clamp(2rem, 4vw, 3rem);
  }
  .psv-page .problem-heading h2, .psv-page .section-heading h2, .psv-page .transformation-title, .psv-page .structure-title, .psv-page .authority-copy h2, .psv-page .audience-section h2, .psv-page .offer-layout h2, .psv-page .objections-section h2, .psv-page .faq-layout h2, .psv-page .final-cta h2 {
    margin: 0; color: #edf5ff; font-size: clamp(2.3rem, 5vw, 5rem); font-weight: 800; letter-spacing: 0; line-height: 0.98;
  }
  .psv-page .problem-heading p, .psv-page .section-heading p, .psv-page .offer-layout p, .psv-page .final-layout p {
    margin: 0; color: #a5bfd5; font-size: clamp(1rem, 1.4vw, 1.14rem); line-height: 1.75;
  }
  .psv-page .problem-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 0; }
  .psv-page .problem-row {
    display: grid; grid-template-columns: 4rem minmax(0, 1fr); gap: 1rem; border-bottom: 1px solid rgba(143,170,210,0.4); padding: 1.6rem 0; transition: background-color 220ms ease, padding-inline 220ms cubic-bezier(0.16,1,0.3,1);
  }
  .psv-page .problem-row:hover { background: rgba(127,200,255,0.07); }
  .psv-page .problem-row p { transition: transform 220ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .problem-row:hover p { transform: translateX(0.3rem); }
  .psv-page .problem-row:nth-child(odd) { border-right: 1px solid rgba(143,170,210,0.4); padding-right: clamp(1rem,3vw,2.5rem); }
  .psv-page .problem-row:nth-child(even) { padding-left: clamp(1rem,3vw,2.5rem); }
  .psv-page .problem-row span { color: #7fc8ff; font-size: 0.82rem; font-weight: 800; }
  .psv-page .problem-row p { margin: 0; color: #edf5ff; font-size: clamp(1rem,1.5vw,1.18rem); line-height:1.55; }
  .psv-page .method-section, .psv-page .offer-section, .psv-page .final-cta { overflow: clip; background: linear-gradient(180deg, #020b18, rgba(18,27,43,0.82)); }
  .psv-page .section-heading-wide { display: grid; grid-template-columns: minmax(0,1fr) minmax(16rem,0.46fr); gap: clamp(2rem,5vw,4rem); align-items: end; }
  .psv-page .section-heading h2 span, .psv-page .objections-section h2 span { color: #7fc8ff; }
  .psv-page .pillar-flow {
    display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); margin-top: clamp(2.5rem,5vw,4.5rem); border: 1px solid rgba(143,170,210,0.4); background: rgba(18,27,43,0.72);
  }
  .psv-page .pillar { position: relative; min-width: 0; overflow: hidden; padding: clamp(1.4rem,3vw,2rem); transition: background-color 240ms ease, transform 240ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .pillar:hover { z-index:1; background: rgba(127,200,255,0.10); transform: translateY(-0.35rem); }
  .psv-page .pillar + .pillar { border-left: 1px solid rgba(143,170,210,0.4); }
  .psv-page .pillar-top { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom: clamp(3rem,8vw,6rem); }
  .psv-page .pillar-number { color:#7fc8ff; font-size:0.85rem; font-weight:800; }
  .psv-page .pillar-arrow { width: 3.5rem; color: rgba(143,170,210,0.45); transition: color 220ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .pillar-icon { width: 1.8rem; height: 1.8rem; margin-left: auto; color:#7fc8ff; transition: color 220ms ease, filter 220ms ease, transform 280ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .pillar:hover .pillar-icon { color: white; filter: drop-shadow(0 0.35rem 0.6rem rgba(0,151,255,0.48)); transform: rotate(-8deg) scale(1.16); }
  .psv-page .pillar:hover .pillar-arrow { color:#7fc8ff; transform: translateX(0.35rem); }
  .psv-page .pillar h3 { margin:0 0 1rem; font-size: clamp(1.6rem,3vw,2.7rem); font-weight:800; line-height:1; text-transform: uppercase; }
  .psv-page .pillar p { margin:0; color:#a5bfd5; line-height:1.7; }
  .psv-page .method-signature { display:flex; flex-wrap:wrap; align-items:center; gap:1rem; margin-top:1.4rem; color:#a5bfd5; font-size: clamp(0.9rem,2vw,1.1rem); font-weight:800; letter-spacing:0.08em; text-transform:uppercase; }
  .psv-page .method-signature svg { width:1.2rem; color:#7fc8ff; }
  .psv-page .transformation-section { overflow:hidden; background: radial-gradient(circle at 84% 52%, rgba(0,132,255,0.16), transparent 32rem), radial-gradient(circle at 12% 86%, rgba(17,83,162,0.11), transparent 27rem), linear-gradient(180deg, #020b18, rgb(2, 8, 18)); }
  .psv-page .transformation-section::before { position:absolute; inset:0; content:""; background: linear-gradient(121deg, transparent 0 86%, rgba(0,122,255,0.23) 86.05%, transparent 86.12%), linear-gradient(32deg, transparent 0 12%, rgba(0,122,255,0.18) 12.05%, transparent 12.12%); pointer-events:none; }
  .psv-page .transformation-section::after { position:absolute; inset:auto 0 0; height:1px; content:""; background: linear-gradient(90deg, transparent, rgba(38,153,255,0.45), transparent); }
  .psv-page .transformation-section .page-shell { position:relative; z-index:1; }
  .psv-page .transformation-head { display:grid; grid-template-columns: minmax(0,1.9fr) minmax(17rem,0.72fr); align-items:end; gap: clamp(2rem,7vw,6rem); }
  .psv-page .transformation-title { max-width:54rem; }
  .psv-page .transformation-title span { color:#7fc8ff; }
  .psv-page .transformation-intro { position:relative; max-width:25rem; margin:0 0 0.55rem; color: rgba(199,214,235,0.82); font-size: clamp(0.95rem,1.5vw,1.08rem); line-height:1.75; }
  .psv-page .transformation-intro::before { display:block; width:2.3rem; height:1px; margin-bottom:1.4rem; content:""; background: rgba(202,222,248,0.66); }
  .psv-page .comparison { display:grid; grid-template-columns: minmax(0,1fr) 7rem minmax(0,1fr); align-items:stretch; gap: clamp(0.85rem,2vw,1.4rem); margin-top: clamp(3rem,6vw,5rem); }
  .psv-page .comparison-side { position:relative; overflow:hidden; border-radius:1rem; border:1px solid rgba(116,151,190,0.36); padding: clamp(1.65rem,3.2vw,2.5rem); transition: box-shadow 280ms ease, transform 280ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .comparison-side:hover { transform: translateY(-0.35rem); }
  .psv-page .comparison-before { background: linear-gradient(145deg, rgba(15,27,43,0.86), rgba(4,12,23,0.94)); box-shadow: 0 1.2rem 3.2rem rgba(0,0,0,0.2); }
  .psv-page .comparison-before:hover { box-shadow: 0 1.6rem 3.8rem rgba(0,0,0,0.34); }
  .psv-page .comparison-after { border-color: rgba(0,156,255,0.9); background: radial-gradient(circle at 100% 0%, rgba(22,126,246,0.28), transparent 20rem), linear-gradient(145deg, rgba(9,43,82,0.96), rgba(3,20,39,0.97)); box-shadow: 0 1.5rem 4rem rgba(0,88,185,0.22); }
  .psv-page .comparison-after::after { position:absolute; inset:0 0 auto; height:2px; content:""; background: linear-gradient(90deg, #7fc8ff, transparent 76%); }
  .psv-page .comparison-after:hover { box-shadow: 0 1.8rem 4.6rem rgba(0,106,218,0.26); }
  .psv-page .comparison-heading { display:flex; min-height:2.25rem; align-items:flex-start; justify-content:space-between; gap:1.25rem; margin-bottom:1.5rem; }
  .psv-page .comparison-label { margin:0; color:#7fc8ff; font-size: clamp(1rem,2vw,1.28rem); font-weight:800; letter-spacing:0.06em; text-transform:uppercase; }
  .psv-page .comparison-before .comparison-label { color: rgba(205,218,235,0.84); }
  .psv-page .comparison-heading > span { max-width:12rem; color: rgba(129,161,200,0.82); font-size:0.64rem; font-weight:750; letter-spacing:0.13em; line-height:1.45; text-align:right; text-transform:uppercase; }
  .psv-page .comparison-after .comparison-heading > span { color: rgba(44,168,255,0.92); }
  .psv-page .comparison-side ul { display:grid; gap:0; margin:0; padding:0; list-style:none; }
  .psv-page .comparison-side li { display:flex; min-height:3.55rem; align-items:center; gap:0.95rem; border-top:1px solid rgba(122,159,199,0.14); color:#edf5ff; line-height:1.55; transition: color 220ms ease, padding-inline 240ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .comparison-side li:last-child { border-bottom:1px solid rgba(122,159,199,0.14); }
  .psv-page .comparison-side li:hover { padding-inline:0.35rem; }
  .psv-page .comparison-icon { display:grid; flex:0 0 auto; width:2rem; height:2rem; place-items:center; border-radius:50%; background: rgba(79,106,143,0.18); color: rgba(186,204,228,0.82); transition: background-color 220ms ease, box-shadow 220ms ease, transform 260ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .comparison-after .comparison-icon { background: rgba(0,125,229,0.26); color:#7fc8ff; }
  .psv-page .comparison-icon svg { width:1rem; height:1rem; }
  .psv-page .comparison-side li:hover .comparison-icon { transform: scale(1.2) rotate(-8deg); }
  .psv-page .comparison-after li:hover .comparison-icon { background: rgba(0,139,255,0.40); box-shadow: 0 0.6rem 1.3rem rgba(0,119,239,0.24); }
  .psv-page .comparison-axis { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.25rem; color:#7fc8ff; font-size:0.74rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; }
  .psv-page .comparison-axis::before { position:absolute; top:1rem; bottom:1rem; left:50%; width:1px; content:""; background: linear-gradient(180deg, transparent, rgba(37,148,255,0.64), transparent); }
  .psv-page .comparison-axis > span { z-index:1; padding-block:0.75rem; background:#020b18; writing-mode:vertical-rl; transform: rotate(180deg); }
  .psv-page .comparison-axis-mark { position:relative; z-index:1; display:grid; width:3.8rem; height:3.8rem; place-items:center; border-radius:50%; background: linear-gradient(145deg, #7fc8ff, #1d7af8); box-shadow: 0 1rem 2.2rem rgba(0,117,235,0.38), inset 0 1px rgba(255,255,255,0.35); color:white; transition: box-shadow 260ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .comparison:hover .comparison-axis-mark { box-shadow: 0 1.1rem 2.6rem rgba(0,140,255,0.46); transform: translateX(0.25rem); }
  .psv-page .comparison-axis-mark svg { width:1.35rem; }
  .psv-page .structure-title { max-width:56rem; }
  .psv-page .timeline { display:grid; margin: clamp(2.2rem,5vw,4rem) 0 0; padding:0; list-style:none; counter-reset:step; }
  .psv-page .timeline li { display:grid; grid-template-columns:5rem 2.5rem minmax(0,1fr); align-items:center; min-height:5.5rem; border-top:1px solid rgba(143,170,210,0.4); transition: background-color 220ms ease, padding-inline 220ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .timeline li:hover { background: rgba(127,200,255,0.08); padding-inline:0.8rem; }
  .psv-page .timeline li:last-child { border-bottom:1px solid rgba(143,170,210,0.4); }
  .psv-page .timeline-number { color:#7fc8ff; font-weight:800; }
  .psv-page .timeline-icon { display:grid; width:2rem; height:2rem; place-items:center; border:1px solid #7fc8ff; border-radius:50%; background:#020b18; color:#7fc8ff; transition: background-color 220ms ease, box-shadow 220ms ease, color 220ms ease, transform 280ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .timeline-icon svg { width:1rem; height:1rem; }
  .psv-page .timeline li:hover .timeline-icon { background:#1d7af8; box-shadow: 0 0.55rem 1.4rem rgba(0,139,255,0.30); color:white; transform: rotate(-8deg) scale(1.12); }
  .psv-page .timeline h3 { margin:0; font-size: clamp(1.15rem,2vw,1.85rem); font-weight:700; line-height:1.2; transition: transform 220ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .timeline li:hover h3 { transform: translateX(0.35rem); }
  .psv-page .authority-layout { display:grid; grid-template-columns: minmax(18rem,0.7fr) minmax(0,1fr); align-items:center; gap: clamp(2rem,6vw,5rem); }
  .psv-page .authority-photo { position:relative; min-width:0; overflow:hidden; border-radius:1rem; background:#020b18; box-shadow: 0 2rem 5rem rgba(0,0,0,0.36), 0 1rem 3.5rem rgba(0,111,224,0.18); }
  .psv-page .authority-portrait { position:relative; z-index:1; aspect-ratio:4/5; object-fit:cover; object-position:50% 20%; border-radius:inherit; filter:saturate(0.84) contrast(1.06); transition: filter 260ms ease, transform 420ms cubic-bezier(0.16,1,0.3,1); }
  .psv-page .authority-photo::after { position:absolute; z-index:2; inset:0; border-radius:inherit; content:""; background: linear-gradient(180deg, transparent 54%, rgba(2,11,24,0.26) 70%, #020b18 100%), linear-gradient(90deg, rgba(0,116,230,0.18), transparent 46%); pointer-events:none; }
  .psv-page .authority-photo:hover .authority-portrait { filter:saturate(0.98) contrast(1.07); transform: scale(1.025); }
  .psv-page .authority-copy { min-width:0; }
  .psv-page .authority-name { margin:1.4rem 0 0; color:#7fc8ff; font-size: clamp(1.2rem,2.4vw,1.7rem); font-weight:800; line-height:1.25; text-transform:uppercase; }
  .psv-page .authority-bio { max-width:36rem; margin:1.25rem 0 2rem; color:#a5bfd5; font-size:1.06rem; line-height:1.8; }
  .psv-page .authority-line { display:flex; flex-wrap:wrap; gap:0.8rem; }
  .psv-page .authority-line span { border-bottom:1px solid rgba(143,170,210,0.4); color:#edf5ff; font-weight:800; line-height:1.8; }
  .psv-page .audience-section h2 { max-width:64rem; }
  .psv-page .audience-list { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:0; margin-top: clamp(2.3rem,5vw,4rem); border-top:1px solid rgba(143,170,210,0.4); }
  .psv-page .audience-item { display:grid; grid-template-columns:2.8rem 2rem minmax(0,1fr); gap:1rem; align-items:center; min-height:6.3rem; border-bottom:1px solid rgba(143,170,210,0.4); padding: 1.2rem 1.2rem 1.2rem 0; }
  .psv-page .audience-item:nth-child(odd) { border-right:1px solid rgba(143,170,210,0.4); }
  .psv-page .audience-item:nth-child(even) { padding-left:1.2rem; }
  .psv-page .audience-item span { color:#a5bfd5; font-size:0.76rem; font-weight:800; }
  .psv-page .audience-item svg { width:1.25rem; height:1.25rem; color:#7fc8ff; }
  .psv-page .audience-item p { margin:0; font-weight:700; line-height:1.45; }
  .psv-page .offer-layout { display:grid; grid-template-columns: minmax(0,1fr) minmax(18rem,27rem); gap: clamp(2rem,5vw,4rem); align-items:start; }
  .psv-page .offer-layout h2 { max-width:50rem; }
  .psv-page .offer-layout > div > p:not(.offer-panel-title) { max-width:34rem; margin-top:1.4rem; }
  .psv-page .offer-panel { position:relative; border:1px solid rgba(127,200,255,0.30); background: rgba(18,27,43,0.78); padding: clamp(1.4rem,3vw,2rem); }
  .psv-page .offer-panel-title { margin:0 0 1.2rem; color:#7fc8ff; font-size:0.76rem; font-weight:800; letter-spacing:0.12em; line-height:1.35; text-transform:uppercase; }
  .psv-page .offer-principles { display:grid; margin-bottom:1.6rem; border-top:1px solid rgba(143,170,210,0.4); }
  .psv-page .offer-principles span { display:grid; grid-template-columns:1.5rem minmax(0,1fr); gap:0.8rem; align-items:center; min-height:3.8rem; border-bottom:1px solid rgba(143,170,210,0.4); color:#edf5ff; font-weight:700; }
  .psv-page .offer-principles svg { width:1.1rem; color:#7fc8ff; }
  .psv-page .offer-panel .cta-link { width:100%; }
  .psv-page .objections-section h2 { max-width:62rem; }
  .psv-page .objection-rows { display:grid; margin-top: clamp(2.5rem,5vw,4rem); border-top:1px solid rgba(143,170,210,0.4); }
  .psv-page .objection-rows article { display:grid; grid-template-columns:5rem minmax(10rem,0.42fr) minmax(0,1fr); gap:1rem; border-bottom:1px solid rgba(143,170,210,0.4); padding:1.6rem 0; }
  .psv-page .objection-rows span { color:#7fc8ff; font-weight:800; }
  .psv-page .objection-rows h3 { margin:0; font-size: clamp(1.3rem,2vw,2rem); font-weight:800; text-transform:uppercase; }
  .psv-page .objection-rows p, .psv-page .objection-close p { margin:0; color:#a5bfd5; line-height:1.7; }
  .psv-page .objection-close { display:grid; grid-template-columns: minmax(0,0.7fr) minmax(0,1fr) auto; gap: clamp(1.2rem,3vw,2rem); align-items:center; margin-top:2rem; }
  .psv-page .faq-layout { display:grid; grid-template-columns:minmax(16rem,0.48fr) minmax(0,1fr); gap: clamp(2rem,5vw,4rem); align-items:start; }
  .psv-page .faq-list { display:grid; border-top:1px solid rgba(143,170,210,0.4); }
  .psv-page .faq-list details { border-bottom:1px solid rgba(143,170,210,0.4); }
  .psv-page .faq-list summary { display:grid; grid-template-columns:2.4rem minmax(0,1fr) 1.4rem; gap:1rem; align-items:center; min-height:5rem; cursor:pointer; color:#edf5ff; font-weight:800; list-style:none; }
  .psv-page .faq-list summary::-webkit-details-marker { display:none; }
  .psv-page .faq-number { color:#7fc8ff; font-size:0.82rem; }
  .psv-page .faq-list summary svg { width:1.2rem; color:#a5bfd5; transition: transform 180ms ease; }
  .psv-page .faq-list details[open] summary svg { transform: rotate(180deg); }
  .psv-page .faq-list details p { margin:0 0 1.4rem 3.4rem; color:#a5bfd5; line-height:1.7; }
  .psv-page .faq-list details[open] p { animation: faq-in 240ms ease-out both; }
  .psv-page .final-layout { display:grid; grid-template-columns: minmax(0,1fr) minmax(18rem,0.58fr) minmax(12rem,0.36fr); gap: clamp(2rem,5vw,4rem); align-items:end; }
  .psv-page .final-media { position:relative; align-self:stretch; min-height:24rem; overflow:hidden; }
  .psv-page .final-media::after { position:absolute; inset:0; content:""; background: linear-gradient(180deg, transparent 48%, #020b18); }
  .psv-page .final-media img { width:100%; height:100%; object-fit:cover; object-position:50% 20%; filter:saturate(0.75) contrast(1.08); }
  .psv-page .motion-ready [data-reveal] { opacity:0; transform:translateY(1.25rem); transition: opacity 620ms cubic-bezier(0.16,1,0.3,1) var(--reveal-delay, 0ms), transform 620ms cubic-bezier(0.16,1,0.3,1) var(--reveal-delay, 0ms); }
  .psv-page .motion-ready [data-reveal].is-visible { opacity:1; transform:translateY(0); }
  @keyframes faq-in { from { opacity:0; transform:translateY(-0.35rem); } to { opacity:1; transform:translateY(0); } }
  @media (prefers-reduced-motion: no-preference) {
    .psv-page .cta-link::before { animation: cta-shine 3.8s ease-in-out infinite; }
    .psv-page [data-hero-sequence] > * { animation: hero-in 720ms cubic-bezier(0.16,1,0.3,1) both; }
    .psv-page [data-hero-sequence] > :nth-child(2) { animation-delay: 70ms; }
    .psv-page [data-hero-sequence] > :nth-child(3) { animation-delay: 140ms; }
    .psv-page [data-hero-sequence] > :nth-child(4) { animation-delay: 210ms; }
    .psv-page [data-hero-sequence] > :nth-child(5) { animation-delay: 280ms; }
    .psv-page [data-hero-sequence] > :nth-child(6) { animation-delay: 350ms; }
  }
  @keyframes cta-shine { 0%, 58% { transform: translateX(0) skewX(-18deg); } 78%, 100% { transform: translateX(780%) skewX(-18deg); } }
  @keyframes hero-in { from { opacity:0; transform:translateY(1rem); } to { opacity:1; transform:translateY(0); } }
  .psv-page .final-words { display:grid; gap:0.3rem; margin-bottom:1.3rem; color:#7fc8ff; font-size: clamp(1.6rem,3vw,2.4rem); font-weight:800; line-height:1.05; }
  .psv-page .final-layout p:not(.eyebrow) { margin: 0 0 1.5rem; }
  .psv-page .site-footer { border-top:1px solid rgba(143,170,210,0.4); background:#020b18; padding-block:2.4rem 1.4rem; }
  .psv-page .footer-layout { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2rem; align-items:start; }
  .psv-page .footer-layout p { margin:0; color:#a5bfd5; line-height:1.7; }
  .psv-page .footer-name { color:#edf5ff !important; font-weight:800; }
  .psv-page .footer-links { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:0.9rem 1.2rem; }
  .psv-page .footer-links a { display:inline-flex; align-items:center; gap:0.35rem; color:#a5bfd5; font-size:0.84rem; font-weight:700; }
  .psv-page .footer-links svg { width:1rem; height:1rem; }
  .psv-page .footer-bottom { display:flex; justify-content:space-between; gap:1rem; margin-top:2rem; border-top:1px solid rgba(143,170,210,0.4); padding-top:1rem; color:#a5bfd5; font-size:0.72rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; }
  @media (max-width: 900px) {
    .psv-page .section { padding-block: 4.5rem; }
    .psv-page .hero { min-height: 100svh; }
    .psv-page .hero-backdrop img { object-position: 50% 18%; }
    .psv-page .hero-shade { background: linear-gradient(180deg, transparent 20%, rgba(2,11,24,0.18) 38%, #020b18 68%), linear-gradient(90deg, #020b18 0%, transparent 42%, transparent 72%, #020b18 100%); }
    .psv-page .hero-native { min-height:100svh; justify-content:flex-end; padding-block: clamp(24rem,59vh,34rem) 3rem; }
    .psv-page .hero-presenter { margin-bottom:1.25rem; }
    .psv-page .hero-method { font-size:clamp(1.15rem,5vw,1.55rem); }
    .psv-page .hero-psv { font-size:clamp(4.8rem,21vw,8rem); }
    .psv-page .hero-description { max-width:38rem; }
    .psv-page .hero-native .hero-proofline { display:none; }
    .psv-page .problem-heading, .psv-page .section-heading-wide, .psv-page .transformation-head, .psv-page .comparison, .psv-page .authority-layout, .psv-page .offer-layout, .psv-page .faq-layout, .psv-page .final-layout { grid-template-columns:1fr; }
    .psv-page .transformation-intro { max-width:38rem; margin-top:0.25rem; }
    .psv-page .comparison-axis { min-height:5rem; flex-direction:row; }
    .psv-page .comparison-axis::before { top:50%; right:1rem; bottom:auto; left:1rem; width:auto; height:1px; background: linear-gradient(90deg, transparent, rgba(37,148,255,0.64), transparent); }
    .psv-page .comparison-axis > span { padding:0.6rem 0.8rem; writing-mode:horizontal-tb; transform:none; }
    .psv-page .comparison-axis-mark svg { transform: rotate(90deg); }
    .psv-page .comparison:hover .comparison-axis-mark { transform: translateY(0.2rem); }
    .psv-page .objection-close, .psv-page .objection-rows article { grid-template-columns:1fr; }
  }
  @media (max-width: 700px) {
    .psv-page .page-shell { width: min(100% - 1.25rem, 76rem); }
    .psv-page .hero-description { margin-bottom:1.3rem; }
    .psv-page .cta-link { width:100%; min-height:3.45rem; padding-inline:1rem; font-size:0.72rem; }
    .psv-page .hero-proofline { font-size:0.76rem; line-height:1.6; }
    .psv-page .transformation-head { gap:1.5rem; }
    .psv-page .transformation-intro::before { margin-bottom:1rem; }
    .psv-page .comparison-heading { align-items:flex-start; }
    .psv-page .comparison-heading > span { max-width:9.5rem; font-size:0.58rem; }
    .psv-page .problem-list, .psv-page .pillar-flow, .psv-page .audience-list { grid-template-columns:1fr; }
    .psv-page .problem-row, .psv-page .problem-row:nth-child(odd), .psv-page .problem-row:nth-child(even), .psv-page .audience-item, .psv-page .audience-item:nth-child(even) { border-right:0; padding-left:0; padding-right:0; }
    .psv-page .pillar + .pillar { border-top:1px solid rgba(143,170,210,0.4); border-left:0; }
    .psv-page .pillar-top { margin-bottom:2rem; }
    .psv-page .pillar-arrow { transform: rotate(90deg); }
    .psv-page .timeline li { grid-template-columns:3rem 1.5rem minmax(0,1fr); min-height:4.8rem; }
    .psv-page .audience-item:nth-child(odd) { border-right:0; }
    .psv-page .footer-layout, .psv-page .footer-bottom { display:grid; grid-template-columns:1fr; }
    .psv-page .footer-links { justify-content:flex-start; }
    .psv-page .final-media { min-height:22rem; }
  }
  @media (max-width: 430px) {
    .psv-page .problem-row { grid-template-columns:3rem minmax(0,1fr); }
    .psv-page .section-label { letter-spacing:0.1em; }
    .psv-page .section-label::after { width:2rem; }
    .psv-page .hero-native { padding-top: min(54vh, 28rem); }
  }
  @media (prefers-reduced-motion: reduce) {
    .psv-page html { scroll-behavior:auto; }
    .psv-page *, .psv-page *::before, .psv-page *::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; transition-duration:0.01ms !important; }
    .psv-page [data-reveal] { opacity:1 !important; transform:none !important; }
  }
`;

function CtaLink({ children, secondary = false }: { children: ReactNode; secondary?: boolean }) {
  return (
    <a href="#contato" className={secondary ? "cta-link cta-link-secondary" : "cta-link"}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
    </a>
  );
}

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span>{children}</span>
    </div>
  );
}

function Portrait({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      className={`portrait ${className}`}
      src={src}
      alt={alt}
      width="1120"
      height="1400"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
    />
  );
}

function RevealMotion() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}

function Hero() {
  return (
    <header id="inicio" className="hero">
      <picture className="hero-backdrop" aria-hidden="true">
        <source media="(max-width: 900px)" srcSet="/silviometodopsv/silvio-speaker.jpg" />
        <img src="/silviometodopsv/hero-stage-clean.png" alt="" width="1671" height="941" loading="eager" fetchPriority="high" decoding="async" />
      </picture>
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-native page-shell" data-hero-sequence>
        <p className="hero-presenter">Silvio Luiz Eidt Junior apresenta</p>
        <h1>
          <span className="hero-method">Método</span>
          <span className="hero-psv">
            PS<span>V</span>
            <b aria-hidden="true">:</b>
          </span>
        </h1>
        <p className="hero-signature">
          Processo, Sistema e <strong>Vendas.</strong>
        </p>
        <p className="hero-description">
          Estruture sua operação comercial com processos claros, gestão e um sistema de vendas preparado para gerar resultados previsíveis.
        </p>
        <CtaLink>Quero estruturar minha equipe de vendas</CtaLink>
        <div className="hero-proofline" aria-label="Processo, Gestão, Execução e Vendas">
          <span>Processo</span>
          <span>Gestão</span>
          <span>Execução</span>
          <span>Vendas</span>
        </div>
      </div>
    </header>
  );
}

function ProblemSection() {
  return (
    <section id="problema" className="section section-light">
      <div className="page-shell">
        <SectionLabel number="01">O ponto de partida</SectionLabel>
        <div className="problem-heading" data-reveal>
          <h2>Vender mais não começa cobrando mais do vendedor.</h2>
          <p>Começa construindo uma operação comercial que sabe o que fazer, como fazer e como medir.</p>
        </div>
        <div className="problem-list">
          {problems.map((problem, index) => (
            <div
              className="problem-row"
              key={problem}
              data-reveal
              style={{ "--reveal-delay": `${index * 55}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodSection() {
  return (
    <section id="metodo" className="section method-section">
      <div className="method-grid" aria-hidden="true" />
      <div className="page-shell">
        <SectionLabel number="02">A estrutura</SectionLabel>
        <div className="section-heading section-heading-wide" data-reveal>
          <h2>
            O Método <span>PSV</span>
          </h2>
          <p>Uma estrutura comercial construída sobre três fundamentos.</p>
        </div>
        <div className="pillar-flow">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <article
                className="pillar"
                key={pillar.title}
                data-reveal
                style={{ "--reveal-delay": `${index * 100}ms` } as CSSProperties}
              >
                <div className="pillar-top">
                  <span className="pillar-number">{pillar.number}</span>
                  <Icon aria-hidden="true" className="pillar-icon" />
                  {index < pillars.length - 1 && <ArrowRight aria-hidden="true" className="pillar-arrow" />}
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            );
          })}
        </div>
        <div className="method-signature" aria-label="Processo leva ao sistema, que leva a vendas">
          <span>Processo</span>
          <ArrowRight aria-hidden="true" />
          <span>Sistema</span>
          <ArrowRight aria-hidden="true" />
          <span>Vendas</span>
        </div>
      </div>
    </section>
  );
}

function TransformationSection() {
  return (
    <section className="section transformation-section">
      <div className="page-shell">
        <SectionLabel number="03">A transformação</SectionLabel>
        <div className="transformation-head">
          <h2 className="transformation-title">
            De uma equipe que apenas vende para uma operação <span>comercial estruturada.</span>
          </h2>
          <p className="transformation-intro">
            O Método PSV organiza a operação comercial para que processo, gestão e execução trabalhem na mesma direção.
          </p>
        </div>
        <div className="comparison" data-reveal>
          <div className="comparison-side comparison-before">
            <div className="comparison-heading">
              <p className="comparison-label">Antes</p>
              <span>Operação sem processo definido</span>
            </div>
            <ul>
              {before.map((item) => (
                <li key={item}>
                  <span className="comparison-icon" aria-hidden="true">
                    <X />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="comparison-axis" aria-hidden="true">
            <span>Estrutura</span>
            <div className="comparison-axis-mark">
              <ArrowRight />
            </div>
          </div>
          <div className="comparison-side comparison-after">
            <div className="comparison-heading">
              <p className="comparison-label">Com o PSV</p>
              <span>Processo, gestão e execução alinhados</span>
            </div>
            <ul>
              {after.map((item) => (
                <li key={item}>
                  <span className="comparison-icon" aria-hidden="true">
                    <Check />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StructureSection() {
  return (
    <section className="section section-light">
      <div className="page-shell">
        <SectionLabel number="04">Dentro da operação</SectionLabel>
        <h2 className="structure-title">O que estruturamos dentro da sua operação comercial</h2>
        <ol className="timeline">
          {structure.map(({ title, icon: Icon }, index) => (
            <li key={title} data-reveal style={{ "--reveal-delay": `${index * 65}ms` } as CSSProperties}>
              <span className="timeline-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="timeline-icon" aria-hidden="true">
                <Icon />
              </span>
              <h3>{title}</h3>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AuthoritySection() {
  return (
    <section className="section authority-section">
      <div className="page-shell authority-layout">
        <div className="authority-photo" data-reveal>
          <Portrait
            src="/silviometodopsv/silvio-about.jpg"
            alt="Retrato profissional de Silvio Luiz Eidt Junior"
            className="authority-portrait"
          />
        </div>
        <div className="authority-copy" data-reveal>
          <SectionLabel number="05">Liderança e direção</SectionLabel>
          <h2>Quem está por trás do Método PSV</h2>
          <p className="authority-name">Silvio Luiz Eidt Junior</p>
          <p className="authority-bio">
            Especialista em estruturação comercial e responsável pelo Método PSV. Esta área está preparada para receber a biografia oficial na próxima etapa do projeto.
          </p>
          <div className="authority-line">
            <span>Processo</span>
            <span>Sistema</span>
            <span>Vendas</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="section section-light audience-section">
      <div className="page-shell">
        <SectionLabel number="06">Para quem é</SectionLabel>
        <h2>O Método PSV é para empresas que precisam transformar vendas em uma operação.</h2>
        <div className="audience-list">
          {audiences.map(({ icon: Icon, text }, index) => (
            <div className="audience-item" key={text} data-reveal style={{ "--reveal-delay": `${index * 55}ms` } as CSSProperties}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon aria-hidden="true" />
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferSection() {
  return (
    <section id="oferta" className="section offer-section">
      <div className="offer-grid" aria-hidden="true" />
      <div className="page-shell offer-layout">
        <div data-reveal>
          <SectionLabel number="07">Próximo passo</SectionLabel>
          <h2>Estruture sua equipe de vendas com o Método PSV.</h2>
          <p>Processo, Sistema e Vendas trabalhando juntos para transformar sua operação comercial.</p>
        </div>
        <div className="offer-panel" data-reveal>
          <p className="offer-panel-title">Uma operação preparada para avançar</p>
          <div className="offer-principles" aria-label="Fundamentos do Método PSV">
            <span>
              <Workflow aria-hidden="true" />
              Processo claro
            </span>
            <span>
              <BarChart3 aria-hidden="true" />
              Gestão acompanhável
            </span>
            <span>
              <Target aria-hidden="true" />
              Execução orientada
            </span>
          </div>
          <a href="#contato" className="cta-link">
            <span>Quero conhecer o Método PSV</span>
            <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ObjectionsSection() {
  return (
    <section className="section objections-section">
      <div className="page-shell">
        <SectionLabel number="08">Clareza na operação</SectionLabel>
        <h2>
          Estruturar vendas não é adicionar burocracia. <span>É eliminar improviso.</span>
        </h2>
        <div className="objection-rows">
          {objections.map(([title, text], index) => (
            <article key={title} data-reveal style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="objection-close">
          <p>Uma equipe comercial forte não depende apenas de bons vendedores.</p>
          <p>Depende de uma estrutura que permita que boas pessoas executem um bom processo.</p>
          <CtaLink secondary>Quero conhecer o Método PSV</CtaLink>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="section section-light faq-section">
      <div className="page-shell faq-layout">
        <div data-reveal>
          <SectionLabel number="09">Dúvidas</SectionLabel>
          <h2>Perguntas frequentes</h2>
        </div>
        <div className="faq-list" data-reveal>
          {faqs.map((faq, index) => (
            <details key={faq.question}>
              <summary>
                <span className="faq-number">0{index + 1}</span>
                <span>{faq.question}</span>
                <ChevronDown aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contato" className="section final-cta">
      <div className="final-lines" aria-hidden="true" />
      <div className="page-shell final-layout">
        <div data-reveal>
          <p className="eyebrow">Método PSV</p>
          <h2>Sua equipe não precisa depender de improviso para vender.</h2>
        </div>
        <div data-reveal>
          <div className="final-words">
            <span>Processo.</span>
            <span>Sistema.</span>
            <span>Vendas.</span>
          </div>
          <p>Construa uma operação comercial mais organizada, gerenciável e preparada para crescer.</p>
          <CtaLink>Quero estruturar minha operação comercial</CtaLink>
        </div>
        <div className="final-media" data-reveal aria-hidden="true">
          <img src="/silviometodopsv/silvio-speaker.jpg" alt="" width="972" height="1215" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-layout">
        <div>
          <p className="footer-name">Silvio Luiz Eidt Junior</p>
          <p>Método PSV</p>
          <p>Processo, Sistema e Vendas.</p>
        </div>
        <div className="footer-links">
          <a href="https://www.instagram.com/silvio.eidt/" target="_blank" rel="noreferrer">
            <Instagram aria-hidden="true" />
            Instagram
          </a>
          <a href="https://www.linkedin.com/in/silvio-eidt-jr-8741b36b/" target="_blank" rel="noreferrer">
            <Linkedin aria-hidden="true" />
            LinkedIn
          </a>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        <span>PSV</span>
        <span>Processo · Sistema · Vendas</span>
      </div>
    </footer>
  );
}

function PsvLandingPage() {
  return (
    <>
      <style>{css}</style>
      <div className="psv-page">
        <RevealMotion />
        <Hero />
        <main>
          <ProblemSection />
          <MethodSection />
          <TransformationSection />
          <StructureSection />
          <AuthoritySection />
          <AudienceSection />
          <OfferSection />
          <ObjectionsSection />
          <FaqSection />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const Route = createFileRoute("/silviometodopsv")({
  head: () => ({
    meta: [
      { title: "Método PSV | Processo, Sistema e Vendas — Silvio Luiz Eidt Junior" },
      {
        name: "description",
        content:
          "Página do Método PSV, de Silvio Luiz Eidt Junior, para estruturação profissional de equipes e operações comerciais.",
      },
      { property: "og:title", content: "Método PSV | Processo, Sistema e Vendas" },
      {
        property: "og:description",
        content:
          "Processo, Sistema e Vendas para estruturar uma operação comercial com gestão, execução e previsibilidade.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "/silviometodopsv/hero-stage-clean.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PsvLandingPage,
});
