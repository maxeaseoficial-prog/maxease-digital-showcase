import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentAdminUser } from "@/lib/admin-auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin") {
      return {};
    }

    const user = await getCurrentAdminUser();
    if (!user) {
      throw redirect({
        to: "/admin",
        search: {
          redirect: location.pathname,
        },
      });
    }

    return { adminUser: user };
  },
});
