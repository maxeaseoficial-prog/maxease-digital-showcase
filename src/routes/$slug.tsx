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
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = (event?: MediaQueryListEvent) =>
      setIsMobile(event?.matches ?? mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const html = useMemo(() => {
    if (isMobile === null) return "";

    const chosen = isMobile
      ? (page.mobileHtml ?? page.desktopHtml)
      : (page.desktopHtml ?? page.mobileHtml);
    return chosen ?? "";
  }, [isMobile, page]);

  if (isMobile !== null && !html) {
    throw notFound();
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
      {html ? (
        <iframe
          key={isMobile ? "mobile" : "desktop"}
          title={page.name}
          sandbox="allow-scripts allow-same-origin"
          srcDoc={html}
          className="block h-full w-full border-0 bg-white"
          referrerPolicy="no-referrer"
          loading="eager"
          scrolling="yes"
        />
      ) : null}
    </div>
  );
}
