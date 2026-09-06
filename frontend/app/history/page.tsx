"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";
import { listInterviews, type InterviewListItem } from "@/lib/interview-api";

const pageSize = 20;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listInterviews(pageSize, 0, controller.signal)
      .then((response) => {
        setInterviews(response.items);
        setTotal(response.total);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "Unable to load interview history.");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  async function loadMore() {
    setIsLoadingMore(true);
    setError("");
    try {
      const response = await listInterviews(pageSize, interviews.length);
      setInterviews((current) => [...current, ...response.items]);
      setTotal(response.total);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to load more interview history.");
    } finally {
      setIsLoadingMore(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Interview history</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your recent sessions</h1>
          </div>
          <Link href="/interview/setup">
            <Button>New interview</Button>
          </Link>
        </div>

        {error ? <p role="alert" className="mb-6 rounded-2xl border border-[#e7b8a9] bg-[#fff1ed] px-4 py-3 text-sm text-[#9a4635]">{error}</p> : null}

        {isLoading ? <p className="text-sm text-slate-500">Loading your interview history...</p> : null}

        {!isLoading && !error && interviews.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900">You haven&apos;t completed a practice interview yet</h2>
            <p className="mt-2 text-sm text-slate-500">Start a session to build your history and track your progress.</p>
            <Link href="/interview/setup" className="mt-5 inline-flex">
              <Button>Start an interview</Button>
            </Link>
          </Card>
        ) : null}

        {!isLoading && interviews.length > 0 ? <div className="space-y-4">
          {interviews.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <Badge className="bg-slate-100 text-slate-700">{formatLabel(item.interview_type)}</Badge>
                    <span className="text-sm text-slate-500">{formatDate(item.completed_at ?? item.created_at)}</span>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">{item.job_role}</p>
                  <p className="mt-1 text-sm capitalize text-slate-500">{formatLabel(item.status)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Score</p>
                    <p className="text-2xl font-semibold text-slate-900">{item.overall_score ?? "-"}</p>
                  </div>
                  <Link href={`/interview/${item.id}`}>
                    <Button variant="secondary">View results</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div> : null}

        {!isLoading && interviews.length > 0 && interviews.length < total ? (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Loading more..." : `Load more (${total - interviews.length} remaining)`}
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
