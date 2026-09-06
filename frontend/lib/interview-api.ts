export type InterviewListItem = {
  id: string;
  status: "created" | "active" | "completed" | "cancelled";
  interview_type: string;
  job_role: string;
  question_count: number;
  overall_score: number | null;
  created_at: string;
  completed_at: string | null;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: "include", cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? "Unable to load interviews.";
    throw new Error(typeof message === "string" ? message : "Unable to load interviews.");
  }
  return body as T;
}

export function listInterviews(limit = 20, offset = 0) {
  return request<{ items: InterviewListItem[]; total: number }>(`/api/interviews?status=completed&limit=${limit}&offset=${offset}`);
}
