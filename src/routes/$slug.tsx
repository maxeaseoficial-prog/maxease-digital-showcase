import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicCustomPageBySlug,
  normalizeSlug,
  RESERVED_CUSTOM_PAGE_SLUGS,
} from "@/lib/custom-pages.functions";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const slug = normalizeSlug(params.slug ?? "");
    if (!slug || RESERVED_CUSTOM_PAGE_SLUGS.has(slug)) {
      throw notFound();
    }

    const page = await getPublicCustomPageBySlug({ data: { slug } });
    if (!page) {
      throw notFound();
    }

    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.name ? `${loaderData.name} — MAXEASE` : "Página privada — MAXEASE" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Página privada protegida por link." },
    ],
  }),
  component: PublicCustomPageRoute,
});

type PublicCustomPageRouteData = {
  name: string;
  desktopHtml?: string | null;
  mobileHtml?: string | null;
};

function PublicCustomPageRoute() {
  const page = Route.useLoaderData() as PublicCustomPageRouteData;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const html = useMemo(() => {
    const chosen = isMobile
      ? (page.mobileHtml ?? page.desktopHtml)
      : (page.desktopHtml ?? page.mobileHtml);
    return chosen ?? "";
  }, [isMobile, page]);

  if (!html) {
    throw notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-full items-center justify-center bg-slate-950 p-0">
        <iframe
          title={page.name}
          sandbox="allow-scripts"
          srcDoc={html}
          className="h-screen w-full border-0 bg-white"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>
    </div>
  );
}
