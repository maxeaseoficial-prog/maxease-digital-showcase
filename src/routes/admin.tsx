import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminAuthProvider } from "@/lib/admin/auth";
import { AdminStoreProvider } from "@/lib/admin/store";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin — MAXEASE Digital" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminStoreProvider>
        <Outlet />
        <Toaster />
      </AdminStoreProvider>
    </AdminAuthProvider>
  );
}
