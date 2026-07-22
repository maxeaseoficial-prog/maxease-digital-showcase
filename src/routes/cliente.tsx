import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalAuthProvider } from "@/lib/portal/auth";
import { PortalDataProvider } from "@/lib/portal/data";
import { PortalShell } from "@/components/portal/PortalShell";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/cliente")({
  head: () => ({ meta: [{ title: "Portal do Cliente — MAXEASE Digital" }, { name: "robots", content: "noindex" }] }),
  component: ClienteLayout,
});

function ClienteLayout() {
  return (
    <PortalAuthProvider>
      <PortalDataProvider>
        <PortalShell>
          <Outlet />
        </PortalShell>
        <Toaster />
      </PortalDataProvider>
    </PortalAuthProvider>
  );
}
