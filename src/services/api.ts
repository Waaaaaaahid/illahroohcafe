/**
 * Centralised API client.
 *
 * Base URL comes from VITE_API_URL (see .env.example), never hardcoded in
 * components. Every service in src/services/* goes through this client.
 */
import { STORAGE_KEYS } from "@/constants";
import type { AuthSession } from "@/lib/types";

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:5000/api";

/** While the Express backend is not connected, services fall back to the mock layer. */
export const USE_MOCK_API: boolean =
  (import.meta.env["VITE_USE_MOCK_API"] as string | undefined) !== "false";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
  const token = auth ? getStoredSession()?.token : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
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
