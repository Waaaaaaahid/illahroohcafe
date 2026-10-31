import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Lumora Curio" },
      { name: "description", content: "Manage menu, orders, users and settings for Lumora Curio." },
      { property: "og:title", content: "Admin Console — Lumora Curio" },
      { property: "og:description", content: "Manage menu, orders, users and settings for Lumora Curio." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <ProtectedRoute adminOnly>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </ProtectedRoute>
  );
}
