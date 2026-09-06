export type InterviewListItem = {
  id: string;
  status: string;
  job_role: string;
  interview_type: string;
  overall_score?: number | null;
  created_at: string;
};

export type InterviewListResponse = {
  items: InterviewListItem[];
  total: number;
  limit: number;
  offset: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function listInterviews({ limit = 20, offset = 0, status }: { limit?: number; offset?: number; status?: string } = {}): Promise<InterviewListResponse> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) query.set("status", status);
  const response = await fetch(`${apiUrl}/api/v1/interviews?${query.toString()}`);
  const payload = (await response.json()) as InterviewListResponse & { detail?: string };

  if (!response.ok) {
    throw new Error(payload.detail ?? "Unable to load interview history.");
  }

  return payload;
}