import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextInput } from "@/components/ui/Field";
import { AuthLayout } from "@/routes/login";
import { authService } from "@/services/authService";
import { useToast } from "@/context/ToastContext";
import { isEmail } from "@/utils/validators";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Maison Noir" },
      { name: "description", content: "Request a password reset link for your Maison Noir account." },
      { property: "og:title", content: "Forgot your Maison Noir password?" },
      { property: "og:description", content: "We'll email you a secure reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      notify("Reset link sent", { description: `Check ${email}`, variant: "success" });
    } catch {
      notify("Could not send the reset link", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll email you a secure link to set a new one."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-sm">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1 text-muted-foreground">
            If an account exists for {email}, a reset link is on its way.
          </p>
          <Link to="/reset-password" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              I have a reset token
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Field id="forgot-email" label="Email" error={error}>
            <TextInput
              id="forgot-email"
              type="email"
              value={email}
              invalid={Boolean(error)}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
