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
    <div className="relative min-h-screen bg-brand-deep text-white">
      <Navbar />
      <main className="pt-24">
        <Sites />
      </main>
      <Footer />
    </div>
  );
}
