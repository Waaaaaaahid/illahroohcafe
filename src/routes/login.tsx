import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LayoutGroup, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { validateLogin, type FieldErrors, type LoginForm } from "@/utils/validators";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lumora Curio" },
      { name: "description", content: "Sign in to order, track deliveries and view past orders." },
      { property: "og:title", content: "Sign in — Lumora Curio" },
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
          <Link to="/register" className="font-semibold text-[#52634c] underline-offset-4 hover:underline">
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
            className="h-12 rounded-xl border-[#d9dfd5] bg-white px-4 focus:border-[#71816a] focus:ring-[#71816a]/20"
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
            className="h-12 rounded-xl border-[#d9dfd5] bg-white px-4 focus:border-[#71816a] focus:ring-[#71816a]/20"
          />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-[#697365] transition hover:text-[#344a35]">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading} className="h-12 w-full rounded-xl bg-[#344a35] text-sm text-white shadow-[0_8px_20px_rgba(52,74,53,.16)] hover:bg-[#263a2a]">
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
  variant = "login",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "login" | "register";
}) {
  return (
    <div className="bg-[#f7f7f2] px-4 py-8 sm:px-6 sm:py-12">
      <LayoutGroup id="lumora-auth-panels">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#e5e7df] bg-white shadow-[0_24px_80px_rgba(36,48,35,.12)] md:min-h-[590px] md:grid-cols-[.95fr_1.05fr]"
      >
        <motion.aside layoutId="lumora-auth-photo" transition={{ layout: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }} className={`relative isolate flex min-h-[210px] flex-col justify-between overflow-hidden bg-[#29392d] p-6 text-white sm:min-h-[250px] sm:p-9 md:min-h-full md:p-11 ${variant === "register" ? "md:order-2" : "md:order-1"}`}>
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1d2b20]/85 via-[#29392d]/65 to-[#29392d]/80" />
          <div>
            <Link to="/" className="inline-flex flex-col leading-none" aria-label="Lumora Curio home">
              <span className="font-serif text-[1.7rem] font-semibold tracking-[-.055em] sm:text-3xl">Lumora</span>
              <span className="mt-1 flex items-center gap-2 font-serif text-lg tracking-[-.035em] text-white/90 sm:text-xl">
                <span className="h-px w-5 bg-[#c4cbb8]/70" />Curio<span className="h-px w-5 bg-[#c4cbb8]/70" />
              </span>
            </Link>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[.24em] text-white/65 sm:text-[10px]">
              Everyday, elevated
            </p>
          </div>
          <div className="mt-8 max-w-sm md:mb-5">
            <div className="mb-4 hidden size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm md:flex">
              <Sparkles className="size-4 text-[#d9dfca]" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/70 sm:text-[10px]">
              A little more lovely, every day
            </p>
            <p className="mt-2 font-serif text-2xl leading-tight tracking-[-.025em] sm:text-3xl md:text-[2.4rem]">
              Thoughtful finds for the way you live.
            </p>
            <div className="mt-5 hidden items-center gap-2 text-xs text-white/75 md:flex">
              <Leaf className="size-4 text-[#d9dfca]" />
              <span>Discover something good, whenever you visit.</span>
              <ArrowUpRight className="ml-auto size-4" />
            </div>
          </div>
        </motion.aside>
        <motion.div layoutId="lumora-auth-form" transition={{ layout: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }} className={`flex items-center px-6 py-8 sm:px-10 sm:py-10 md:px-12 lg:px-16 ${variant === "register" ? "md:order-1" : "md:order-2"}`}>
          <div className="mx-auto w-full max-w-sm">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7b866f]">
              Welcome to Lumora Curio
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[-.04em] text-[#242820] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#74786f]">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer ? <p className="mt-6 text-center text-sm text-[#74786f]">{footer}</p> : null}
            <p className="mt-8 border-t border-[#eceee8] pt-4 text-center text-[10px] text-[#96998f]">
              A considered collection for everyday living
            </p>
          </div>
        </motion.div>
      </motion.div>
      </LayoutGroup>
    </div>
  );
}
