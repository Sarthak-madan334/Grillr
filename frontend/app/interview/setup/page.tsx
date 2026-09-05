"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TopNav } from "@/components/layout/top-nav";

type SetupFormState = {
  interviewType: "technical" | "behavioral" | "hr";
  jobTitle: string;
  experienceLevel: "mid" | "junior" | "senior";
  difficulty: "medium" | "easy" | "hard";
  personality: "professional" | "friendly" | "tough";
  duration: "30" | "15" | "45";
  questionCount: number;
  resume: File | null;
  jobDescription: string;
};

const initialFormState: SetupFormState = {
  interviewType: "technical",
  jobTitle: "",
  experienceLevel: "mid",
  difficulty: "medium",
  personality: "professional",
  duration: "30",
  questionCount: 5,
  resume: null,
  jobDescription: "",
};

export default function InterviewSetupPage() {
  const [formState, setFormState] = useState<SetupFormState>(initialFormState);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.debug("Interview setup state", formState);
    }
  }, [formState]);

  function updateField<Key extends keyof SetupFormState>(field: Key, value: SetupFormState[Key]) {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  }

  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Interview setup</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#201a17]">Start your mock interview</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <form className="grid gap-6 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="interviewType" className="text-sm font-medium text-[#5e4d40]">Interview type</label>
              <Select id="interviewType" name="interviewType" value={formState.interviewType} onChange={(value) => updateField("interviewType", value as SetupFormState["interviewType"])} options={[{ value: "technical", label: "Technical" }, { value: "behavioral", label: "Behavioral" }, { value: "hr", label: "HR" }]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="jobTitle" className="text-sm font-medium text-[#5e4d40]">Job title</label>
              <Input id="jobTitle" name="jobTitle" value={formState.jobTitle} onChange={(event) => updateField("jobTitle", event.target.value)} placeholder="Software Engineer" />
            </div>

            <div className="space-y-2">
              <label htmlFor="experienceLevel" className="text-sm font-medium text-[#5e4d40]">Experience level</label>
              <Select id="experienceLevel" name="experienceLevel" value={formState.experienceLevel} onChange={(value) => updateField("experienceLevel", value as SetupFormState["experienceLevel"])} options={[{ value: "mid", label: "Mid" }, { value: "junior", label: "Junior" }, { value: "senior", label: "Senior" }]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium text-[#5e4d40]">Difficulty</label>
              <Select id="difficulty" name="difficulty" value={formState.difficulty} onChange={(value) => updateField("difficulty", value as SetupFormState["difficulty"])} options={[{ value: "medium", label: "Medium" }, { value: "easy", label: "Easy" }, { value: "hard", label: "Hard" }]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="personality" className="text-sm font-medium text-[#5e4d40]">AI personality</label>
              <Select id="personality" name="personality" value={formState.personality} onChange={(value) => updateField("personality", value as SetupFormState["personality"])} options={[{ value: "professional", label: "Professional" }, { value: "friendly", label: "Friendly" }, { value: "tough", label: "Tough" }]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium text-[#5e4d40]">Duration</label>
              <Select id="duration" name="duration" value={formState.duration} onChange={(value) => updateField("duration", value as SetupFormState["duration"])} options={[{ value: "30", label: "30 minutes" }, { value: "15", label: "15 minutes" }, { value: "45", label: "45 minutes" }]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="questionCount" className="text-sm font-medium text-[#5e4d40]">Number of questions</label>
              <select id="questionCount" name="questionCount" value={formState.questionCount} onChange={(event) => updateField("questionCount", Number(event.target.value))} className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]">
                {Array.from({ length: 20 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? "question" : "questions"}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="resume" className="text-sm font-medium text-[#5e4d40]">Resume</label>
              <input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" onChange={(event) => updateField("resume", event.target.files?.[0] ?? null)} className="w-full rounded-2xl border border-dashed border-[#d9c5b1] bg-[rgba(255,255,255,0.42)] p-4 text-sm text-[#7a5f48] file:mr-3 file:rounded-full file:border-0 file:bg-[#2d241d] file:px-3 file:py-2 file:text-xs file:font-medium file:text-white" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="jobDescription" className="text-sm font-medium text-[#5e4d40]">Job description</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formState.jobDescription}
                onChange={(event) => updateField("jobDescription", event.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]"
                placeholder="Paste the job description or key responsibilities here..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Link href="/interview">
                <Button size="lg">Begin interview</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
