import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import { getStoredSession, setStoredSession, AUTH_UNAUTHORIZED_EVENT } from "@/services/api";
import type { AuthSession, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isReady: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (input: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
    setIsReady(true);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const persist = useCallback((next: AuthSession | null) => {
    setSession(next);
    setStoredSession(next);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async (input) => {
      const next = await authService.login(input);
      persist(next);
      return next.user;
    },
    [persist],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async (input) => {
      const next = await authService.register(input);
      persist(next);
      return next.user;
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (input) => {
      if (!session) throw new Error("Not authenticated");
      const updated = await authService.updateProfile(session.user._id, input);
      persist({ ...session, user: updated });
      return updated;
    },
    [persist, session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAdmin: session?.user.role === "admin",
      isReady,
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, isReady, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
