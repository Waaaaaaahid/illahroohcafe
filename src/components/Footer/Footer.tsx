import { Link } from "@tanstack/react-router";
import { Coffee, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { useCafe } from "@/context/CafeContext";

export function Footer() {
  const { settings } = useCafe();

  return (
    <footer className="mt-24 bg-hero-gradient text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-gradient text-accent-foreground">
              <Coffee className="size-4.5" />
            </span>
            <span className="font-display text-2xl font-semibold">{settings.name}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            {settings.description}
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { href: settings.socialLinks.instagram, Icon: Instagram, label: "Instagram" },
              { href: settings.socialLinks.facebook, Icon: Facebook, label: "Facebook" },
              { href: settings.socialLinks.twitter, Icon: Twitter, label: "Twitter" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="glass-dark flex size-10 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow text-accent">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/70">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-primary-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/order-tracking" className="transition-colors hover:text-primary-foreground">
                Track order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-accent">Visit</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {settings.address}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={`tel:${settings.phone}`}>{settings.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </li>
          </ul>
          <ul className="mt-5 space-y-1 text-xs text-primary-foreground/55">
            {settings.openingHours.map((entry) => (
              <li key={entry.day}>
                {entry.day}: {entry.hours}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <p>Crafted in Mumbai · Brewed daily since 2016</p>
        </div>
      </div>
    </footer>
  );
}
