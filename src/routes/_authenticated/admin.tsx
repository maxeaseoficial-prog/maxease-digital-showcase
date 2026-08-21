import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin')({
  component: () => (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-blue/10 selection:text-brand-blue">
      <Outlet />
    </div>
  )
});
