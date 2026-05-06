const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_STT_API_BASE_URL as string | undefined)?.trim() ||
  "http://127.0.0.1:8000";

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

function getAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("accessToken") || "";
}

async function request<T>(path: string, init: RequestInit, isFormData = false): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (!isFormData && !headers.has("Content-Type")) {
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

export type EvaluationMode = "practice" | "mock_test";

export type EvaluationQuestionPayload = {
  questionId: string;
  questionOrder: number;
  questionText: string;
  questionType?: string | null;
  translation?: string | null;
  hint?: string | null;
  category?: string | null;
};

export type EvaluationScores = {
  grammar: number;
  fluency: number;
  vocabulary: number;
  completion: number;
  relevance: number;
  speed: number;
  engagement: number;
};

export type EvaluationFeedbackText = {
  grammar: string;
  fluency: string;
  vocabulary: string;
  completion: string;
  relevance: string;
  speed: string;
  sentenceLength: string;
  repetition: string;
  engagement: string;
  answerTime: string;
  keywordSimilarity: string;
};

export type EvaluationMetrics = {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  repetitionRate: number;
  lexicalDiversity: number;
  keywordSimilarity: number;
  connectorCount?: number;
  connectorRatio?: number;
  speechDurationSeconds: number;
  silenceDurationSeconds: number;
  silenceRatio: number;
  pauseCount: number;
  avgPauseSeconds: number;
  speechRateWpm: number;
  fillerCount: number;
  fillerRatio: number;
  tooShort: boolean;
  tooMuchSilence: boolean;
  isGradable: boolean;
};

export type EvaluationAnswerFeedback = {
  strengths: string[];
  weaknesses: string[];
  scores: EvaluationScores;
  feedback: EvaluationFeedbackText;
  tips: string[];
  tooShort: boolean;
  tooMuchSilence: boolean;
  questionRelevance: string;
  sentenceLength: string;
  answerTime: string;
  repetitionRate: string;
  keywordSimilarity: string;
};

export type OpicGate = {
  im2Candidate: boolean;
  ihCandidate: boolean;
  alCandidate: boolean;
};

export type OpicMetricSnapshot = {
  wordCount?: number;
  sentenceCount?: number;
  avgSentenceLength?: number;
  speechDurationSeconds?: number;
  speechRateWpm?: number;
  silenceRatio?: number;
  avgPauseSeconds?: number;
  fillerRatio?: number;
  connectorCount?: number;
  connectorRatio?: number;
  lexicalDiversity?: number;
  repetitionRate?: number;
  keywordSimilarity?: number;
};

export type OpicEvaluation = {
  score: number;
  score100: number;
  grade?: string;
  gradeReason?: string;
  summary: string;
  mainFeedback: string;
  weights: Record<string, number>;
  breakdown: Record<string, number>;
  weakPoints: string[];
  tips: string[];
  tags: string[];
  gate?: OpicGate;
  metricSnapshot?: OpicMetricSnapshot;
  gradableAnswers?: number | null;
  totalAnswers?: number | null;
  isGradable: boolean;
};

export type EvaluationAnswer = {
  id: number;
  sessionId: number;
  mode: EvaluationMode;
  questionId: string;
  questionOrder: number;
  questionType?: string | null;
  questionText: string;
  audioUrl?: string | null;
  audioDurationSeconds: number;
  originalTranscript: string;
  editedTranscript?: string | null;
  usedTranscript: string;
  metrics: EvaluationMetrics;
  feedback: EvaluationAnswerFeedback & { opic?: OpicEvaluation | null };
  createdAt: string;
  updatedAt: string;
};

export type EvaluationSessionOverall = {
  strengths: string[];
  weaknesses: string[];
  feedback: Record<string, string>;
  tips: string[];
  categoryScores: Record<string, number>;
  opic?: OpicEvaluation | null;
  estimatedGrade?: string | null;
  isGradable: boolean;
};

export type EvaluationSession = {
  id: number;
  mode: EvaluationMode;
  status: string;
  title?: string | null;
  difficulty?: string | null;
  totalQuestions: number;
  completedQuestions: number;
  metadata: Record<string, unknown>;
  questions: EvaluationQuestionPayload[];
  answers: EvaluationAnswer[];
  overall: EvaluationSessionOverall;
  createdAt: string;
  updatedAt: string;
};

export function createEvaluationSession(payload: {
  mode: EvaluationMode;
  title?: string;
  difficulty?: string;
  metadata?: Record<string, unknown>;
  questions: EvaluationQuestionPayload[];
}) {
  return request<EvaluationSession>("/api/evaluations/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function uploadAnswerEvaluation(payload: {
  sessionId: number;
  mode: EvaluationMode;
  questionId: string;
  questionOrder: number;
  questionText: string;
  questionType?: string;
  language?: string;
  clientDurationSeconds: number;
  audioBlob?: Blob | null;
  fileName?: string;
  clientTranscript?: string;
}) {
  const formData = new FormData();
  formData.append("sessionId", String(payload.sessionId));
  formData.append("mode", payload.mode);
  formData.append("questionId", payload.questionId);
  formData.append("questionOrder", String(payload.questionOrder));
  formData.append("questionText", payload.questionText);
  formData.append("clientDurationSeconds", String(payload.clientDurationSeconds));
  formData.append("language", payload.language || "en");

  if (payload.questionType) {
    formData.append("questionType", payload.questionType);
  }

  if (payload.audioBlob) {
    formData.append("audioFile", payload.audioBlob, payload.fileName || "recording.webm");
  }

  if (payload.clientTranscript) {
    formData.append("clientTranscript", payload.clientTranscript);
  }

  return request<EvaluationAnswer>("/api/evaluations/answers", {
    method: "POST",
    body: formData,
  }, true);
}

export function updateAnswerTranscript(answerId: number, transcript: string) {
  return request<EvaluationAnswer>(`/api/evaluations/answers/${answerId}/transcript`, {
    method: "PATCH",
    body: JSON.stringify({ transcript }),
  });
}

export function reEvaluateAnswer(answerId: number) {
  return request<EvaluationAnswer>(`/api/evaluations/answers/${answerId}/re-evaluate`, {
    method: "POST",
  });
}

export function completeEvaluationSession(sessionId: number) {
  return request<EvaluationSession>(`/api/evaluations/sessions/${sessionId}/complete`, {
    method: "POST",
  });
}

export function getEvaluationSessionResult(sessionId: number) {
  return request<EvaluationSession>(`/api/evaluations/sessions/${sessionId}/result`, {
    method: "GET",
  });
}

export function saveEvaluatedAnswer(answerId: number) {
  return request<{ savedId: number; message: string }>(`/api/evaluations/answers/${answerId}/save`, {
    method: "POST",
  });
}
