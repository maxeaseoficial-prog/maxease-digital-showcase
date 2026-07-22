import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Painel Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminIndex,
});

function AdminIndex() {
  const { session, hydrated } = useAdminAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    navigate({ to: session ? "/admin/dashboard" : "/admin/login" });
  }, [hydrated, session, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/60 text-sm">Carregando...</div>
  );
}
