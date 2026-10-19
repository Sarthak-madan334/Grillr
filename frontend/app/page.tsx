import Link from "next/link";
import type { CSSProperties } from "react";
import { HomeCTA } from "@/components/HomeCTA";
import { ArrowIcon } from "@/components/landing/ArrowIcon";
import { TopNav } from "@/components/layout/top-nav";

const practiceSteps = [
  {
    number: "01",
    title: "Choose your direction",
    description:
      "Pick a role, experience level, and interview style. We shape the session around what you need.",
  },
  {
    number: "02",
    title: "Find your rhythm",
    description:
      "Answer out loud, think at your own pace, and get thoughtful follow-ups as you go.",
  },
  {
    number: "03",
    title: "Leave with a plan",
    description:
      "Get clear notes on your answers and delivery, then try again with a little more confidence.",
  },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <div className="landing-atmosphere" aria-hidden="true">
        <span className="landing-orb landing-orb-one" />
        <span className="landing-orb landing-orb-two" />
      </div>
      <TopNav />

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-container landing-hero-grid">
          <div className="landing-copy">
            <p className="landing-eyebrow">
              <span className="landing-eyebrow-mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              Interview practice, in a better rhythm
            </p>
            <h1 id="landing-title">
              Show up as
              <br />
              <span>your best self.</span>
            </h1>
            <p className="landing-intro">
              A thoughtful space to practice out loud, get useful feedback, and
              feel more like yourself when it counts.
            </p>

            <HomeCTA />

            <div className="landing-reassurance">
              <span className="landing-reassurance-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M10 2.7 16 5v4.8c0 3.6-2.5 6.1-6 7.5-3.5-1.4-6-3.9-6-7.5V5l6-2.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="m7.4 10 1.7 1.7 3.6-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Built for honest practice <span aria-hidden="true">·</span> Practice at your pace
            </div>
          </div>

          <div className="landing-preview">
            <div className="landing-preview-glow" aria-hidden="true" />
            <article className="landing-session glass-surface">
              <div className="landing-session-topline">
                <div className="landing-session-label">
                  <span className="landing-live-dot" />
                  SAMPLE SESSION
                </div>
                <span className="landing-more-button" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </div>

              <div className="landing-session-heading">
                <div>
                  <p>Product designer</p>
                  <h2>A little practice goes a long way.</h2>
                </div>
                <div className="landing-session-avatar" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5">
                    <path d="M16 4.5v23M4.5 16h23M7.9 7.9l16.2 16.2m0-16.2L7.9 24.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="16" cy="16" r="4.5" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </div>
              </div>

              <div className="landing-question-card">
                <div className="landing-question-meta">
                  <span>YOUR NEXT QUESTION</span>
                  <span>02 <i /> 06</span>
                </div>
                <p>
                  Tell me about a time you made a complicated experience feel
                  simple.
                </p>
              </div>

              <div className="landing-listening-row">
                <div className="landing-waveform" aria-hidden="true">
                  {[12, 23, 16, 31, 20, 35, 15, 27, 12, 21, 32, 17, 26, 13, 22, 34, 16, 25, 12, 20, 30, 15, 24, 11, 19, 28, 14, 22, 10, 17].map((height, index) => (
                    <span key={index} style={{ "--wave-height": `${height}px`, "--wave-delay": `${index * -45}ms` } as CSSProperties} />
                  ))}
                </div>
                <div className="landing-listening-copy">
                  <strong>Take your time</strong>
                  <span>Your interviewer is listening</span>
                </div>
                <span className="landing-mic-mark" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <rect x="7" y="2.5" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M4.7 9.5a5.3 5.3 0 0 0 10.6 0M10 15v2.5m-3 0h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
            </article>

            <div className="landing-insight glass-surface">
              <span className="landing-insight-spark" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M10 2.5v15M2.5 10h15M4.7 4.7l10.6 10.6m0-10.6L4.7 15.3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <strong>One answer at a time.</strong>
                <span>Small steps. Real progress.</span>
              </div>
              <span className="landing-insight-check" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="m3.5 8.2 2.8 2.7 6.2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-method" aria-labelledby="landing-method-title">
        <div className="landing-container">
          <div className="landing-section-heading">
            <div>
              <p className="landing-section-kicker">A practice that feels human</p>
              <h2 id="landing-method-title">More confidence, one conversation at a time.</h2>
            </div>
            <p className="landing-section-summary">
              No scripts to memorize. Just a calm place to get clearer, more
                  comfortable, and ready for what comes next.
            </p>
          </div>

          <ol className="landing-steps">
            {practiceSteps.map((step) => (
              <li className="landing-step" key={step.number}>
                <span className="landing-step-number">{step.number}</span>
                <div className="landing-step-rule" aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-bottom" aria-labelledby="landing-bottom-title">
        <div className="landing-container">
          <div className="landing-bottom-card glass-surface">
            <div>
              <p className="landing-section-kicker">Your next answer starts here</p>
              <h2 id="landing-bottom-title">Ready when you are.</h2>
            </div>
            <Link href="/interview/setup" className="landing-button landing-button-secondary">
              Start a practice session <ArrowIcon diagonal />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
