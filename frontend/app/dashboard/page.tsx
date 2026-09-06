import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";

const recentInterviews = [
  {
    role: "Senior Product Designer",
    score: 88,
    date: "Aug 30",
    status: "Completed",
  },
  { role: "Frontend Engineer", score: 84, date: "Aug 21", status: "Completed" },
  { role: "Software Engineer", score: 91, date: "Aug 12", status: "Improved" },
];

const scoreBreakdown = [
  { label: "Clarity", value: 84 },
  { label: "Structure", value: 89 },
  { label: "Specificity", value: 82 },
  { label: "Communication", value: 90 },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-6 rounded-[32px] border border-[#eadcc8] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(244,236,227,0.85))] p-6 shadow-[0_24px_70px_rgba(120,92,68,0.08)] backdrop-blur-md sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 border-[#eadcc8] bg-[#f9f1e8] text-[#6a5648]">
              Practice dashboard
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-[#201a17] sm:text-4xl">
              Get ready for your next round.
            </h1>
            <p className="mt-3 max-w-xl text-base text-[#5e4d40]">
              Review your metrics, open the next mock interview, and keep
              improving with focused feedback.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/interview/setup">
              <Button size="lg">Start interview</Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary" size="lg">
                View history
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-[#7a5f48]">Average score</p>
            <p className="mt-4 text-4xl font-semibold text-[#201a17]">86</p>
            <p className="mt-2 text-sm text-[#1f8a5b]">+12% from last month</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[#7a5f48]">Interviews</p>
            <p className="mt-4 text-4xl font-semibold text-[#201a17]">18</p>
            <p className="mt-2 text-sm text-[#5e4d40]">Across 5 roles</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[#7a5f48]">Improvement</p>
            <p className="mt-4 text-4xl font-semibold text-[#201a17]">+14</p>
            <p className="mt-2 text-sm text-[#5e4d40]">Best streak this week</p>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#201a17]">
                Recent interviews
              </h2>
              <Link
                href="/history"
                className="text-sm font-medium text-[#5d4a3b] hover:text-[#201a17]"
              >
                See all
              </Link>
            </div>

            <div className="space-y-4">
              {recentInterviews.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between rounded-[22px] border border-[#eadcc8] bg-[rgba(255,255,255,0.45)] p-4 backdrop-blur-sm"
                >
                  <div>
                    <p className="font-medium text-[#201a17]">{item.role}</p>
                    <p className="mt-1 text-sm text-[#7a5f48]">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#dff5e8] px-2.5 py-1 text-xs font-medium text-[#1c7c4d]">
                      {item.status}
                    </span>
                    <span className="text-lg font-semibold text-[#201a17]">
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#201a17]">
              Performance
            </h2>
            <div className="mt-5 space-y-4">
              {scoreBreakdown.map((metric) => (
                <div key={metric.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-[#5e4d40]">
                    <span>{metric.label}</span>
                    <span>{metric.value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full border border-[#eadcc8] bg-[rgba(255,255,255,0.45)] backdrop-blur-sm">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(122,95,72,0.92),rgba(201,176,152,0.95))] shadow-[0_0_18px_rgba(122,95,72,0.22)]"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
