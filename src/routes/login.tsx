import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { validateLogin, type FieldErrors, type LoginForm } from "@/utils/validators";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Ilarooh" },
      { name: "description", content: "Sign in to your Ilarooh account to order, track deliveries and view past orders." },
      { property: "og:title", content: "Sign in to Ilarooh" },
      { property: "og:description", content: "Access your orders, addresses and rewards." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const user = await login(form);
      notify(`Welcome back, ${user.name.split(" ")[0]}`, { variant: "success" });
      await navigate({ to: user.role === "admin" ? "/admin" : "/" });
    } catch (error) {
      notify("Could not sign you in", {
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field id="login-email" label="Email" error={errors.email}>
          <TextInput
            id="login-email"
            type="email"
            autoComplete="email"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field id="login-password" label="Password" error={errors.password}>
          <TextInput
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="••••••••"
          />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-muted-foreground hover:text-accent">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-lift sm:p-10"
      >
        <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-gradient text-accent-foreground">
          <Coffee className="size-5" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer ? <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p> : null}
      </motion.div>
    </div>
  );
}
