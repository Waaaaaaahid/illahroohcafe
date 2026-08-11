import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextInput } from "@/components/ui/Field";
import { AuthLayout } from "@/routes/login";
import { authService } from "@/services/authService";
import { useToast } from "@/context/ToastContext";
import { isStrongEnough } from "@/utils/validators";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    ...(typeof search["token"] === "string" ? { token: search["token"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — Maison Noir" },
      { name: "description", content: "Choose a new password for your Maison Noir account using your reset token." },
      { property: "og:title", content: "Set a new Maison Noir password" },
      { property: "og:description", content: "Complete your password reset securely." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: token ?? "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string | undefined> = {};
    if (!form.token.trim()) nextErrors["token"] = "Paste the token from your email";
    if (!isStrongEnough(form.password)) nextErrors["password"] = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) nextErrors["confirmPassword"] = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await authService.resetPassword({ token: form.token, password: form.password });
      notify("Password updated", { description: "You can sign in now.", variant: "success" });
      await navigate({ to: "/login" });
    } catch {
      notify("Reset failed", { description: "The token may have expired.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something you haven't used before.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Field id="reset-token" label="Reset token" error={errors["token"]}>
          <TextInput
            id="reset-token"
            value={form.token}
            invalid={Boolean(errors["token"])}
            onChange={(event) => setForm({ ...form, token: event.target.value })}
            placeholder="Paste from your email"
          />
        </Field>
        <Field id="reset-password" label="New password" error={errors["password"]}>
          <TextInput
            id="reset-password"
            type="password"
            value={form.password}
            invalid={Boolean(errors["password"])}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </Field>
        <Field id="reset-confirm" label="Confirm new password" error={errors["confirmPassword"]}>
          <TextInput
            id="reset-confirm"
            type="password"
            value={form.confirmPassword}
            invalid={Boolean(errors["confirmPassword"])}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
