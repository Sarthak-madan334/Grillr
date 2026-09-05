"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";

type Interview = {
  id: string;
  status: string;
  job_role: string;
  interview_type: string;
  question_count: number;
  current_question_number: number;
  questions: Array<{ id: string; question_number: number; question_text: string }>;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function InterviewSessionPage() {
  const params = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInterview() {
      try {
        const response = await fetch(`${apiUrl}/api/v1/interviews/${params.id}`);
        const payload = (await response.json()) as Interview & { detail?: string };
        if (!response.ok) {
          throw new Error(payload.detail ?? "Unable to load this interview.");
        }
        setInterview(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this interview.");
      }
    }

    void loadInterview();
  }, [params.id]);

  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {error ? <p role="alert" className="rounded-2xl border border-[#e7b8a9] bg-[#fff1ed] px-4 py-3 text-sm text-[#9a4635]">{error}</p> : null}
        {!error && !interview ? <p className="text-sm text-[#7a5f48]">Loading interview...</p> : null}
        {interview ? (
          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Live interview</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#201a17]">{interview.job_role}</h1>
                <p className="mt-2 text-sm capitalize text-[#5e4d40]">{interview.interview_type} interview</p>
              </div>
              <span className="rounded-full bg-[#dff5e8] px-3 py-1 text-xs font-medium capitalize text-[#1c7c4d]">{interview.status}</span>
            </div>

            <div className="mt-8 rounded-2xl border border-[#eadcc8] bg-[rgba(255,255,255,0.55)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a5f48]">Question {interview.current_question_number + 1} of {interview.question_count}</p>
              <p className="mt-3 text-xl font-medium leading-8 text-[#201a17]">{interview.questions[interview.current_question_number]?.question_text ?? interview.questions[0]?.question_text}</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-[#5d4a3b] hover:text-[#201a17]">Back to dashboard</Link>
              <Button disabled>Start speaking</Button>
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
