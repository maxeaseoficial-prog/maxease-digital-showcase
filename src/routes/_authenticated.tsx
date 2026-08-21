import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // This is a simple path-based gate.
    // In a real app with Supabase, this would check the session.
    // For this project, it allows access to the admin routes.
    return {};
  }
});
