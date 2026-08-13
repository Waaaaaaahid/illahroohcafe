import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { useCafe } from "@/context/CafeContext";
import { useToast } from "@/context/ToastContext";
import { isEmail } from "@/utils/validators";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Ilarooh — Bandra West, Mumbai" },
      {
        name: "description",
        content:
          "Call, WhatsApp or write to Ilarooh. Find our address, opening hours and reservation details in Bandra West, Mumbai.",
      },
      { property: "og:title", content: "Contact Ilarooh" },
      {
        property: "og:description",
        content: "Address, hours and reservations for Ilarooh, Bandra West.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings } = useCafe();
  const { notify } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Please tell us your name";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address";
    if (form.message.trim().length < 10) nextErrors.message = "A little more detail, please";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notify("Please fix the highlighted fields", { variant: "error" });
      return;
    }
    setSubmitting(true);
    // TODO(backend): POST to a /api/contact endpoint once the Express server is connected.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitting(false);
    setForm({ name: "", email: "", message: "" });
    notify("Message sent", { description: "We reply within one working day.", variant: "success" });
  };

  return (
    <>
      <header className="bg-hero-gradient text-primary-foreground">
        <div className="container-page py-16 sm:py-20">
          <span className="eyebrow text-accent">Say hello</span>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Contact & bookings</h1>
        </div>
      </header>

      <div className="container-page section-padding grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-9">
          <h2 className="font-display text-2xl font-semibold">Send a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reservations, private events, catering or feedback.
          </p>
          <div className="mt-7 space-y-5">
            <Field id="contact-name" label="Your name" error={errors.name}>
              <TextInput
                id="contact-name"
                value={form.name}
                invalid={Boolean(errors.name)}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Aarav Mehta"
              />
            </Field>
            <Field id="contact-email" label="Email" error={errors.email}>
              <TextInput
                id="contact-email"
                type="email"
                value={form.email}
                invalid={Boolean(errors.email)}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
              />
            </Field>
            <Field id="contact-message" label="Message" error={errors.message}>
              <TextArea
                id="contact-message"
                value={form.message}
                invalid={Boolean(errors.message)}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Table for six on Saturday at 8pm…"
              />
            </Field>
            <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
              Send message
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <InfoCard icon={MapPin} title="Visit" lines={[settings.address]} />
          <InfoCard
            icon={Phone}
            title="Call"
            lines={[settings.phone]}
            href={`tel:${settings.phone}`}
          />
          <InfoCard
            icon={MessageCircle}
            title="WhatsApp"
            lines={[settings.whatsappNumber]}
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
          />
          <InfoCard icon={Mail} title="Email" lines={[settings.email]} href={`mailto:${settings.email}`} />
          <InfoCard
            icon={Clock}
            title="Hours"
            lines={settings.openingHours.map((entry) => `${entry.day} · ${entry.hours}`)}
          />
          <div className="overflow-hidden rounded-3xl border border-border bg-secondary/50">
            <iframe
              title="Ilarooh location map"
              src="https://www.google.com/maps?q=28.562712,77.290247&z=16&output=embed"
              className="h-56 w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </div>
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
  href,
}: {
  icon: typeof MapPin;
  title: string;
  lines: string[];
  href?: string;
}) {
  const content = (
    <div className="flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
        <Icon className="size-4.5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        {lines.map((line) => (
          <p key={line} className="mt-1 text-sm">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
}
