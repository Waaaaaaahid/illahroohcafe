import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast, type ToastVariant } from "@/context/ToastContext";

const iconFor: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const accentFor: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:bottom-auto sm:top-24 sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = iconFor[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              role="status"
              aria-live="polite"
              className="glass-panel pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-lift"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${accentFor[toast.variant]}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
