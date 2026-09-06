export type DashboardStats = {
  average_score: number | null;
  interview_count: number;
  role_count: number;
  dimensions: Record<string, number | null>;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: "include", cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? "Unable to load dashboard data.";
    throw new Error(typeof message === "string" ? message : "Unable to load dashboard data.");
  }
  return body as T;
}

export function getDashboardStats() {
  return request<DashboardStats>("/api/interviews/stats");
}
