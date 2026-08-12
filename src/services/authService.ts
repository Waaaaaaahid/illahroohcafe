import { api, USE_MOCK_API } from "@/services/api";
import { mockApi } from "@/lib/mock/mockApi";
import type { AuthSession, User } from "@/lib/types";

/** POST /api/auth/register, /login, GET /api/auth/me, forgot/reset password. */
export const authService = {
  register: (input: { name: string; email: string; phone: string; password: string }) =>
    USE_MOCK_API ? mockApi.register(input) : api.post<AuthSession>("/auth/register", input, { auth: false }),

  login: (input: { email: string; password: string }) =>
    USE_MOCK_API
      ? mockApi.login(input.email, input.password)
      : api.post<AuthSession>("/auth/login", input, { auth: false }),

  me: async () => {
    if (USE_MOCK_API) return Promise.reject(new Error("Not available in mock mode"));
    const response = await api.get<{ user: User }>("/auth/me");
    return response.user;
  },

  forgotPassword: (email: string) =>
    USE_MOCK_API
      ? mockApi.forgotPassword(email)
      : api.post<{ message: string }>("/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (input: { token: string; password: string }) =>
    USE_MOCK_API
      ? mockApi.resetPassword()
      : api.post<{ message: string }>("/auth/reset-password", input, { auth: false }),

  updateProfile: (userId: string, input: Partial<User>) =>
    USE_MOCK_API ? mockApi.updateProfile(userId, input) : api.put<User>("/users/profile", input),
};
