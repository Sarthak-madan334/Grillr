"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-api";
import { listInterviews, type InterviewListItem } from "@/lib/interview-api";

const dimensionLabels = [
  ["clarity", "Clarity"],
  ["structure", "Structure"],
  ["specificity", "Specificity"],
  ["communication", "Communication"],
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function LoadingCard({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] bg-[#eadcc8] ${className}`} aria-hidden="true" />;
}

function RecentInterview({ interview }: { interview: InterviewListItem }) {
  return (
    <Link href={`/interview/${interview.id}`} className="flex items-center justify-between rounded-[22px] border border-[#eadcc8] bg-[rgba(255,255,255,0.45)] p-4 transition hover:border-[#b8916d] hover:bg-white">
      <div>
        <p className="font-medium text-[#201a17]">{interview.job_role}</p>
        <p className="mt-1 text-sm text-[#7a5f48]">{formatDate(interview.completed_at ?? interview.created_at)}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#dff5e8] px-2.5 py-1 text-xs font-medium text-[#1c7c4d]">Completed</span>
        <span className="text-lg font-semibold text-[#201a17]">{interview.overall_score ?? "—"}</span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listInterviews(3), getDashboardStats()])
      .then(([recent, dashboardStats]) => {
        if (!active) return;
        setInterviews(recent.items);
        setStats(dashboardStats);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load dashboard data.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const hasCompletedInterviews = Boolean(stats?.interview_count);

  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-6 rounded-[32px] border border-[#eadcc8] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(244,236,227,0.85))] p-6 shadow-[0_24px_70px_rgba(120,92,68,0.08)] backdrop-blur-md sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 border-[#eadcc8] bg-[#f9f1e8] text-[#6a5648]">Practice dashboard</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-[#201a17] sm:text-4xl">Get ready for your next round.</h1>
            <p className="mt-3 max-w-xl text-base text-[#5e4d40]">Review your metrics, open the next mock interview, and keep improving with focused feedback.</p>
          </div>
          <div className="flex gap-3"><Link href="/interview/setup"><Button size="lg">Start interview</Button></Link><Link href="/history"><Button variant="secondary" size="lg">View history</Button></Link></div>
        </section>

        {error ? <div role="alert" className="mb-8 border-l-2 border-[#b45b45] pl-4 text-sm text-[#8a3f32]">{error}</div> : null}

        {isLoading ? (
          <div className="space-y-8" aria-label="Loading dashboard"><div className="grid gap-6 md:grid-cols-3"><LoadingCard className="h-32" /><LoadingCard className="h-32" /><LoadingCard className="h-32" /></div><div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><LoadingCard className="h-72" /><LoadingCard className="h-72" /></div></div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-3">
              <Card className="p-5"><p className="text-sm text-[#7a5f48]">Average score</p><p className="mt-4 text-4xl font-semibold text-[#201a17]">{stats?.average_score ?? "—"}</p><p className="mt-2 text-sm text-[#5e4d40]">{hasCompletedInterviews ? "Across completed interviews" : "Complete your first interview"}</p></Card>
              <Card className="p-5"><p className="text-sm text-[#7a5f48]">Interviews</p><p className="mt-4 text-4xl font-semibold text-[#201a17]">{stats?.interview_count ?? 0}</p><p className="mt-2 text-sm text-[#5e4d40]">Across {stats?.role_count ?? 0} {stats?.role_count === 1 ? "role" : "roles"}</p></Card>
              <Card className="p-5"><p className="text-sm text-[#7a5f48]">Improvement</p><p className="mt-4 text-4xl font-semibold text-[#201a17]">—</p><p className="mt-2 text-sm text-[#5e4d40]">Available after retry tracking</p></Card>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold text-[#201a17]">Recent interviews</h2><Link href="/history" className="text-sm font-medium text-[#5d4a3b] hover:text-[#201a17]">See all</Link></div>{interviews.length ? <div className="space-y-4">{interviews.map((interview) => <RecentInterview key={interview.id} interview={interview} />)}</div> : <p className="rounded-2xl border border-dashed border-[#d9c5b1] px-4 py-8 text-center text-sm text-[#7a5f48]">Complete your first interview to see it here.</p>}</Card>
              <Card className="p-6"><h2 className="text-xl font-semibold text-[#201a17]">Performance</h2>{hasCompletedInterviews ? <div className="mt-5 space-y-4">{dimensionLabels.map(([key, label]) => { const value = stats?.dimensions[key] ?? null; return <div key={key}><div className="mb-2 flex items-center justify-between text-sm text-[#5e4d40]"><span>{label}</span><span>{value ?? "—"}</span></div><div className="h-2.5 overflow-hidden rounded-full border border-[#eadcc8] bg-[rgba(255,255,255,0.45)]"><div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(122,95,72,0.92),rgba(201,176,152,0.95))]" style={{ width: `${value ?? 0}%` }} /></div></div>; })}</div> : <p className="mt-5 rounded-2xl border border-dashed border-[#d9c5b1] px-4 py-8 text-center text-sm text-[#7a5f48]">Complete your first interview to see performance data.</p>}</Card>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
