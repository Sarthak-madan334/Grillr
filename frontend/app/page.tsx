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

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="transform-gpu grid items-center gap-8 rounded-[38px] border border-[#e7d8c5]/80 bg-[rgba(255,255,255,0.16)] px-4 py-4 shadow-[0_28px_90px_rgba(120,92,68,0.1)] backdrop-blur-xl transition-[transform,box-shadow] duration-300 [transform:perspective(1200px)_translateZ(0)] hover:[transform:perspective(1200px)_translateY(-3px)_rotateX(0.5deg)_rotateY(-0.5deg)] hover:shadow-[0_34px_100px_rgba(120,92,68,0.14)] sm:px-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-6 lg:py-6">
          <div className="px-2 py-6 sm:px-3 sm:py-8 lg:px-4 lg:py-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#7a5f48]">
              Speak. Practice. Grow.
            </p>
            <h1 className="group/headline max-w-xl text-3xl font-semibold tracking-tight text-[#201a17] sm:text-4xl lg:text-[3rem]">
              <span className="inline-block transition duration-300 group-hover/headline:-translate-y-0.5">
                Turn every answer into momentum.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#5e4d40]">
              Grillr helps candidates sharpen answers, improve delivery, and build confidence with focused mock interviews and structured feedback.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <Button size="lg">Create account</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">
                  Explore dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#e7d8c5] bg-[linear-gradient(180deg,rgba(255,255,255,0.36),rgba(243,233,224,0.9))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(121,94,72,0.06)] backdrop-blur-xl">
            <div className="rounded-[24px] border border-[#e8dac5] bg-[rgba(255,255,255,0.48)] p-5 shadow-[0_14px_30px_rgba(121,94,72,0.08)] backdrop-blur-lg">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a5f48]">Current session</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#201a17]">Software Engineer</h2>
                </div>
                <div className="rounded-full bg-[#dff5e8] px-2.5 py-1 text-xs font-medium text-[#1c7c4d]">
                  Live
                </div>
              </div>

              <div className="rounded-2xl border border-[#eadcc8] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(250,245,240,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <p className="text-sm text-[#7a5f48]">Question</p>
                <p className="mt-2 text-base font-medium text-[#201a17]">
                  Tell me about a time you improved a system under pressure.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[#5e4d40]">
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
