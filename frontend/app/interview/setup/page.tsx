import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/layout/top-nav";

export default function InterviewSetupPage() {
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
          <form className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5e4d40]">Interview type</label>
              <select className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]">
                <option>Technical</option>
                <option>Behavioral</option>
                <option>HR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5e4d40]">Job title</label>
              <Input placeholder="Software Engineer" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5e4d40]">Experience level</label>
              <select className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]">
                <option>Mid</option>
                <option>Junior</option>
                <option>Senior</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5e4d40]">Difficulty</label>
              <select className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]">
                <option>Medium</option>
                <option>Easy</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5e4d40]">AI personality</label>
              <select className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Tough</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5e4d40]">Duration</label>
              <select className="w-full rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.62)] px-3.5 py-3 text-sm text-[#201a17] outline-none backdrop-blur-sm focus:border-[#b8916d]">
                <option>30 minutes</option>
                <option>15 minutes</option>
                <option>45 minutes</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#5e4d40]">Resume</label>
              <div className="rounded-2xl border border-dashed border-[#d9c5b1] bg-[rgba(255,255,255,0.42)] p-4 text-sm text-[#7a5f48]">
                Upload your resume or drag and drop here.
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#5e4d40]">Job description</label>
              <textarea
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
