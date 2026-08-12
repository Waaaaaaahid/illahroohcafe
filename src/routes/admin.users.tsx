import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate, initials } from "@/utils/format";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/AppButton";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/Loading/Loading";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { User, UserRole } from "@/lib/types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Ilarooh Admin" },
      { name: "description", content: "Manage customer and admin accounts for Ilarooh." },
      { property: "og:title", content: "Users — Ilarooh Admin" },
      { property: "og:description", content: "Manage customer and admin accounts for Ilarooh." },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { user: currentUser } = useAuth();

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: adminService.listUsers });

  const roleMutation = useMutation({
    mutationFn: (input: { id: string; role: UserRole }) => adminService.updateUserRole(input.id, input.role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      notify("Role updated", { variant: "success" });
    },
    onError: () => notify("Couldn't update role", { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      notify("User deleted", { variant: "success" });
      setPendingDelete(null);
    },
    onError: () => notify("Couldn't delete user", { variant: "error" }),
  });

  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-accent">People</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Users</h1>
      </div>

      {usersQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : usersQuery.isError ? (
        <ErrorState onRetry={() => void usersQuery.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title="No users yet" description="Registered customers will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                        {initials(user.name)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{user.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Select
                      value={user.role}
                      disabled={roleMutation.isPending || user._id === currentUser?._id}
                      onChange={(event) =>
                        roleMutation.mutate({ id: user._id, role: event.target.value as UserRole })
                      }
                      className="w-32"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={user._id === currentUser?._id}
                      onClick={() => setPendingDelete(user)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete._id)}
        title="Delete user"
        description={pendingDelete ? `Remove "${pendingDelete.name}" permanently?` : ""}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
