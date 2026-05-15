import { getAccessToken } from "./authStorage";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_STT_API_BASE_URL as string | undefined)?.trim() ||
  "http://127.0.0.1:8000";

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
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

export type SavedQuestionItem = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  level: string | null;
  hint?: string | null;
  translation?: string | null;
  savedDate: string;
  deletedDate?: string | null;
  daysLeft?: number | null;
  deleted: boolean;
};

export type SavedQuestionListResponse = {
  items: SavedQuestionItem[];
};

export function getSavedQuestions() {
  return request<SavedQuestionListResponse>("/api/saved/questions", {
    method: "GET",
  });
}

export function deleteSavedQuestion(savedId: number) {
  return request<SavedQuestionListResponse>(`/api/saved/questions/${savedId}`, {
    method: "DELETE",
  });
}

export function restoreSavedQuestion(savedId: number) {
  return request<SavedQuestionListResponse>(`/api/saved/questions/${savedId}/restore`, {
    method: "POST",
  });
}
