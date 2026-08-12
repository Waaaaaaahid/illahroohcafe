import { STORAGE_KEYS } from "@/constants";
import type { AuthSession } from "@/lib/types";

const configuredApiUrl = (import.meta.env["VITE_API_URL"] as string | undefined)?.trim();

function getDefaultApiUrl() {
  // Explicit env always wins. Use this for Vercel/production deployments.
  if (configuredApiUrl) return configuredApiUrl.replace(/\/$/, "");

  // Local Vite development.
  if (import.meta.env.DEV) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      // GitHub Codespaces forwards each port through a hostname such as
      // <codespace>-5173.app.github.dev. Automatically target port 5000.
      if (host.endsWith(".app.github.dev")) {
        return `${window.location.protocol}//${host.replace(/-5173(?=\.app\.github\.dev$)/, "-5000")}/api`;
      }
    }
    return "http://localhost:5000/api";
  }

  return "";
}

export const API_BASE_URL = getDefaultApiUrl();

export const USE_MOCK_API =
  (import.meta.env["VITE_USE_MOCK_API"] as string | undefined) === "true";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.session);
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEYS.session);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  if (!USE_MOCK_API && !API_BASE_URL) {
    throw new ApiError("VITE_API_URL is not configured for this deployment", 500);
  }

  const token = auth ? getStoredSession()?.token : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body === undefined ? null : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (auth && response.status === 401) clearStoredSession();
    const message =
      (payload as { message?: string } | null)?.message ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return ((payload as { data?: T } | null)?.data ?? (payload as T)) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
