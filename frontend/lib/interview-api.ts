export type SessionStatus = "created" | "active" | "completed" | "cancelled";

export type InterviewListItem = {
  id: string;
  status: SessionStatus;
  interview_type: string;
  job_role: string;
  question_count: number;
  overall_score: number | null;
  created_at: string;
  completed_at: string | null;
};

export type InterviewQuestion = {
  id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  is_follow_up: boolean;
  answered_at: string | null;
};

export type InterviewSession = {
  id: string;
  status: SessionStatus;
  interview_type: string;
  job_role: string;
  experience_level: string;
  difficulty: string;
  personality: string;
  duration: number;
  question_count: number;
  current_question_number: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  questions: InterviewQuestion[];
};

export type Feedback = {
  overall_score: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improved_answer: string;
};

export type Answer = {
  id: string;
  question_id: string;
  attempt_number: number;
  transcript: string;
  duration: number;
  created_at: string;
  completed_at: string | null;
  speech_metrics: {
    words_per_minute: number;
    filler_count: number;
    pause_count: number;
    repetition_count: number;
    duration_seconds: number;
    word_count: number;
  } | null;
  evaluation: Feedback | null;
};

export type Summary = {
  overall_score: number;
  total_questions: number;
  total_duration: number;
  average_wpm: number;
  total_filler_words: number;
  total_pauses: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type InterviewCreateInput = {
  interview_type: string;
  job_role: string;
  experience_level: string;
  difficulty: string;
  personality: string;
  duration: number;
  question_count: number;
  job_description?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class InterviewApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "InterviewApiError";
  }
}

async function request<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? body?.detail ?? "The interview service is unavailable.";
    throw new InterviewApiError(response.status, typeof message === "string" ? message : "The interview service is unavailable.");
  }
  return body as T;
}

export function listInterviews(limit = 20, offset = 0, signal?: AbortSignal) {
  return request<{ items: InterviewListItem[]; total: number }>(`/api/v1/interviews?status=completed&limit=${limit}&offset=${offset}`, undefined, signal);
}

export function createInterview(input: InterviewCreateInput, signal?: AbortSignal) {
  return request<InterviewSession>("/api/v1/interviews", { method: "POST", body: JSON.stringify(input) }, signal);
}

export function getInterview(sessionId: string, signal?: AbortSignal) {
  return request<InterviewSession>(`/api/v1/interviews/${sessionId}`, undefined, signal);
}

export function startInterview(sessionId: string, signal?: AbortSignal) {
  return request<InterviewSession>(`/api/v1/interviews/${sessionId}/start`, { method: "POST" }, signal);
}

export function getQuestions(sessionId: string, signal?: AbortSignal) {
  return request<{ items: InterviewQuestion[] }>(`/api/v1/interviews/${sessionId}/questions`, undefined, signal);
}

export function getLatestAnswer(sessionId: string, signal?: AbortSignal) {
  return request<Answer>(`/api/v1/interviews/${sessionId}/latest-answer`, undefined, signal);
}

export function submitAnswer(questionId: string, transcript: string, duration: number, signal?: AbortSignal) {
  return request<Answer>(`/api/v1/interviews/questions/${questionId}/answer`, {
    method: "POST",
    body: JSON.stringify({ transcript, duration }),
  }, signal);
}

export function getSummary(sessionId: string, signal?: AbortSignal) {
  return request<Summary>(`/api/v1/interviews/${sessionId}/feedback`, undefined, signal);
}
