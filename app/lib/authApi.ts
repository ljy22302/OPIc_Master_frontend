const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_STT_API_BASE_URL as string | undefined)?.trim() ||
  "http://127.0.0.1:8000";

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data.detail === "string"
        ? data.detail
        : data && typeof data.message === "string"
          ? data.message
          : "Request failed.";
    throw new Error(message);
  }

  return data as T;
}

export type AuthTokenResponse = {
  accessToken: string;
  tokenType: string;
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
};

export type AuthMessageResponse = {
  message: string;
};

export function signup(payload: {
  username: string;
  password: string;
  name: string;
  email: string;
  birthDate?: string;
}) {
  return request<AuthTokenResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { username: string; password: string }) {
  return request<AuthTokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function checkUsername(username: string) {
  return request<{ available: boolean; message: string }>(
    `/api/auth/check-username?username=${encodeURIComponent(username)}`,
    { method: "GET" },
  );
}

export function sendEmailVerification(payload: { email: string }) {
  return request<AuthMessageResponse>("/api/auth/email/send-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(payload: { email: string; code: string }) {
  return request<AuthMessageResponse>("/api/auth/email/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function findId(payload: { name: string; email: string }) {
  return request<AuthMessageResponse>("/api/auth/find-id", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload: { username: string; email: string }) {
  return request<AuthMessageResponse>("/api/auth/reset-password/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmPasswordReset(payload: { token: string; newPassword: string }) {
  return request<AuthMessageResponse>("/api/auth/reset-password/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
