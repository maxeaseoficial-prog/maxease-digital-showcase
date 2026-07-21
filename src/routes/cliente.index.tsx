import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cliente/")({
  beforeLoad: () => {
    throw redirect({ to: "/cliente/dashboard" });
  },
});
