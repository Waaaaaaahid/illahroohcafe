import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Maison Noir" },
      { name: "description", content: "Manage menu, orders, users and settings for Maison Noir." },
      { property: "og:title", content: "Admin Console — Maison Noir" },
      { property: "og:description", content: "Manage menu, orders, users and settings for Maison Noir." },
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
