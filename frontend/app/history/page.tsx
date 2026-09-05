import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";

const history = [
  { role: "Senior Product Designer", type: "Behavioral", score: 88, date: "Aug 30" },
  { role: "Software Engineer", type: "Technical", score: 91, date: "Aug 21" },
  { role: "Data Analyst", type: "HR", score: 79, date: "Aug 12" },
];

export default function HistoryPage() {
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

        <div className="space-y-4">
          {history.map((item) => (
            <Card key={`${item.role}-${item.date}`} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <Badge className="bg-slate-100 text-slate-700">{item.type}</Badge>
                    <span className="text-sm text-slate-500">{item.date}</span>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">{item.role}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Score</p>
                    <p className="text-2xl font-semibold text-slate-900">{item.score}</p>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="secondary">View results</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
