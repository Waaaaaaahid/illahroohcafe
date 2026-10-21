import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menuService";
import type { CafeSettings } from "@/lib/types";

/** Neutral fallback while settings load (real values come from the backend). */
const FALLBACK_SETTINGS: CafeSettings = {
  announcementBar: {
    enabled: true,
    defaultDurationSeconds: 4,
    animation: "fade",
    announcements: [
      { id: "brand-message", text: "A LITTLE SOMETHING BETTER, EVERY DAY ✳ SHOP SMART WITH ZRCART", enabled: true, order: 0, durationSeconds: 4, animation: "fade", backgroundColor: "#22231f", textColor: "#ffffff", link: "", startsAt: null, endsAt: null },
      { id: "discover-message", text: "DISCOVER SOMETHING GOOD — SHOP THE LATEST FINDS", enabled: true, order: 1, durationSeconds: 4, animation: "slide", backgroundColor: "#e9ede3", textColor: "#252720", link: "/menu", startsAt: null, endsAt: null },
    ],
  },
  name: "IlaahRooh",
  logo: "",
  description: "Taste that reaches your soul",
  phone: "",
  email: "",
  address: "",
  openingHours: [],
  socialLinks: { instagram: "", facebook: "", twitter: "" },
  deliveryFee: 49,
  taxPercentage: 5,
  currency: "INR",
  whatsappNumber: "",
};

interface CafeContextValue {
  settings: CafeSettings;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const CafeContext = createContext<CafeContextValue | null>(null);

/** Cafe-wide settings from GET /api/cafe/settings, consumed across the UI. */
export function CafeProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["cafe-settings"],
    queryFn: menuService.settings,
    staleTime: 5 * 60 * 1000,
  });

  const value = useMemo<CafeContextValue>(
    () => ({
      settings: query.data
        ? { ...FALLBACK_SETTINGS, ...query.data, announcementBar: query.data.announcementBar ?? FALLBACK_SETTINGS.announcementBar }
        : FALLBACK_SETTINGS,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: () => void query.refetch(),
    }),
    [query],
  );

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) throw new Error("useCafe must be used inside <CafeProvider>");
  return context;
}
