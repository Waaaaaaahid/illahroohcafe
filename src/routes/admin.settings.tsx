import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { useCafe } from "@/context/CafeContext";
import { useToast } from "@/context/ToastContext";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Cafe settings — Ilarooh Admin" },
      { name: "description", content: "Update cafe details, delivery fee, tax, currency and social links." },
      { property: "og:title", content: "Cafe settings — Ilarooh Admin" },
      { property: "og:description", content: "Manage the cafe profile used across the storefront." },
    ],
  }),
  component: CafeSettingsPage,
});

function CafeSettingsPage() {
  const { settings, isLoading } = useCafe();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);

  // The first render uses the neutral CafeContext fallback while the API loads.
  // Hydrate the form once the real saved settings arrive, but never overwrite
  // values the admin has already started editing.
  useEffect(() => {
    if (!isLoading && !dirtyRef.current) {
      setForm(settings);
    }
  }, [isLoading, settings]);

  const updateForm = (next: typeof form) => {
    dirtyRef.current = true;
    setForm(next);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(form);
      dirtyRef.current = false;
      await queryClient.invalidateQueries({ queryKey: ["cafe-settings"] });
      notify("Cafe settings updated", { variant: "success" });
    } catch {
      notify("Could not save settings", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Cafe settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These values drive the storefront, checkout totals and footer.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <div className="mt-5 space-y-4">
            <Field id="s-name" label="Cafe name">
              <TextInput id="s-name" value={form.name} onChange={(e) => updateForm({ ...form, name: e.target.value })} />
            </Field>
            <Field id="s-logo" label="Logo URL" hint="Cloudinary URL once uploads are connected">
              <TextInput id="s-logo" value={form.logo} onChange={(e) => updateForm({ ...form, logo: e.target.value })} />
            </Field>
            <Field id="s-desc" label="Description">
              <TextArea id="s-desc" value={form.description} onChange={(e) => updateForm({ ...form, description: e.target.value })} />
            </Field>
            <Field id="s-address" label="Address">
              <TextInput id="s-address" value={form.address} onChange={(e) => updateForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <div className="mt-5 space-y-4">
            <Field id="s-phone" label="Phone">
              <TextInput id="s-phone" value={form.phone} onChange={(e) => updateForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field id="s-email" label="Email">
              <TextInput id="s-email" type="email" value={form.email} onChange={(e) => updateForm({ ...form, email: e.target.value })} />
            </Field>
            <Field id="s-wa" label="WhatsApp number">
              <TextInput id="s-wa" value={form.whatsappNumber} onChange={(e) => updateForm({ ...form, whatsappNumber: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="s-ig" label="Instagram">
                <TextInput id="s-ig" value={form.socialLinks.instagram} onChange={(e) => updateForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })} />
              </Field>
              <Field id="s-fb" label="Facebook">
                <TextInput id="s-fb" value={form.socialLinks.facebook} onChange={(e) => updateForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })} />
              </Field>
              <Field id="s-tw" label="Twitter">
                <TextInput id="s-tw" value={form.socialLinks.twitter} onChange={(e) => updateForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })} />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Commerce</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field id="s-fee" label="Delivery fee">
              <TextInput id="s-fee" type="number" value={form.deliveryFee} onChange={(e) => updateForm({ ...form, deliveryFee: Number(e.target.value) })} />
            </Field>
            <Field id="s-tax" label="Tax %">
              <TextInput id="s-tax" type="number" value={form.taxPercentage} onChange={(e) => updateForm({ ...form, taxPercentage: Number(e.target.value) })} />
            </Field>
            <Field id="s-cur" label="Currency">
              <TextInput id="s-cur" value={form.currency} onChange={(e) => updateForm({ ...form, currency: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Opening hours</h2>
          <div className="mt-5 space-y-3">
            {form.openingHours.map((entry, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  aria-label="Days"
                  value={entry.day}
                  onChange={(e) => {
                    const next = [...form.openingHours];
                    next[index] = { ...entry, day: e.target.value };
                    updateForm({ ...form, openingHours: next });
                  }}
                />
                <TextInput
                  aria-label="Hours"
                  value={entry.hours}
                  onChange={(e) => {
                    const next = [...form.openingHours];
                    next[index] = { ...entry, hours: e.target.value };
                    updateForm({ ...form, openingHours: next });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateForm({ ...form, openingHours: [...form.openingHours, { day: "", hours: "" }] })}
            >
              Add row
            </Button>
          </div>
        </section>

        <div className="lg:col-span-2">
          <Button type="submit" size="lg" loading={saving}>
            Save settings
          </Button>
        </div>
      </form>
    </div>
  );
}
