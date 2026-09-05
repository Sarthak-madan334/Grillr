import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";

const promoCards = [
  { title: "Behavioral mock interviews", value: "12" },
  { title: "AI follow-ups", value: "Adaptive" },
  { title: "Feedback loops", value: "Real-time" },
];

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

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {promoCards.map((card) => (
            <Card key={card.title} className="group p-5">
              <p className="text-sm text-[#7a5f48]">{card.title}</p>
              <p className="mt-3 inline-block text-2xl font-semibold text-[#201a17] transition duration-300 group-hover:translate-x-1 group-hover:text-[#755d4a]">
                {card.value}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
