import Image from "next/image";
import Link from "next/link";
import { HomeCTA } from "@/components/HomeCTA";
import { TopNav } from "@/components/layout/top-nav";
import { ArrowIcon } from "@/components/landing/ArrowIcon";
import { FeedbackPreview } from "@/components/landing/FeedbackPreview";
import { InterviewPreview } from "@/components/landing/InterviewPreview";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

const steps = [
  { number: "01", title: "Set the scene", description: "Choose your role, your experience, and your interview style. Make the practice your own.", path: "M4 7h16M7 4v6m-3 7h16m-7-3v6" },
  { number: "02", title: "Answer out loud", description: "Have a real conversation. Think on your feet, find your rhythm, and let your ideas take shape.", path: "M9 3h6v10a3 3 0 0 1-6 0V3Zm-4 9a7 7 0 0 0 14 0m-7 7v3m-4 0h8" },
  { number: "03", title: "See what to improve", description: "Get thoughtful feedback on what worked, what could be clearer, and what to try next.", path: "m5 12 4 4L19 6M4 21h16" },
];
const questions = [
  { question: "Do I need to know what to say first?", answer: "No. Pick a role and experience level, then start answering. The point is to practice thinking out loud, not to arrive with a perfect script." },
  { question: "What kind of feedback will I get?", answer: "Grillr reviews clarity, structure, relevance, and specificity, alongside speaking patterns such as pace and filler words." },
  { question: "Can I try an answer again?", answer: "Yes. You can retry answers and use the feedback to make a more focused attempt. Improvement comes from the second try as much as the first." },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <TopNav />
      <ScrollReveal />
      <section className="home-hero" aria-labelledby="landing-title">
        <Image className="hero-texture" src="/images/stone-light.jpg" alt="" fill priority sizes="100vw" quality={75} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="home-container home-hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-rule" />INTERVIEW PRACTICE, REIMAGINED</p>
            <h1 id="landing-title">Speak.<br />Practice.<br /><span>Get better.</span></h1>
            <p className="hero-description">A little practice. A clearer voice.<br />Real conversations and thoughtful feedback to help you walk into your next interview with confidence.</p>
            <HomeCTA />
            <p className="hero-note">Free to start <span>·</span> No credit card required</p>
          </div>
          <InterviewPreview />
        </div>
      </section>
      <section className="home-container stat-strip" aria-label="A better way to practice">
        {[["01", "Real conversations", "Questions that follow your thinking."], ["02", "Instant feedback", "Clarity on what to try next."], ["03", "Steady improvement", "One answer stronger, every time."]].map(([number, title, copy]) => <div key={number}><span className="stat-number">{number}</span><div><h2>{title}</h2><p>{copy}</p></div></div>)}
      </section>
      <section className="home-container home-section reveal" id="how-it-works" aria-labelledby="flow-title">
        <div className="section-heading"><div><p className="eyebrow">HOW IT WORKS</p><h2 id="flow-title">A simple flow<br />that fits your day.</h2></div><p>No scripts to memorize. No perfect answers expected. Just a little space to practice being yourself.</p></div>
        <div className="home-steps">{steps.map((step) => <article key={step.number}><div className="step-top"><span className="icon-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={step.path} /></svg></span><span className="step-connector" aria-hidden="true" /><span className="step-number">{step.number}</span></div><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
      </section>
      <section className="home-container home-section purpose-section reveal" aria-labelledby="purpose-title">
        <div className="purpose-copy"><p className="eyebrow">PRACTICE WITH PURPOSE</p><h2 id="purpose-title">Good feedback.<br /><span>A better next answer.</span></h2><p>Understand how you come across, not just what you say. Turn a moment of reflection into something you can use in your next conversation.</p><a href="#feedback-format" className="home-text-link">Explore the feedback format <ArrowIcon /></a><div className="purpose-tags"><span>Clarity</span><span>Structure</span><span>Delivery</span></div></div>
        <FeedbackPreview />
      </section>
      <section className="home-container home-cta-wrap reveal" aria-labelledby="start-title"><div className="home-cta-banner"><Image src="/images/quiet-stone.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 1200px" quality={75} /><div className="cta-shade" aria-hidden="true" /><div className="home-cta-copy"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2 id="start-title">Start practicing today.</h2><p>A calmer mind. A clearer answer. A little more ready.</p><Link href="/interview/setup" className="glass-button glass-button--primary">Practice with Grillr <ArrowIcon /></Link></div></div></section>
      <section className="home-container home-section home-faq reveal" aria-labelledby="faq-title"><div><p className="eyebrow">BEFORE YOU BEGIN</p><h2 id="faq-title">A few good questions.</h2></div><div>{questions.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>
    </main>
  );
}
