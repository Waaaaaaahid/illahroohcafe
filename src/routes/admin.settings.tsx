import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Megaphone, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { useCafe } from "@/context/CafeContext";
import { useToast } from "@/context/ToastContext";
import { adminService } from "@/services/adminService";
import type { AnnouncementAnimation, AnnouncementItem } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Store settings — Zrcart Admin" },
      { name: "description", content: "Update store details, delivery fee, tax, currency and social links." },
      { property: "og:title", content: "Store settings — Zrcart Admin" },
      { property: "og:description", content: "Manage the store profile used across the storefront." },
    ],
  }),
  component: StoreSettingsPage,
});

function StoreSettingsPage() {
  const { settings, isLoading } = useCafe();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);

  // The first render uses the neutral store-settings fallback while the API loads.
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

  const updateAnnouncementBar = (patch: Partial<typeof form.announcementBar>) => {
    updateForm({ ...form, announcementBar: { ...form.announcementBar, ...patch } });
  };

  const updateAnnouncement = (id: string, patch: Partial<AnnouncementItem>) => {
    updateAnnouncementBar({
      announcements: form.announcementBar.announcements.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  };

  const addAnnouncement = () => {
    const count = form.announcementBar.announcements.length;
    const item: AnnouncementItem = {
      id: `announcement-${Date.now()}`,
      text: "NEW ANNOUNCEMENT — EDIT THIS MESSAGE",
      enabled: true,
      order: count,
      durationSeconds: form.announcementBar.defaultDurationSeconds || 4,
      animation: form.announcementBar.animation || "fade",
      backgroundColor: "#22231f",
      textColor: "#ffffff",
      link: "",
      startsAt: null,
      endsAt: null,
    };
    updateAnnouncementBar({ announcements: [...form.announcementBar.announcements, item] });
  };

  const removeAnnouncement = (id: string) => {
    updateAnnouncementBar({
      announcements: form.announcementBar.announcements
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, order: index })),
    });
  };

  const toLocalDateTime = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  };

  const fromLocalDateTime = (value: string) => value ? new Date(value).toISOString() : null;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(form);
      dirtyRef.current = false;
      await queryClient.invalidateQueries({ queryKey: ["cafe-settings"] });
      notify("Store settings updated", { variant: "success" });
    } catch {
      notify("Could not save settings", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Store settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These values drive the storefront, checkout totals and footer.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <div className="mt-5 space-y-4">
            <Field id="s-name" label="Store name">
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

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#e9ede3] text-[#4c5845]"><Megaphone className="size-5" /></span>
              <div>
                <h2 className="font-display text-lg font-semibold">Announcement bar</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Control the rotating message strip above your store navigation. Changes are saved to the database and appear on the storefront without a code push.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold">
              <input type="checkbox" checked={form.announcementBar.enabled} onChange={(e) => updateAnnouncementBar({ enabled: e.target.checked })} className="size-4 accent-[#4c5845]" />
              Bar enabled
            </label>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field id="announcement-default-duration" label="Default duration (seconds)" hint="Used when a message duration is not set.">
              <TextInput id="announcement-default-duration" type="number" min={2} max={30} value={form.announcementBar.defaultDurationSeconds} onChange={(e) => updateAnnouncementBar({ defaultDurationSeconds: Math.min(30, Math.max(2, Number(e.target.value) || 4)) })} />
            </Field>
            <Field id="announcement-animation" label="Default animation">
              <select id="announcement-animation" value={form.announcementBar.animation} onChange={(e) => updateAnnouncementBar({ animation: e.target.value as AnnouncementAnimation })} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="fade">Fade</option><option value="slide">Slide</option><option value="static">No animation</option>
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="button" onClick={addAnnouncement} className="w-full rounded-xl bg-[#252720] text-white hover:bg-[#4c5845]"><Plus className="mr-2 size-4" /> Add announcement</Button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {form.announcementBar.announcements
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">{index + 1}</span>
                      <div><p className="text-sm font-semibold">Announcement {index + 1}</p><p className="text-xs text-muted-foreground">Order: {item.order}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={item.enabled} onChange={(e) => updateAnnouncement(item.id, { enabled: e.target.checked })} className="size-4 accent-[#4c5845]" /> Enabled</label>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeAnnouncement(item.id)} aria-label={`Delete announcement ${index + 1}`} className="rounded-xl text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Field id={`announcement-text-${item.id}`} label="Message text" hint="Keep it short for mobile. Maximum 180 characters.">
                      <TextInput id={`announcement-text-${item.id}`} maxLength={180} value={item.text} onChange={(e) => updateAnnouncement(item.id, { text: e.target.value })} />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field id={`announcement-order-${item.id}`} label="Display order">
                      <TextInput id={`announcement-order-${item.id}`} type="number" min={0} value={item.order} onChange={(e) => updateAnnouncement(item.id, { order: Math.max(0, Number(e.target.value) || 0) })} />
                    </Field>
                    <Field id={`announcement-duration-${item.id}`} label="Duration (seconds)">
                      <TextInput id={`announcement-duration-${item.id}`} type="number" min={2} max={30} value={item.durationSeconds} onChange={(e) => updateAnnouncement(item.id, { durationSeconds: Math.min(30, Math.max(2, Number(e.target.value) || 4)) })} />
                    </Field>
                    <Field id={`announcement-animation-item-${item.id}`} label="Animation">
                      <select id={`announcement-animation-item-${item.id}`} value={item.animation} onChange={(e) => updateAnnouncement(item.id, { animation: e.target.value as AnnouncementAnimation })} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                        <option value="fade">Fade</option><option value="slide">Slide</option><option value="static">No animation</option>
                      </select>
                    </Field>
                    <Field id={`announcement-link-${item.id}`} label="Click-through link" hint="Optional: /menu or https://...">
                      <TextInput id={`announcement-link-${item.id}`} value={item.link || ""} placeholder="/menu" onChange={(e) => updateAnnouncement(item.id, { link: e.target.value })} />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field id={`announcement-background-${item.id}`} label="Background colour">
                      <div className="flex h-11 items-center gap-3 rounded-xl border border-input px-3"><input id={`announcement-background-${item.id}`} type="color" value={/^#[0-9a-fA-F]{6}$/.test(item.backgroundColor || "") ? item.backgroundColor : "#22231f"} onChange={(e) => updateAnnouncement(item.id, { backgroundColor: e.target.value })} className="size-7 cursor-pointer rounded border-0 bg-transparent" /><span className="text-xs uppercase text-muted-foreground">{item.backgroundColor}</span></div>
                    </Field>
                    <Field id={`announcement-text-color-${item.id}`} label="Text colour">
                      <div className="flex h-11 items-center gap-3 rounded-xl border border-input px-3"><input id={`announcement-text-color-${item.id}`} type="color" value={/^#[0-9a-fA-F]{6}$/.test(item.textColor || "") ? item.textColor : "#ffffff"} onChange={(e) => updateAnnouncement(item.id, { textColor: e.target.value })} className="size-7 cursor-pointer rounded border-0 bg-transparent" /><span className="text-xs uppercase text-muted-foreground">{item.textColor}</span></div>
                    </Field>
                    <Field id={`announcement-start-${item.id}`} label="Start time (optional)">
                      <TextInput id={`announcement-start-${item.id}`} type="datetime-local" value={toLocalDateTime(item.startsAt)} onChange={(e) => updateAnnouncement(item.id, { startsAt: fromLocalDateTime(e.target.value) })} />
                    </Field>
                    <Field id={`announcement-end-${item.id}`} label="End time (optional)">
                      <TextInput id={`announcement-end-${item.id}`} type="datetime-local" value={toLocalDateTime(item.endsAt)} onChange={(e) => updateAnnouncement(item.id, { endsAt: fromLocalDateTime(e.target.value) })} />
                    </Field>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-border">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground"><Eye className="mr-1 inline size-3.5" /> Live preview</div>
                    <div className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[.12em] sm:text-xs" style={{ backgroundColor: item.backgroundColor, color: item.textColor }}>{item.text || "Your announcement will appear here"}</div>
                  </div>
                </article>
              ))}
            {!form.announcementBar.announcements.length ? <div className="rounded-2xl border border-dashed border-border p-8 text-center"><p className="text-sm text-muted-foreground">No announcements yet.</p><Button type="button" variant="outline" size="sm" onClick={addAnnouncement} className="mt-3 rounded-xl"><Plus className="mr-2 size-4" /> Create first announcement</Button></div> : null}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">Scheduling uses the store server/browser local time. Leave start or end blank for no time limit. The message is only shown while enabled and inside its schedule. A banner message does not change actual product prices or apply a discount automatically.</p>
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
