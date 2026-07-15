import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer, Audiovisual } from "./index";

export const Route = createFileRoute("/audiovisual")({
  head: () => ({
    meta: [
      { title: "Produção Audiovisual — MAXEASE Digital" },
      { name: "description", content: "Vídeos institucionais, comerciais, Reels e campanhas com direção criativa e edição cinematográfica." },
      { property: "og:title", content: "Produção Audiovisual — MAXEASE Digital" },
      { property: "og:description", content: "Histórias visuais que emocionam e convertem." },
    ],
  }),
  component: AudiovisualPage,
});

function AudiovisualPage() {
  return (
    <div className="relative min-h-screen bg-brand-deep text-white">
      <Navbar />
      <main className="pt-24">
        <Audiovisual />
      </main>
      <Footer />
    </div>
  );
}
