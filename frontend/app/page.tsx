import Link from "next/link";
import type { CSSProperties } from "react";
import { HomeCTA } from "@/components/HomeCTA";
import { ArrowIcon } from "@/components/landing/ArrowIcon";
import { TopNav } from "@/components/layout/top-nav";

const practiceSteps = [
  {
    number: "01",
    title: "Set the scene",
    description: "Choose a role, experience level, and interview style. Your session starts with questions shaped around your goals.",
  },
  {
    number: "02",
    title: "Answer out loud",
    description: "Talk it through like the real thing. Grillr listens, follows your answers, and can ask a natural follow-up.",
  },
  {
    number: "03",
    title: "Make the next one stronger",
    description: "Review feedback on your answer and delivery, retry a question, and keep building your confidence through practice.",
  },
];

const feedbackNotes = [
  { label: "Answer structure", note: "Make the result easier to spot", mark: "01" },
  { label: "Speaking pace", note: "A little more room between ideas", mark: "02" },
  { label: "Specificity", note: "Add one concrete detail to ground it", mark: "03" },
];

const questions = [
  {
    question: "Do I need to know what to say first?",
    answer: "No. Pick a role and experience level, then start answering. The point is to practice thinking out loud, not to arrive with a perfect script.",
  },
  {
    question: "What kind of feedback will I get?",
    answer: "Grillr reviews your answer for qualities like clarity, structure, relevance, and specificity, alongside speaking patterns such as pace and filler words.",
  },
  {
    question: "Can I try an answer again?",
    answer: "Yes. You can retry answers and use the feedback to make a more focused attempt. Improvement comes from the second try as much as the first.",
  },
];

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.75v18.5M2.75 12h18.5M5.45 5.45l13.1 13.1m0-13.1-13.1 13.1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

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
              <span className="landing-eyebrow-mark" aria-hidden="true"><span /><span /><span /></span>
              A little practice changes everything
            </p>
            <h1 id="landing-title">Your next interview, <span>less uncertain.</span></h1>
            <p className="landing-intro">
              Practice answering out loud, get thoughtful feedback, and walk into the real conversation feeling more like yourself.
            </p>
            <HomeCTA />
            <div className="landing-reassurance" aria-label="Practice on your own terms">
              <span>At your pace</span><i aria-hidden="true" /><span>Built around your role</span><i aria-hidden="true" /><span>Room to try again</span>
            </div>
          </div>

          <div className="landing-preview" aria-label="Illustration of a Grillr interview practice session">
            <div className="landing-preview-glow" aria-hidden="true" />
            <div className="landing-preview-note landing-preview-note-top" aria-hidden="true"><span className="landing-note-spark"><SparkIcon /></span><span>One question at a time</span></div>
            <article className="landing-session glass-surface">
              <div className="landing-session-topline">
                <div className="landing-session-label"><span className="landing-live-dot" /> SESSION PREVIEW</div>
                <span className="landing-session-time">Voice practice</span>
              </div>
              <div className="landing-session-heading">
                <div><p>Role-specific practice</p><h2>A conversation, not a quiz.</h2></div>
                <div className="landing-session-avatar" aria-hidden="true"><SparkIcon /></div>
              </div>
              <div className="landing-question-card">
                <div className="landing-question-meta"><span>SAMPLE QUESTION</span><span>BEHAVIORAL</span></div>
                <p>Tell me about a time you made a complicated experience feel simple.</p>
              </div>
              <div className="landing-listening-row">
                <div className="landing-waveform" aria-hidden="true">
                  {[12, 23, 16, 31, 20, 35, 15, 27, 12, 21, 32, 17, 26, 13, 22, 34, 16, 25, 12, 20, 30, 15, 24, 11, 19, 28, 14, 22, 10, 17].map((height, index) => (
                    <span key={index} style={{ "--wave-height": `${height}px`, "--wave-delay": `${index * -45}ms` } as CSSProperties} />
                  ))}
                </div>
                <div className="landing-listening-copy"><strong>Take your time</strong><span>Your interviewer is listening</span></div>
                <span className="landing-mic-mark" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><rect x="7" y="2.5" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" /><path d="M4.7 9.5a5.3 5.3 0 0 0 10.6 0M10 15v2.5m-3 0h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
              </div>
              <div className="landing-session-footer"><span><span className="landing-footer-dot" /> Your practice room</span><span>Nothing to memorize</span></div>
            </article>
            <div className="landing-preview-note landing-preview-note-bottom" aria-hidden="true"><span className="landing-note-check">✓</span><span>Feedback you can use</span></div>
          </div>
        </div>
      </section>

      <section className="landing-method" id="how-it-works" aria-labelledby="landing-method-title">
        <div className="landing-container">
          <div className="landing-section-heading">
            <div><p className="landing-section-kicker">More than rehearsing a script</p><h2 id="landing-method-title">Get comfortable with the <em>unexpected.</em></h2></div>
            <p className="landing-section-summary">Good interviews are conversations. Practice the parts you can control, so you have more headspace for the parts you can’t.</p>
          </div>

          <div className="landing-steps" role="list">
            {practiceSteps.map((step) => (
              <article className="landing-step" key={step.number} role="listitem">
                <span className="landing-step-number">{step.number}</span>
                <div className="landing-step-rule" aria-hidden="true" />
                <h3>{step.title}</h3><p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-coaching" aria-labelledby="landing-coaching-title">
        <div className="landing-container landing-coaching-grid">
          <div className="landing-coaching-copy">
            <p className="landing-section-kicker"><span className="landing-kicker-star"><SparkIcon /></span>Feedback with a next step</p>
            <h2 id="landing-coaching-title">Know what landed. Know what to try next.</h2>
            <p>After each answer, get a clearer read on how you communicated. Not a wall of scores. Just useful direction you can put into your next attempt.</p>
            <Link href="/interview/setup" className="landing-text-link">See what a session feels like <ArrowIcon diagonal /></Link>
            <div className="landing-feedback-tags" aria-label="Feedback areas"><span>Clarity</span><span>Structure</span><span>Specificity</span><span>Speaking pace</span></div>
          </div>

          <div className="landing-feedback" aria-label="Example feedback, for illustration">
            <div className="landing-feedback-head"><div><span className="landing-feedback-overline">AFTER YOUR ANSWER</span><h3>A few things to take with you</h3></div><span className="landing-feedback-spark"><SparkIcon /></span></div>
            <p className="landing-feedback-context">Example coaching notes <span>·</span> Not a scorecard</p>
            <ol className="landing-feedback-list">
              {feedbackNotes.map((note) => <li key={note.mark}><span className="landing-feedback-index">{note.mark}</span><div><strong>{note.label}</strong><span>{note.note}</span></div><ArrowIcon diagonal /></li>)}
            </ol>
            <div className="landing-feedback-foot"><span className="landing-feedback-foot-icon">↗</span><span>Retry the answer and see what feels different.</span></div>
          </div>
        </div>
      </section>

      <section className="landing-quote" aria-label="A reminder for interview practice">
        <div className="landing-container landing-quote-inner"><span className="landing-quote-mark" aria-hidden="true">“</span><p>You don’t have to be perfect.<br /><em>You just have to be more ready than yesterday.</em></p><span className="landing-quote-caption">A better answer starts with a place to practice.</span></div>
      </section>

      <section className="landing-faq" aria-labelledby="landing-faq-title">
        <div className="landing-container landing-faq-grid">
          <div className="landing-faq-intro"><p className="landing-section-kicker">A few good questions</p><h2 id="landing-faq-title">Before you begin.</h2><p>Start wherever you are. The first answer doesn’t need to be your best one.</p><Link href="/interview/setup" className="landing-text-link">Start a practice session <ArrowIcon diagonal /></Link></div>
          <div className="landing-faq-list">{questions.map((item) => <details className="landing-faq-item" key={item.question}><summary>{item.question}<span aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="landing-bottom" aria-labelledby="landing-bottom-title">
        <div className="landing-container landing-bottom-inner">
          <div><p className="landing-section-kicker">When you’re ready</p><h2 id="landing-bottom-title">Your next interview starts with one answer.</h2><p>Take a breath. Pick a role. We’ll take it from there.</p></div>
          <Link href="/interview/setup" className="landing-button landing-button-primary">Practice with Grillr <ArrowIcon /></Link>
        </div>
      </section>
    </main>
  );
}
