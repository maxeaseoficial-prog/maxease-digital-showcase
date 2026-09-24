import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, MapPin, MessageCircle, Search, Star } from "lucide-react";
import { Navbar, Footer } from "./index";
import { useQuoteModal } from "@/components/QuoteModal";

const pageUrl = "https://www.maxease.com.br/google-meu-negocio";

export const Route = createFileRoute("/google-meu-negocio")({
  head: () => ({
    meta: [
      { title: "Google Meu Negócio para empresas | MAXEASE Digital" },
      {
        name: "description",
        content:
          "Otimização do Perfil da Empresa no Google para aumentar sua visibilidade local, gerar contatos e conquistar mais avaliações.",
      },
      { property: "og:title", content: "Google Meu Negócio para empresas | MAXEASE Digital" },
      {
        property: "og:description",
        content:
          "Faça sua empresa aparecer melhor no Google e no Maps para clientes da sua região.",
      },
      { property: "og:url", content: pageUrl },
    ],
    links: [{ rel: "canonical", href: pageUrl }],
  }),
  component: GoogleBusinessPage,
});

const benefits = [
  {
    icon: Search,
    title: "Mais visibilidade local",
    description:
      "Estruturamos o perfil para aumentar suas chances de aparecer nas buscas e no Google Maps.",
  },
  {
    icon: Star,
    title: "Mais confiança",
    description:
      "Organizamos informações, imagens e avaliações para transmitir credibilidade desde o primeiro contato.",
  },
  {
    icon: MessageCircle,
    title: "Mais oportunidades",
    description:
      "Facilitamos ligações, mensagens, rotas e visitas ao site para transformar pesquisas em contatos reais.",
  },
  {
    icon: BarChart3,
    title: "Decisões com dados",
    description:
      "Acompanhamos os principais indicadores para entender como as pessoas encontram e acionam sua empresa.",
  },
];

const deliverables = [
  "Revisão e otimização completa do perfil",
  "Categorias, serviços e descrição estratégica",
  "Padronização de telefone, site e horário",
  "Orientação para fotos, publicações e avaliações",
  "Análise de concorrentes e oportunidades locais",
  "Acompanhamento dos resultados do perfil",
];

const faqs = [
  {
    question: "O que é Google Meu Negócio?",
    answer:
      "É o antigo nome do Perfil da Empresa no Google, a ficha que pode aparecer na Pesquisa e no Google Maps com telefone, endereço, horário, avaliações e outros dados do negócio.",
  },
  {
    question: "Esse serviço garante a primeira posição?",
    answer:
      "Nenhuma empresa pode garantir uma posição específica. A otimização melhora a qualidade e a relevância do perfil, mas o Google também considera proximidade, concorrência e outros sinais.",
  },
  {
    question: "A MAXEASE também cria o site da empresa?",
    answer:
      "Sim. Podemos unir um site profissional ao perfil do Google para construir uma presença digital mais completa e aumentar as oportunidades de contato.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Otimização do Perfil da Empresa no Google",
  serviceType: "Gestão e otimização do Google Meu Negócio",
  provider: {
    "@type": "ProfessionalService",
    name: "MAXEASE Digital",
    url: "https://www.maxease.com.br/",
    telephone: "+55 42 98837-7640",
    email: "maxeaseoficial@gmail.com",
  },
  areaServed: { "@type": "Country", name: "Brasil" },
  url: pageUrl,
};

function GoogleBusinessPage() {
  const { open: openQuote } = useQuoteModal();

  return (
    <div className="min-h-screen bg-[#071426] text-white selection:bg-brand-blue/20">
      <Navbar />
      <main>
        <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:px-6 sm:pb-32 sm:pt-48">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(21,94,239,0.28),transparent_42%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 py-2 text-sm text-blue-200">
                <MapPin className="h-4 w-4" /> Presença local no Google
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Sua empresa mais visível no{" "}
                <span className="text-brand-blue">Google e no Maps</span>.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Otimizamos o Perfil da Empresa no Google para ajudar negócios a serem encontrados,
                transmitir confiança e gerar mais contatos de clientes da região.
              </p>
              <button
                type="button"
                onClick={openQuote}
                className="mt-10 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-bright"
              >
                Quero melhorar meu perfil
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur sm:p-9">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-light">
                O que fazemos
              </p>
              <ul className="mt-7 space-y-4">
                {deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-24 text-slate-900 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
                Resultados para empresas
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Transforme pesquisas locais em novos contatos.
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {benefits.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-slate-200 p-7 shadow-sm">
                  <Icon className="h-8 w-8 text-brand-blue" />
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-brand-light">
              Dúvidas frequentes
            </p>
            <h2 className="mt-4 text-center text-4xl font-bold">
              Google Meu Negócio para empresas
            </h2>
            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-6"
                >
                  <h3 className="text-lg font-bold">{faq.question}</h3>
                  <p className="mt-3 leading-relaxed text-slate-300">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-blue px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-5xl">
            Pronto para fortalecer sua presença no Google?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
            Fale com a MAXEASE e receba uma análise do perfil da sua empresa.
          </p>
          <button
            type="button"
            onClick={openQuote}
            className="mt-8 rounded-lg bg-white px-7 py-4 text-sm font-bold text-brand-deep transition hover:scale-[1.02]"
          >
            Solicitar análise
          </button>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </div>
  );
}
