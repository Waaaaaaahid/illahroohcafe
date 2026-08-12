import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextInput } from "@/components/ui/Field";
import { AuthLayout } from "@/routes/login";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { validateRegister, type FieldErrors, type RegisterForm } from "@/utils/validators";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Ilarooh" },
      { name: "description", content: "Create a Ilarooh account for faster checkout, saved addresses and order tracking." },
      { property: "og:title", content: "Join Ilarooh" },
      { property: "og:description", content: "Faster checkout, saved addresses and live order tracking." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      notify("Account created", { description: "Welcome to Ilarooh.", variant: "success" });
      await navigate({ to: "/" });
    } catch (error) {
      notify("Could not create your account", {
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One minute now, thirty seconds at every checkout after."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field id="register-name" label="Full name" error={errors.name}>
          <TextInput
            id="register-name"
            value={form.name}
            invalid={Boolean(errors.name)}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Aarav Mehta"
          />
        </Field>
        <Field id="register-email" label="Email" error={errors.email}>
          <TextInput
            id="register-email"
            type="email"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field id="register-phone" label="Phone" error={errors.phone}>
          <TextInput
            id="register-phone"
            type="tel"
            value={form.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="+91 98200 00000"
          />
        </Field>
        <Field id="register-password" label="Password" error={errors.password}>
          <TextInput
            id="register-password"
            type="password"
            value={form.password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Minimum 6 characters"
          />
        </Field>
        <Field id="register-confirm" label="Confirm password" error={errors.confirmPassword}>
          <TextInput
            id="register-confirm"
            type="password"
            value={form.confirmPassword}
            invalid={Boolean(errors.confirmPassword)}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            placeholder="Repeat your password"
          />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
