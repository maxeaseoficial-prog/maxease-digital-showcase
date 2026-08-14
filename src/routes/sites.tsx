import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer, Sites } from "./index";

export const Route = createFileRoute("/sites")({
  head: () => ({
    meta: [
      { title: "Sites Desenvolvidos — MAXEASE Digital" },
      { name: "description", content: "Sites modernos, rápidos e desenvolvidos para converter visitantes em clientes." },
      { property: "og:title", content: "Sites Desenvolvidos — MAXEASE Digital" },
      { property: "og:description", content: "Projetos que performam tão bem quanto parecem." },
    ],
  }),
  component: SitesPage,
});

function SitesPage() {
  return (
    <div className="relative min-h-screen bg-[#08111F] selection:bg-brand-blue/10 selection:text-brand-blue">
      <Navbar />
      <main className="pt-24 pb-20">
        <Sites />
      </main>
      <Footer />
    </div>
  );
}
