export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

import { getBrowserApiBase } from "./api-base";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const BASE_URL = getBrowserApiBase();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      data?.error ?? data?.message ?? "Something went wrong",
    );
  }

  const json = await res.json().catch(() => null);
  return (json?.data ?? json) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function logout(): Promise<void> {
  await api.post("/auth/logout", {});
}

export async function register(
  email: string,
  password: string,
  username: string,
): Promise<AuthUser> {
  return api.post<AuthUser>("/auth/register", { email, password, username });
}
