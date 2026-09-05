import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/layout/top-nav";

export default function InterviewSetupPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <TopNav />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Interview setup</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Start your mock interview</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <form className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Interview type</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-400">
                <option>Technical</option>
                <option>Behavioral</option>
                <option>HR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Job title</label>
              <Input placeholder="Software Engineer" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Experience level</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-400">
                <option>Mid</option>
                <option>Junior</option>
                <option>Senior</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Difficulty</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-400">
                <option>Medium</option>
                <option>Easy</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">AI personality</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-400">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Tough</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Duration</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-400">
                <option>30 minutes</option>
                <option>15 minutes</option>
                <option>45 minutes</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Resume</label>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Upload your resume or drag and drop here.
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Job description</label>
              <textarea
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="Paste the job description or key responsibilities here..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Link href="/dashboard">
                <Button size="lg">Begin interview</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
