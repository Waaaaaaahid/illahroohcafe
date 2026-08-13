import { api } from "@/services/api";
import type { AuthSession, User } from "@/lib/types";

/** POST /api/auth/register, /login, GET /api/auth/me, forgot/reset password. */
export const authService = {
  register: (input: { name: string; email: string; phone: string; password: string }) =>
    api.post<AuthSession>("/auth/register", input, { auth: false }),

  login: (input: { email: string; password: string }) =>
    api.post<AuthSession>("/auth/login", input, { auth: false }),

me: async () => {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.user;
  },

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (input: { token: string; password: string }) =>
    api.post<{ message: string }>("/auth/reset-password", input, { auth: false }),

  updateProfile: (userId: string, input: Partial<User>) =>
    api.put<User>("/users/profile", input),
};