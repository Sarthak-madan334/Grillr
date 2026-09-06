import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";

const flowSteps = [
  { title: "Choose your interview", description: "Select your role, experience level, and interview style.", icon: "compass" },
  { title: "Answer in real time", description: "Respond naturally as the AI adapts with relevant follow-ups.", icon: "waveform" },
  { title: "Get honest feedback", description: "Review speech metrics, strengths, and the clearest next improvements.", icon: "pulse" },
  { title: "Retry and track progress", description: "Practice again and see your confidence build over time.", icon: "trend" },
];

function FlowIcon({ icon }: { icon: string }) {
  if (icon === "compass") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m14.8 9.2-1.7 3.9-3.9 1.7 1.7-3.9 3.9-1.7Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
  }

  if (icon === "pulse") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
  }

  if (icon === "trend") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path d="M4 17 10 11l4 4 6-8M15 7h5v5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path d="M4 13v-2M8 16V8M12 19V5M16 16V8M20 13v-2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>;
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

      <section aria-labelledby="grillr-flow-heading" className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
        <div className="border-b border-[#e7d8c5]/80 pb-10 sm:pb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a5f48]">The Grillr flow</p>
          <h2 id="grillr-flow-heading" className="mt-3 text-2xl font-semibold tracking-tight text-[#201a17] sm:text-3xl">Practice with purpose.</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#5e4d40]">A focused loop designed to make every interview answer stronger.</p>

          <ol className="mt-8 grid gap-7 border-l border-[#dfcdb9] pl-5 sm:mt-10 sm:gap-8 sm:pl-6 md:grid-cols-4 md:gap-6 md:border-l-0 md:pl-0">
            {flowSteps.map((step, index) => (
              <li key={step.title} className="relative md:pr-4 last:pr-0 md:after:absolute md:after:left-12 md:after:right-0 md:after:top-4 md:after:border-t md:after:border-[#dfcdb9] md:last:after:hidden">
                <div className="absolute -left-[2.1rem] top-0 flex h-8 w-8 items-center justify-center bg-[#f7f3ed] text-[#a27c5b] md:static md:h-auto md:w-auto md:justify-start md:bg-transparent">
                  <FlowIcon icon={step.icon} />
                </div>
                <p className="relative z-10 text-xs font-semibold tracking-[0.16em] text-[#a27c5b]">0{index + 1}</p>
                <h3 className="mt-3 text-base font-semibold text-[#201a17]">{step.title}</h3>
                <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#5e4d40]">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
