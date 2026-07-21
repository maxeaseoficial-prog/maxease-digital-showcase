import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalAuthProvider } from "@/lib/portal/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/cliente")({
  head: () => ({ meta: [{ title: "Portal do Cliente — MAXEASE Digital" }, { name: "robots", content: "noindex" }] }),
  component: ClienteLayout,
});

function ClienteLayout() {
  return (
    <PortalAuthProvider>
      <PortalShell>
        <Outlet />
      </PortalShell>
    </PortalAuthProvider>
  );
}
