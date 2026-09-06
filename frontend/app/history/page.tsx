"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";
import { listInterviews, type InterviewListItem } from "@/lib/interview-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listInterviews()
      .then((response) => setInterviews(response.items))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Unable to load interview history."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Interview history</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Your recent sessions</h1></div><Link href="/interview/setup"><Button>New interview</Button></Link></div>
        {error ? <p role="alert" className="mb-5 border-l-2 border-rose-400 pl-4 text-sm text-rose-700">{error}</p> : null}
        {isLoading ? <div className="space-y-4" aria-label="Loading interview history"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /></div> : interviews.length ? <div className="space-y-4">{interviews.map((item) => <Card key={item.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-2 flex items-center gap-3"><Badge className="bg-slate-100 text-slate-700">{item.interview_type}</Badge><span className="text-sm text-slate-500">{formatDate(item.completed_at ?? item.created_at)}</span></div><p className="text-xl font-semibold text-slate-900">{item.job_role}</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="text-sm text-slate-500">Score</p><p className="text-2xl font-semibold text-slate-900">{item.overall_score ?? "—"}</p></div><Link href={`/interview/${item.id}`}><Button variant="secondary">View results</Button></Link></div></div></Card>)}</div> : <Card className="p-8 text-center text-sm text-slate-500">No completed interviews yet. Start your first interview to see it here.</Card>}
      </div>
    </main>
  );
}
