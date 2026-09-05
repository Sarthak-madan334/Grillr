import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";

const promoCards = [
  { title: "Behavioral mock interviews", value: "12", kind: "count", icon: "waveform" },
  { title: "AI follow-ups", value: "Adaptive", kind: "state", icon: "branch" },
  { title: "Feedback loops", value: "Real-time", kind: "state", icon: "pulse" },
];

function StatIcon({ icon }: { icon: string }) {
  if (icon === "branch") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path d="M6 5v5a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v3M18 16l2 2-2 2M18 4l2 2-2 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>;
  }

  if (icon === "pulse") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path d="M4 13v-2M8 16V8M12 19V5M16 16V8M20 13v-2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}

export default function HomePage() {
  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <div className="transform-gpu grid items-center gap-8 transition-[transform,box-shadow] duration-300 sm:rounded-[38px] sm:border sm:border-[#d2d2d7] sm:bg-white sm:px-5 sm:py-4 sm:shadow-[0_28px_90px_rgba(0,0,0,0.06)] sm:[transform:perspective(1200px)_translateZ(0)] sm:hover:[transform:perspective(1200px)_translateY(-3px)] sm:hover:shadow-[0_34px_100px_rgba(0,0,0,0.1)] lg:grid-cols-[1.2fr_0.8fr] lg:px-6 lg:py-6">
          <div className="rounded-[28px] border border-[#d2d2d7] bg-white px-5 py-9 shadow-[0_18px_50px_rgba(0,0,0,0.04)] sm:rounded-none sm:border-0 sm:px-3 sm:py-8 sm:shadow-none lg:px-4 lg:py-10">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#424245] sm:mb-4">
              Speak. Practice. Grow.
            </p>
            <h1 className="group/headline max-w-xl text-3xl font-semibold tracking-tight text-[#201a17] sm:text-4xl lg:text-[3rem]">
              <span className="inline-block transition duration-300 group-hover/headline:-translate-y-0.5">
                Turn every answer into momentum.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#6e6e73] sm:mt-5 sm:text-lg sm:leading-8">
              Grillr helps candidates sharpen answers, improve delivery, and build confidence with focused mock interviews and structured feedback.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full" size="lg">Create account</Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full" variant="secondary" size="lg">
                  Explore dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#d2d2d7] bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.06)] sm:p-5">
            <div className="rounded-[24px] border border-[#d2d2d7] bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.04)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#424245]">Current session</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#1d1d1f]">Software Engineer</h2>
                </div>
                <div className="rounded-full bg-[#dff5e8] px-2.5 py-1 text-xs font-medium text-[#1c7c4d]">
                  Live
                </div>
              </div>

              <div className="rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] p-4">
                <p className="text-sm text-[#424245]">Question</p>
                <p className="mt-2 text-base font-medium text-[#1d1d1f]">
                  Tell me about a time you improved a system under pressure.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[#6e6e73]">
                <span>Question 3 of 8</span>
                <span>18:42 remaining</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-b border-[#d2d2d7] pb-8 md:grid-cols-3">
          {promoCards.map((card) => (
            <Card key={card.title} className={`group p-5 ${card.kind === "count" ? "md:scale-[1.03] md:shadow-[0_24px_60px_rgba(120,92,68,0.14)]" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d2d2d7] bg-white text-[#2563eb] transition duration-300 group-hover:rotate-[-4deg] group-hover:bg-[#eff6ff]"><StatIcon icon={card.icon} /></span>
                <p className="text-sm text-[#424245]">{card.title}</p>
              </div>
              {card.kind === "count" ? (
                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#201a17] transition duration-300 group-hover:translate-x-1 group-hover:text-[#755d4a]">{card.value}</p>
              ) : (
                <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d4eadb] bg-[#e7f6ec] px-3 py-1.5 text-sm font-semibold text-[#26724d] transition duration-300 group-hover:translate-x-1"><span className="h-1.5 w-1.5 rounded-full bg-[#3b9a68]" />{card.value}</span>
              )}
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
