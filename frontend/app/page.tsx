"use client";

import { HomeCTA } from "@/components/HomeCTA";
import { TopNav } from "@/components/layout/top-nav";

const flowSteps = [
  {
    title: "Choose your interview",
    description: "Select your role, experience level, and interview style.",
    icon: "compass",
  },
  {
    title: "Answer in real time",
    description: "Respond naturally as the AI adapts with relevant follow-ups.",
    icon: "waveform",
  },
  {
    title: "Get honest feedback",
    description: "Review speech metrics, strengths, and the clearest next improvements.",
    icon: "pulse",
  },
  {
    title: "Retry and track progress",
    description: "Practice again and see your confidence build over time.",
    icon: "trend",
  },
];

function FlowIcon({ icon }: { icon: string }) {
  if (icon === "compass") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m14.8 9.2-1.7 3.9-3.9 1.7 1.7-3.9 3.9-1.7Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (icon === "pulse") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (icon === "trend") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path d="M4 17 10 11l4 4 6-8M15 7h5v5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M4 13v-2M8 16V8M12 19V5M16 16V8M20 13v-2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0e1720] text-[#f8f5f0]">
      <TopNav />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <div className="grid items-center gap-6 overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(186,122,75,0.28),_transparent_26%),linear-gradient(135deg,#111b24_0%,#0e1720_45%,#0b1117_100%)] p-4 shadow-[0_30px_90px_rgba(15,23,32,0.38)] sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-7 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c78d5f]/30 bg-[#ba7a4b]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f2d1a2]">
              <span className="h-2 w-2 rounded-full bg-[#f2d1a2]" />
              Speak. Practice. Grow.
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-[4rem] lg:leading-[0.96]">
              Turn every answer into momentum.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#d3dbe5] sm:text-lg">
              Grillr helps candidates sharpen answers, improve delivery, and build confidence with deliberate mock interviews and real-time coaching.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <HomeCTA />
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#d3dbe5]">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Voice-first interview flow</div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Adaptive follow-ups</div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Actionable coaching</div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#101a23] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.34)] sm:p-5">
            <div className="rounded-[24px] border border-[#d7c8ba]/10 bg-[#111d26] p-4 sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#a8b7c7]">Current session</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#f8f5f0]">Software Engineer</h2>
                </div>
                <div className="rounded-full border border-[#83d1a1]/30 bg-[#1a3d2b] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#bfe9cf]">
                  Live
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[#0d1520] p-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#9fb3c4]">
                  <span>Question</span>
                  <span>3 / 8</span>
                </div>
                <p className="mt-4 text-lg font-medium leading-7 text-[#f1eee9]">
                  Tell me about a time you improved a system under pressure.
                </p>
              </div>

              <div className="mt-5 rounded-[20px] border border-[#d7c8ba]/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#9fb3c4]">
                  <span>Voice status</span>
                  <span>Listening</span>
                </div>
                <div className="mt-3 flex items-end gap-1">
                  {[16, 20, 14, 28, 18, 24, 20, 16, 22, 14, 18, 28, 16, 24, 12].map((height, index) => (
                    <span key={index} className="block w-1.5 rounded-full bg-gradient-to-t from-[#ba7a4b] to-[#f2d1a2]" style={{ height: `${height}px` }} />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[#d3dbe5]">
                <span>Q3 / 8</span>
                <span>18:42 remaining</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="grillr-flow-heading" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="rounded-[32px] border border-[#d7c8ba]/70 bg-[#f5efe9]/90 p-5 shadow-[0_18px_48px_rgba(17,24,39,0.04)] sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f6d4d]">The Grillr flow</p>
          <h2 id="grillr-flow-heading" className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-3xl">Practice with purpose.</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#5b6472]">A focused loop designed to make every interview answer stronger.</p>

          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {flowSteps.map((step, index) => (
              <li key={step.title} className="relative rounded-[24px] border border-[#eaded1] bg-white/80 p-4 shadow-[0_12px_30px_rgba(17,24,39,0.03)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4e6d8] text-[#8f6d4d]">
                  <FlowIcon icon={step.icon} />
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f6d4d]">0{index + 1}</p>
                <h3 className="mt-3 text-base font-semibold text-[#111827]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5b6472]">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
