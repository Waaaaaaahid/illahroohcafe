import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menuService";
import type { CafeSettings } from "@/lib/types";
import { mockCafeSettings } from "@/lib/mock/mockData";

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
      settings: query.data ?? mockCafeSettings,
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
