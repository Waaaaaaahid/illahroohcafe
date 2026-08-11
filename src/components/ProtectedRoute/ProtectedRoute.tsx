import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/Loading/Loading";

/**
 * Client-side route guard. The authoritative check lives on the Express API
 * (authMiddleware + adminMiddleware) — this only shapes the UI.
 */
export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isAdmin, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady) return;
    if (!user) void navigate({ to: "/login" });
    else if (adminOnly && !isAdmin) void navigate({ to: "/" });
  }, [isReady, user, isAdmin, adminOnly, navigate]);

  if (!isReady || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="container-page space-y-4 py-24">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  return <>{children}</>;
}
