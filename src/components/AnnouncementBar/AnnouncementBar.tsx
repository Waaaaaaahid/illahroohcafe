import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCafe } from "@/context/CafeContext";
import type { AnnouncementItem } from "@/lib/types";

function isInSchedule(item: AnnouncementItem, now: number) {
  if (!item.enabled || !item.text.trim()) return false;
  const start = item.startsAt ? new Date(item.startsAt).getTime() : Number.NEGATIVE_INFINITY;
  const end = item.endsAt ? new Date(item.endsAt).getTime() : Number.POSITIVE_INFINITY;
  return (!Number.isFinite(start) || now >= start) && (!Number.isFinite(end) || now <= end);
}

function safeLink(value: string) {
  const link = value.trim();
  if (!link) return "";
  if (link.startsWith("/") || link.startsWith("#")) return link;
  try {
    const parsed = new URL(link);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? link : "";
  } catch {
    return "";
  }
}

export function AnnouncementBar() {
  const { settings } = useCafe();
  const reducedMotion = useReducedMotion();
  const config = settings.announcementBar;
  const [now, setNow] = useState(() => Date.now());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo(
    () => (config?.announcements ?? []).filter((item) => isInSchedule(item, now)).sort((a, b) => a.order - b.order),
    [config?.announcements, now],
  );

  useEffect(() => setIndex(0), [items.length]);

  const current = items.length ? items[index % items.length] : undefined;
  useEffect(() => {
    if (!current || items.length < 2) return;
    const duration = Math.min(30, Math.max(2, Number(current.durationSeconds) || config?.defaultDurationSeconds || 4));
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % items.length), duration * 1000);
    return () => window.clearTimeout(timer);
  }, [current, items.length, config?.defaultDurationSeconds]);

  if (!config?.enabled || !current) return null;

  const animation = reducedMotion ? "static" : current.animation || config.animation || "fade";
  const variants = animation === "slide"
    ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  const link = safeLink(current.link || "");

  const message = (
    <motion.span
      key={current.id}
      initial={animation === "static" ? false : variants.initial}
      animate={variants.animate}
      exit={animation === "static" ? undefined : variants.exit}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: "easeOut" }}
      className="block max-w-full truncate px-3 text-center text-[9px] font-semibold uppercase tracking-[.12em] sm:text-[10px] sm:tracking-[.16em]"
    >
      {current.text}
    </motion.span>
  );

  return (
    <div
      role="region"
      aria-label="Store announcements"
      className="relative flex min-h-9 items-center justify-center overflow-hidden px-2 py-2"
      style={{ backgroundColor: current.backgroundColor || "#22231f", color: current.textColor || "#ffffff" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {link.startsWith("/") || link.startsWith("#") ? (
          <Link key={current.id} to={link as "/"} className="block max-w-full">
            {message}
          </Link>
        ) : link ? (
          <a key={current.id} href={link} target="_blank" rel="noreferrer" className="block max-w-full">
            {message}
          </a>
        ) : message}
      </AnimatePresence>
      {items.length > 1 ? (
        <span className="absolute right-2 hidden text-[9px] opacity-60 sm:block" aria-hidden="true">
          {index % items.length + 1}/{items.length}
        </span>
      ) : null}
    </div>
  );
}
