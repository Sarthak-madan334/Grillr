import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../../app/dashboard/page";
import { HomeCTA } from "../../components/HomeCTA";
import { TopNav } from "../../components/layout/top-nav";
import { getDashboardStats } from "../../lib/dashboard-api";
import { listInterviews } from "../../lib/interview-api";

const auth = vi.hoisted(() => ({
  value: { user: { id: "user", name: "Alex Morgan", email: "alex@example.test" } as { id: string; name: string; email: string } | null, isAuthenticated: true, isLoading: false, signOut: vi.fn() },
}));
vi.mock("../../lib/auth-client", () => ({ useAuth: () => auth.value }));
vi.mock("../../lib/dashboard-api", () => ({ getDashboardStats: vi.fn() }));
vi.mock("../../lib/interview-api", () => ({ listInterviews: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const stats = { average_score: 78, interview_count: 6, role_count: 2, dimensions: { clarity: 84, structure: 62, specificity: 76, communication: 90 } };
const sessions = [
  { id: "active", question_count: 5, job_role: "Frontend Engineer", interview_type: "technical", status: "active" as const, overall_score: null, created_at: "2026-10-20T12:00:00Z", completed_at: null },
  { id: "done", question_count: 5, job_role: "Product Designer", interview_type: "behavioral", status: "completed" as const, overall_score: 82, created_at: "2026-10-18T12:00:00Z", completed_at: "2026-10-18T13:00:00Z" },
  { id: "cancelled", question_count: 5, job_role: "UX Researcher", interview_type: "behavioral", status: "cancelled" as const, overall_score: null, created_at: "2026-10-17T12:00:00Z", completed_at: null },
];
beforeEach(() => {
  auth.value = { user: { id: "user", name: "Alex Morgan", email: "alex@example.test" }, isAuthenticated: true, isLoading: false, signOut: vi.fn() };
  vi.mocked(getDashboardStats).mockReset().mockResolvedValue(stats);
  vi.mocked(listInterviews).mockReset().mockResolvedValue({ items: sessions, total: 3 });
});

describe("practice dashboard", () => {
  it("uses real scores, resumes an unfinished interview, and recommends the lowest scored skill", async () => {
    render(<DashboardPage />);
    expect(await screen.findByRole("heading", { name: "Welcome back, Alex." })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Continue interview" })).toHaveAttribute("href", "/interview/active");
    expect(screen.getByText("Make structure your strength.")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Structure" })).toHaveAttribute("value", "62");
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /UX Researcher/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Completed")).toHaveLength(1);
    expect(screen.queryByText("Available after retry tracking")).not.toBeInTheDocument();
  });

  it("shows a useful empty state without invented scores", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({ average_score: null, interview_count: 0, role_count: 0, dimensions: {} });
    vi.mocked(listInterviews).mockResolvedValue({ items: [], total: 0 });
    render(<DashboardPage />);
    expect(await screen.findByText("Your first conversation starts here.")).toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a practice interview" })).toHaveAttribute("href", "/interview/setup");
    expect(screen.getByText("Your strengths will take shape.")).toBeInTheDocument();
  });

  it("preserves available sessions when statistics fail and recovers on retry", async () => {
    vi.mocked(getDashboardStats).mockRejectedValueOnce(new Error("unavailable")).mockResolvedValue(stats);
    render(<DashboardPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("scores couldn’t load");
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("meter", { name: "Clarity" })).toHaveAttribute("value", "84");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("preserves statistics when recent sessions fail", async () => {
    vi.mocked(listInterviews).mockRejectedValue(new Error("unavailable"));
    render(<DashboardPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("recent sessions couldn’t load");
    expect(screen.getByRole("meter", { name: "Communication" })).toHaveAttribute("value", "90");
    expect(screen.getByRole("button", { name: "Reload sessions" })).toBeInTheDocument();
  });

  it("distinguishes zero scores from missing scores", async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({ ...stats, average_score: 0, dimensions: { clarity: 0, structure: null } });
    render(<DashboardPage />);
    expect(await screen.findByRole("meter", { name: "Clarity" })).toHaveAttribute("value", "0");
    expect(screen.queryByRole("meter", { name: "Structure" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Not scored")).toHaveLength(3);
  });
});

describe("landing page account actions", () => {
  it("hides signup in the hero and both navbar layouts for signed-in users", () => {
    render(<><TopNav /><HomeCTA /></>);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.queryByRole("link", { name: /create your account|get started|sign in/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Your dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it("does not flash signup while authentication is loading", () => {
    auth.value = { ...auth.value, user: null, isAuthenticated: false, isLoading: true };
    render(<><TopNav /><HomeCTA /></>);
    expect(screen.getByRole("link", { name: "Open your practice space" })).toHaveAttribute("href", "/dashboard");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.queryByRole("link", { name: /create your account|get started|sign in/i })).not.toBeInTheDocument();
  });

  it("shows signup for guests and updates immediately when the shared sign-in state changes", () => {
    auth.value = { ...auth.value, user: null, isAuthenticated: false };
    const { rerender, container } = render(<HomeCTA />);
    expect(screen.getByRole("link", { name: "Create your account" })).toHaveAttribute("href", "/signup");
    auth.value = { ...auth.value, user: { id: "user", name: "Alex", email: "alex@example.test" }, isAuthenticated: true };
    rerender(<HomeCTA />);
    expect(within(container).queryByRole("link", { name: "Create your account" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue practicing" })).toBeInTheDocument();
  });
});
