# Grillr UI redesign — full changed source

Complete files as implemented. Design tokens, checklist, assumptions, and validation are in [UI-REDESIGN.md](UI-REDESIGN.md). The navbar layout and behavior are preserved; its original logo artwork is now a shared component.

## Changed file manifest

- `frontend/public/grillr-logo.svg`
- `frontend/components/GrillrLogo.tsx`
- `frontend/components/layout/top-nav.tsx`
- `frontend/components/ui/button.tsx`
- `frontend/app/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/history/page.tsx`
- `frontend/app/interview/[id]/page.tsx`
- `frontend/app/interview/setup/page.tsx`
- `frontend/app/login/page.tsx`
- `frontend/app/onboarding/page.tsx`
- `frontend/app/privacy/page.tsx`
- `frontend/app/signup/page.tsx`
- `frontend/app/globals.css`
- `frontend/app/error.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/not-found.tsx`
- `frontend/components/ConversationTurnBanner.tsx`
- `frontend/components/HomeCTA.tsx`
- `frontend/components/interview/InterviewSessionView.tsx`
- `frontend/components/interview/JobTitleAutocomplete.tsx`
- `frontend/components/interview/ScoreBar.tsx`
- `frontend/components/interview/SessionClock.tsx`
- `frontend/components/interview/SpeechAnalysis.tsx`
- `frontend/components/landing/FeedbackPreview.tsx`
- `frontend/components/landing/InterviewPreview.tsx`
- `frontend/components/landing/ScrollReveal.tsx`
- `frontend/components/layout/footer.tsx`
- `frontend/components/LiveInterviewCard.tsx`
- `frontend/components/OAuthButtons.tsx`
- `frontend/components/QuestionAudioPlayer.tsx`
- `frontend/components/ui/badge.tsx`
- `frontend/components/ui/card.tsx`
- `frontend/components/ui/input.tsx`
- `frontend/components/ui/select.tsx`
- `frontend/components/VoiceAnswerPanel.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/live-interview/AudioVisualizer.tsx`
- `frontend/src/components/live-interview/TranscriptPanel.tsx`
- `frontend/src/components/live-interview/VoiceInterviewPanel.tsx`

## frontend/components/ui/button.tsx

Changed file — complete source.

````tsx
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function GlassButton({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`glass-button glass-button--${variant} glass-button--${size} ${className}`}
    >
      {loading ? <span className="glass-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

// Keep existing consumers and their behavior unchanged.
export const Button = GlassButton;
````

## frontend/app/page.tsx

Changed file — complete source.

````tsx
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
````

## frontend/app/dashboard/page.tsx

Changed file — complete source.

````tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { ArrowIcon } from "@/components/landing/ArrowIcon";
import { useAuth } from "@/lib/auth-client";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard-api";
import { listInterviews, type InterviewListItem } from "@/lib/interview-api";

const dimensions = [
  { key: "clarity", label: "Clarity", tip: "Lead with your main point. Then explain it in two or three short sentences." },
  { key: "structure", label: "Structure", tip: "Set the scene, explain what you did, and finish with the result." },
  { key: "specificity", label: "Specificity", tip: "Choose one real example. Include your contribution and a measurable result." },
  { key: "communication", label: "Communication", tip: "Pause between ideas. Give each thought a clear beginning and ending." },
] as const;

function score(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}
function label(value: string) { return value.replace(/_/g, " "); }

function PracticeIcon({ kind = "voice" }: { kind?: "voice" | "sessions" | "score" | "roles" }) {
  const paths = {
    voice: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-3 0h6" /></>,
    sessions: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="m8 12 3 3 5-6" /></>,
    score: <><path d="M4 18V6m0 12h16M8 14l4-5 4 3 4-7" /></>,
    roles: <><rect x="3" y="7" width="18" height="14" rx="3" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a20 20 0 0 0 18 0m-9 0v3" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function SessionRow({ interview }: { interview: InterviewListItem }) {
  const completed = interview.status === "completed";
  const resumable = interview.status === "active" || interview.status === "created";
  const value = completed ? score(interview.overall_score) : null;
  const content = <>
    <span className="dashboard-session-icon"><PracticeIcon /></span>
    <span className="dashboard-session-description"><strong>{interview.job_role}</strong><span>{label(interview.interview_type)} · {formatDate(interview.completed_at ?? interview.created_at)}</span></span>
    <span className={`dashboard-session-status dashboard-session-status--${interview.status}`}>{completed ? "Completed" : interview.status === "created" ? "Ready to start" : resumable ? "In progress" : "Cancelled"}</span>
    <span className="dashboard-session-score">{value !== null ? <><strong>{value}</strong><small>/100</small></> : <span className="dashboard-session-action">{resumable ? "Resume" : completed ? "View results" : "—"}</span>}</span>{interview.status !== "cancelled" ? <ArrowIcon /> : null}
  </>;
  return <li>{interview.status === "cancelled" ? <div className="dashboard-session-row">{content}</div> : <Link href={`/interview/${interview.id}`} className="dashboard-session-row">{content}</Link>}</li>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [recentError, setRecentError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.allSettled([listInterviews(5), getDashboardStats()]).then(([recent, dashboardStats]) => {
      if (!active) return;
      setRecentError(recent.status === "rejected");
      setStatsError(dashboardStats.status === "rejected");
      if (recent.status === "fulfilled") setInterviews(recent.value.items);
      if (dashboardStats.status === "fulfilled") setStats(dashboardStats.value);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [reload]);

  function retry() { setIsLoading(true); setReload(value => value + 1); }
  const name = user?.name?.trim().split(/\s+/)[0];
  const resumable = recentError || isLoading ? undefined : interviews.find(item => item.status === "active" || item.status === "created");
  const measured = statsError ? [] : dimensions.flatMap(dimension => {
    const value = score(stats?.dimensions[dimension.key]);
    return value === null ? [] : [{ ...dimension, value }];
  });
  const focus = [...measured].sort((a, b) => a.value - b.value)[0];
  const average = statsError ? null : score(stats?.average_score);

  return <main className="dashboard-page">
    <TopNav />
    <div className="dashboard-container">
      <header className="dashboard-heading"><div><p className="eyebrow">YOUR PRACTICE SPACE</p><h1>{name ? `Welcome back, ${name}.` : "Make room for a better answer."}</h1><p>A little practice today. More confidence for what comes next.</p></div><Link href="/history" className="dashboard-text-link">Your interview history <ArrowIcon /></Link></header>
      <section className="dashboard-feature-grid" aria-label="Your next step">
        <div className="dashboard-practice-card">
          <div className="dashboard-practice-copy"><span className="dashboard-kicker"><span />{resumable ? "PICK UP WHERE YOU LEFT OFF" : "ONE CONVERSATION AT A TIME"}</span><h2>{resumable ? <>Your next answer<br />is waiting.</> : <>Build confidence.<br /><span>One answer at a time.</span></>}</h2><p>{resumable ? `Continue your ${resumable.job_role} interview when you’re ready.` : "A space to find your words, sharpen your thinking, and get comfortable being yourself."}</p><Link href={resumable ? `/interview/${resumable.id}` : "/interview/setup"} className="glass-button glass-button--primary">{resumable ? "Continue interview" : "Start a practice interview"}<ArrowIcon /></Link><span className="dashboard-practice-note">Your role. Your pace. Your next step.</span></div>
          <div className="dashboard-voice-art" aria-hidden="true"><div className="dashboard-orbit dashboard-orbit--outer" /><div className="dashboard-orbit dashboard-orbit--inner" /><div className="dashboard-voice-core"><PracticeIcon /></div><div className="dashboard-voice-bars">{[8, 16, 28, 17, 39, 51, 30, 43, 22, 34, 18, 9].map((height, i) => <span key={i} style={{ height }} />)}</div><span>PRACTICE. REFLECT. GROW.</span></div>
        </div>
        <aside className="dashboard-focus-card"><span className="dashboard-icon-tile"><PracticeIcon kind="score" /></span><p className="dashboard-overline">YOUR NEXT FOCUS</p><h2>{isLoading ? "Finding your next step…" : focus ? `Make ${focus.label.toLowerCase()} your strength.` : "Start with one good story."}</h2><p>{!isLoading && focus ? focus.tip : "Think of a challenge you faced, what you did, and what changed. A real example is a great place to begin."}</p><div className="dashboard-focus-footer">{!isLoading && focus ? <><span>Based on your feedback</span><strong>{focus.label} · {focus.value}/100</strong></> : <><span>A small step, a stronger answer</span><strong>Try situation → action → result</strong></>}</div></aside>
      </section>
      {(statsError || recentError) && !isLoading ? <div className="dashboard-error" role="alert"><div><strong>Some of your practice data couldn’t load.</strong><p>{statsError && recentError ? "Your progress is unavailable for now. You can still start a practice interview." : statsError ? "Your recent sessions are ready, but your scores couldn’t load." : "Your scores are ready, but recent sessions couldn’t load."}</p></div><button type="button" onClick={retry}>Try again</button></div> : null}
      {isLoading ? <div className="dashboard-loading" role="status"><span className="sr-only">Loading your practice dashboard</span><div className="dashboard-stats-grid">{[0, 1, 2].map(item => <div key={item} className="dashboard-skeleton dashboard-stat-skeleton" />)}</div><div className="dashboard-detail-grid"><div className="dashboard-skeleton dashboard-panel-skeleton" /><div className="dashboard-skeleton dashboard-panel-skeleton" /></div></div> : <>
        <section className="dashboard-stats-grid" aria-label="Practice overview">
          {[{ label: "Interviews completed", value: statsError ? "—" : stats?.interview_count ?? "—", note: stats?.interview_count ? "Every conversation is a step forward" : "Your first session is the starting line", icon: "sessions" as const }, { label: "Average score", value: average ?? "—", note: average !== null ? "Across your scored, completed interviews" : "Available after your first scored interview", icon: "score" as const }, { label: "Roles explored", value: statsError ? "—" : stats?.role_count ?? "—", note: "Across your completed interviews", icon: "roles" as const }].map(item => <article className="dashboard-stat" key={item.label}><div><p>{item.label}</p><PracticeIcon kind={item.icon} /></div><strong>{item.value}{item.label === "Average score" && average !== null ? <small>/100</small> : null}</strong><span>{statsError ? "Temporarily unavailable" : item.note}</span></article>)}
        </section>
        <div className="dashboard-detail-grid">
          <section className="dashboard-panel" aria-labelledby="recent-title"><div className="dashboard-panel-heading"><div><p className="dashboard-overline">KEEP THE MOMENTUM</p><h2 id="recent-title">Recent sessions</h2></div><Link href="/history" className="dashboard-text-link">View all <ArrowIcon /></Link></div>
            {recentError ? <div className="dashboard-empty"><span className="dashboard-icon-tile"><PracticeIcon kind="sessions" /></span><h3>Your sessions are temporarily unavailable.</h3><p>Try again to reconnect with your interview history.</p><button onClick={retry} type="button">Reload sessions</button></div> : interviews.length ? <ul className="dashboard-session-list">{interviews.map(interview => <SessionRow key={interview.id} interview={interview} />)}</ul> : <div className="dashboard-empty"><span className="dashboard-icon-tile"><PracticeIcon /></span><h3>Your first conversation starts here.</h3><p>Choose a role and answer out loud. Your sessions and feedback will have a home here.</p><Link href="/interview/setup" className="dashboard-text-link">Set up your first interview <ArrowIcon /></Link></div>}
          </section>
          <section className="dashboard-panel dashboard-profile" aria-labelledby="profile-title"><div className="dashboard-panel-heading"><div><p className="dashboard-overline">LEARN FROM EVERY ANSWER</p><h2 id="profile-title">Your skill snapshot</h2></div><span className="dashboard-out-of">/100</span></div><p className="dashboard-panel-caption">Average scores from completed interviews.</p>
            {measured.length ? <div className="dashboard-skills">{dimensions.map(dimension => {
              const value = score(stats?.dimensions[dimension.key]);
              return <div key={dimension.key}><div className="dashboard-skill-label">{value !== null ? <label htmlFor={`skill-${dimension.key}`}>{dimension.label}</label> : <span>{dimension.label}</span>}<strong>{value ?? "Not scored"}</strong></div>{value !== null ? <meter id={`skill-${dimension.key}`} min={0} max={100} value={value} className="dashboard-meter" /> : <div className="dashboard-meter-empty" aria-hidden="true" />}</div>;
            })}<p className="dashboard-profile-note">A snapshot of your practice, with room to grow.</p></div> : <div className="dashboard-empty dashboard-profile-empty"><span className="dashboard-unscored" aria-hidden="true">—</span><h3>{statsError ? "Your scores couldn’t load." : "Your strengths will take shape."}</h3><p>{statsError ? "Try again to see your skill snapshot." : "Finish a scored interview to discover what’s working and where to focus next."}</p></div>}
          </section>
        </div>
        <footer className="dashboard-footer"><span>Progress comes from showing up.</span><span>Practice. Reflect. Grow.</span></footer>
      </>}
    </div>
  </main>;
}
````

## frontend/app/history/page.tsx

Changed file — complete source.

````tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";
import { listInterviews, type InterviewListItem } from "@/lib/interview-api";

const pageSize = 20;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listInterviews(pageSize, 0, controller.signal)
      .then((response) => {
        setInterviews(response.items);
        setTotal(response.total);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "Unable to load interview history.");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  async function loadMore() {
    setIsLoadingMore(true);
    setError("");
    try {
      const response = await listInterviews(pageSize, interviews.length);
      setInterviews((current) => [...current, ...response.items]);
      setTotal(response.total);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to load more interview history.");
    } finally {
      setIsLoadingMore(false);
    }
  }
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Interview history</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">Your recent sessions</h1>
          </div>
          <Link href="/interview/setup">
            <Button>New interview</Button>
          </Link>
        </div>

        {error ? <p role="alert" className="mb-6 rounded-2xl border border-[var(--error)] bg-[var(--error-surface)] px-4 py-3 text-sm text-[var(--error)]">{error}</p> : null}

        {isLoading ? <div role="status" aria-label="Loading your interview history" className="space-y-4"><p className="text-sm text-[var(--muted)]">Loading your interview history...</p>{[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-[24px] bg-[var(--surface-raised)] motion-safe:animate-pulse" aria-hidden="true" />)}</div> : null}

        {!isLoading && !error && interviews.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">You haven&apos;t completed a practice interview yet</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Start a session to build your history and track your progress.</p>
            <Link href="/interview/setup" className="mt-5 inline-flex">
              <Button>Start an interview</Button>
            </Link>
          </Card>
        ) : null}

        {!isLoading && interviews.length > 0 ? <div className="space-y-4">
          {interviews.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <Badge className="bg-[var(--surface)] text-[var(--foreground)]">{formatLabel(item.interview_type)}</Badge>
                    <span className="text-sm text-[var(--muted)]">{formatDate(item.completed_at ?? item.created_at)}</span>
                  </div>
                  <p className="text-xl font-semibold text-[var(--foreground)]">{item.job_role}</p>
                  <p className="mt-1 text-sm capitalize text-[var(--muted)]">{formatLabel(item.status)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-[var(--muted)]">Score</p>
                    <p className="text-2xl font-semibold text-[var(--foreground)]">{item.overall_score ?? "-"}</p>
                  </div>
                  <Link href={`/interview/${item.id}`}>
                    <Button variant="secondary">View results</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div> : null}

        {!isLoading && interviews.length > 0 && interviews.length < total ? (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Loading more..." : `Load more (${total - interviews.length} remaining)`}
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
````

## frontend/app/interview/[id]/page.tsx

Changed file — complete source.

````tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";
import { VoiceAnswerPanel } from "@/components/VoiceAnswerPanel";
import type { TurnState } from "@/components/VoiceAnswerPanel";
import { ConversationTurnBanner } from "@/components/ConversationTurnBanner";
import { CodingWorkspace } from "@/components/interview/CodingWorkspace";
import { SessionClock } from "@/components/interview/SessionClock";
import { ScoreBar } from "@/components/interview/ScoreBar";
import {
  getInterview,
  getQuestions,
  getSummary,
  startInterview,
  type InterviewQuestion,
  type InterviewSession,
  type Summary,
} from "@/lib/interview-api";

function formatInterviewType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LoadingState() {
  return (
    <div aria-live="polite" className="interview-loading">
      <p className="interview-overline"><span className="interview-live-indicator" /> Preparing your interview room</p>
      <div className="interview-loading-title motion-safe:animate-pulse motion-reduce:animate-none" />
      <div className="interview-loading-panel motion-safe:animate-pulse motion-reduce:animate-none" />
      <p className="interview-loading-note">Getting your next question ready…</p>
    </div>
  );
}

function CompletionPanel({ summary }: { summary: Summary }) {
  return (
    <section
      aria-labelledby="completion-heading"
      className="interview-completion space-y-8"
      aria-live="polite"
    >
      <div className="interview-completion-heading border-b border-[var(--border)] pb-8">
        <Badge className="border-[var(--success)] bg-[var(--success-surface)] text-[var(--success)]">
          Interview complete
        </Badge>
        <h1
          id="completion-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]"
        >
          Your practice signal is ready.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Review the patterns from this session, then carry one clear
          improvement into your next answer.
        </p>
      </div>
      <ScoreBar value={summary.overall_score} />
      <div className="interview-completion-stats grid gap-5 border-b border-[var(--border)] pb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-2 border-[var(--border)] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Overall score
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {summary.overall_score}
          </p>
        </div>
        <div className="border-l-2 border-[var(--border)] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Questions
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {summary.total_questions}
          </p>
        </div>
        <div className="border-l-2 border-[var(--border)] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Average WPM
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {summary.average_wpm}
          </p>
        </div>
        <div className="border-l-2 border-[var(--border)] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Pauses
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {summary.total_pauses}
          </p>
        </div>
      </div>
      <div className="grid gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">What worked</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
            {summary.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recommendations
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
            {summary.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
        <Link href="/interview/setup">
          <Button variant="secondary">Practice again</Button>
        </Link>
      </div>
    </section>
  );
}

export default function InterviewSessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<
    "loading" | "ready" | "completed" | "error"
  >("loading");
  const [error, setError] = useState("");
  const [turnState, setTurnState] = useState<TurnState>("listening");
  const questionStartedAt = useRef<number | null>(null);

  const loadSession = useCallback(
    async (signal?: AbortSignal) => {
      setState("loading");
      setError("");
      const loaded = await getInterview(sessionId, signal);
      const active =
        loaded.status === "created"
          ? await startInterview(sessionId, signal)
          : loaded;
      setSession(active);
      if (active.status === "completed") {
        setSummary(await getSummary(sessionId, signal));
        setState("completed");
        return;
      }
      const questionData = await getQuestions(sessionId, signal);
      const unanswered = questionData.items.find((item) => !item.answered_at);
      if (!unanswered)
        throw new Error("This interview has no unanswered question.");
      setQuestion(unanswered);
      setTurnState("listening");
      questionStartedAt.current = Date.now();
      setState("ready");
    },
    [sessionId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => loadSession(controller.signal))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError")
          return;
        setError(
          caught instanceof Error
            ? caught.message
            : "We could not load this interview.",
        );
        setState("error");
      });
    return () => controller.abort();
  }, [loadSession]);

  const progress =
    session && question
      ? Math.min(
          100,
          ((question.question_number - 1) / session.question_count) * 100,
        )
      : 0;
  const wordCount = useMemo(
    () => (draft.trim() ? draft.trim().split(/\s+/).length : 0),
    [draft],
  );
  const isCodingQuestion = question?.question_type === "coding";

  const handleVoiceCompleted = useCallback(async () => {
    try {
      setSummary(await getSummary(sessionId));
      setTurnState("completed");
      setState("completed");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "We could not load interview results.");
      setState("error");
    }
  }, [sessionId]);

  const handleVoiceQuestionReady = useCallback(
    (nextQuestion: { id: string; text: string; questionNumber: number; questionType?: string; isFollowUp: boolean }) => {
      setQuestion({
        id: nextQuestion.id,
        question_number: nextQuestion.questionNumber,
        question_text: nextQuestion.text,
        question_type: nextQuestion.questionType ?? session?.interview_type ?? "behavioral",
        is_follow_up: nextQuestion.isFollowUp,
        answered_at: null,
      });
      questionStartedAt.current = Date.now();
      setTurnState("listening");
    },
    [session?.interview_type],
  );

  return (
    <main className="interview-room min-h-screen text-[var(--foreground)]">
      <a className="interview-skip-link" href="#interview-content">Skip to interview</a>
      <TopNav />
      <div id="interview-content" tabIndex={-1} className="interview-room-container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {state === "loading" ? (
          <LoadingState />
        ) : state === "completed" && summary ? (
          <CompletionPanel summary={summary} />
        ) : state === "error" ? (
          <section
            role="alert"
            className="max-w-xl border-l-2 border-[var(--border)] pl-5"
          >
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              We could not open this interview.
            </h1>
            <p className="mt-3 leading-7 text-[var(--muted)]">{error}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void loadSession()}>Try again</Button>
              <Link href="/dashboard">
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
            </div>
          </section>
        ) : session && question ? (
          <>
            <header className="interview-session-header">
              <div className="interview-session-title">
                <p className="interview-overline"><span className="interview-live-indicator" /> Live practice session <span className="interview-overline-separator">/</span> {formatInterviewType(session.interview_type)}</p>
                <h1>{session.job_role}</h1>
                <p className="interview-session-detail">{session.experience_level} level <span aria-hidden="true">·</span> {formatInterviewType(session.personality)} interviewer</p>
              </div>
              <div className="interview-progress">
                <SessionClock startedAt={session.started_at} />
                <div className="interview-progress-label"><span>Question <strong>{String(question.question_number).padStart(2, "0")}</strong> <span className="interview-progress-total">of {String(session.question_count).padStart(2, "0")}</span></span><span>{Math.round(progress)}% complete</span></div>
                <div className="interview-progress-track" role="progressbar" aria-label="Interview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>
              </div>
            </header>
            <section aria-labelledby="question-heading" className="interview-workspace">
              <div className="interview-main-column">
                <VoiceAnswerPanel
                  sessionId={session.id}
                  questionText={question.question_text}
                  hidden={state !== "ready"}
                  disabled={state !== "ready" || turnState === "asking" || turnState === "processing"}
                  onTranscript={setDraft}
                  onRecordingChange={(recording) => { if (recording) setDraft(""); }}
                  onTurnStateChange={setTurnState}
                  onQuestionReady={handleVoiceQuestionReady}
                  onCompleted={handleVoiceCompleted}
                />
                <div className="interview-prompt">
                  <div className="interview-prompt-topline">
                    <div className="interview-question-mark" aria-hidden="true">{isCodingQuestion ? "{ }" : "Q"}</div>
                    <div className="interview-interviewer-copy"><span>{isCodingQuestion ? "Coding challenge" : "Interview question"}</span><span>{formatInterviewType(session.personality)} style · {formatInterviewType(session.interview_type)} round</span></div>
                    <span className="interview-prompt-label">{question.is_follow_up ? "FOLLOW-UP" : `QUESTION ${String(question.question_number).padStart(2, "0")}`}</span>
                  </div>
                  <div className="interview-prompt-rule" />
                  <p className="interview-overline">{question.is_follow_up ? "A follow-up for you" : isCodingQuestion ? "Your coding prompt" : "Your question"}</p>
                  <h2 id="question-heading">{question.question_text}</h2>
                  <p className="interview-prompt-hint">{isCodingQuestion ? "Clarify the examples, talk through your approach, then work through the implementation at your own pace." : "Take a moment to collect your thoughts. Answer as you would in a real conversation; there is no need to rush."}</p>
                  <div className="interview-prompt-foot"><span><span className="interview-live-indicator" /> {turnState === "asking" ? "Interviewer is speaking" : turnState === "processing" ? "Reviewing your response" : "Interview in progress"}</span><span>{session.experience_level} level</span></div>
                </div>
                {isCodingQuestion ? <CodingWorkspace key={question.id} questionId={question.id} /> : null}
                <ConversationTurnBanner state={turnState} />
                <div className="interview-transcript" aria-label="Recorded answer transcript">
                  <div className="interview-answer-header"><div><p className="interview-overline">Your response</p><h3>{wordCount > 0 ? "Your last recorded answer" : "Your words will appear here"}</h3></div><span className="interview-word-count"><strong>{wordCount}</strong> {wordCount === 1 ? "word" : "words"}</span></div>
                  <p className={wordCount > 0 ? "interview-transcript-copy" : "interview-transcript-placeholder"} aria-live="polite">{draft || "Start recording when you’re ready. Your transcript will appear here after you stop recording."}</p>
                </div>
              </div>
              <aside className="interview-sidebar" aria-label="Interview guidance">
                <div className="interview-sidebar-section"><p className="interview-overline">In this round</p><h3 className="interview-sidebar-heading">{formatInterviewType(session.interview_type)}</h3><p className="interview-sidebar-copy">{session.experience_level} level · {formatInterviewType(session.personality)} interview style</p></div>
                <div className="interview-sidebar-section"><p className="interview-overline">{isCodingQuestion ? "How to approach it" : "A useful answer"}</p><ol className="interview-answer-cues"><li><span>01</span><div><strong>{isCodingQuestion ? "Clarify" : "Be direct"}</strong><small>{isCodingQuestion ? "Confirm inputs and edge cases." : "Lead with your main point."}</small></div></li><li><span>02</span><div><strong>{isCodingQuestion ? "Explain" : "Get specific"}</strong><small>{isCodingQuestion ? "Share a simple plan before coding." : "Use a real example or detail."}</small></div></li><li><span>03</span><div><strong>{isCodingQuestion ? "Review" : "Close the loop"}</strong><small>{isCodingQuestion ? "Check complexity and edge cases." : "Share the result or takeaway."}</small></div></li></ol></div>
                <div className="interview-sidebar-note"><span aria-hidden="true">i</span><p>{isCodingQuestion ? "Your code draft is saved only in this browser. Use the microphone to explain your reasoning." : "Take a breath between thoughts. The microphone picks up your answer as you speak."}</p></div>
              </aside>
            </section>
            <div className="interview-exit"><Link href="/dashboard">← <span>Exit interview</span></Link><span>One question at a time</span></div>
          </>
        ) : null}
      </div>
    </main>
  );
}
````

## frontend/app/interview/setup/page.tsx

Changed file — complete source.

````tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JobTitleAutocomplete } from "@/components/interview/JobTitleAutocomplete";
import { Select } from "@/components/ui/select";
import { TopNav } from "@/components/layout/top-nav";
import { createInterview } from "@/lib/interview-api";

type SetupFormState = {
  interviewType: "technical" | "behavioral" | "hr";
  jobTitle: string;
  experienceLevel: "mid" | "junior" | "senior";
  difficulty: "medium" | "easy" | "hard";
  personality: "professional" | "friendly" | "tough";
  duration: "30" | "15" | "45";
  questionCount: number;
  jobDescription: string;
};

const initialFormState: SetupFormState = {
  interviewType: "technical",
  jobTitle: "",
  experienceLevel: "mid",
  difficulty: "medium",
  personality: "professional",
  duration: "30",
  questionCount: 5,
  jobDescription: "",
};

export default function InterviewSetupPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<SetupFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField<Key extends keyof SetupFormState>(
    field: Key,
    value: SetupFormState[Key],
  ) {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
    setError("");
  }

  async function handleSubmit() {
    if (!formState.jobTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const interview = await createInterview({
        interview_type: formState.interviewType,
        job_role: formState.jobTitle.trim(),
        experience_level: formState.experienceLevel,
        difficulty: formState.difficulty,
        personality: formState.personality,
        duration: Number(formState.duration),
        question_count: formState.questionCount,
        job_description: formState.jobDescription.trim() || undefined,
      });
      router.push(`/interview/${interview.id}`);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not create this interview.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen text-[var(--foreground)]">
      <TopNav />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Interview setup
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              Start your mock interview
            </h1>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <form
            className="grid gap-6 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="interviewType"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Interview type
              </label>
              <Select
                id="interviewType"
                name="interviewType"
                value={formState.interviewType}
                onChange={(value) =>
                  updateField(
                    "interviewType",
                    value as SetupFormState["interviewType"],
                  )
                }
                options={[
                  { value: "technical", label: "Technical" },
                  { value: "behavioral", label: "Behavioral" },
                  { value: "hr", label: "HR" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="jobTitle"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Job title
              </label>
              <p className="-mt-1 text-xs leading-5 text-[var(--muted)]">
                What role are you preparing for?
              </p>
              <JobTitleAutocomplete
                value={formState.jobTitle}
                onChange={(value) => updateField("jobTitle", value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="experienceLevel"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Experience level
              </label>
              <Select
                id="experienceLevel"
                name="experienceLevel"
                value={formState.experienceLevel}
                onChange={(value) =>
                  updateField(
                    "experienceLevel",
                    value as SetupFormState["experienceLevel"],
                  )
                }
                options={[
                  { value: "mid", label: "Mid" },
                  { value: "junior", label: "Junior" },
                  { value: "senior", label: "Senior" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="difficulty"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Difficulty
              </label>
              <Select
                id="difficulty"
                name="difficulty"
                value={formState.difficulty}
                onChange={(value) =>
                  updateField(
                    "difficulty",
                    value as SetupFormState["difficulty"],
                  )
                }
                options={[
                  { value: "medium", label: "Medium" },
                  { value: "easy", label: "Easy" },
                  { value: "hard", label: "Hard" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="personality"
                className="text-sm font-medium text-[var(--muted)]"
              >
                AI personality
              </label>
              <Select
                id="personality"
                name="personality"
                value={formState.personality}
                onChange={(value) =>
                  updateField(
                    "personality",
                    value as SetupFormState["personality"],
                  )
                }
                options={[
                  { value: "professional", label: "Professional" },
                  { value: "friendly", label: "Friendly" },
                  { value: "tough", label: "Tough" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="duration"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Duration
              </label>
              <Select
                id="duration"
                name="duration"
                value={formState.duration}
                onChange={(value) =>
                  updateField("duration", value as SetupFormState["duration"])
                }
                options={[
                  { value: "30", label: "30 minutes" },
                  { value: "15", label: "15 minutes" },
                  { value: "45", label: "45 minutes" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="questionCount"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Number of questions
              </label>
              <select
                id="questionCount"
                name="questionCount"
                value={formState.questionCount}
                onChange={(event) =>
                  updateField("questionCount", Number(event.target.value))
                }
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none backdrop-blur-sm focus:border-[var(--border)]"
              >
                {Array.from({ length: 20 }, (_, index) => index + 1).map(
                  (count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "question" : "questions"}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="jobDescription"
                className="text-sm font-medium text-[var(--muted)]"
              >
                Job description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formState.jobDescription}
                onChange={(event) =>
                  updateField("jobDescription", event.target.value)
                }
                rows={5}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none backdrop-blur-sm focus:border-[var(--border)]"
                placeholder="Paste the job description or key responsibilities here..."
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="md:col-span-2 border-l-2 border-[var(--border)] pl-3 text-sm leading-6 text-[var(--error)]"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/dashboard"
                className="text-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Cancel
              </Link>
              <Button
                size="lg"
                type="submit"
                disabled={!formState.jobTitle.trim() || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Creating interview..." : "Begin interview"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
````

## frontend/app/login/page.tsx

Changed file - complete source.

````tsx
"use client";

import { GrillrLogo, GrillrBrand } from "@/components/GrillrLogo";
import Link from "next/link";
import { OAuthButtons } from "@/components/OAuthButtons";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function oauthErrorMessage(code: string | null) {
  const messages: Record<string, string> = {
    cancelled: "Sign-in was cancelled. You can try again.",
    invalid_callback: "The sign-in response was invalid. Please try again.",
    exchange_failed: "We could not complete sign-in with the provider. Please try again.",
    account_sync_failed: "Your provider sign-in succeeded, but we could not prepare your Grillr account.",
    provider_unavailable: "The authentication provider is unavailable. Please try again later.",
    unsupported_provider: "That sign-in provider is not supported.",
  };
  return messages[code ?? ""] ?? "";
}

function LoginContent() {
  const searchParams = useSearchParams();
  const message = oauthErrorMessage(searchParams.get("oauth_error"));
  const requestedNext = searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  return (
    <main className="login-page min-h-screen bg-[var(--surface)] px-3 py-3 text-[var(--foreground)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="login-surface mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[var(--surface)] px-6 py-10 text-[var(--foreground)] sm:px-10 sm:py-12 lg:block lg:px-12 lg:py-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[var(--border)]" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[var(--border)]" />
          <div className="relative flex h-full flex-col">
            <GrillrBrand size={40} />
            <div className="my-auto max-w-md py-8 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Interview practice, with a pulse</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Practice interviews that talk back.</h1>
              <p className="mt-4 max-w-sm text-base leading-7 text-[var(--muted)]">Build the clarity, confidence, and composure to make your next answer count.</p>
            </div>
            <p className="text-xs text-[var(--muted)]">A calmer way to get interview-ready.</p>
          </div>
        </section>

        <section className="login-auth-panel relative flex min-h-full items-center justify-center overflow-hidden px-6 py-12 sm:px-12 sm:py-14 lg:px-14 lg:py-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[var(--border)]" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[var(--border)]" />
          <div className="relative w-full max-w-md text-center">
            <Link href="/" className="auth-home">← Back to Grillr</Link>
            <div className="mx-auto w-fit"><GrillrLogo size={56} /></div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">Your next answer starts here.</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">Use your existing Google or GitHub account to continue practicing.</p>

            {message ? <div role="alert" className="mt-6 rounded-2xl border border-[var(--error)] bg-[var(--error-surface)] px-4 py-3 text-left text-sm text-[var(--error)]">{message}</div> : null}

            <div className="mx-auto mt-8 w-full max-w-sm"><OAuthButtons next={nextPath} /></div>
            <p className="mx-auto mt-6 max-w-sm text-xs leading-5 text-[var(--muted)]">New to Grillr? Just sign in. We&apos;ll set up your account automatically.</p>
            <p className="mt-10 text-[11px] leading-5 text-[var(--muted)]">By continuing, you agree to our Terms and Privacy Policy.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="auth-skeleton" role="status" aria-label="Loading sign-in"><div /><div /><div /></div>}><LoginContent /></Suspense>;
}
````

## frontend/app/onboarding/page.tsx

Changed file - complete source.

````tsx
import Link from "next/link";
import { GrillrBrand } from "@/components/GrillrLogo";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 py-12">
      <section className="w-full max-w-xl rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-soft)] sm:p-12">
        <div className="flex justify-center"><GrillrBrand /></div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Your workspace is ready
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
          Choose an interview setup when you are ready to begin practicing.
        </p>
        <Link
          href="/interview/setup"
          className="glass-button glass-button--primary mt-8"
        >
          Start an interview
        </Link>
      </section>
    </main>
  );
}
````

## frontend/app/privacy/page.tsx

Changed file — complete source.

````tsx
import { TopNav } from "@/components/layout/top-nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <TopNav />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <header className="max-w-2xl border-b border-[var(--border)] pb-12 sm:pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Grillr / Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 text-sm font-medium text-[var(--muted)]">Effective date: September 5, 2026</p>
          <p className="mt-8 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Grillr handles the data created during interview practice with care. This policy explains what we collect, why we use it, and the choices you have over your information.
          </p>
        </header>

        <ol className="m-0 list-none p-0">
          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">01</p>
            <section aria-labelledby="information-we-collect">
              <h2 id="information-we-collect" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Information we collect</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Grillr is an AI-powered mock interview tool. To run practice sessions and provide feedback, we collect:</p>
              <ul className="mt-5 space-y-4 leading-7 text-[var(--muted)]">
                <li><strong className="font-semibold text-[var(--foreground)]">Account information:</strong> your name and email address when you create an account.</li>
                <li><strong className="font-semibold text-[var(--foreground)]">Interview audio and responses:</strong> your spoken answers during a session, so we can analyze speech and generate feedback.</li>
                <li><strong className="font-semibold text-[var(--foreground)]">Session activity:</strong> questions asked, generated follow-ups, and progress across sessions.</li>
              </ul>
              <aside className="mt-8 flex gap-3 border-l-2 border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]" aria-label="Privacy reassurance">
                <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3 19 6v5c0 4.6-2.9 8.2-7 10-4.1-1.8-7-5.4-7-10V6l7-3Z" />
                  <rect x="9" y="10" width="6" height="5" rx="1" />
                  <path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10" />
                </svg>
                <p>We do not collect passwords in plain text, payment card details, or audio from outside an active practice session.</p>
              </aside>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">02</p>
            <section aria-labelledby="how-we-use-your-data">
              <h2 id="how-we-use-your-data" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">How we use your data</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">The information we collect is used only to power Grillr&apos;s core features:</p>
              <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[var(--muted)] marker:text-[var(--muted)]">
                <li>Analyze speech for pace, clarity, and confidence.</li>
                <li>Generate follow-up questions based on your answers.</li>
                <li>Produce feedback after each session.</li>
                <li>Track progress across retries so you can see improvement over time.</li>
              </ul>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">03</p>
            <section aria-labelledby="data-processing">
              <h2 id="data-processing" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Data processing and third parties</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Interview audio and transcripts may be processed through Grillr&apos;s AI provider API to generate feedback and follow-up questions. Grillr does not sell data or share recordings or transcripts with advertisers or data brokers.</p>
            </section>
          </li>

          <li className="grid gap-3 border-b border-[var(--border)] py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">04</p>
            <section aria-labelledby="storage-retention-controls">
              <h2 id="storage-retention-controls" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Data storage, retention, and your controls</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Recordings and transcripts are kept only as long as necessary for feedback and progress tracking. You can:</p>
              <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[var(--muted)] marker:text-[var(--muted)]">
                <li>Delete individual session recordings.</li>
                <li>Request a full export of your data.</li>
                <li>Delete your account, including recordings, transcripts, and personal information.</li>
              </ul>
            </section>
          </li>

          <li className="grid gap-3 py-10 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-12">
            <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--muted)]">05</p>
            <section aria-labelledby="contact-us">
              <h2 id="contact-us" className="text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">Contact us</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">Questions about this policy, or requests to access, correct, export, or delete your data, can be sent to:</p>
              <a href="mailto:thegrillrai@gmail.com" className="mt-5 inline-block break-all text-base font-semibold text-[var(--foreground)] underline decoration-[var(--border)] decoration-2 underline-offset-4 transition hover:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-white" aria-label="Email Grillr privacy support at thegrillrai@gmail.com">thegrillrai@gmail.com</a>
            </section>
          </li>
        </ol>
      </article>
    </main>
  );
}
````

## frontend/app/signup/page.tsx

Changed file - complete source.

````tsx
"use client";

import { GrillrBrand, GrillrLogo } from "@/components/GrillrLogo";
import Link from "next/link";
import { OAuthButtons } from "@/components/OAuthButtons";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4"><path fill="#4285F4" d="M21.35 12.22c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z" /><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.7Z" /><path fill="#FBBC05" d="M6.54 13.79A5.85 5.85 0 0 1 6.24 12c0-.62.11-1.23.3-1.79V7.69H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.06 1.03 4.31l3.24-2.52Z" /><path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z" /></svg>;
}

export function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M12 .7a11.3 11.3 0 0 0-3.58 22.02c.57.1.78-.25.78-.55v-2.13c-3.17.69-3.84-1.34-3.84-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.53-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.12 1.17a10.82 10.82 0 0 1 5.68 0c2.16-1.48 3.12-1.17 3.12-1.17.62 1.58.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.39-2.67 5.35-5.21 5.64.41.36.78 1.06.78 2.14v3.11c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" /></svg>;
}

function SignupContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("oauth_error") ? "Sign-in could not be completed. Please try again." : "";

  function moveBackground(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--signup-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--signup-y", `${event.clientY}px`);
  }

  return (
    <main onPointerMove={moveBackground} className="signup-page min-h-screen bg-[var(--surface)] px-3 py-3 text-[var(--foreground)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="signup-surface mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[var(--surface)] px-6 py-10 text-[var(--foreground)] lg:block sm:px-10 sm:py-12 lg:px-12 lg:py-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[var(--border)]" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-[var(--border)]" />
          <div className="relative flex h-full flex-col">
            <Link href="/" aria-label="Grillr home"><GrillrBrand size={40} /></Link>
            <div className="my-auto max-w-md py-8 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Interview practice, with a pulse</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Practice interviews that talk back.</h1>
              <p className="mt-4 max-w-sm text-base leading-7 text-[var(--muted)]">Build the clarity, confidence, and composure to make your next answer count.</p>
              <ul className="mt-7 space-y-3">{["Real-time AI-generated follow-up questions", "Live speech analysis for pace and clarity", "Honest, structured feedback after each session", "Retry-based coaching that tracks improvement"].map((feature) => <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-bold text-[var(--foreground)]">✓</span>{feature}</li>)}</ul>
            </div>
            <p className="text-xs text-[var(--muted)]">A calmer way to get interview-ready.</p>
          </div>
        </section>

        <section className="flex min-h-full items-center justify-center px-6 py-10 sm:px-12 sm:py-12 lg:px-14 lg:py-8">
          <div className="w-full max-w-md text-center">
            <Link href="/" className="auth-home">← Back to Grillr</Link>
            <div className="mx-auto mb-6 w-fit"><GrillrLogo size={56} /></div>
            <p className="eyebrow justify-center">MAKE ROOM TO GROW</p>
            <h2 className="auth-title">Find your voice.</h2>
            <p className="auth-subtitle mt-4 text-sm leading-6">Your next great answer starts with a little practice.</p>
            {message ? <div role="alert" className="mb-5 rounded-2xl border border-[var(--error)] bg-[var(--error-surface)] px-4 py-3 text-left text-sm text-[var(--error)]">{message}</div> : null}
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use your existing Google or GitHub account to get started.</p>
            <div className="mx-auto mt-7 w-full max-w-sm"><OAuthButtons /></div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return <Suspense fallback={<div className="auth-skeleton" role="status" aria-label="Loading sign-up"><div /><div /><div /></div>}><SignupContent /></Suspense>;
}
````

## frontend/app/globals.css

Changed file - complete source.

````css
@import "tailwindcss";

:root {
  color-scheme: dark;
  --background: #0a0a0b;
  --foreground: #f5f5f7;
  --muted: #9a9aa2;
  --caption: #8b8b95;
  --surface: #131315;
  --surface-raised: #1a1a1d;
  --card: #131315;
  --card-strong: #1a1a1d;
  --border: rgba(255,255,255,.08);
  --border-strong: rgba(255,255,255,.14);
  --accent: #f5f5f7;
  --accent-strong: #ffffff;
  --focus-ring: rgba(255,255,255,.4);
  --success: #a2c6b0;
  --success-surface: #18271f;
  --warning: #d4bc93;
  --warning-surface: #2b241b;
  --error: #e2a6a4;
  --error-surface: #2c1c1f;
  --space: .5rem;
  --radius-card: 24px;
  --radius-control: 14px;
  --radius-pill: 999px;
  --shadow-soft: 0 8px 24px rgba(0,0,0,.15);
  --shadow-card: 0 20px 60px rgba(0,0,0,.24);
  --shadow-glass: inset 0 1px 0 rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.2);
  --text-hero: clamp(4rem, 2.5rem + 5vw, 7.25rem);
  --text-title: clamp(2rem, 1.2rem + 2.6vw, 3.5rem);
  --text-body: 1rem;
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 100px; background: var(--background); }
body { margin: 0; background: var(--background); color: var(--foreground); font-family: var(--font-geist-sans),Arial,Helvetica,sans-serif; }
button,input,select,textarea { font: inherit; }
::selection { background: rgba(255,255,255,.2); }
.app-frame { min-height: 100vh; background: var(--background); color: var(--foreground); }
/* Body content only: navbar typography, colors and touch targets are excluded. */
main :where(h1,h2,h3,p,li):not(.grillr-nav-shell *) { overflow-wrap: break-word; }
main :where(h1,h2,h3):not(.grillr-nav-shell *) { letter-spacing: -.045em; }
main :where(h1,h2):not(.grillr-nav-shell *) { text-wrap: balance; }
main :where(a,button,input,select,textarea,summary,[tabindex="0"]):not(.grillr-nav-shell *):focus-visible,
.site-footer a:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 4px; }
.surface-card { border: 1px solid var(--border); border-radius: var(--radius-card); background: var(--surface); box-shadow: var(--shadow-card); }
.field-input,
main :where(input:not([type="range"]):not([type="hidden"]):not([type="checkbox"]),select,textarea):not(.grillr-nav-shell *) {
  min-height: 48px; border: 1px solid var(--border-strong); border-radius: var(--radius-control); color: var(--foreground); background: #101012; outline-offset: 3px; transition: border-color 250ms ease-out,box-shadow 250ms ease-out;
}
main :where(input,select,textarea):not(.grillr-nav-shell *):focus { border-color: rgba(255,255,255,.4); box-shadow: 0 0 0 3px rgba(255,255,255,.06); }
main :where(input,textarea)::placeholder { color: var(--caption); opacity: 1; }
main option { color: var(--foreground); background: var(--surface-raised); }
main input[type="range"], main input[type="checkbox"] { accent-color: #dddde2; }
main [aria-invalid="true"] { border-color: var(--error); }
main [role="listbox"] { background: var(--surface-raised); border-color: var(--border-strong); }
main [role="option"][aria-selected="true"], main button[aria-pressed="true"]:not(.grillr-nav-shell *) { border-color: rgba(255,255,255,.3); }

/* One glass system for native controls, linked CTAs, and explicit variants. */
.glass-button,
main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)),
.landing-button,
main :where(a).oauth-button {
  --glass-fill: rgba(255,255,255,.075);
  --glass-hover: rgba(255,255,255,.13);
  --glass-ink: #f5f5f7;
  --glass-solid: #242427;
  display: inline-flex; min-height: 44px; align-items: center; justify-content: center; gap: 10px;
  border: 1px solid var(--border-strong); border-radius: var(--radius-control); padding: 10px 18px;
  color: var(--glass-ink); background: var(--glass-fill); box-shadow: var(--shadow-glass);
  -webkit-backdrop-filter: blur(18px) saturate(140%); backdrop-filter: blur(18px) saturate(140%);
  font-size: .875rem; font-weight: 500; line-height: 1.4; text-decoration: none; cursor: pointer;
  transition: background 250ms ease-out,border-color 250ms ease-out,transform 250ms ease-out,box-shadow 250ms ease-out;
}
.glass-button:hover,
main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)):hover,
.landing-button:hover,
main :where(a).oauth-button:hover { color: var(--glass-ink); background: var(--glass-hover); border-color: rgba(255,255,255,.3); transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.22),0 10px 24px rgba(0,0,0,.25); }
.glass-button:active,main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)):active,.landing-button:active { transform: scale(.98); }
.glass-button:disabled,main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)):disabled,
.glass-button[aria-disabled="true"] { opacity: .4; pointer-events: none; }
main .glass-button--primary,main .landing-button-primary {
  --glass-fill: rgba(255,255,255,.92); --glass-hover: #fff; --glass-ink: #111113; --glass-solid: #f0f0f2;
  border-color: rgba(255,255,255,.8); border-radius: var(--radius-pill);
}
main .glass-button--secondary,main .landing-button-secondary { border-radius: var(--radius-pill); }
main .glass-button--ghost { --glass-fill: rgba(255,255,255,.025); --glass-hover: rgba(255,255,255,.09); border-color: rgba(255,255,255,.06); border-radius: var(--radius-pill); box-shadow: inset 0 1px 0 rgba(255,255,255,.06); }
main .glass-button--icon { --glass-fill: rgba(255,255,255,.035); width: 44px; min-width: 44px; border-radius: 14px; padding: 10px; }
main .glass-button--sm { min-height: 44px; padding-inline: 15px; font-size: .8125rem; }
main .glass-button--lg { min-height: 52px; padding-inline: 24px; }
.glass-button svg,.landing-button svg { width: 17px; height: 17px; flex: 0 0 auto; }
.glass-spinner { width: 15px; height: 15px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: glass-spin .8s linear infinite; }
@keyframes glass-spin { to { transform: rotate(360deg); } }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-button,main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)),.landing-button,main :where(a).oauth-button { background: var(--glass-solid); }
}

.landing-page { --landing-ink: #f1f0eb; position: relative; isolation: isolate; min-height: 100vh; background: var(--background); color: var(--foreground); }
.home-container { width: min(1200px,calc(100% - 80px)); margin-inline: auto; }
.eyebrow { display: flex; align-items: center; gap: 12px; margin: 0; color: #a6a6ae; font-size: .625rem; font-weight: 500; line-height: 1.7; letter-spacing: .25em; text-transform: uppercase; }
.eyebrow-rule { width: 24px; height: 1px; background: #aaaab3; }
.home-hero { position: relative; isolation: isolate; overflow: hidden; padding: clamp(72px,8vw,120px) 0 84px; }
.hero-texture { z-index: -3; object-fit: cover; object-position: center 58%; opacity: .2; filter: grayscale(1) brightness(.7); }
.hero-shade { position: absolute; z-index: -2; inset: 0; background: linear-gradient(90deg,#0a0a0b 1%,rgba(10,10,11,.87) 36%,rgba(10,10,11,.25) 76%,rgba(10,10,11,.56)),linear-gradient(0deg,#0a0a0b,transparent 28%,transparent 75%,#0a0a0b); }
.home-hero-grid { display: grid; grid-template-columns: 1fr 1.06fr; align-items: center; gap: 48px; }
.hero-copy { z-index: 1; }
.hero-copy h1 { margin: 25px 0 27px; font-size: var(--text-hero); font-weight: 400; letter-spacing: -.065em; line-height: .99; }
.hero-copy h1 span { color: #b7b7bf; background: linear-gradient(110deg,#f5f5f7 3%,#81818c 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero-description { max-width: 380px; margin: 0; color: var(--muted); font-size: .9375rem; line-height: 1.8; }
.landing-cta-row { display: flex; flex-wrap: wrap; gap: 10px; min-height: 48px; margin-top: 30px; }
.landing-cta-placeholder { min-height: 48px; width: 100%; margin-top: 30px; border-radius: 999px; }
.hero-note { margin: 18px 0 0; color: var(--caption); font-size: .6875rem; }
.hero-note span { margin-inline: 7px; }
.hero-explore { display: inline-flex; min-height: 44px; align-items: center; margin-top: 8px; color: var(--muted); font-size: .75rem; text-decoration: none; }
.hero-explore:hover { color: white; }
.laptop-scene { position: relative; min-width: 0; padding: 40px 0; perspective: 1200px; }
.laptop-halo { position: absolute; inset: -60px -60px -20px; border-radius: 50%; background: radial-gradient(ellipse,rgba(255,255,255,.08),transparent 65%); pointer-events: none; }
.laptop-device { position: relative; width: min(100% - 24px,560px); margin-inline: auto; transform: rotateY(-10deg) rotateX(6deg) rotateZ(-2deg); }
.laptop-screen { position: relative; display: flex; flex-direction: column; aspect-ratio: 16 / 10; border: 5px solid #232326; border-bottom-width: 10px; border-radius: 13px 13px 4px 4px; padding: 12px 18px 10px; background: linear-gradient(145deg,#1a1a1c,#0e0e10 66%); box-shadow: 0 1px 0 rgba(255,255,255,.25),0 36px 80px rgba(0,0,0,.65),inset 0 0 0 1px #38383d; }
.laptop-camera { position: absolute; top: -4px; left: calc(50% - 2px); width: 4px; height: 4px; border-radius: 50%; background: #070708; }
.preview-toolbar { display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 7px; }
.preview-brand { display: flex; align-items: center; gap: 9px; font-size: .9375rem; }
.preview-brand > span { font-size: .75rem; letter-spacing: -.04em; }
.preview-time { margin-left: auto; color: #b5b5bd; font-family: var(--font-geist-mono),monospace; font-size: .625rem; }
.preview-live { display: flex; align-items: center; gap: 5px; border: 1px solid var(--border); border-radius: 999px; padding: 4px 8px; color: var(--success); background: rgba(162,198,176,.05); font-size: .5625rem; }
.preview-live i { width: 4px; height: 4px; border-radius: 50%; background: var(--success); }
.preview-question { padding: 14px 12px 0; text-align: center; }
.preview-question .eyebrow { display: block; font-size: .5rem; }
.preview-question h2 { max-width: 340px; margin: 8px auto 0; font-size: clamp(1rem,.8rem + .35vw,1.1875rem); font-weight: 400; line-height: 1.35; }
.preview-question p { display: none; }
.preview-waveform { display: flex; flex: 1; min-height: 36px; max-height: 64px; justify-content: center; align-items: center; gap: 4px; margin-block: 4px; }
.preview-waveform span { width: 3px; height: var(--bar-height); border-radius: 10px; background: linear-gradient(#e8e8ed,#777781); transform-origin: center; animation: voice-wave 2s ease-in-out var(--bar-delay) infinite alternate; }
.preview-waveform.is-paused span { animation-play-state: paused; opacity: .3; }
@keyframes voice-wave { from { transform: scaleY(.45); opacity: .45; } to { transform: scaleY(1); opacity: .9; } }
.preview-listening { min-height: 12px; margin: 0 0 8px; color: var(--muted); font-size: .5625rem; text-align: center; }
.preview-controls { display: flex; min-height: 44px; align-items: center; justify-content: center; gap: 8px; }
.preview-controls .glass-button { font-size: .625rem; }
.preview-controls .glass-button--icon { width: 44px; }
.preview-stop { width: 7px; height: 7px; border-radius: 2px; background: #b9a3a5; }
.preview-footnote { margin-top: 9px; color: var(--caption); font-size: .4375rem; letter-spacing: .12em; text-align: center; }
.laptop-base { position: relative; width: calc(100% + 64px); height: 24px; margin-left: -32px; border: 1px solid #505055; border-top: 7px solid #39393e; border-bottom: 4px solid #171719; border-radius: 3px 3px 35% 35% / 3px 3px 100% 100%; background: linear-gradient(#535359,#252528); box-shadow: 0 24px 36px #000; }
.laptop-base span { display: block; width: 90px; height: 4px; margin: 0 auto; border-radius: 0 0 7px 7px; background: #202023; }
.laptop-caption { display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 34px; color: var(--caption); font-size: .6875rem; letter-spacing: .01em; }
.laptop-caption span { width: 20px; height: 1px; background: #595961; }
.stat-strip { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); border-block: 1px solid var(--border); padding-block: 30px; }
.stat-strip > div { display: flex; align-items: baseline; gap: 20px; padding-inline: 32px; }
.stat-strip > div:first-child { padding-left: 0; }
.stat-strip > div + div { border-left: 1px solid var(--border); }
.stat-number { color: var(--caption); font-family: var(--font-geist-mono),monospace; font-size: .6875rem; }
.stat-strip h2 { margin: 0 0 5px; font-size: .9375rem; font-weight: 450; }
.stat-strip p { margin: 0; color: var(--caption); font-size: .75rem; }
.home-section { padding-block: 104px; border-bottom: 1px solid var(--border); }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 48px; }
.home-section h2 { margin: 18px 0 0; font-size: var(--text-title); font-weight: 400; letter-spacing: -.05em; line-height: 1.12; }
.section-heading > p { max-width: 290px; margin: 0 0 3px; color: var(--muted); font-size: .875rem; line-height: 1.8; }
.home-steps { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 48px; margin-top: 55px; }
.step-top { display: flex; align-items: center; gap: 18px; }
.icon-tile { display: grid; width: 48px; height: 48px; flex: 0 0 auto; place-items: center; border: 1px solid var(--border-strong); border-radius: 14px; color: #d0d0d7; background: linear-gradient(145deg,#202023,#131315); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
.icon-tile svg { width: 21px; height: 21px; }
.step-connector { width: 100%; height: 1px; background: var(--border); }
.step-number { color: var(--caption); font-family: var(--font-geist-mono),monospace; font-size: .625rem; }
.home-steps h3 { margin: 25px 0 12px; font-size: 1.0625rem; font-weight: 450; }
.home-steps p { max-width: 310px; margin: 0; color: var(--muted); font-size: .8125rem; line-height: 1.9; }
.purpose-section { display: grid; grid-template-columns: .95fr 1.05fr; gap: 88px; align-items: center; }
.purpose-copy h2 span { color: #a5a5ae; }
.purpose-copy > p:not(.eyebrow) { max-width: 365px; margin: 23px 0 0; color: var(--muted); font-size: .875rem; line-height: 1.9; }
.home-text-link { display: inline-flex; min-height: 44px; align-items: center; gap: 14px; margin-top: 17px; color: #dcdce2; font-size: .8125rem; text-decoration: none; }
.home-text-link svg { width: 16px; height: 16px; }
.home-text-link:hover { color: white; }
.purpose-tags { display: flex; gap: 20px; margin-top: 23px; color: var(--caption); font-size: .6875rem; }
.purpose-tags span + span { border-left: 1px solid var(--border-strong); padding-left: 20px; }
.feedback-preview { padding: 28px; background: linear-gradient(135deg,#1b1b1e,#111113); box-shadow: inset 0 1px 0 rgba(255,255,255,.035),0 24px 70px rgba(0,0,0,.25); }
.feedback-preview-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.feedback-preview-heading .eyebrow { font-size: .5rem; }
.sample-label { border: 1px solid var(--border); border-radius: 999px; padding: 4px 8px; color: var(--caption); font-size: .5625rem; }
.feedback-tabs { display: flex; gap: 5px; margin-block: 23px 25px; border-bottom: 1px solid var(--border); padding-bottom: 14px; }
.feedback-tabs .glass-button { min-width: 0; flex: 1; padding: 8px 10px; font-size: .625rem; }
.feedback-tabs .is-selected { background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.2); }
.feedback-preview-content { min-height: 144px; }
.feedback-preview-content h3 { margin: 0 0 12px; font-size: .9375rem; font-weight: 450; }
.feedback-preview-content p { margin: 0; color: var(--muted); font-size: .8125rem; line-height: 1.9; }
.feedback-score-label { display: flex; justify-content: space-between; margin-top: 16px; color: var(--muted); font-size: .6875rem; }
.feedback-score-label strong { color: white; font-size: 1.1875rem; font-weight: 450; }
.feedback-score-track { height: 4px; margin-top: 12px; border-radius: 999px; background: #2c2c31; overflow: hidden; }
.feedback-score-track span { display: block; width: 82%; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#777781,#e6e6eb); }
.feedback-tip { display: flex; align-items: flex-start; gap: 13px; margin-top: 25px; padding: 16px; border: 1px solid var(--border); border-radius: 14px; background: rgba(255,255,255,.025); }
.feedback-tip svg { width: 18px; height: 18px; flex: 0 0 auto; color: #c4c4cd; }
.feedback-tip p { margin: 0; color: var(--muted); font-size: .6875rem; line-height: 1.8; }
.feedback-tip strong { display: block; margin-bottom: 3px; color: #d8d8df; font-weight: 500; }
.home-cta-wrap { padding-top: 88px; }
.home-cta-banner { position: relative; isolation: isolate; overflow: hidden; min-height: 330px; border: 1px solid var(--border-strong); border-radius: 28px; padding: 66px 55px; background: #171719; }
.home-cta-banner > img { z-index: -3; object-fit: cover; object-position: 0 55%; filter: grayscale(1) brightness(.55); }
.cta-shade { position: absolute; z-index: -2; inset: 0; background: linear-gradient(90deg,rgba(15,15,17,.1),rgba(15,15,17,.83) 50%,#101012 80%); }
.home-cta-copy { width: fit-content; max-width: 560px; margin-left: auto; }
.home-cta-copy .eyebrow { font-size: .5625rem; }
.home-cta-copy h2 { margin: 15px 0 11px; font-size: clamp(2rem,1rem + 2.5vw,3.125rem); font-weight: 400; line-height: 1.15; }
.home-cta-copy > p:not(.eyebrow) { margin: 0 0 25px; color: #adadb6; font-size: .8125rem; }
.home-faq { display: grid; grid-template-columns: .85fr 1.15fr; gap: 80px; border-bottom: 0; }
.home-faq h2 { font-size: clamp(1.75rem,1rem + 2vw,2.5rem); }
.home-faq details { border-bottom: 1px solid var(--border); }
.home-faq summary { display: flex; min-height: 66px; align-items: center; justify-content: space-between; gap: 20px; cursor: pointer; list-style: none; color: #d5d5dd; font-size: .875rem; }
.home-faq summary::-webkit-details-marker { display: none; }
.home-faq summary > span { color: var(--muted); font-size: 1.3rem; transition: transform 250ms ease-out; }
.home-faq details[open] summary > span { transform: rotate(45deg); }
.home-faq details p { margin: 0 22px 22px 0; color: var(--muted); font-size: .8125rem; line-height: 1.9; }
.reveal { transition: opacity 650ms ease-out,translate 650ms ease-out; }
.reveal-pending { opacity: 0; translate: 0 20px; }

@supports (background: linear-gradient(90deg in oklab,white,gray)) {
  .hero-copy h1 span { background-image: linear-gradient(110deg in oklab,#f5f5f7 3%,#81818c 100%); }
}
@media (max-width: 1024px) {
  .home-container { width: calc(100% - 48px); }
  .home-hero-grid { gap: 24px; }
  .hero-copy h1 { font-size: clamp(4rem,1rem + 7vw,6rem); }
  .landing-cta-row { gap: 8px; }
  .landing-cta-row .landing-button { padding-inline: 16px; font-size: .75rem; }
  .laptop-screen { padding-inline: 16px; }
  .purpose-section { gap: 40px; }
  .feedback-preview { padding: 23px; }
  .stat-strip > div { gap: 14px; padding-inline: 24px; }
  .stat-strip p { font-size: .6875rem; }
}
@media (max-width: 767px) {
  .home-container { width: calc(100% - 40px); }
  .home-hero { padding-block: 60px 36px; }
  .home-hero-grid { grid-template-columns: minmax(0,1fr); gap: 34px; }
  .hero-copy h1 { font-size: clamp(4.25rem,2rem + 8vw,6.5rem); }
  .hero-description { max-width: 420px; }
  .eyebrow { font-size: .5625rem; letter-spacing: .2em; }
  .laptop-scene { width: min(540px,calc(100% - 24px)); margin-inline: auto; padding-block: 24px; }
  .laptop-device { transform: rotateX(4deg) rotateZ(-1deg); }
  .laptop-screen { padding-inline: 18px; }
  .preview-question h2 { font-size: 1.0625rem; }
  .preview-question { padding-top: 12px; }
  .preview-waveform { margin-top: 6px; }
  .laptop-screen { min-height: 290px; }
  .stat-strip { grid-template-columns: 1fr; padding-block: 4px; }
  .stat-strip > div,.stat-strip > div:first-child { padding: 22px 0; gap: 22px; }
  .stat-strip > div + div { border-left: 0; border-top: 1px solid var(--border); }
  .stat-strip h2 { font-size: 1rem; }
  .stat-strip p { font-size: .75rem; }
  .home-section { padding-block: 64px; }
  .section-heading { flex-direction: column; align-items: flex-start; gap: 20px; }
  .section-heading > p { max-width: 390px; }
  .home-steps { grid-template-columns: 1fr; gap: 32px; margin-top: 36px; }
  .home-steps p { max-width: 440px; }
  .home-steps h3 { margin-top: 18px; }
  .purpose-section,.home-faq { grid-template-columns: minmax(0,1fr); gap: 36px; }
  .purpose-copy > p:not(.eyebrow) { max-width: 460px; }
  .feedback-preview { padding: 22px; }
  .feedback-preview-content { min-height: 140px; }
  .feedback-tabs { gap: 3px; }
  .feedback-tabs .glass-button { padding-inline: 7px; font-size: .5625rem; }
  .home-cta-wrap { padding-top: 56px; }
  .home-cta-banner { min-height: 400px; display: flex; align-items: flex-end; padding: 34px 25px; }
  .home-cta-copy { margin-left: 0; }
  .cta-shade { background: linear-gradient(0deg,#101012 5%,rgba(15,15,17,.8) 50%,rgba(15,15,17,.1)); }
}
@media (max-width: 380px) {
  .landing-cta-row { flex-direction: column; }
  .landing-cta-placeholder { min-height: 100px; }
  .hero-copy h1 { font-size: 4rem; }
  .preview-waveform { gap: 3px; }
  .preview-waveform span { width: 2px; }
  .preview-question h2 { font-size: 1rem; }
  .feedback-preview { padding: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  main :not(.grillr-nav-shell):not(.grillr-nav-shell *),main :not(.grillr-nav-shell *)::before,main :not(.grillr-nav-shell *)::after { animation: none !important; transition: none !important; }
  .reveal-pending { opacity: 1; translate: none; }
  main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)):hover,.landing-button:hover,.glass-button:hover { transform: none; }
}

/* Existing navbar: deliberately preserved. */


.grillr-nav-shell {
  --nav-ink: #10233f;
  --nav-blue: #4d7cff;
  --nav-gold: #f4b860;
  border-bottom: 1px solid rgba(207, 218, 237, .72);
  background: rgba(248, 251, 255, .82);
  box-shadow: 0 8px 28px rgba(35, 65, 108, .06);
  backdrop-filter: blur(18px);
}

.grillr-nav { min-height: 68px; }
.grillr-brand { color: var(--nav-ink); text-decoration: none; }
.grillr-brand-mark { background: linear-gradient(145deg, #10233f, #2b5fc9); box-shadow: 0 9px 22px rgba(37, 82, 159, .24); transition: transform .24s ease, box-shadow .24s ease; }
.grillr-brand:hover .grillr-brand-mark { transform: rotate(-4deg) translateY(-2px); box-shadow: 0 13px 26px rgba(37, 82, 159, .3); }
.grillr-brand-name { font-size: 11px; font-weight: 800; letter-spacing: .2em; line-height: 1; }
.grillr-brand-tagline { margin-top: 4px; color: #7890ae; font-size: 7px; font-weight: 700; letter-spacing: .18em; line-height: 1; }
.grillr-nav-links { gap: 3px; margin-left: 48px; }
.grillr-nav-link { position: relative; padding: 23px 13px 21px; color: #657792; font-size: 12px; font-weight: 650; text-decoration: none; transition: color .2s ease; }
.grillr-nav-link::after { position: absolute; right: 13px; bottom: 12px; left: 13px; height: 2px; border-radius: 999px; background: var(--nav-blue); content: ""; opacity: 0; transform: scaleX(.35); transition: opacity .2s ease, transform .2s ease; }
.grillr-nav-link:hover,
.grillr-nav-link.is-active { color: var(--nav-ink); }
.grillr-nav-link:hover::after,
.grillr-nav-link.is-active::after { opacity: 1; transform: scaleX(1); }
.grillr-nav-action { min-height: 34px; border-radius: 9px; padding: 0 13px; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform .2s ease, background .2s ease, box-shadow .2s ease, border-color .2s ease; }
.grillr-nav-action:hover { transform: translateY(-1px); }
.grillr-nav-action-muted { border: 1px solid #d7e0ee; color: #45617f; background: rgba(255,255,255,.72); }
.grillr-nav-action-muted:hover { border-color: #b9c9e1; background: #fff; }
.grillr-nav-action-primary { border: 1px solid #10233f; color: #fff; background: #10233f; box-shadow: 0 7px 16px rgba(16, 35, 63, .18); }
.grillr-nav-action-primary:hover { background: #1e4073; box-shadow: 0 10px 21px rgba(16, 35, 63, .24); }
.grillr-nav-signin { align-items: center; min-height: 34px; padding: 0 11px; color: #657792; font-size: 12px; font-weight: 650; text-decoration: none; transition: color .2s ease; }
.grillr-nav-signin:hover { color: var(--nav-ink); }
.grillr-menu-button { display: flex; height: 40px; width: 40px; align-items: center; justify-content: center; border: 1px solid #d7e0ee; border-radius: 10px; color: var(--nav-ink); background: #fff; box-shadow: 0 5px 14px rgba(35, 65, 108, .08); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
.grillr-menu-button:hover { border-color: #9eb5d8; background: #f4f7fc; transform: translateY(-1px); }
.grillr-mobile-menu { padding: 10px; border: 1px solid #d7e0ee; border-radius: 14px; background: rgba(255,255,255,.96); box-shadow: 0 18px 42px rgba(16, 35, 63, .16); animation: grillr-menu-in .2s ease both; }
.grillr-mobile-link { display: flex; min-height: 42px; align-items: center; border-radius: 9px; padding: 0 12px; color: #526986; font-size: 13px; font-weight: 650; text-decoration: none; transition: color .18s ease, background .18s ease, transform .18s ease; }
.grillr-mobile-link:hover,
.grillr-mobile-link.is-active { color: var(--nav-ink); background: #eef4ff; transform: translateX(2px); }
.grillr-nav-shell .border-t { border-color: #e1e8f2; }
@keyframes grillr-menu-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (prefers-reduced-motion: reduce) { .grillr-brand-mark,
.grillr-nav-link::after,
.grillr-nav-action,
.grillr-menu-button,
.grillr-mobile-link,
.grillr-mobile-menu { animation: none; transition: none; } }
.landing-page .grillr-nav-shell {
  border-bottom: 1px solid rgba(255, 255, 255, .7);
  background: rgba(247, 249, 253, .72);
  box-shadow: 0 8px 26px rgba(41, 60, 91, .035);
  -webkit-backdrop-filter: blur(22px) saturate(1.35);
  backdrop-filter: blur(22px) saturate(1.35);
}
.landing-page .grillr-nav { min-height: 72px; }
.landing-page .grillr-nav-link { color: #65738a; }
.landing-page .grillr-nav-link:hover,
.landing-page .grillr-nav-link.is-active { color: var(--landing-ink); }
.landing-page .grillr-nav-signin,
.landing-page .grillr-nav-action-muted {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, .92);
  border-radius: 999px;
  padding-inline: 16px;
  color: #41516a;
  background: rgba(255, 255, 255, .56);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 5px 16px rgba(40, 57, 86, .07);
  text-decoration: none;
  -webkit-backdrop-filter: blur(18px) saturate(1.35);
  backdrop-filter: blur(18px) saturate(1.35);
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
}
.landing-page .grillr-nav-signup {
  border-color: rgba(45, 81, 145, .76);
  color: #fff;
  background: linear-gradient(145deg, rgba(66, 105, 174, .96), rgba(43, 75, 132, .94));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 8px 20px rgba(47, 78, 132, .2);
}
.landing-page .grillr-nav-signin:hover,
.landing-page .grillr-nav-action-muted:hover { color: var(--landing-ink); background: rgba(255,255,255,.88); transform: translateY(-1px); }
.landing-page .grillr-nav-signup:hover { color: #fff; background: linear-gradient(145deg, #4a76bd, #31558f); box-shadow: 0 11px 24px rgba(47, 78, 132, .24); }
.landing-page .grillr-menu-button {
  border: 1px solid rgba(255,255,255,.92);
  border-radius: 14px;
  color: #344762;
  background: rgba(255,255,255,.62);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 6px 16px rgba(40,57,86,.08);
  -webkit-backdrop-filter: blur(18px) saturate(1.35);
  backdrop-filter: blur(18px) saturate(1.35);
}
.landing-page .grillr-menu-button:hover { border-color: #fff; color: var(--landing-blue-deep); background: rgba(255,255,255,.9); }
.landing-page .grillr-mobile-menu {
  border-color: rgba(255,255,255,.88);
  background: rgba(246,249,255,.84);
  box-shadow: 0 18px 46px rgba(32,53,89,.16), inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter: blur(24px) saturate(1.45);
  backdrop-filter: blur(24px) saturate(1.45);
}
.landing-page .grillr-mobile-link { color: #52627a; }
.landing-page .grillr-mobile-link:hover,
.landing-page .grillr-mobile-link.is-active { color: var(--landing-blue-deep); background: rgba(219,231,252,.72); }
.landing-page .grillr-mobile-auth {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,.94);
  border-radius: 14px;
  padding-inline: 12px;
  color: #43546e;
  background: rgba(255,255,255,.58);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 5px 14px rgba(40,57,86,.06);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  -webkit-backdrop-filter: blur(18px) saturate(1.35);
  backdrop-filter: blur(18px) saturate(1.35);
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
}
.landing-page .grillr-mobile-auth:hover { color: #263e65; background: rgba(255,255,255,.9); transform: translateY(-1px); }
.landing-page .grillr-mobile-auth-primary { border-color: rgba(45,81,145,.72); color: #fff; background: linear-gradient(145deg, rgba(68,108,177,.97), rgba(43,76,137,.96)); box-shadow: inset 0 1px 0 rgba(255,255,255,.32), 0 8px 18px rgba(49,83,143,.18); }
.landing-page .grillr-mobile-auth-primary:hover { color: #fff; background: linear-gradient(145deg, #527fc5, #345c9b); }
.landing-page .grillr-mobile-auth-button { width: 100%; cursor: pointer; }
.landing-page .grillr-nav-shell .border-t { border-color: rgba(43,69,108,.12); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .landing-page .grillr-nav-shell,
.landing-page .grillr-mobile-menu,
.landing-page .grillr-nav-signin,
.landing-page .grillr-menu-button,
.landing-page .grillr-mobile-auth { background-color: rgba(248,250,253,.96); }
  .landing-page .grillr-nav-signup,
.landing-page .grillr-mobile-auth-primary { background: #31558f; }
}
@media (prefers-reduced-motion: reduce) {
  .landing-page .grillr-nav-signin,
.landing-page .grillr-nav-action-muted,
.landing-page .grillr-menu-button,
.landing-page .grillr-mobile-link,
.landing-page .grillr-mobile-auth { transition: none; }
  .landing-page .grillr-menu-button:hover { transform: none; }
}
.landing-page .grillr-nav-shell { border-bottom-color: rgba(232,238,225,.1); background: rgba(9,11,12,.76); box-shadow: 0 10px 30px rgba(0,0,0,.14); }
.landing-page .grillr-brand { color: #f2f1ec; }
.landing-page .grillr-brand-mark { background: linear-gradient(145deg,#314021,#a9d34d); box-shadow: 0 8px 22px rgba(169,211,77,.14); }
.landing-page .grillr-brand-tagline { color: #8c9581; }
.landing-page .grillr-nav-link { color: #a0a39f; }
.landing-page .grillr-nav-link:hover,
.landing-page .grillr-nav-link.is-active { color: #f3f2ed; }
.landing-page .grillr-nav-link::after { background: #c6ee5b; }
.landing-page .grillr-nav-signin,
.landing-page .grillr-nav-action-muted { border-color: rgba(225,232,217,.12); color: #dcdfd6; background: rgba(255,255,255,.045); box-shadow: inset 0 1px 0 rgba(255,255,255,.07),0 5px 16px rgba(0,0,0,.13); }
.landing-page .grillr-nav-signup { border-color: #d1f174; color: #10130a; background: linear-gradient(145deg,#ddf98b,#bce64f); box-shadow: inset 0 1px 0 rgba(255,255,255,.6),0 8px 20px rgba(161,197,75,.16); }
.landing-page .grillr-nav-signin:hover,
.landing-page .grillr-nav-action-muted:hover { color: #fff; background: rgba(255,255,255,.1); }
.landing-page .grillr-nav-signup:hover { color: #080a05; background: #e4ffa0; box-shadow: 0 12px 26px rgba(161,197,75,.23); }
.landing-page .grillr-menu-button { border-color: rgba(225,232,217,.14); color: #e2e5dc; background: rgba(255,255,255,.055); box-shadow: inset 0 1px 0 rgba(255,255,255,.08),0 6px 16px rgba(0,0,0,.14); }
.landing-page .grillr-menu-button:hover { border-color: rgba(208,243,106,.38); color: #d5f77b; background: rgba(208,243,106,.08); }
.landing-page .grillr-mobile-menu { border-color: rgba(231,238,222,.13); background: rgba(17,20,19,.94); box-shadow: 0 18px 46px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06); }
.landing-page .grillr-mobile-link { color: #c2c5bd; }
.landing-page .grillr-mobile-link:hover,
.landing-page .grillr-mobile-link.is-active { color: #e4ffa0; background: rgba(208,243,106,.09); }
.landing-page .grillr-mobile-auth { border-color: rgba(231,238,222,.13); color: #e1e4dc; background: rgba(255,255,255,.055); box-shadow: inset 0 1px 0 rgba(255,255,255,.06),0 5px 14px rgba(0,0,0,.15); }
.landing-page .grillr-mobile-auth:hover { color: #fff; background: rgba(255,255,255,.1); }
.landing-page .grillr-mobile-auth-primary { border-color: #d1f174; color: #10130a; background: linear-gradient(145deg,#ddf98b,#bce64f); }
.landing-page .grillr-nav-shell .border-t { border-color: rgba(231,238,222,.13); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .landing-page .grillr-nav-shell,
.landing-page .grillr-mobile-menu { background-color: #151a17; }
}
.landing-page .grillr-nav-shell {
  border: 0;
  padding: 10px clamp(16px,2.2vw,40px) 0;
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.landing-page .grillr-nav {
  position: relative;
  width: 100%;
  max-width: 1760px;
  min-height: 82px;
  margin-inline: auto;
  border: 1px solid rgba(231,237,225,.14);
  border-radius: 999px;
  padding-inline: clamp(18px,2vw,30px);
  background: linear-gradient(110deg,rgba(31,36,34,.95),rgba(14,17,16,.95));
  box-shadow: 0 14px 48px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.07);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  backdrop-filter: blur(24px) saturate(1.2);
}
.landing-page .grillr-brand-mark {
  border: 1px solid rgba(208,243,106,.38);
  background: rgba(208,243,106,.035);
  box-shadow: none;
}
.landing-page .grillr-brand:hover .grillr-brand-mark { box-shadow: 0 0 22px rgba(208,243,106,.1); }
.landing-page .grillr-nav-links {
  position: absolute;
  left: 50%;
  height: 100%;
  gap: clamp(6px,1vw,14px);
  margin-left: 0;
  transform: translateX(-50%);
}
.landing-page .grillr-nav-link {
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0 clamp(15px,1.4vw,22px);
  color: #b9bdb5;
  font-size: 13px;
  font-weight: 540;
  white-space: nowrap;
}
.landing-page .grillr-nav-link::after { display: none; }
.landing-page .grillr-nav-link:hover { color: #f2f3ed; background: rgba(255,255,255,.045); }
.landing-page .grillr-nav-link.is-active { border-color: rgba(255,255,255,.08); color: #f1f1eb; background: rgba(255,255,255,.075); box-shadow: inset 0 1px 0 rgba(255,255,255,.035); }
.landing-page .grillr-nav-external { color: #aeb3a8; font-size: 16px; line-height: 1; }
.landing-page .grillr-nav-signin { min-height: 58px; border: 1px solid rgba(232,238,225,.16); border-radius: 999px; padding-inline: 22px; color: #f0f0ea; background: rgba(255,255,255,.025); font-size: 13px; font-weight: 630; }
.landing-page .grillr-nav-signin:hover { border-color: rgba(232,238,225,.3); color: #fff; background: rgba(255,255,255,.075); }
.landing-page .grillr-nav-signup { min-height: 58px; gap: 16px; border: 0; border-radius: 999px; padding-inline: 24px; color: #15190e; background: #c9f55a; box-shadow: 0 8px 26px rgba(179,218,79,.12); font-size: 13px; font-weight: 680; }
.landing-page .grillr-nav-signup:hover { color: #10130a; background: #d8ff79; box-shadow: 0 10px 30px rgba(179,218,79,.2); transform: translateY(-1px); }
.landing-page .grillr-nav-cta-arrow { font-size: 18px; font-weight: 400; line-height: 1; transition: transform .2s ease; }
.landing-page .grillr-nav-signup:hover .grillr-nav-cta-arrow { transform: translateX(3px); }
.landing-page .grillr-nav-signup,
.landing-page .grillr-mobile-auth-primary { background-image: none; }
@media (max-width: 1000px) and (min-width: 701px) {
  .landing-page .grillr-nav-links { gap: 0; }
  .landing-page .grillr-nav-link { padding-inline: 13px; font-size: 12px; }
  .landing-page .grillr-nav-signin { padding-inline: 16px; }
  .landing-page .grillr-nav-signup { gap: 9px; padding-inline: 18px; }
}
@media (max-width: 700px) {
  .landing-page .grillr-nav-shell { padding: 9px 14px 0; }
  .landing-page .grillr-nav { min-height: 66px; border-radius: 999px; padding-inline: 14px; }
  .landing-page .grillr-nav-links { display: none; }
  .landing-page .grillr-menu-button { width: 42px; height: 42px; border-radius: 50%; }
  .landing-page .grillr-mobile-menu { top: calc(100% + 10px); border-radius: 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .landing-page .grillr-nav-cta-arrow { transition: none; }
  .landing-page .grillr-nav-signup:hover .grillr-nav-cta-arrow { transform: none; }
}
.app-frame .grillr-nav-shell {
  position: sticky;
  top: 0;
  z-index: 30;
  border: 0;
  padding: 8px clamp(12px, 2.2vw, 38px) 0;
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.app-frame .grillr-nav {
  position: relative;
  width: 100%;
  max-width: 1760px;
  min-height: 66px;
  margin-inline: auto;
  border: 1px solid rgba(231,237,225,.13);
  border-radius: 999px;
  padding-inline: clamp(14px, 2vw, 28px);
  background: linear-gradient(110deg,rgba(28,33,30,.96),rgba(14,17,16,.96));
  box-shadow: 0 12px 38px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.055);
  -webkit-backdrop-filter: blur(22px) saturate(1.1);
  backdrop-filter: blur(22px) saturate(1.1);
}
.app-frame .grillr-brand { color: #f1f1eb; }
.app-frame .grillr-brand-mark { width: 36px; height: 36px; border: 1px solid rgba(208,243,106,.3); background: rgba(208,243,106,.035); box-shadow: none; }
.app-frame .grillr-brand-name { font-size: 10px; letter-spacing: .18em; }
.app-frame .grillr-brand-tagline { color: #8f9887; }
.app-frame .grillr-nav-links { position: absolute; left: 50%; height: 100%; gap: 4px; margin: 0; transform: translateX(-50%); }
.app-frame .grillr-nav-link { display: inline-flex; min-height: 44px; align-items: center; border: 1px solid transparent; border-radius: 999px; padding: 0 clamp(12px,1.3vw,19px); color: #aeb3aa; font-size: 13px; font-weight: 540; white-space: nowrap; }
.app-frame .grillr-nav-link::after { display: none; }
.app-frame .grillr-nav-link:hover { color: #f2f3ed; background: rgba(255,255,255,.045); }
.app-frame .grillr-nav-link.is-active { border-color: rgba(255,255,255,.08); color: #f1f1eb; background: rgba(255,255,255,.075); }
.app-frame .grillr-nav-external { color: #aeb3a8; font-size: 15px; }
.app-frame .grillr-nav-signin,
.app-frame .grillr-nav-action-muted { min-height: 44px; align-items: center; border: 1px solid rgba(232,238,225,.15); border-radius: 999px; padding: 0 18px; color: #e4e6df; background: rgba(255,255,255,.035); box-shadow: none; font-size: 12px; font-weight: 630; }
.app-frame .grillr-nav-signin:hover,
.app-frame .grillr-nav-action-muted:hover { color: #fff; background: rgba(255,255,255,.09); }
.app-frame .grillr-nav-signup,
.app-frame .grillr-mobile-auth-primary { min-height: 44px; gap: 12px; border: 0; border-radius: 999px; padding-inline: 21px; color: #15190e; background: #c9f55a; box-shadow: none; font-size: 12px; font-weight: 680; }
.app-frame .grillr-nav-signup:hover,
.app-frame .grillr-mobile-auth-primary:hover { color: #10130a; background: #d8ff79; box-shadow: 0 8px 22px rgba(179,218,79,.14); }
.app-frame .grillr-menu-button { height: 40px; width: 40px; border: 1px solid rgba(232,238,225,.14); border-radius: 50%; color: #e2e5dc; background: rgba(255,255,255,.055); box-shadow: none; }
.app-frame .grillr-menu-button:hover { border-color: rgba(208,243,106,.38); color: #d5f77b; background: rgba(208,243,106,.08); transform: none; }
.app-frame .grillr-mobile-menu { border-color: rgba(231,238,222,.13); background: rgba(17,20,19,.97); box-shadow: 0 18px 46px rgba(0,0,0,.45); }
.app-frame .grillr-mobile-link { color: #c2c5bd; }
.app-frame .grillr-mobile-link:hover,
.app-frame .grillr-mobile-link.is-active { color: #e4ffa0; background: rgba(208,243,106,.09); }
.app-frame .grillr-mobile-auth { display: flex; width: 100%; min-height: 42px; align-items: center; justify-content: center; border: 1px solid rgba(231,238,222,.13); border-radius: 999px; color: #e1e4dc; background: rgba(255,255,255,.055); }
.app-frame .grillr-mobile-auth-button { cursor: pointer; }
.app-frame .grillr-nav-shell .border-t { border-color: rgba(231,238,222,.13); }
.app-frame [class*="rounded-full border border-[#d7e0ee]"] { border-color: rgba(231,237,225,.13); background: rgba(255,255,255,.05); box-shadow: none; }
.app-frame [class*="bg-[#edf4ff]"] { background: rgba(201,245,90,.12); color: #d8f89a; }
.app-frame [class*="text-[#4b5d77]"] { color: #c1c7bd; }

@media (max-width: 1000px) and (min-width: 701px) {
  .app-frame .grillr-nav-links { gap: 0; }
  .app-frame .grillr-nav-link { padding-inline: 10px; font-size: 12px; }
  .app-frame .grillr-nav-signin,
.app-frame .grillr-nav-action-muted { padding-inline: 13px; }
  .app-frame .grillr-nav-signup { gap: 7px; padding-inline: 15px; }
}
@media (max-width: 700px) {
  .app-frame .grillr-nav-shell { padding: 8px 12px 0; }
  .app-frame .grillr-nav { min-height: 60px; padding-inline: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .app-frame .grillr-nav-shell,
.app-frame .grillr-nav-link,
.app-frame .grillr-nav-signup { scroll-behavior: auto; transition: none; }
}
.ai-core-shell {
  --ai-ink: var(--foreground);
  --ai-muted: #9a9aa2;
  --ai-faint: #9a9aa2;
  --ai-border: #f5f5f7;
  --ai-panel: var(--card-strong);
  --ai-panel-deep: #f5f5f7;
  --ai-canvas: var(--background);
  --ai-mint: var(--accent);
  --ai-mint-strong: var(--accent-strong);
  --ai-coral: #9a9aa2;
  min-height: calc(100vh - 76px);
  background: #f5f5f7;
  color: var(--ai-ink);
  font-family: var(--font-geist-sans), sans-serif;
}

.ai-core-container { width: min(1320px, calc(100% - 48px)); margin: 0 auto; padding: 58px 0 30px; }
.ai-core-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 34px; }
.ai-eyebrow { display: flex; align-items: center; gap: 9px; color: var(--ai-mint); font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.ai-live-dot, .ai-status-dot, .ai-pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ai-mint-strong); box-shadow: 0 0 0 4px rgba(37, 99, 235, .12); }
.ai-eyebrow-divider { width: 1px; height: 14px; background: var(--ai-border); }
.ai-core-header h1 { margin: 13px 0 9px; color: var(--foreground); font-size: clamp(2rem, 4vw, 3.35rem); font-weight: 500; letter-spacing: -.055em; line-height: 1.05; }
.ai-core-header p { margin: 0; color: var(--ai-muted); font-size: 14px; }
.ai-header-actions { display: flex; align-items: center; gap: 12px; padding-bottom: 3px; }
.ai-status-pill { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--ai-border); border-radius: 999px; padding: 9px 13px; color: var(--ai-muted); background: #f5f5f7; font-size: 11px; font-weight: 600; }
.ai-icon-button, .ai-help-button { display: inline-grid; place-items: center; border: 1px solid var(--ai-border); color: var(--ai-muted); background: #f5f5f7; cursor: pointer; transition: .2s ease; }
.ai-icon-button { width: 38px; height: 38px; border-radius: 11px; }
.ai-icon-button:hover, .ai-help-button:hover { border-color: var(--ai-mint); color: var(--ai-mint-strong); background: #f5f5f7; }
.ai-icon { width: 16px; height: 16px; flex: 0 0 auto; }
.ai-workspace-grid { display: grid; grid-template-columns: minmax(0, 1fr) 326px; align-items: stretch; gap: 15px; }
.ai-conversation-panel, .ai-control-rail { border: 1px solid var(--ai-border); background: var(--ai-panel); box-shadow: 0 12px 32px rgba(15, 23, 42, .06); }
.ai-conversation-panel { display: flex; min-height: 650px; flex-direction: column; border-radius: 18px; overflow: hidden; }
.ai-panel-toolbar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--ai-border); padding: 21px 25px; }
.ai-panel-kicker { margin: 0 0 5px; color: var(--ai-mint); font-size: 10px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; }
.ai-panel-toolbar h2 { margin: 0; color: var(--foreground); font-size: 17px; font-weight: 600; letter-spacing: -.02em; }
.ai-text-button, .ai-copy-json, .ai-add-prompt { display: inline-flex; align-items: center; gap: 7px; border: 0; color: var(--ai-muted); background: transparent; font-size: 12px; cursor: pointer; }
.ai-text-button:hover, .ai-copy-json:hover, .ai-add-prompt:hover { color: var(--ai-mint); }
.ai-message-list { flex: 1; padding: 28px 32px; }
.ai-message { display: flex; gap: 13px; max-width: 760px; margin-bottom: 28px; animation: ai-rise .35s ease both; }
.ai-message-user { margin-left: auto; flex-direction: row-reverse; }
.ai-message-avatar { display: grid; flex: 0 0 31px; width: 31px; height: 31px; place-items: center; border: 1px solid var(--ai-border); border-radius: 10px; color: var(--ai-muted); background: #f5f5f7; font-size: 9px; font-weight: 700; }
.ai-message-user .ai-message-avatar { border-color: #f5f5f7; color: #9a9aa2; background: #f5f5f7; }
.ai-message-body { min-width: 0; padding-top: 1px; }
.ai-message-meta { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; font-size: 11px; }
.ai-message-meta strong { color: var(--foreground); font-weight: 650; }
.ai-message-meta span { color: var(--ai-faint); }
.ai-message-body p { max-width: 650px; margin: 0; color: #9a9aa2; font-size: 14px; line-height: 1.72; }
.ai-message-user .ai-message-body { text-align: right; }
.ai-message-user .ai-message-body p { display: inline-block; padding: 11px 14px; border: 1px solid #f5f5f7; border-radius: 12px 3px 12px 12px; color: var(--ai-mint-strong); background: #f5f5f7; text-align: left; }
.ai-code-block { margin-top: 15px; overflow: hidden; border: 1px solid var(--ai-border); border-radius: 10px; background: #f5f5f7; }
.ai-code-heading { display: flex; align-items: center; justify-content: space-between; padding: 9px 13px; border-bottom: 1px solid #f5f5f7; color: #9a9aa2; font-family: var(--font-geist-mono), monospace; font-size: 10px; }
.ai-code-heading button { display: inline-flex; align-items: center; gap: 5px; border: 0; color: #9a9aa2; background: transparent; cursor: pointer; font-size: 10px; }
.ai-code-heading button:hover { color: var(--ai-mint); }
.ai-code-heading .ai-icon { width: 13px; height: 13px; }
.ai-code-block pre { overflow-x: auto; margin: 0; padding: 14px; color: #9a9aa2; font-family: var(--font-geist-mono), monospace; font-size: 12px; line-height: 1.75; }
.ai-empty-state { display: grid; max-width: 280px; margin: 90px auto; place-items: center; text-align: center; }
.ai-empty-icon { display: grid; width: 48px; height: 48px; margin-bottom: 15px; place-items: center; border: 1px solid var(--ai-border); border-radius: 15px; color: var(--ai-muted); background: #f5f5f7; }
.ai-empty-state h3 { margin: 0 0 7px; color: var(--foreground); font-size: 15px; }
.ai-empty-state p { margin: 0; color: var(--ai-muted); font-size: 13px; line-height: 1.6; }
.ai-typing { display: flex; gap: 4px; padding-top: 5px; }
.ai-typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--ai-mint); animation: ai-blink 1s infinite; }
.ai-typing span:nth-child(2) { animation-delay: .15s; }.ai-typing span:nth-child(3) { animation-delay: .3s; }
.ai-error-banner { display: flex; align-items: center; gap: 10px; margin: 0 25px 14px; padding: 11px 13px; border: 1px solid #f5f5f7; border-radius: 10px; color: var(--ai-coral); background: #f5f5f7; font-size: 12px; }
.ai-error-banner div { display: grid; gap: 2px; flex: 1; }.ai-error-banner span { color: #bdbdc4; font-size: 11px; }.ai-error-banner button { border: 0; color: #f5f5f7; background: transparent; cursor: pointer; font-size: 11px; font-weight: 700; }
.ai-composer-wrap { padding: 0 25px 18px; }.ai-composer { border: 1px solid var(--ai-border); border-radius: 13px; background: var(--card-strong); box-shadow: 0 0 0 3px rgba(37, 99, 235, .04); transition: .2s ease; }.ai-composer:focus-within { border-color: var(--ai-mint); box-shadow: 0 0 0 3px rgba(37, 99, 235, .12); }
.ai-composer textarea { display: block; width: 100%; min-height: 51px; resize: vertical; border: 0; outline: 0; padding: 15px 15px 5px; color: var(--foreground); background: transparent; font-size: 13px; line-height: 1.5; }.ai-composer textarea::placeholder { color: #9a9aa2; }
.ai-composer-footer { display: flex; align-items: center; gap: 12px; padding: 7px 9px 9px 13px; }.ai-attach-button { display: inline-flex; align-items: center; gap: 6px; border: 0; color: var(--ai-muted); background: transparent; cursor: pointer; font-size: 11px; }.ai-attach-button:hover { color: var(--ai-mint); }.ai-attach-button .ai-icon { width: 14px; height: 14px; }.ai-shortcut { margin-left: auto; color: var(--ai-faint); font-size: 10px; }.ai-shortcut kbd { margin: 0 2px; padding: 2px 4px; border: 1px solid var(--ai-border); border-radius: 3px; color: var(--ai-muted); background: #f5f5f7; font-size: 9px; }.ai-send-button { display: grid; width: 33px; height: 33px; margin-left: 4px; place-items: center; border: 0; border-radius: 9px; color: #f5f5f7; background: var(--ai-mint); cursor: pointer; transition: .2s ease; }.ai-send-button:hover { background: var(--ai-mint-strong); transform: translateY(-1px); }.ai-send-button:active { transform: translateY(0); }.ai-composer-note { margin-top: 10px; color: var(--ai-faint); font-size: 10px; text-align: center; }.ai-secure-mark { color: var(--ai-mint-strong); font-size: 8px; margin-right: 4px; }
.ai-control-rail { align-self: start; border-radius: 18px; padding: 21px; }.ai-rail-section { display: grid; gap: 12px; }.ai-rail-heading, .ai-slider-label, .ai-slider-ends { display: flex; align-items: center; justify-content: space-between; color: #bdbdc4; font-size: 11px; font-weight: 600; }.ai-model-badge { border-radius: 4px; padding: 3px 5px; color: #0e0e10; background: var(--ai-mint); font-size: 8px; letter-spacing: .08em; }.ai-select-control { display: flex; width: 100%; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--ai-border); border-radius: 10px; color: var(--ai-muted); background: rgba(255,255,255,.025); text-align: left; cursor: pointer; }.ai-select-control:hover { border-color: rgba(226,226,226,.4); }.ai-select-control > .ai-icon { width: 14px; margin-left: auto; }.ai-model-orb, .ai-prompt-mark { display: grid; width: 29px; height: 29px; place-items: center; border-radius: 8px; color: #1a1a1d; background: var(--ai-mint); font-size: 13px; font-weight: 800; }.ai-prompt-mark { color: #f5f5f7; background: rgba(213,213,213,.13); }.ai-select-copy { display: grid; gap: 3px; }.ai-select-copy strong { color: #f5f5f7; font-size: 12px; font-weight: 600; }.ai-select-copy small { color: #9a9aa2; font-size: 10px; }.ai-rail-divider { height: 1px; margin: 21px 0; background: var(--ai-border); }.ai-help-button { width: 17px; height: 17px; border-radius: 50%; font-size: 10px; }.ai-add-prompt { justify-self: start; padding: 0; font-size: 11px; }.ai-add-prompt .ai-icon, .ai-copy-json .ai-icon { width: 13px; height: 13px; }.ai-tuning-label { color: var(--ai-mint); font-size: 10px; font-weight: 500; }.ai-slider-label { margin-top: 3px; font-weight: 500; }.ai-slider-label output { color: #f5f5f7; font-family: var(--font-geist-mono), monospace; font-size: 10px; }.ai-slider { width: 100%; height: 3px; accent-color: var(--ai-mint-strong); cursor: pointer; }.ai-slider-ends { color: #9a9aa2; font-size: 9px; font-weight: 400; }.ai-token-label { margin-top: 9px; }.ai-json-viewer { display: grid; gap: 4px; padding: 11px 12px; border: 1px solid var(--ai-border); border-radius: 9px; color: #bdbdc4; background: #0e0e10; font-family: var(--font-geist-mono), monospace; font-size: 10px; line-height: 1.5; }.ai-json-viewer b { color: #bdbdc4; font-weight: 500; }.ai-json-viewer em { color: #bdbdc4; font-style: normal; }.ai-json-viewer i { color: #bdbdc4; font-style: normal; }.json-brace { color: #9a9aa2; }
.ai-footer-meta { display: flex; justify-content: flex-end; gap: 20px; padding: 16px 2px 0; color: #9a9aa2; font-size: 10px; }.ai-footer-meta span { display: inline-flex; align-items: center; gap: 6px; }.ai-pulse-dot { width: 5px; height: 5px; }
@keyframes ai-rise { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } @keyframes ai-blink { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
@media (max-width: 820px) { .ai-core-container { width: min(100% - 30px, 680px); padding-top: 34px; }.ai-core-header { align-items: flex-start; flex-direction: column; margin-bottom: 24px; }.ai-header-actions { width: 100%; justify-content: space-between; }.ai-workspace-grid { grid-template-columns: 1fr; }.ai-control-rail { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }.ai-rail-divider { display: none; }.ai-message-list { padding: 23px 18px; }.ai-composer-wrap { padding: 0 16px 16px; }.ai-shortcut { display: none; } }
@media (max-width: 520px) { .ai-core-container { width: calc(100% - 22px); }.ai-core-header h1 { font-size: 2.25rem; }.ai-status-pill { font-size: 10px; }.ai-conversation-panel { min-height: 690px; }.ai-panel-toolbar { padding: 18px; }.ai-control-rail { grid-template-columns: 1fr; padding: 17px; }.ai-footer-meta { justify-content: space-between; gap: 8px; }.ai-footer-meta span:last-child { display: none; }.ai-attach-button span { display: none; } }
@media (prefers-reduced-motion: reduce) { .ai-message, .ai-typing span, .ai-send-button { animation: none; transition: none; } }

/* Interview room: a focused prompt, a comfortable response area, and quiet cues. */
.interview-room {
  position: relative;
  overflow: clip;
  background: radial-gradient(ellipse at 13% 22%,rgba(224,224,224,.035),transparent 34rem),linear-gradient(180deg,#0e0e10 0%,#0e0e10 56%,#0e0e10 100%) !important;
  color: #f5f5f7 !important;
}
.interview-room::before {
  position: absolute;
  top: 86px;
  left: 50%;
  width: min(1320px,calc(100% - 48px));
  height: 1px;
  background: linear-gradient(90deg,transparent,rgba(235,235,235,.11) 12%,rgba(235,235,235,.11) 88%,transparent);
  content: "";
  pointer-events: none;
  transform: translateX(-50%);
}
.interview-room-container { position: relative; z-index: 1; width: min(100%,1280px); padding-top: clamp(42px,6vw,76px) !important; padding-bottom: 70px !important; }
.interview-session-header { display: flex; align-items: end; justify-content: space-between; gap: 36px; margin-bottom: 38px; border-bottom: 1px solid rgba(235,235,235,.12); padding-bottom: 25px; }
.interview-session-title h1 { margin: 11px 0 0; color: #f5f5f7; font-size: clamp(1.8rem,3.2vw,2.65rem); font-weight: 550; letter-spacing: -.055em; line-height: 1.08; }
.interview-session-detail { display: flex; align-items: center; gap: 9px; margin: 9px 0 0; color: #bdbdc4; font-size: 13px; }
.interview-overline { display: flex; align-items: center; gap: 9px; margin: 0; color: #bdbdc4; font-family: var(--font-geist-mono),monospace; font-size: 10px; font-weight: 550; letter-spacing: .14em; line-height: 1.5; text-transform: uppercase; }
.interview-live-indicator { position: relative; display: inline-block; width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: #f5f5f7; box-shadow: 0 0 0 4px rgba(224,224,224,.09); }
.interview-live-indicator::after { position: absolute; inset: -4px; border: 1px solid rgba(224,224,224,.32); border-radius: inherit; content: ""; animation: interview-status-pulse 2.6s ease-out infinite; }
@keyframes interview-status-pulse { 0% { opacity: .5; transform: scale(.78); } 75%,100% { opacity: 0; transform: scale(1.75); } }
.interview-overline-separator { color: #9a9aa2; }
.interview-progress { width: min(320px,38%); flex: 0 0 auto; padding-bottom: 2px; }
.interview-progress-label { display: flex; justify-content: space-between; gap: 12px; color: #bdbdc4; font-size: 11px; }
.interview-progress-label strong { color: #f5f5f7; font-size: 13px; font-weight: 650; }
.interview-progress-total { color: #9a9aa2; }
.interview-progress-track { height: 3px; overflow: hidden; margin-top: 12px; border-radius: 99px; background: rgba(235,235,235,.1); }
.interview-progress-track > span { display: block; height: 100%; border-radius: inherit; background: #f5f5f7; box-shadow: 0 0 12px rgba(224,224,224,.24); transition: width .45s cubic-bezier(.2,.7,.2,1); }
.interview-workspace { display: grid; grid-template-columns: minmax(0,1fr) 270px; align-items: start; gap: clamp(36px,6vw,84px); }
.interview-main-column { min-width: 0; }
.interview-prompt { position: relative; overflow: hidden; border: 1px solid rgba(235,235,235,.1); border-radius: 5px 24px 24px 5px; padding: clamp(23px,4vw,40px); background: radial-gradient(ellipse at 88% 0%,rgba(224,224,224,.055),transparent 28rem),linear-gradient(135deg,rgba(28,28,28,.93),rgba(18,18,18,.84)); box-shadow: 0 26px 70px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.035); }
.interview-prompt::before { position: absolute; inset-block: 0; inset-inline-start: 0; width: 2px; background: linear-gradient(180deg,rgba(224,224,224,.72),rgba(224,224,224,.08)); content: ""; }
.interview-prompt-topline { display: flex; align-items: center; gap: 12px; }
.interview-interviewer-mark { position: relative; display: grid; width: 39px; height: 39px; flex: 0 0 auto; place-items: center; overflow: visible; border: 1px solid rgba(224,224,224,.22); border-radius: 13px; color: #f5f5f7; background: linear-gradient(145deg,rgba(224,224,224,.12),rgba(224,224,224,.035)); font-size: 15px; font-weight: 650; }
.interview-interviewer-mark i { position: absolute; right: -2px; bottom: -2px; width: 9px; height: 9px; border: 2px solid #0e0e10; border-radius: 50%; background: #f5f5f7; }
.interview-interviewer-copy { display: grid; gap: 3px; }
.interview-interviewer-copy span:first-child { color: #f5f5f7; font-size: 12px; font-weight: 620; }
.interview-interviewer-copy span:last-child { color: #9a9aa2; font-size: 11px; }
.interview-prompt-label { margin-left: auto; color: #9a9aa2; font-family: var(--font-geist-mono),monospace; font-size: 9px; letter-spacing: .13em; }
.interview-prompt-rule { height: 1px; margin: 25px 0 29px; background: linear-gradient(90deg,rgba(235,235,235,.13),rgba(235,235,235,.025)); }
.interview-prompt > .interview-overline { color: #bdbdc4; }
.interview-prompt h2 { max-width: 840px; margin: 15px 0 0; color: #f5f5f7; font-size: clamp(1.8rem,3.8vw,3.25rem); font-weight: 480; letter-spacing: -.055em; line-height: 1.17; text-wrap: pretty; }
.interview-prompt-hint { max-width: 650px; margin: 19px 0 0; color: #bdbdc4; font-size: 14px; line-height: 1.75; }
.interview-prompt-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 31px; border-top: 1px solid rgba(235,235,235,.085); padding-top: 16px; color: #9a9aa2; font-size: 10px; }
.interview-prompt-foot > span:first-child { display: flex; align-items: center; gap: 9px; }
.interview-prompt-foot .interview-live-indicator { width: 5px; height: 5px; }
.interview-prompt-foot .interview-live-indicator::after { display: none; }
.interview-answer { margin-top: 20px; border: 1px solid rgba(235,235,235,.11); border-radius: 20px; padding: clamp(20px,3vw,29px); background: rgba(22,22,22,.86); box-shadow: 0 18px 48px rgba(0,0,0,.14); transition: border-color .22s ease,box-shadow .22s ease; }
.interview-answer:focus-within { border-color: rgba(224,224,224,.32); box-shadow: 0 20px 55px rgba(0,0,0,.2),0 0 0 3px rgba(224,224,224,.035); }
.interview-answer-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.interview-answer-header h3 { margin: 7px 0 0; color: #f5f5f7; font-size: 17px; font-weight: 570; letter-spacing: -.025em; }
.interview-word-count { flex: 0 0 auto; color: #9a9aa2; font-size: 10px; }
.interview-word-count strong { color: #f5f5f7; font-family: var(--font-geist-mono),monospace; font-size: 13px; font-weight: 600; }
.interview-answer-input { display: block; width: 100%; min-height: 188px; margin-top: 19px; resize: vertical; border: 0; border-top: 1px solid rgba(235,235,235,.08); border-radius: 0; padding: 17px 0; color: #f5f5f7; background: transparent; font-size: 14px; line-height: 1.8; outline: none; }
.interview-answer-input::placeholder { color: #9a9aa2; }
.interview-answer-input:focus { outline: none; }
.interview-answer-input:disabled { opacity: .65; }
.interview-answer-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid rgba(235,235,235,.08); padding-top: 16px; }
.interview-answer-footer p { max-width: 360px; margin: 0; color: #9a9aa2; font-size: 10px; line-height: 1.65; }
.interview-answer-footer button { min-height: 44px; flex: 0 0 auto; border-radius: 999px; padding-inline: 20px; font-size: 12px; }
.interview-sidebar { padding-top: 4px; }
.interview-sidebar-person { display: flex; flex-direction: column; align-items: flex-start; border-bottom: 1px solid rgba(235,235,235,.1); padding-bottom: 24px; }
.interview-avatar { position: relative; display: grid; width: 66px; height: 66px; margin-bottom: 22px; place-items: center; overflow: hidden; border: 1px solid rgba(224,224,224,.26); border-radius: 22px; color: #f5f5f7; background: radial-gradient(circle at 28% 18%,rgba(224,224,224,.19),transparent 55%),linear-gradient(145deg,#1a1a1d,#0e0e10); box-shadow: inset 0 1px 0 rgba(255,255,255,.07),0 12px 30px rgba(0,0,0,.22); font-size: 23px; font-weight: 520; }
.interview-avatar-orbit { position: absolute; right: -20px; bottom: -28px; width: 70px; height: 70px; border: 1px solid rgba(224,224,224,.18); border-radius: 50%; }
.interview-sidebar-person .interview-overline,.interview-sidebar-section > .interview-overline { color: #9a9aa2; font-size: 9px; }
.interview-sidebar-person h3 { margin: 8px 0 0; color: #f5f5f7; font-size: 19px; font-weight: 570; letter-spacing: -.04em; }
.interview-sidebar-personality { margin: 4px 0 0; color: #bdbdc4; font-size: 11px; }
.interview-listening-status { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; border: 1px solid rgba(224,224,224,.12); border-radius: 999px; padding: 7px 10px; color: #bdbdc4; background: rgba(224,224,224,.035); font-size: 9px; }
.interview-listening-status i { width: 5px; height: 5px; border-radius: 50%; background: #f5f5f7; }
.interview-sidebar-section { padding: 24px 0; }
.interview-answer-cues { display: grid; gap: 18px; margin: 19px 0 0; padding: 0; list-style: none; }
.interview-answer-cues li { display: flex; align-items: flex-start; gap: 11px; }
.interview-answer-cues li > span { padding-top: 1px; color: #bdbdc4; font-family: var(--font-geist-mono),monospace; font-size: 9px; }
.interview-answer-cues li div { display: grid; gap: 4px; }
.interview-answer-cues strong { color: #f5f5f7; font-size: 11px; font-weight: 570; }
.interview-answer-cues small { color: #9a9aa2; font-size: 10px; line-height: 1.5; }
.interview-sidebar-note { display: flex; align-items: flex-start; gap: 10px; border-top: 1px solid rgba(235,235,235,.1); padding-top: 17px; }
.interview-sidebar-note > span { display: grid; width: 17px; height: 17px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(224,224,224,.2); border-radius: 50%; color: #f5f5f7; font-family: Georgia,serif; font-size: 11px; }
.interview-sidebar-note p { margin: 0; color: #9a9aa2; font-size: 10px; line-height: 1.6; }
.interview-exit { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 31px; border-top: 1px solid rgba(235,235,235,.09); padding-top: 18px; }
.interview-exit a { color: #bdbdc4; font-size: 11px; text-decoration: none; transition: color .2s ease; }
.interview-exit a:hover { color: #f5f5f7; }
.interview-exit > span { color: #9a9aa2; font-size: 10px; }
.interview-loading { max-width: 850px; }
.interview-loading-title,.interview-loading-panel { border: 1px solid rgba(235,235,235,.08); border-radius: 16px; background: linear-gradient(100deg,#0e0e10,#0e0e10,#0e0e10); background-size: 200% 100%; }
.interview-loading-title { width: min(530px,80%); height: 40px; margin-top: 20px; }
.interview-loading-panel { height: 370px; margin-top: 35px; border-radius: 22px; }
.interview-loading-note { color: #9a9aa2; font-size: 12px; }
.interview-feedback,.interview-completion { color: #f5f5f7; }
.interview-feedback-heading,.interview-completion-heading { border-color: rgba(235,235,235,.13) !important; }
.interview-feedback .interview-score { border-color: rgba(224,224,224,.16); background: rgba(224,224,224,.055); }
.interview-feedback-grid { border-bottom: 1px solid rgba(235,235,235,.12); padding-bottom: 30px; }
.interview-completion-stats { border-color: rgba(235,235,235,.13) !important; }
.interview-room [role="alert"] { border-color: rgba(159,159,159,.55); }
.interview-room [role="alert"] h1 { color: #f5f5f7; }
.interview-room [role="alert"] > p:not(.text-xs) { color: #bdbdc4; }
.interview-skip-link { position: absolute; z-index: 80; top: 8px; left: 12px; padding: 10px 14px; border-radius: 999px; color: #0e0e10; background: #f5f5f7; font-size: 12px; font-weight: 650; text-decoration: none; transform: translateY(-160%); transition: transform .18s ease; }
.interview-skip-link:focus { transform: translateY(0); }
.interview-room-container:focus { outline: none; }
.interview-room-container:focus-visible { outline: 2px solid #f5f5f7; outline-offset: -4px; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] {
  margin-bottom: 18px;
  border-color: rgba(235,235,235,.11);
  border-radius: 18px;
  padding: 19px 21px;
  background: linear-gradient(120deg,rgba(27,27,27,.96),rgba(19,19,19,.9));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
}
.interview-main-column > section[aria-labelledby="voice-answer-heading"] h3 { color: #f5f5f7; font-size: 12px; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] h3 span { color: #bdbdc4; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type { gap: 18px; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > div > div > span:first-child { border: 1px solid rgba(224,224,224,.2); border-radius: 11px; color: #f5f5f7; background: rgba(224,224,224,.075); }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > div > p { color: #bdbdc4; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > button {
  min-height: 44px;
  border: 1px solid #f5f5f7;
  color: #0e0e10;
  background: #f5f5f7;
  box-shadow: 0 8px 22px rgba(224,224,224,.1);
  font-weight: 650;
}
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > button:hover { background: #f5f5f7; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > button:focus-visible,
.interview-main-column > section[aria-labelledby="voice-answer-heading"] button:focus-visible { outline: 2px solid #f5f5f7; outline-offset: 3px; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:not(:first-child) { border-color: rgba(235,235,235,.1); color: #bdbdc4; background: rgba(255,255,255,.025); }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] input[type="range"] { accent-color: #f5f5f7; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] audio { accent-color: #f5f5f7; }
.interview-main-column > [role="status"] { margin: 14px 0 0; border-color: rgba(235,235,235,.1); border-radius: 13px; background: rgba(255,255,255,.025); }
.interview-main-column > [role="status"] p:first-child { color: #f5f5f7; }
.interview-main-column > [role="status"] p:last-child { color: #9a9aa2; }
.interview-main-column > [role="status"] > span { background: #f5f5f7; box-shadow: 0 0 0 4px rgba(224,224,224,.08); }
.interview-transcript { margin-top: 14px; border: 1px solid rgba(235,235,235,.1); border-radius: 16px; padding: 19px 21px; background: rgba(17,17,17,.72); }
.interview-transcript .interview-answer-header h3 { font-size: 13px; }
.interview-transcript-copy,.interview-transcript-placeholder { min-height: 48px; margin: 17px 0 0; border-top: 1px solid rgba(235,235,235,.08); padding-top: 14px; font-size: 12px; line-height: 1.8; }
.interview-transcript-copy { color: #f5f5f7; }
.interview-transcript-placeholder { color: #9a9aa2; }
.interview-room [role="alert"] { border-color: rgba(159,159,159,.3); border-radius: 14px; padding: 15px; background: rgba(105,105,105,.09); color: #bdbdc4; }
.interview-room [role="alert"] button { border-color: rgba(159,159,159,.35); color: #bdbdc4; }
.interview-room [role="alert"] button:hover { background: rgba(159,159,159,.1); }

@media (max-width: 900px) {
  .interview-workspace { grid-template-columns: minmax(0,1fr) 220px; gap: 32px; }
  .interview-prompt h2 { font-size: clamp(1.75rem,4.5vw,2.65rem); }
}
@media (max-width: 700px) {
  .interview-room::before { top: 70px; }
  .interview-room-container { padding-top: 34px !important; padding-bottom: 46px !important; }
  .interview-session-header { align-items: stretch; flex-direction: column; gap: 21px; margin-bottom: 25px; padding-bottom: 20px; }
  .interview-progress { width: 100%; }
  .interview-workspace { grid-template-columns: 1fr; gap: 24px; }
  .interview-main-column > section[aria-labelledby="voice-answer-heading"] { padding: 16px; }
  .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type { align-items: stretch; flex-direction: column; }
  .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > button { width: 100%; }
  .interview-prompt { border-radius: 4px 18px 18px 4px; padding: 22px 20px; }
  .interview-prompt-rule { margin: 21px 0 24px; }
  .interview-prompt h2 { font-size: clamp(1.75rem,8vw,2.4rem); }
  .interview-prompt-foot { margin-top: 23px; }
  .interview-answer { margin-top: 14px; padding: 20px; }
  .interview-answer-input { min-height: 160px; }
  .interview-answer-footer { align-items: stretch; flex-direction: column; gap: 14px; }
  .interview-answer-footer button { width: 100%; }
  .interview-sidebar { display: grid; grid-template-columns: 1fr; }
  .interview-sidebar-person { display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 15px; padding-bottom: 17px; }
  .interview-avatar { grid-row: span 4; width: 52px; height: 52px; margin: 0; border-radius: 17px; font-size: 19px; }
  .interview-sidebar-person .interview-overline { align-self: end; }
  .interview-sidebar-person h3 { align-self: end; margin-top: 1px; font-size: 16px; }
  .interview-sidebar-personality { align-self: start; margin-top: 0; }
  .interview-listening-status { justify-self: start; margin-top: 7px; }
  .interview-sidebar-section { padding: 20px 0; }
  .interview-answer-cues { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
  .interview-answer-cues li { gap: 7px; }
  .interview-exit { margin-top: 23px; }
}
@media (max-width: 420px) {
  .interview-session-title h1 { font-size: 1.8rem; }
  .interview-prompt-topline { gap: 9px; }
  .interview-interviewer-mark { width: 34px; height: 34px; }
  .interview-prompt-label { font-size: 8px; }
  .interview-prompt-foot > span:last-child { text-align: right; }
  .interview-answer-cues { grid-template-columns: 1fr; gap: 13px; }
  .interview-exit > span { max-width: 150px; text-align: right; }
}
@media (prefers-reduced-motion: reduce) {
  .interview-live-indicator::after { animation: none; }
  .interview-progress-track > span,.interview-answer,.interview-exit a,.interview-skip-link { transition: none; }
}

/* Keep the interview room calm; reserve the accent for meaningful states. */
.interview-room {
  background: radial-gradient(ellipse at 78% 0%,rgba(141,141,141,.045),transparent 38rem),linear-gradient(180deg,#0e0e10 0%,#0e0e10 52%,#0e0e10 100%) !important;
}
.interview-room .interview-live-indicator { background: #bdbdc4; box-shadow: 0 0 0 4px rgba(200,200,200,.075); }
.interview-room .interview-live-indicator::after { border-color: rgba(200,200,200,.25); }
.interview-room .interview-progress-track > span { background: #bdbdc4; box-shadow: 0 0 10px rgba(200,200,200,.12); }
.interview-room .interview-prompt {
  background: linear-gradient(145deg,rgba(30,30,30,.96),rgba(19,19,19,.96));
  box-shadow: 0 26px 70px rgba(0,0,0,.17),inset 0 1px 0 rgba(255,255,255,.035);
}
.interview-room .interview-prompt::before { background: linear-gradient(180deg,rgba(200,200,200,.52),rgba(200,200,200,.04)); }
.interview-room .interview-prompt > .interview-overline { color: #bdbdc4; }
.interview-room .interview-question-mark { display: grid; width: 39px; height: 39px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(235,235,235,.12); border-radius: 12px; color: #bdbdc4; background: rgba(255,255,255,.035); font-family: var(--font-geist-mono),monospace; font-size: 12px; font-weight: 600; }
.interview-room .interview-sidebar-section { border-bottom: 1px solid rgba(235,235,235,.09); }
.interview-room .interview-sidebar-section:last-of-type { border-bottom: 0; }
.interview-room .interview-sidebar-heading { margin: 10px 0 0; color: #f5f5f7; font-size: 17px; font-weight: 570; letter-spacing: -.025em; }
.interview-room .interview-sidebar-copy { margin: 7px 0 0; color: #9a9aa2; font-size: 11px; line-height: 1.6; }
.interview-room .interview-answer-cues li > span { color: #bdbdc4; }
.interview-room .interview-listening-status { border-color: rgba(235,235,235,.1); color: #bdbdc4; background: rgba(255,255,255,.025); }
.interview-room .interview-listening-status i { background: #bdbdc4; }

.coding-workspace { overflow: hidden; margin-top: 18px; border: 1px solid rgba(230,230,230,.12); border-radius: 17px; background: #0e0e10; box-shadow: 0 18px 48px rgba(0,0,0,.17); }
.coding-workspace-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; border-bottom: 1px solid rgba(230,230,230,.09); padding: 15px 17px; }
.coding-workspace-header .interview-overline { color: #9a9aa2; font-size: 9px; }
.coding-workspace-header h3 { margin: 4px 0 0; color: #f5f5f7; font-size: 13px; font-weight: 600; }
.coding-workspace-actions { display: flex; align-items: center; gap: 7px; }
.coding-language-label { color: #9a9aa2; font-size: 10px; }
.coding-language-select { min-height: 34px; border: 1px solid rgba(230,230,230,.13); border-radius: 8px; padding: 0 25px 0 10px; color: #f5f5f7; background: #0e0e10; font-size: 11px; }
.coding-tool-button { min-width: 42px; min-height: 34px; border: 1px solid rgba(230,230,230,.1); border-radius: 8px; padding: 0 9px; color: #bdbdc4; background: rgba(255,255,255,.025); font-size: 10px; cursor: pointer; transition: background .18s ease,color .18s ease,border-color .18s ease; }
.coding-tool-button:hover { border-color: rgba(230,230,230,.2); color: #f5f5f7; background: rgba(255,255,255,.07); }
.coding-language-select:focus-visible,.coding-tool-button:focus-visible { outline: 2px solid #bdbdc4; outline-offset: 2px; }
.coding-editor { display: grid; min-height: 240px; max-height: 440px; grid-template-columns: 42px minmax(0,1fr); background: #0e0e10; }
.coding-editor-gutter { overflow: hidden; padding-block: 16px; border-right: 1px solid rgba(230,230,230,.07); color: #9a9aa2; font-family: var(--font-geist-mono),monospace; font-size: 11px; line-height: 1.7; text-align: right; user-select: none; }
.coding-editor-gutter span { display: block; padding-right: 12px; }
.coding-editor-input { width: 100%; min-height: 240px; resize: vertical; border: 0; padding: 16px; color: #f5f5f7; background: transparent; font-family: var(--font-geist-mono),monospace; font-size: 12px; line-height: 1.7; tab-size: 2; white-space: pre; outline: none; }
.coding-editor-input:focus-visible { outline: 2px solid rgba(200,200,200,.55); outline-offset: -3px; }
.coding-workspace-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; border-top: 1px solid rgba(230,230,230,.08); padding: 11px 16px; }
.coding-workspace-footer p { margin: 0; color: #9a9aa2; font-size: 10px; line-height: 1.5; }
.coding-workspace-footer [role="status"] { flex: 0 0 auto; color: #bdbdc4; font-size: 9px; text-align: right; }

@media (max-width: 700px) {
  .interview-room .interview-question-mark { width: 34px; height: 34px; }
  .coding-workspace-header { align-items: flex-start; flex-direction: column; }
  .coding-workspace-actions { width: 100%; flex-wrap: wrap; }
  .coding-language-label { margin-right: auto; }
  .coding-editor { min-height: 210px; grid-template-columns: 34px minmax(0,1fr); }
  .coding-editor-input { min-height: 210px; padding: 13px 11px; font-size: 11px; }
  .coding-workspace-footer { align-items: flex-start; flex-direction: column; }
  .coding-workspace-footer [role="status"] { text-align: left; }
}
@media (prefers-reduced-motion: reduce) { .coding-tool-button { transition: none; } }

/* Existing application screens use the same tokens as the public page. */
.app-frame main:not(.landing-page) { background: var(--background); color: var(--foreground); }
.app-frame main:not(.landing-page) > div:not(.grillr-nav-shell):not(.grillr-nav):not(.grillr-nav-shell *) { min-width: 0; }
.app-frame main:not(.landing-page) > .max-w-6xl,.app-frame main:not(.landing-page) > .max-w-5xl { padding-top: clamp(40px,5vw,72px); padding-bottom: 80px; }
.app-frame main:not(.landing-page) > div > div:first-child h1 { font-size: clamp(1.75rem,1.2rem + 2vw,2.75rem); font-weight: 450; }
.app-frame main:not(.landing-page) > div > section:first-child h1 { font-weight: 450; }
.app-frame main:not(.landing-page) [role="alert"] { color: var(--error); border-color: rgba(226,166,164,.24); background: var(--error-surface); border-radius: 14px; }
.app-frame main:not(.landing-page) [role="alert"] h1 { color: var(--foreground); }
.app-frame main:not(.landing-page) [role="alert"] p { color: var(--error); }
.app-frame main:not(.landing-page) .surface-card { background: var(--surface); }
main button[role="option"] { width: 100%; justify-content: flex-start; box-shadow: none; border-radius: 10px; }
main button[aria-haspopup="listbox"] { justify-content: space-between; background: #101012; }
.login-page,.signup-page { background: radial-gradient(ellipse at 10% 20%,rgba(255,255,255,.035),transparent 40rem),var(--background); }
.login-surface,.signup-surface { border-color: var(--border-strong); background: var(--surface); box-shadow: 0 30px 100px rgba(0,0,0,.35); }
.login-surface:hover,.signup-surface:hover { transform: none; }
.login-surface > section:first-child,.signup-surface > section:first-child { background: linear-gradient(160deg,rgba(255,255,255,.04),transparent),#151517; }
.login-auth-panel { background: #101012; }
.signup-surface > section:last-child { background: #101012; }
.signup-surface h1,.login-surface h1 { font-weight: 400; letter-spacing: -.045em; }
.auth-title { margin-top: 12px; font-size: clamp(2rem,1rem + 2vw,3rem); line-height: 1.15; }
.auth-home { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 32px; color: var(--muted); font-size: .8125rem; text-decoration: none; }
.auth-home:hover { color: white; }
.auth-subtitle { margin-bottom: 20px; color: var(--muted); }
.oauth-button { width: 100%; border-radius: 999px; }
.auth-skeleton { width: min(420px,calc(100% - 40px)); margin: 20vh auto; }
.auth-skeleton > div { height: 48px; margin-bottom: 18px; border-radius: 14px; background: var(--surface-raised); }
.auth-skeleton > div:first-child { width: 65%; height: 30px; }

.ai-core-shell { --ai-ink: var(--foreground); --ai-muted: var(--muted); --ai-faint: var(--caption); --ai-border: var(--border); --ai-panel: var(--surface); --ai-panel-deep: #101012; --ai-mint: var(--foreground); --ai-mint-strong: #fff; --ai-coral: var(--error); }
.ai-core-container { max-width: 1200px; }
.ai-core-shell .ai-conversation-panel,.ai-core-shell .ai-control-rail { border-radius: 24px; background: var(--surface); }
.ai-core-shell .ai-message-body p { color: #b9b9c2; }
.ai-core-shell .ai-message-user .ai-message-body p { border-color: var(--border); color: var(--foreground); background: var(--surface-raised); }
.ai-core-shell .ai-message-avatar,.ai-core-shell .ai-empty-icon,.ai-core-shell .ai-code-block,.ai-core-shell .ai-json-viewer,.ai-core-shell .ai-composer { background: #101012; border-color: var(--border); }
.ai-code-block pre { color: #c8c8d1; }
.ai-core-shell .ai-composer:focus-within { border-color: var(--focus-ring); box-shadow: 0 0 0 3px rgba(255,255,255,.04); }
.ai-core-shell .ai-select-control { justify-content: flex-start; }
.ai-core-shell .ai-model-orb { background: #e0e0e6; color: #111113; }
.ai-core-shell .ai-prompt-mark { color: #d0d0d8; background: #29292e; }
.ai-core-shell .ai-send-button { width: 44px; min-width: 44px; padding: 12px; }
.ai-live-dot,.ai-status-dot,.ai-pulse-dot { background: var(--success); box-shadow: none; }
.ai-core-shell .ai-status-pill { color: var(--success); background: rgba(162,198,176,.04); }
.ai-core-shell .ai-help-button { min-width: 44px; width: 44px; height: 44px; }
.ai-core-shell .ai-back-button { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.ai-json-viewer b,.ai-json-viewer em,.ai-json-viewer i { color: #b9b9c2; }
.ai-core-shell .ai-error-banner { border-color: rgba(226,166,164,.2); color: var(--error); background: var(--error-surface); }
.ai-shortcut kbd { background: #222225; border-color: var(--border); color: var(--muted); }
.ai-model-badge { color: #111113; }

.app-frame .interview-room { background: var(--background) !important; color: var(--foreground) !important; overflow: visible; }
.interview-room::before { display: none; }
.interview-room .interview-prompt { border-radius: 24px; background: linear-gradient(145deg,#1a1a1d,#111113); text-align: center; }
.interview-room .interview-prompt::before { display: none; }
.interview-prompt > .interview-overline { justify-content: center; color: var(--caption); }
.interview-prompt h2 { margin-inline: auto; color: var(--foreground); font-weight: 400; font-size: clamp(1.6rem,1rem + 2vw,2.75rem); }
.interview-prompt-hint { margin-inline: auto; color: var(--muted); }
.interview-room .interview-progress-track > span { background: #dedee4; box-shadow: none; }
.interview-room .interview-live-indicator { background: var(--success); box-shadow: 0 0 0 4px rgba(162,198,176,.06); }
.interview-room .interview-live-indicator::after { border-color: rgba(162,198,176,.2); }
.interview-prompt-label,.interview-session-detail,.interview-overline { color: var(--muted); }
.interview-room .interview-word-count strong { color: var(--foreground); }
.interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] { padding: 24px; border-radius: 24px; background: var(--surface); }
.interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > button {
  --glass-fill: rgba(255,255,255,.92); --glass-hover: #fff; --glass-ink: #111113; --glass-solid: #f0f0f2;
  border: 1px solid rgba(255,255,255,.8); color: var(--glass-ink); background: var(--glass-fill); box-shadow: var(--shadow-glass);
}
.interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > button:hover { background: var(--glass-hover); }
.interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:first-of-type > div > div > span:first-child { border-color: var(--border); color: var(--foreground); background: var(--surface-raised); }
.interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div:not(:first-child) { background: #171719; }
.interview-room .interview-main-column > [role="status"] > span { background: var(--success); box-shadow: none; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] input[type="range"] { accent-color: #dedee4; }
.interview-transcript,.interview-answer { background: var(--surface); border-color: var(--border); border-radius: 24px; }
.interview-answer:focus-within { border-color: var(--border-strong); box-shadow: var(--shadow-soft); }
.interview-answer-input,.coding-editor-input { border-radius: 0; }
.interview-room .interview-sidebar-note > span { color: var(--muted); border-color: var(--border-strong); }
.interview-room .interview-answer-cues li > span { color: var(--caption); }
.interview-room .interview-sidebar-heading { color: var(--foreground); }
.interview-sidebar-copy,.interview-sidebar-note p,.interview-answer-cues small { color: var(--muted); font-size: .75rem; }
.interview-answer-cues strong { font-size: .8125rem; }
.interview-room .interview-interviewer-mark,.interview-avatar { background: #232326; color: #ededf2; border-color: var(--border-strong); }
.interview-room .interview-feedback,.interview-room .interview-completion { border: 1px solid var(--border); border-radius: 24px; padding: clamp(24px,4vw,48px); background: var(--surface); }
.interview-feedback .interview-score { border-color: var(--border-strong); background: var(--surface-raised); }
.interview-skip-link { color: #111113; background: #f5f5f7; }
.coding-workspace { border-radius: 24px; background: var(--surface); }
.coding-editor { background: #0e0e10; }
.coding-editor-input { font-family: var(--font-geist-mono),monospace; }
.coding-language-select { border-radius: 10px; }
.coding-editor-gutter { color: var(--caption); }
.coding-workspace-footer p,.coding-workspace-footer [role="status"] { color: var(--muted); font-size: .6875rem; }
.live-waveform { display: flex; align-items: center; justify-content: center; gap: 4px; min-height: 56px; margin-top: 18px; }
.live-waveform span { width: 3px; height: var(--bar-height); border-radius: 99px; background: #d2d2dc; transform-origin: center; }
.live-waveform.is-active span { animation: voice-wave 1.8s ease-in-out var(--bar-delay) infinite alternate; }
.live-waveform:not(.is-active) span { opacity: .25; transform: scaleY(.2); }

.site-footer { margin-top: auto; border-top: 1px solid var(--border); background: #0a0a0b; }
.site-footer-main { display: flex; width: min(1200px,calc(100% - 80px)); margin-inline: auto; align-items: center; justify-content: space-between; gap: 32px; padding-block: 45px; }
.site-footer-wordmark { display: inline-flex; align-items: center; gap: 10px; color: #efeff4; font-size: 1.25rem; font-weight: 500; letter-spacing: -.06em; text-decoration: none; }
.site-footer-mark { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid var(--border-strong); border-radius: 9px; font-size: 1rem; }
.site-footer-brand p { margin: 10px 0 0; color: var(--caption); font-size: .75rem; }
.site-footer-explore { display: flex; flex-wrap: wrap; gap: 24px; }
.site-footer-explore a { display: inline-flex; min-height: 44px; align-items: center; color: var(--muted); font-size: .75rem; text-decoration: none; }
.site-footer-explore a:hover { color: white; }
.site-footer-bottom { display: flex; width: min(1200px,calc(100% - 80px)); margin-inline: auto; justify-content: space-between; border-top: 1px solid var(--border); padding-block: 18px 24px; color: var(--caption); font-size: .625rem; }
@media (max-width: 767px) {
  .site-footer-main,.site-footer-bottom { width: calc(100% - 40px); }
  .site-footer-main { align-items: flex-start; flex-direction: column; padding-block: 32px; gap: 18px; }
  .site-footer-explore { gap: 18px; }
  .interview-session-header { align-items: stretch; flex-direction: column; }
  .interview-progress { width: 100%; }
  .interview-room .interview-workspace { grid-template-columns: minmax(0,1fr); }
  .interview-room .interview-prompt { padding: 24px 20px; }
  .interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] { padding: 18px; }
  .interview-prompt-label { font-size: .5rem; }
  .ai-composer-footer { flex-wrap: wrap; }
  .ai-send-button { margin-left: auto; }
  .ai-code-block pre { max-width: calc(100vw - 100px); }
}
@media (max-width: 500px) {
  .app-frame main:not(.landing-page) > div > div:first-child:has(h1):not(.grillr-nav-shell *) { align-items: flex-start; flex-direction: column; }
  .app-frame main:not(.landing-page) section > div.flex.gap-3:has(a) { flex-wrap: wrap; }
}
@media (forced-colors: active) {
  .hero-copy h1 span { background: none; -webkit-text-fill-color: CanvasText; }
  .glass-button,main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)) { border: 1px solid ButtonText; color: ButtonText; }
  .feedback-score-track > span { background: Highlight; }
}
.session-clock { display: flex; width: fit-content; align-items: center; gap: 8px; margin: 0 0 14px auto; border: 1px solid var(--border-strong); border-radius: 999px; padding: 7px 12px; color: #c7c7d0; background: rgba(255,255,255,.035); font-family: var(--font-geist-mono),monospace; font-size: .75rem; }
/* Freeze inherited navbar values from the previous theme as well. */
.app-frame .grillr-nav-shell { color: #e9e9e1; }
.app-frame .landing-page .grillr-nav-shell { color: #f1f0eb; }
.landing-page .grillr-nav-shell a:focus-visible,.landing-page .grillr-nav-shell button:focus-visible { outline: 3px solid #d0f36a; outline-offset: 3px; }
.landing-cta-placeholder { min-height: 100px; }
@media (max-width: 380px) { .landing-cta-placeholder { min-height: 148px; } }
.result-score { max-width: 640px; border: 1px solid var(--border); border-radius: 16px; padding: 20px 24px 24px; background: #19191c; }
.result-score .feedback-score-label { margin-top: 0; }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  main :where(button):not(.grillr-nav-shell *):not(:where([role="option"], [role="option"] *)),main .glass-button,.landing-button,main :where(a).oauth-button { background: var(--glass-solid,#242427) !important; }
}
.interview-main-column { display: flex; flex-direction: column; }
.interview-main-column > * { order: 2; }
.interview-main-column > .interview-prompt { order: 0; }
.interview-main-column > section[aria-labelledby="voice-answer-heading"] { order: 1; margin-top: 18px; }
.interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] > .live-waveform { background: transparent; }
.app-frame .interview-room .interview-main-column > section[aria-labelledby="voice-answer-heading"] > div[role="alert"] { border-color: rgba(226,166,164,.24); background: var(--error-surface); color: var(--error); }

/* User-requested navbar finish: transparent monochrome glass. */
.app-frame .grillr-nav-shell { background: transparent; }
.app-frame .grillr-nav {
  border-color: rgba(255,255,255,.14);
  background: rgba(255,255,255,.045);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12),0 12px 36px rgba(0,0,0,.18);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  backdrop-filter: blur(20px) saturate(140%);
}
.app-frame .grillr-brand-mark,
.landing-page .grillr-brand:hover .grillr-brand-mark {
  border-color: rgba(255,255,255,.2);
  background: rgba(255,255,255,.055);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
}
.app-frame .grillr-brand-tagline { color: #9a9aa2; }
.app-frame .grillr-nav-signin,.app-frame .grillr-nav-action-muted {
  border-color: rgba(255,255,255,.14);
  background: rgba(255,255,255,.04);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1);
}
.app-frame .grillr-nav-signup,.app-frame .grillr-mobile-auth-primary {
  color: #111113;
  background: rgba(255,255,255,.92);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.6),0 6px 18px rgba(0,0,0,.12);
}
.app-frame .grillr-nav-signup:hover,.app-frame .grillr-mobile-auth-primary:hover { color: #111113; background: #fff; box-shadow: inset 0 1px 0 #fff,0 8px 22px rgba(0,0,0,.2); }
.app-frame .grillr-menu-button:hover { border-color: rgba(255,255,255,.3); color: #fff; background: rgba(255,255,255,.09); }
.app-frame .grillr-mobile-menu {
  border-color: rgba(255,255,255,.14);
  background: rgba(19,19,21,.8);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12),0 18px 46px rgba(0,0,0,.35);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  backdrop-filter: blur(24px) saturate(140%);
}
.app-frame .grillr-mobile-link:hover,.app-frame .grillr-mobile-link.is-active { color: #fff; background: rgba(255,255,255,.07); }
.app-frame [class*="bg-[#edf4ff]"] { color: #e5e5eb; background: rgba(255,255,255,.1); }
.landing-page .grillr-nav-shell a:focus-visible,.landing-page .grillr-nav-shell button:focus-visible { outline-color: rgba(255,255,255,.5); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .app-frame .grillr-nav,.app-frame .grillr-mobile-menu { background: #19191c; }
}

/* Keep the first conversation and its actions within the opening viewport. */
.home-hero { padding-block: clamp(24px,4svh,44px); }
.hero-copy h1 { margin-block: 18px; font-size: clamp(4.25rem,12svh,7rem); }
.hero-description { font-size: .875rem; line-height: 1.7; }
.landing-cta-row { margin-top: 20px; }
.hero-explore { margin-top: 0; }
.hero-note { margin-top: 10px; }
.laptop-scene { padding-block: 16px; }
.laptop-caption { margin-top: 20px; }
.landing-cta-placeholder { margin-top: 20px; min-height: 92px; }
@media (max-width: 767px) {
  .home-hero { padding-block: 20px; }
  .home-hero-grid { gap: 16px; }
  .hero-copy h1 { margin-block: 12px; font-size: clamp(3.25rem,8.8svh,4.125rem); }
  .hero-description { font-size: .8125rem; line-height: 1.6; }
  .hero-explore { display: none; }
  .landing-cta-row { flex-direction: row; flex-wrap: nowrap; gap: 8px; margin-top: 16px; }
  .landing-cta-row .landing-button { min-width: 0; padding-inline: 12px; font-size: .6875rem; gap: 6px; }
  .hero-note { font-size: .625rem; }
  .laptop-scene { padding-block: 6px; }
  .laptop-screen { min-height: 254px; padding: 10px 12px 8px; }
  .preview-question { padding: 10px 4px 0; }
  .preview-question h2 { font-size: .9375rem; }
  .preview-waveform { max-height: 44px; min-height: 30px; }
  .laptop-caption { display: none; }
  .landing-cta-placeholder { margin-top: 16px; min-height: 44px; }
}
@media (min-width: 480px) and (max-width: 767px) {
  .home-hero-grid { grid-template-columns: minmax(0,1fr) minmax(0,1.1fr); gap: 12px; }
  .hero-copy h1 { font-size: clamp(3.25rem,10svh,4.2rem); }
  .hero-copy > .eyebrow { font-size: .5rem; letter-spacing: .14em; gap: 6px; }
  .eyebrow-rule { width: 12px; flex-shrink: 0; }
  .landing-cta-row { flex-wrap: wrap; }
  .laptop-scene { width: 100%; }
  .laptop-device { width: calc(100% - 12px); transform: rotateY(-6deg) rotateZ(-1deg); }
  .laptop-screen { padding-inline: 8px; }
  .preview-question h2 { font-size: .8125rem; }
  .preview-question .eyebrow { font-size: .375rem; letter-spacing: .12em; }
  .preview-toolbar { gap: 6px; }
  .preview-brand { font-size: .75rem; gap: 4px; }
  .preview-brand > span,.preview-time { font-size: .5rem; }
  .preview-waveform { gap: 2px; }
  .preview-waveform span { width: 2px; }
  .preview-controls { gap: 5px; }
  .preview-controls .glass-button--sm { padding-inline: 9px; }
  .laptop-base { width: calc(100% + 28px); margin-left: -14px; height: 20px; }
}
.laptop-screen { width: 100%; min-width: 0; }
.preview-question { min-width: 0; }
.preview-waveform { overflow: hidden; }
@media (min-width: 480px) and (max-width: 767px) {
  .laptop-screen { aspect-ratio: auto; }
  .preview-brand { flex-shrink: 0; }
}
.hero-copy h1 span { white-space: nowrap; }

/* One navbar-derived logo and wordmark across every surface. */
.grillr-logo { border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.055); box-shadow: inset 0 1px 0 rgba(255,255,255,.12); vertical-align: middle; }
.grillr-logo-lockup { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; text-align: left; }
.grillr-logo-wordmark { display: grid; gap: 4px; }
.grillr-logo-wordmark strong { color: #f1f1eb; font-size: .625rem; font-weight: 800; letter-spacing: .18em; line-height: 1; }
.grillr-logo-wordmark small { color: #9a9aa2; font-size: .4375rem; font-weight: 700; letter-spacing: .18em; line-height: 1; }
.preview-brand.grillr-logo-lockup { gap: 6px; }
.preview-brand .grillr-logo-wordmark strong { font-size: .5rem; }

/* Menu choices are flat rows, not separate glass buttons. */
main .dropdown-option {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: flex-start;
  border: 0;
  border-radius: 8px;
  color: var(--muted);
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  cursor: pointer;
  transition: background 200ms ease-out,color 200ms ease-out;
}
main .dropdown-option:hover,
main .dropdown-option[data-active="true"],
main .dropdown-option[aria-selected="true"],
main [role="option"][aria-selected="true"] > .dropdown-option,
main .dropdown-option:focus-visible {
  color: var(--foreground);
  background: rgba(255,255,255,.065);
  box-shadow: none;
  transform: none;
}
main .dropdown-option:focus-visible { outline: none; }
@media (prefers-reduced-motion: reduce) { main .dropdown-option { transition: none; } }

/* Practice dashboard: quieter surfaces, real scores, one clear next step. */
.dashboard-page { min-height: 100vh; background: radial-gradient(ellipse at 45% 0,rgba(255,255,255,.025),transparent 55%),var(--background); }
.dashboard-container { max-width: 1248px; margin: 0 auto; padding: 48px 32px 28px; }
.dashboard-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 32px; }
.dashboard-heading .eyebrow { margin: 0 0 14px; font-size: .625rem; }
.dashboard-heading h1 { margin: 0; font-size: clamp(1.8rem,1.2rem + 1.8vw,2.5rem); font-weight: 450; letter-spacing: -.045em; line-height: 1.2; overflow-wrap: anywhere; }
.dashboard-heading > div > p:last-child { color: var(--muted); margin: 12px 0 0; font-size: .875rem; line-height: 1.7; }
.dashboard-text-link { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: #c1c1c8; font-size: .75rem; text-decoration: none; }
.dashboard-text-link:hover { color: white; }
.dashboard-text-link svg { width: 15px; height: 15px; }
.dashboard-feature-grid,.dashboard-detail-grid { display: grid; grid-template-columns: minmax(0,1.8fr) minmax(0,1fr); gap: 20px; }
.dashboard-practice-card { display: flex; align-items: center; position: relative; isolation: isolate; min-width: 0; min-height: 320px; padding: 32px; border: 1px solid rgba(255,255,255,.11); border-radius: 24px; background: radial-gradient(ellipse at 96% 10%,rgba(255,255,255,.065),transparent 65%),linear-gradient(125deg,#1c1c20,#101012); overflow: hidden; }
.dashboard-practice-card:after { position: absolute; content: ''; inset: 0; z-index: -1; background: repeating-linear-gradient(120deg,transparent 0,transparent 85px,rgba(255,255,255,.014) 86px,transparent 87px); pointer-events: none; }
.dashboard-practice-copy { position: relative; z-index: 1; flex: 1; }
.dashboard-kicker { display: flex; align-items: center; gap: 8px; font-size: .5625rem; letter-spacing: .16em; color: #b5b5bf; font-weight: 500; }
.dashboard-kicker > span { height: 5px; width: 5px; background: #c8c8d0; border-radius: 50%; box-shadow: 0 0 12px #ffffff30; }
.dashboard-practice-copy h2 { font-size: clamp(1.85rem,1.2rem + 1.4vw,2.55rem); font-weight: 450; line-height: 1.13; letter-spacing: -.045em; margin: 22px 0 14px; }
.dashboard-practice-copy h2 > span { color: #a7a7b1; }
.dashboard-practice-copy > p { max-width: 340px; color: #a6a6af; font-size: .8125rem; line-height: 1.8; margin: 0 0 24px; }
.dashboard-practice-copy .glass-button { border-radius: 999px; font-size: .75rem; padding-inline: 20px; }
.dashboard-practice-note { display: block; margin-top: 12px; color: #92929d; font-size: .625rem; }
.dashboard-voice-art { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; align-self: stretch; flex: 0 0 180px; min-height: 250px; margin-right: -12px; }
.dashboard-orbit { position: absolute; border: 1px solid #ffffff09; border-radius: 50%; width: 218px; height: 218px; top: 17px; }
.dashboard-orbit--inner { width: 165px; height: 165px; top: 44px; border-style: dashed; transform: rotate(20deg); }
.dashboard-voice-core { display: grid; place-items: center; width: 80px; height: 80px; border: 1px solid #ffffff25; border-radius: 24px; background: linear-gradient(145deg,#ffffff15,#ffffff03); box-shadow: inset 0 1px 0 #ffffff20,0 15px 50px #0006; transform: rotate(-7deg); }
.dashboard-voice-core svg { width: 31px; height: 31px; color: #c6c6d0; transform: rotate(7deg); }
.dashboard-voice-bars { height: 64px; display: flex; align-items: center; gap: 4px; margin-top: 23px; }
.dashboard-voice-bars span { width: 3px; border-radius: 3px; background: linear-gradient(#c5c5cf,#5b5b66); opacity: .65; }
.dashboard-voice-art > span { margin-top: 8px; font-size: .4rem; letter-spacing: .18em; color: #92929e; }
.dashboard-focus-card { padding: 28px; background: #111113; border: 1px solid var(--border); border-radius: 24px; display: flex; flex-direction: column; align-items: flex-start; }
.dashboard-icon-tile { display: grid; place-items: center; flex-shrink: 0; width: 38px; height: 38px; border: 1px solid var(--border); border-radius: 12px; background: #ffffff04; color: #b4b4bf; }
.dashboard-icon-tile svg { width: 19px; height: 19px; }
.dashboard-overline { color: #93939f; font-size: .5625rem; font-weight: 500; letter-spacing: .15em; line-height: 1.5; margin: 0 0 8px; }
.dashboard-focus-card > .dashboard-overline { margin-top: 22px; }
.dashboard-focus-card h2 { font-size: 1.375rem; font-weight: 450; letter-spacing: -.035em; margin: 0 0 12px; line-height: 1.3; }
.dashboard-focus-card > p:not(.dashboard-overline) { font-size: .8125rem; line-height: 1.8; color: var(--muted); margin: 0 0 22px; }
.dashboard-focus-footer { border-top: 1px solid var(--border); padding-top: 15px; margin-top: auto; width: 100%; }
.dashboard-focus-footer span,.dashboard-focus-footer strong { display: block; font-size: .625rem; font-weight: 400; line-height: 1.7; }
.dashboard-focus-footer span { color: #90909b; margin-bottom: 3px; }
.dashboard-focus-footer strong { color: #c2c2ca; }
.dashboard-stats-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; margin-top: 24px; margin-bottom: 28px; }
.dashboard-stat { padding: 22px 24px; border: 1px solid var(--border); background: #111113; border-radius: 20px; }
.dashboard-stat > div { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.dashboard-stat p { font-size: .75rem; color: #b1b1bb; margin: 0; }
.dashboard-stat svg { width: 17px; height: 17px; color: #8c8c98; }
.dashboard-stat > strong { display: block; font-weight: 450; font-size: 2.25rem; letter-spacing: -.06em; line-height: 1.1; margin: 20px 0 10px; font-variant-numeric: tabular-nums; }
.dashboard-stat small { font-size: .8125rem; letter-spacing: 0; color: #8f8f9b; margin-left: 5px; }
.dashboard-stat > span { font-size: .625rem; color: #93939f; line-height: 1.7; display: block; }
.dashboard-panel { min-width: 0; border: 1px solid var(--border); border-radius: 24px; background: #111113; padding: 26px; }
.dashboard-panel-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.dashboard-panel-heading h2 { font-size: 1.125rem; font-weight: 450; letter-spacing: -.025em; margin: 0; }
.dashboard-panel-heading .dashboard-text-link { font-size: .6875rem; white-space: nowrap; }
.dashboard-session-list { list-style: none; margin: 20px 0 0; padding: 0; }
.dashboard-session-list li + li { border-top: 1px solid var(--border); }
.dashboard-session-row { display: flex; align-items: center; gap: 14px; padding: 19px 0; text-decoration: none; border-radius: 8px; transition: background 200ms ease-out; }
.dashboard-session-row:hover { background: #ffffff03; }
.dashboard-session-icon { height: 37px; width: 37px; border-radius: 12px; background: #ffffff04; border: 1px solid var(--border); display: grid; place-items: center; color: #92929e; flex-shrink: 0; }
.dashboard-session-icon svg { width: 17px; height: 17px; }
.dashboard-session-description { flex: 1; min-width: 0; }
.dashboard-session-description strong { display: block; font-size: .8125rem; font-weight: 500; overflow-wrap: anywhere; line-height: 1.5; }
.dashboard-session-description > span { display: block; color: #9797a3; font-size: .625rem; margin-top: 4px; text-transform: capitalize; }
.dashboard-session-status { font-size: .5625rem; color: #b2b2bd; border: 1px solid var(--border); border-radius: 999px; padding: 4px 8px; white-space: nowrap; }
.dashboard-session-status--completed { color: var(--success); background: #a2c6b007; }
.dashboard-session-status--active,.dashboard-session-status--created { color: var(--warning); background: #d4bc9308; }
.dashboard-session-score { min-width: 46px; text-align: right; font-variant-numeric: tabular-nums; }
.dashboard-session-score strong { font-size: 1rem; font-weight: 500; }
.dashboard-session-score small { color: #90909b; font-size: .5625rem; margin-left: 2px; }
.dashboard-session-action { color: #b8b8c3; font-size: .625rem; }
.dashboard-session-row > svg { width: 13px; height: 13px; color: #878793; flex-shrink: 0; }
.dashboard-out-of { color: #9797a3; font-size: .6875rem; }
.dashboard-panel-caption { color: #9797a3; font-size: .6875rem; line-height: 1.7; margin: 12px 0 0; }
.dashboard-skills { margin-top: 28px; }
.dashboard-skills > div + div { margin-top: 23px; }
.dashboard-skill-label { display: flex; justify-content: space-between; gap: 12px; font-size: .6875rem; margin-bottom: 10px; color: #b6b6c1; }
.dashboard-skill-label strong { font-size: .6875rem; font-weight: 450; font-variant-numeric: tabular-nums; color: #ededf2; }
.dashboard-meter,.dashboard-meter-empty { display: block; width: 100%; height: 5px; appearance: none; border: 0; border-radius: 99px; background: #ffffff0c; overflow: hidden; }
.dashboard-meter::-webkit-meter-bar { border: 0; border-radius: 99px; background: #ffffff0c; height: 5px; }
.dashboard-meter::-webkit-meter-optimum-value { background: linear-gradient(90deg,#7e7e8d,#dedee5); border-radius: 99px; }
.dashboard-meter::-moz-meter-bar { background: #c8c8d2; border-radius: 99px; }
.dashboard-profile-note { margin: 27px 0 0; padding-top: 16px; border-top: 1px solid var(--border); font-size: .625rem; color: #92929e; line-height: 1.7; }
.dashboard-empty { min-height: 245px; padding: 36px 16px 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.dashboard-empty h3 { font-size: .9375rem; font-weight: 450; letter-spacing: -.025em; margin: 18px 0 10px; }
.dashboard-empty > p { color: #a0a0ac; font-size: .75rem; line-height: 1.8; max-width: 290px; margin: 0 0 14px; }
.dashboard-profile-empty { min-height: 240px; padding-inline: 0; }
.dashboard-unscored { font-size: 3rem; color: #6c6c78; font-weight: 300; }
.dashboard-error { display: flex; align-items: center; justify-content: space-between; gap: 20px; border: 1px solid #d4bc9325; background: #d4bc9308; padding: 18px 22px; margin-top: 24px; border-radius: 16px; }
.dashboard-error strong { font-size: .8125rem; font-weight: 500; color: var(--warning); }
.dashboard-error p { font-size: .75rem; color: #b4b0a9; line-height: 1.7; margin: 5px 0 0; }
.dashboard-error button { flex-shrink: 0; }
.dashboard-skeleton { border: 1px solid var(--border); border-radius: 22px; background: linear-gradient(110deg,#131315,#19191d,#131315); }
.dashboard-stat-skeleton { height: 159px; }
.dashboard-panel-skeleton { height: 330px; }
.dashboard-footer { display: flex; justify-content: space-between; gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border); font-size: .625rem; color: #93939f; }
.dashboard-container a:focus-visible { outline: 2px solid #ffffff80; outline-offset: 5px; border-radius: 8px; }
@media (min-width: 769px) and (max-width: 1080px) {
  .dashboard-feature-grid,.dashboard-detail-grid { grid-template-columns: minmax(0,1.5fr) minmax(0,1fr); }
  .dashboard-voice-art { display: none; }
  .dashboard-practice-card { padding: 28px; }
  .dashboard-session-icon { display: none; }
  .dashboard-session-row { gap: 8px; }
}
@media (max-width: 768px) {
  .dashboard-container { padding: 32px 20px 24px; }
  .dashboard-heading { display: block; margin-bottom: 24px; }
  .dashboard-heading > .dashboard-text-link { margin-top: 12px; }
  .dashboard-feature-grid,.dashboard-detail-grid { grid-template-columns: minmax(0,1fr); gap: 16px; }
  .dashboard-practice-card { min-height: 310px; padding: 26px; }
  .dashboard-voice-art { flex-basis: 145px; margin-right: -20px; }
  .dashboard-orbit--outer { width: 180px; height: 180px; top: 36px; }
  .dashboard-orbit--inner { width: 140px; height: 140px; top: 56px; }
  .dashboard-focus-card { padding: 24px; }
  .dashboard-focus-card > .dashboard-icon-tile { display: none; }
  .dashboard-focus-card > .dashboard-overline { margin-top: 0; }
  .dashboard-stats-grid { gap: 10px; margin-top: 16px; margin-bottom: 24px; }
  .dashboard-stat { padding: 17px 14px; border-radius: 16px; }
  .dashboard-stat > div { align-items: flex-start; }
  .dashboard-stat p { font-size: .6875rem; line-height: 1.5; }
  .dashboard-stat svg { display: none; }
  .dashboard-stat > strong { font-size: 1.8rem; margin-top: 17px; }
  .dashboard-stat > span { font-size: .5625rem; }
  .dashboard-panel { padding: 22px; }
  .dashboard-error { flex-direction: column; align-items: flex-start; }
  .dashboard-footer { font-size: .5625rem; }
}
@media (max-width: 460px) {
  .dashboard-container { padding-inline: 16px; }
  .dashboard-voice-art { display: none; }
  .dashboard-practice-card { min-height: 305px; }
  .dashboard-practice-copy h2 { font-size: 2rem; }
  .dashboard-session-row { flex-wrap: wrap; gap: 10px; }
  .dashboard-session-description { flex-basis: calc(100% - 50px); }
  .dashboard-session-status { margin-left: 47px; }
  .dashboard-session-score { margin-left: auto; }
  .dashboard-stat > strong { font-size: 1.6rem; }
  .dashboard-stat small { font-size: .5625rem; margin-left: 2px; }
}
````

## frontend/app/error.tsx

Changed file - complete source.

````tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GrillrBrand } from "@/components/GrillrLogo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center px-6 py-16"><section className="surface-card w-full max-w-lg p-8 text-center" role="alert"><div className="flex justify-center"><GrillrBrand /></div><h1 className="mt-5 text-3xl font-normal">A small pause in the conversation.</h1><p className="mt-5 text-sm leading-7 text-[var(--muted)]">Something didn’t load as expected. Try again when you’re ready.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button onClick={reset}>Try again</Button><Link href="/" className="glass-button glass-button--secondary">Back home</Link></div></section></main>;
}
````

## frontend/app/layout.tsx

Changed file — complete source.

````tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grillr",
  description:
    "AI-powered mock interviews with adaptive questioning and structured feedback.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--surface)] text-[var(--foreground)]">
        <AuthProvider>
          <div className="app-frame">{children}</div>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
````

## frontend/app/not-found.tsx

Changed file — complete source.

````tsx
import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";

export default function NotFound() {
  return <main className="min-h-screen"><TopNav /><section className="mx-auto max-w-xl px-6 py-24 text-center"><p className="eyebrow justify-center">GRILLR / 404</p><h1 className="mt-6 text-4xl font-normal">Let’s find your way back.</h1><p className="mt-5 text-sm leading-7 text-[var(--muted)]">This page isn’t here, but your next practice session is just a step away.</p><Link href="/" className="glass-button glass-button--primary mt-8">Back to Grillr</Link></section></main>;
}
````

## frontend/components/ConversationTurnBanner.tsx

Changed file — complete source.

````tsx
import type { TurnState } from "./VoiceAnswerPanel";

type ConversationTurnBannerProps = {
  state: TurnState;
};

const copy: Record<TurnState, { label: string; detail: string }> = {
  asking: { label: "AI is asking", detail: "Listen to the question before answering." },
  listening: { label: "Your turn", detail: "Take a moment, then answer by voice." },
  processing: { label: "Reviewing your answer", detail: "Your response is being analyzed." },
  completed: { label: "Interview complete", detail: "Your session summary is ready." },
};

export function ConversationTurnBanner({ state }: ConversationTurnBannerProps) {
  const message = copy[state];
  return <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3" aria-live="polite" aria-label={`Conversation state: ${message.label}`}><span className={`h-2.5 w-2.5 rounded-full ${state === "processing" ? "animate-pulse bg-[var(--surface)]" : state === "listening" ? "bg-[var(--success-surface)]" : "bg-[var(--surface)]"}`} /><div><p className="text-sm font-semibold text-[var(--foreground)]">{message.label}</p><p className="text-xs text-[var(--muted)]">{message.detail}</p></div></div>;
}
````

## frontend/components/HomeCTA.tsx

Changed file — complete source.

````tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-client";
import { ArrowIcon } from "@/components/landing/ArrowIcon";

export function HomeCTA() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="landing-cta-row"><Link href="/dashboard" className="landing-button landing-button-primary">Open your practice space <ArrowIcon /></Link></div>;
  }

  if (isAuthenticated) {
    return (
      <div className="landing-cta-row">
        <Link href="/interview/setup" className="landing-button landing-button-primary">
          Continue practicing <ArrowIcon />
        </Link>
        <Link href="/dashboard" className="landing-button landing-button-secondary">
          Your dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="landing-cta-row">
        <Link href="/signup" className="landing-button landing-button-primary">
          Create your account <ArrowIcon />
        </Link>
        <a href="#how-it-works" className="landing-button glass-button--ghost">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></svg>
          See how it works
        </a>
      </div>
      <Link href="/dashboard" className="hero-explore">Explore Grillr <span className="ml-2" aria-hidden="true">↗</span></Link>
    </>
  );
}
````

## frontend/components/interview/InterviewSessionView.tsx

Changed file - complete source.

````tsx
"use client";

import { GrillrLogo } from "@/components/GrillrLogo";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";
import { SpeechAnalysis } from "@/components/interview/SpeechAnalysis";
import { ScoreBar } from "@/components/interview/ScoreBar";
import {
  getInterview,
  getLatestAnswer,
  getQuestions,
  getSummary,
  startInterview,
  submitAnswer,
  type Answer,
  type Feedback,
  type InterviewQuestion,
  type InterviewSession,
  type Summary,
} from "@/lib/interview-api";

export { buildSpeechInsight, createSpeechOverview } from "@/components/interview/SpeechAnalysis";

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LoadingState() {
  return (
    <div aria-live="polite" className="interview-loading">
      <p className="interview-overline"><span className="interview-live-indicator" /> Preparing your interview room</p>
      <div className="interview-loading-title motion-safe:animate-pulse motion-reduce:animate-none" />
      <div className="interview-loading-panel motion-safe:animate-pulse motion-reduce:animate-none" />
      <p className="interview-loading-note">Getting your next question ready…</p>
    </div>
  );
}

function FeedbackPanel({ feedback, answer, isFinal, onContinue }: { feedback: Feedback; answer: Answer; isFinal: boolean; onContinue: () => void }) {
  return (
    <section aria-labelledby="feedback-heading" className="interview-feedback space-y-8" aria-live="polite">
      <div className="interview-feedback-heading flex flex-col justify-between gap-6 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-start">
        <div>
          <Badge className="border-[var(--success)] bg-[var(--success-surface)] text-[var(--success)]">Answer analyzed</Badge>
          <h2 id="feedback-heading" className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--foreground)]">A useful signal for your next attempt.</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">Attempt {answer.attempt_number} · {answer.speech_metrics?.word_count ?? answer.transcript.trim().split(/\s+/).filter(Boolean).length} words · {Math.round(answer.duration)} seconds</p>
        </div>
        <div className="interview-score flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[22px] border border-[var(--border)] bg-[var(--surface)] text-center">
          <span className="text-3xl font-semibold text-[var(--foreground)]">{feedback.overall_score}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Overall</span>
        </div>
      </div>

      <ScoreBar value={feedback.overall_score} />
      <SpeechAnalysis answer={answer} />

      <div className="interview-feedback-grid grid gap-x-8 gap-y-7 sm:grid-cols-3">
        <FeedbackList title="What worked" color="green" items={feedback.strengths} />
        <FeedbackList title="Next focus" color="orange" items={feedback.weaknesses.length ? feedback.weaknesses : feedback.suggestions} />
        <div><h3 className="text-sm font-semibold text-[var(--muted)]">Try this next</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{feedback.suggestions[0] ?? "Review your answer and choose one specific improvement."}</p></div>
      </div>
      <Button size="lg" onClick={onContinue}>{isFinal ? "View interview results" : "Continue to next question"}<span aria-hidden="true" className="ml-2">→</span></Button>
    </section>
  );
}

function FeedbackList({ title, color, items }: { title: string; color: "green" | "orange"; items: string[] }) {
  return <div><h3 className={`text-sm font-semibold ${color === "green" ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">{items.map((item) => <li key={item} className="flex gap-2"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color === "green" ? "bg-[var(--success-surface)]" : "bg-[var(--surface)]"}`} />{item}</li>)}</ul></div>;
}

function CompletionPanel({ summary }: { summary: Summary }) {
  const stats = [["Overall score", summary.overall_score], ["Questions", summary.total_questions], ["Average WPM", summary.average_wpm], ["Pauses", summary.total_pauses]] as const;
  return (
    <section aria-labelledby="completion-heading" className="interview-completion space-y-10" aria-live="polite">
      <div className="interview-completion-heading border-b border-[var(--border)] pb-8"><Badge className="border-[var(--success)] bg-[var(--success-surface)] text-[var(--success)]">Interview complete</Badge><h1 id="completion-heading" className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[var(--foreground)]">Your practice signal is ready.</h1><p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">Review the patterns from this session, then carry one clear improvement into your next answer.</p></div>
      <div className="interview-completion-stats grid gap-6 border-b border-[var(--border)] pb-8 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value], index) => <div key={label} className={`border-l-2 pl-4 ${index === 0 ? "border-[var(--border)]" : "border-[var(--border)]"}`}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{value}</p></div>)}</div>
      <div className="grid gap-8 sm:grid-cols-2"><FeedbackList title="What worked" color="green" items={summary.strengths} /><FeedbackList title="Recommendations" color="orange" items={summary.recommendations} /></div>
    </section>
  );
}

export default function InterviewSessionView() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "submitting" | "feedback" | "completed" | "error">("loading");
  const [error, setError] = useState("");
  const questionStartedAt = useRef<number | null>(null);

  const loadSession = useCallback(async (signal?: AbortSignal, restoreLatestFeedback = false) => {
    setState("loading"); setError("");
    const loaded = await getInterview(sessionId, signal);
    const active = loaded.status === "created" ? await startInterview(sessionId, signal) : loaded;
    setSession(active);
    if (active.status === "completed") { setSummary(await getSummary(sessionId, signal)); setState("completed"); return; }
    const questionData = await getQuestions(sessionId, signal);
    if (restoreLatestFeedback) {
      try {
        const latest = await getLatestAnswer(sessionId, signal);
        const answeredQuestion = questionData.items.find((item) => item.id === latest.question_id);
        if (answeredQuestion && latest.evaluation) { setQuestion(answeredQuestion); setAnswer(latest); setFeedback(latest.evaluation); setState("feedback"); return; }
      } catch (caught: unknown) {
        if (caught instanceof DOMException && caught.name === "AbortError") throw caught;
        if (!(caught instanceof Error && "status" in caught && (caught as { status?: number }).status === 404)) throw caught;
      }
    }
    const unanswered = questionData.items.find((item) => !item.answered_at);
    if (!unanswered) throw new Error("This interview has no unanswered question.");
    setQuestion(unanswered); questionStartedAt.current = Date.now(); setState("ready");
  }, [sessionId]);

  useEffect(() => { const controller = new AbortController(); void Promise.resolve().then(() => loadSession(controller.signal, true)).catch((caught: unknown) => { if (caught instanceof DOMException && caught.name === "AbortError") return; setError(caught instanceof Error ? caught.message : "We could not load this interview."); setState("error"); }); return () => controller.abort(); }, [loadSession]);

  const progress = session && question ? Math.min(100, (question.question_number / session.question_count) * 100) : 0;
  const isFinal = Boolean(session && question && question.question_number >= session.question_count);
  const wordCount = useMemo(() => draft.trim() ? draft.trim().split(/\s+/).length : 0, [draft]);

  async function handleSubmit() {
    if (!question || !draft.trim() || state === "submitting") return;
    setState("submitting"); setError("");
    try { const submitted = await submitAnswer(question.id, draft.trim(), Math.max(1, (Date.now() - (questionStartedAt.current ?? Date.now())) / 1000)); if (!submitted.evaluation) throw new Error("The answer was saved, but feedback is not available yet."); setAnswer(submitted); setFeedback(submitted.evaluation); setState("feedback"); } catch (caught: unknown) { setError(caught instanceof Error ? caught.message : "We could not submit your answer."); setState("error"); }
  }

  async function continueAfterFeedback() { if (isFinal) { await loadSession(); return; } setDraft(""); setAnswer(null); setFeedback(null); await loadSession(); }

  return (
    <main className="interview-room min-h-screen bg-[var(--surface)] text-[var(--foreground)]"><TopNav /><div className="interview-room-container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {state === "loading" ? <LoadingState /> : state === "completed" && summary ? <CompletionPanel summary={summary} /> : state === "error" ? <section role="alert" className="max-w-xl border-l-2 border-[var(--border)] pl-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Interview room</p><h1 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">We could not open this interview.</h1><p className="mt-3 leading-7 text-[var(--muted)]">{error}</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => void loadSession()}>Try again</Button><Link href="/dashboard"><Button variant="secondary">Back to dashboard</Button></Link></div></section> : session && question ? <>
  <header className="interview-session-header"><div className="interview-session-title"><p className="interview-overline"><span className="interview-live-indicator" /> Live practice session <span className="interview-overline-separator">/</span> {formatLabel(session.interview_type)}</p><h1>{session.job_role}</h1><p className="interview-session-detail">{formatLabel(session.experience_level)} level <span aria-hidden="true">·</span> {formatLabel(session.personality)} interviewer</p></div><div className="interview-progress"><div className="interview-progress-label"><span>Question <strong>{String(question.question_number).padStart(2, "0")}</strong> <span className="interview-progress-total">of {String(session.question_count).padStart(2, "0")}</span></span><span>{Math.round(progress)}% complete</span></div><div className="interview-progress-track" role="progressbar" aria-label="Interview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div></div></header>
        {state === "feedback" && feedback && answer ? <FeedbackPanel feedback={feedback} answer={answer} isFinal={isFinal} onContinue={() => void continueAfterFeedback()} /> : <section aria-labelledby="question-heading" className="interview-workspace"><div className="interview-main-column"><div className="interview-prompt"><div className="interview-prompt-topline"><div className="interview-interviewer-mark" aria-hidden="true"><GrillrLogo size={32} decorative /><i /></div><div className="interview-interviewer-copy"><span>Grillr interviewer</span><span>{formatLabel(session.personality)} · {formatLabel(session.interview_type)}</span></div><span className="interview-prompt-label">QUESTION {String(question.question_number).padStart(2, "0")}</span></div><div className="interview-prompt-rule" /><p className="interview-overline">Let’s get into it</p><h2 id="question-heading">{question.question_text}</h2><p className="interview-prompt-hint">Take a moment to think. A clear answer with one concrete example is usually stronger than a perfect one.</p><div className="interview-prompt-foot"><span><span className="interview-live-indicator" /> Interview in progress</span><span>{formatLabel(session.experience_level)} level</span></div></div>
          <div className="interview-answer"><div className="interview-answer-header"><div><p className="interview-overline">Your response</p><h3>{state === "submitting" ? "Reviewing your answer" : "Take the floor"}</h3></div><span className="interview-word-count"><strong>{wordCount}</strong> words</span></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} disabled={state === "submitting"} aria-label="Your interview answer" placeholder="Start with the situation, then explain what you did and what changed..." className="interview-answer-input" /><div className="interview-answer-footer"><p>{state === "submitting" ? "Your response is being reviewed. This usually takes a few seconds." : "Be specific. You can take a breath and organize your thoughts before submitting."}</p><Button size="lg" disabled={!draft.trim() || state === "submitting"} onClick={() => void handleSubmit()}>{state === "submitting" ? "Reviewing..." : "Submit answer"}<span aria-hidden="true" className="ml-2">→</span></Button></div></div></div>
          <aside className="interview-sidebar"><div className="interview-sidebar-person"><div className="interview-avatar" aria-hidden="true"><GrillrLogo size={48} decorative /><div className="interview-avatar-orbit" /></div><p className="interview-overline">Your interviewer</p><h3>Grillr</h3><p className="interview-sidebar-personality">{formatLabel(session.personality)} style</p><span className="interview-listening-status"><i /> Ready for your answer</span></div><div className="interview-sidebar-section"><p className="interview-overline">A useful answer</p><ol className="interview-answer-cues"><li><span>01</span><div><strong>Be direct</strong><small>Lead with your main point.</small></div></li><li><span>02</span><div><strong>Get specific</strong><small>Use a real example or detail.</small></div></li><li><span>03</span><div><strong>Close the loop</strong><small>Share the result or takeaway.</small></div></li></ol></div><div className="interview-sidebar-note"><span aria-hidden="true">i</span><p>Your answer is evaluated for clarity, structure, and relevance.</p></div></aside></section>}
        {state !== "feedback" ? <div className="interview-exit"><Link href="/dashboard">← <span>Exit interview</span></Link><span>One question at a time</span></div> : null}
      </> : null}
    </div></main>
  );
}
````

## frontend/components/interview/JobTitleAutocomplete.tsx

Changed file - complete source.

````tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "../ui/input";
import { filterJobTitles } from "../../lib/job-titles";

type JobTitleAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
};

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const matchStart = title.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || matchStart < 0) return <>{title}</>;

  const matchEnd = matchStart + query.trim().length;
  return <>{title.slice(0, matchStart)}<strong className="font-semibold text-[var(--muted)]">{title.slice(matchStart, matchEnd)}</strong>{title.slice(matchEnd)}</>;
}

export function JobTitleAutocomplete({ value, onChange }: JobTitleAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const suggestions = useMemo(() => filterJobTitles(value), [value]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectTitle(title: string) {
    onChange(title);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!suggestions.length) return;
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.length) return;
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      selectTitle(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const showSuggestions = isOpen && value.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        id="jobTitle"
        name="jobTitle"
        value={value}
        onChange={(event) => { onChange(event.target.value); setActiveIndex(-1); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Software Engineer"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-activedescendant={showSuggestions && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        className="min-h-12 rounded-xl border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-none transition-colors hover:border-[var(--border)] focus:border-[var(--border)] focus:ring-2 focus:ring-[var(--focus-ring)] motion-reduce:transition-none"
      />
      {showSuggestions ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] motion-safe:animate-[fade-in_120ms_ease-out]" role="presentation">
          {suggestions.length ? (
            <ul id={listboxId} role="listbox" aria-label="Suggested job titles" className="max-h-64 overflow-y-auto p-1.5">
              {suggestions.map((title, index) => (
                <li key={title} id={`${listboxId}-option-${index}`} role="option" aria-selected={index === activeIndex}>
                  <button type="button" data-active={index === activeIndex} className="dropdown-option px-3 text-left text-sm" onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectTitle(title)}>
                    <HighlightedTitle title={title} query={value} />
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="px-4 py-3 text-sm text-[var(--muted)]">No matching roles</p>}
        </div>
      ) : null}
    </div>
  );
}
````

## frontend/components/interview/ScoreBar.tsx

Changed file — complete source.

````tsx
export function ScoreBar({ value }: { value: number }) {
  const progress = Math.min(100, Math.max(0, value));
  return <div className="result-score"><div className="feedback-score-label"><span>Overall score</span><span><strong>{value}</strong> / 100</span></div><div className="feedback-score-track" role="progressbar" aria-label="Overall interview score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div></div>;
}
````

## frontend/components/interview/SessionClock.tsx

Changed file — complete source.

````tsx
"use client";

import { useEffect, useState } from "react";

/** Read-only elapsed display. Does not control session duration or lifecycle. */
export function SessionClock({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = startedAt ? Date.parse(startedAt) : Date.now();
    const update = () => setElapsed(Number.isFinite(start) ? Math.max(0,Math.floor((Date.now() - start) / 1000)) : 0);
    const timer = window.setInterval(update,1000);
    return () => window.clearInterval(timer);
  },[startedAt]);
  return <span className="session-clock" aria-label="Elapsed session time"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2M9 2h6" /></svg><time>{String(Math.floor(elapsed / 60)).padStart(2,"0")}:{String(elapsed % 60).padStart(2,"0")}</time></span>;
}
````

## frontend/components/interview/SpeechAnalysis.tsx

Changed file — complete source.

````tsx
import type { Answer } from "@/lib/interview-api";

type SpeechMetrics = NonNullable<Answer["speech_metrics"]>;

type SpeechAnalysisProps = {
  answer: Answer;
};

export function formatSpeechDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "Unavailable";

  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

export function createSpeechOverview(metrics: Answer["speech_metrics"], answerDurationSeconds: number) {
  void answerDurationSeconds;
  if (!metrics) return [] as Array<{ label: string; value: string; tone: "neutral" | "accent" }>;

  return [
    { label: "Speaking pace", value: `${Math.round(metrics.words_per_minute)} WPM`, tone: "neutral" as const },
    { label: "Speaking time", value: formatSpeechDuration(metrics.duration_seconds), tone: "neutral" as const },
    { label: "Filler words", value: `${metrics.filler_count}`, tone: metrics.filler_count > 0 ? ("accent" as const) : ("neutral" as const) },
    { label: "Pauses", value: `${metrics.pause_count}`, tone: metrics.pause_count > 0 ? ("accent" as const) : ("neutral" as const) },
  ];
}

export function buildSpeechInsight(metrics: Answer["speech_metrics"], answerDurationSeconds: number) {
  void answerDurationSeconds;
  if (!metrics) {
    return "Detailed timing metrics were not available for this answer, but your transcript and interview feedback are still available.";
  }

  const paceValue = Math.round(metrics.words_per_minute);
  const paceText = metrics.words_per_minute >= 170
    ? `Your pace was ${paceValue} WPM, so a slightly slower rhythm could make key points easier to follow.`
    : metrics.words_per_minute <= 100
      ? `Your pace was ${paceValue} WPM and measured; a little more energy could help keep the answer moving.`
      : `Your pace was ${paceValue} WPM and steady, which is a clear baseline for your next answer.`;
  const fillerText = metrics.filler_count > 0
    ? `${metrics.filler_count} filler words were detected; replacing them with short pauses may make your delivery more deliberate.`
    : "No filler words were detected, which helped keep the answer crisp.";
  const pauseText = metrics.pause_count > 0
    ? `${metrics.pause_count} significant pauses appeared during the answer.`
    : "The answer stayed fairly smooth without significant pauses.";
  const repetitionText = metrics.repetition_count > 0
    ? "Removing repeated points could make the response tighter."
    : "The response did not show repeated points in the available analysis.";

  return `${paceText} ${fillerText} ${pauseText} ${repetitionText}`;
}

function paceLabel(wpm: number) {
  if (wpm >= 170) return "Fast-paced";
  if (wpm <= 100) return "Slower pace";
  return "Steady pace";
}

function speechSummary(metrics: SpeechMetrics) {
  const pace = paceLabel(metrics.words_per_minute).toLowerCase();
  const actions = [
    metrics.filler_count > 0 ? "reducing filler words" : null,
    metrics.pause_count > 0 ? "using pauses intentionally" : null,
    metrics.repetition_count > 0 ? "tightening repeated points" : null,
  ].filter(Boolean);

  if (!actions.length) return `Your delivery had a ${pace} with a clean set of communication signals in this answer.`;
  return `Your delivery had a ${pace}. ${actions.join(", ")} could make your next answer sound more deliberate.`;
}

function Metric({ label, value, supporting, primary = false }: { label: string; value: string; supporting: string; primary?: boolean }) {
  return (
    <div className={primary ? "border-l-2 border-[var(--border)] pl-5" : "border-l border-[var(--border)] pl-4"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 font-semibold tracking-tight text-[var(--foreground)] ${primary ? "text-4xl" : "text-2xl"}`}>{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{supporting}</p>
    </div>
  );
}

function DetailStat({ label, value, unavailable = false }: { label: string; value: string; unavailable?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${unavailable ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}

function PaceScale({ wpm }: { wpm: number }) {
  const position = Math.min(96, Math.max(4, ((wpm - 70) / 130) * 100));
  return (
    <div aria-label={`${Math.round(wpm)} words per minute, ${paceLabel(wpm)}`} className="mt-5">
      <div className="relative h-2 rounded-full bg-[var(--surface)]">
        <div className="absolute inset-y-0 left-1/3 right-1/3 border-x border-[var(--border)]" aria-hidden="true" />
        <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]" style={{ left: `${position}%` }} aria-hidden="true" />
      </div>
      <div className="mt-3 flex justify-between text-xs text-[var(--muted)]"><span>Slower pace</span><span>Balanced</span><span>Faster pace</span></div>
      <p className="mt-3 text-sm text-[var(--muted)]">{paceLabel(wpm)} at <strong className="font-semibold text-[var(--foreground)]">{Math.round(wpm)} WPM</strong></p>
    </div>
  );
}

function InsightList({ metrics }: { metrics: SpeechMetrics }) {
  const insights = [
    metrics.words_per_minute >= 170
      ? "A slightly slower rhythm may give key points more room to land."
      : metrics.words_per_minute <= 100
        ? "A little more pace could help your answer feel more energetic."
        : "Your pace sat in a steady range that should be easy to follow.",
    metrics.filler_count > 0
      ? `Replacing ${metrics.filler_count} detected filler word${metrics.filler_count === 1 ? "" : "s"} with a short pause may make your delivery more deliberate.`
      : "No filler words were detected in the available transcript analysis.",
    metrics.repetition_count > 0
      ? `${metrics.repetition_count} repeated pattern${metrics.repetition_count === 1 ? "" : "s"} suggest one opportunity to make the answer tighter.`
      : "The available analysis did not detect repeated points.",
  ];

  return <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">{insights.map((insight) => <li key={insight} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--surface)]" aria-hidden="true" />{insight}</li>)}</ul>;
}

export function SpeechAnalysis({ answer }: SpeechAnalysisProps) {
  const metrics = answer.speech_metrics;

  return (
    <section aria-labelledby="speech-analysis-heading" className="border-y border-[var(--border)] py-8 sm:py-10">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Speech analysis</p>
        <h3 id="speech-analysis-heading" className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">How effectively did you communicate?</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your speaking patterns during this answer, translated into a few practical signals.</p>
      </div>

      {!metrics ? (
        <div className="mt-8 border-l-2 border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm leading-6 text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">Speech timing is unavailable for this answer.</p>
          <p className="mt-1">Your transcript and interview feedback are still available. We do not estimate speech metrics when timing data is missing.</p>
        </div>
      ) : (
        <>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">{speechSummary(metrics)}</p>
          <div className="mt-8 grid gap-8 border-y border-[var(--border)] py-7 sm:grid-cols-3">
            <Metric label="Speaking pace" value={`${Math.round(metrics.words_per_minute)} WPM`} supporting="Active speaking time" primary />
            <Metric label="Response duration" value={formatSpeechDuration(answer.duration)} supporting="Total answer duration" />
            <Metric label="Word count" value={String(metrics.word_count)} supporting="Words spoken" />
          </div>

          <div className="grid gap-8 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <h4 className="text-base font-semibold text-[var(--foreground)]">Speaking pace</h4>
              <p className="mt-1 text-sm text-[var(--muted)]">A simple view of your speaking rhythm.</p>
              <PaceScale wpm={metrics.words_per_minute} />
            </div>
            <div className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <h4 className="text-base font-semibold text-[var(--foreground)]">Pause behavior</h4>
              <p className="mt-1 text-sm text-[var(--muted)]">Significant pauses detected in the answer.</p>
              <div className="mt-6 grid grid-cols-2 gap-y-5"><DetailStat label="Significant pauses" value={String(metrics.pause_count)} /><DetailStat label="Total pause time" value="Unavailable" unavailable /><DetailStat label="Longest pause" value="Unavailable" unavailable /><DetailStat label="Pause timeline" value="Not recorded" unavailable /></div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground)]">Filler words</h4>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{metrics.filler_count > 0 ? "Reducing filler words may make your answers sound more deliberate." : "No filler words were detected in the available analysis."}</p>
              <div className="mt-5 flex items-end gap-3"><span className="text-3xl font-semibold text-[var(--foreground)]">{metrics.filler_count}</span><span className="pb-1 text-sm text-[var(--muted)]">detected</span></div>
              <p className="mt-3 text-xs text-[var(--muted)]">Most frequent terms are not returned by the current speech-analysis API.</p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground)]">Repetition</h4>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Repeated patterns that may be worth tightening.</p>
              <div className="mt-5 flex items-end gap-3"><span className="text-3xl font-semibold text-[var(--foreground)]">{metrics.repetition_count}</span><span className="pb-1 text-sm text-[var(--muted)]">detected</span></div>
              <p className="mt-3 text-xs text-[var(--muted)]">Repeated words and phrases are not returned individually by the current API.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 border-t border-[var(--border)] pt-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground)]">Focus signal</h4>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">A calm coaching signal based on the available speech fields.</p>
              <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">{metrics.repetition_count > 0 || metrics.filler_count > 0 ? "Could be tighter" : "Focused"}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{metrics.repetition_count > 0 || metrics.filler_count > 0 ? "Some repetition or filler usage was detected. The signal is directional, not a score of communication quality." : "The available signals suggest your answer stayed focused and structured."}</p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[var(--foreground)]">What this means</h4>
              <InsightList metrics={metrics} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
````

## frontend/components/landing/FeedbackPreview.tsx

Changed file — complete source.

````tsx
"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

const notes = {
  Summary: "A thoughtful answer with a clear sense of ownership. Your example made the challenge easy to understand. A sharper ending will make the impact even stronger.",
  Strengths: "You explained your decisions clearly, used a specific example, and kept a steady speaking pace. Your contribution was easy to follow.",
  Improvements: "Give the outcome a little more room. Replace general statements with one concrete result, and pause briefly between your main ideas.",
  "Next steps": "Try the answer once more. Lead with your main point, keep the context short, and finish with the result and what you learned.",
};
type Tab = keyof typeof notes;
const tabs = Object.keys(notes) as Tab[];

export function FeedbackPreview() {
  const [active, setActive] = useState<Tab>("Summary");
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(tabs[next]);
    refs.current[next]?.focus();
  }

  return (
    <div className="feedback-preview surface-card" id="feedback-format" aria-label="Illustrative interview feedback">
      <div className="feedback-preview-heading"><span className="eyebrow">YOUR SESSION, REFLECTED</span><span className="sample-label">Example</span></div>
      <div className="feedback-tabs" role="tablist" aria-label="Example feedback sections">
        {tabs.map((tab, index) => <button key={tab} type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={active === tab} aria-controls={`${id}-panel`} tabIndex={active === tab ? 0 : -1} ref={(element) => { refs.current[index] = element; }} onKeyDown={(event) => navigate(event, index)} onClick={() => setActive(tab)} className={`glass-button glass-button--ghost ${active === tab ? "is-selected" : ""}`}>{tab}</button>)}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tabs.indexOf(active)}`} tabIndex={0} className="feedback-preview-content"><h3>{active === "Summary" ? "A strong start. A clearer next step." : active}</h3><p>{notes[active]}</p></div>
      <div className="feedback-score-label"><span>Overall score</span><span><strong>8.2</strong> / 10</span></div>
      <div className="feedback-score-track" role="progressbar" aria-label="Example overall score" aria-valuemin={0} aria-valuemax={10} aria-valuenow={8.2}><span /></div>
      <div className="feedback-tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 18h6m-5 3h4M8.5 14.5a6 6 0 1 1 7 0c-1 .7-1.5 1.5-1.5 3.5h-4c0-2-.5-2.8-1.5-3.5Z" /></svg><p><strong>One thing to try</strong>Close with a specific result. Small details make your impact memorable.</p></div>
    </div>
  );
}
````

## frontend/components/landing/InterviewPreview.tsx

Changed file - complete source.

````tsx
"use client";

import { GrillrBrand } from "@/components/GrillrLogo";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";

const heights = [8, 13, 20, 12, 28, 37, 21, 46, 32, 19, 39, 54, 28, 43, 60, 37, 23, 49, 33, 56, 40, 25, 44, 31, 20, 36, 24, 17, 27, 12, 21, 9];

export function InterviewPreview() {
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  return (
    <div className="laptop-scene" aria-label="Interactive illustration of a Grillr practice room">
      <div className="laptop-halo" aria-hidden="true" />
      <div className="laptop-device">
        <div className="laptop-screen">
          <div className="laptop-camera" aria-hidden="true" />
          <div className="preview-toolbar"><GrillrBrand size={20} tagline={false} className="preview-brand" /><span className="preview-time">04:32</span><span className="preview-live"><i />{ended ? "Finished" : paused ? "Paused" : "Live"}</span></div>
          <div className="preview-question"><span className="eyebrow">{ended ? "A LITTLE MORE READY" : "QUESTION 02 / 05"}</span><h2>{ended ? "Every answer is a step forward." : "Tell me about a challenge you turned into an opportunity."}</h2><p>{ended ? "Your next conversation starts with practice." : "Take a breath. There’s room to think."}</p></div>
          <div className={`preview-waveform ${paused || ended || muted ? "is-paused" : ""}`} aria-hidden="true">{heights.map((height, index) => <span key={index} style={{ "--bar-height": `${height}px`, "--bar-delay": `${index * -91}ms` } as CSSProperties} />)}</div>
          <p className="preview-listening" role="status">{ended ? "Demo complete" : paused ? "Take your time" : muted ? "Microphone muted in this demo" : "Listening to your answer…"}</p>
          <div className="preview-controls">
            {ended ? <Button variant="secondary" size="sm" onClick={() => { setEnded(false); setPaused(false); setMuted(false); }}>Replay preview</Button> : <>
              <Button variant="icon" size="sm" aria-label={muted ? "Unmute demo microphone" : "Mute demo microphone"} aria-pressed={muted} onClick={() => setMuted(!muted)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />{muted ? <path d="m3 3 18 18" /> : null}</svg></Button>
              <Button variant="icon" size="sm" aria-label={paused ? "Resume demo" : "Pause demo"} aria-pressed={paused} onClick={() => setPaused(!paused)}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused ? <path d="m8 5 11 7-11 7Z" /> : <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>}</svg></Button>
              <Button variant="secondary" size="sm" onClick={() => setEnded(true)}><span className="preview-stop" aria-hidden="true" />End</Button>
            </>}
          </div>
        </div>
        <div className="laptop-base" aria-hidden="true"><span /></div>
      </div>
      <div className="laptop-caption"><span />A space to find your voice.</div>
    </div>
  );
}
````

## frontend/components/landing/ScrollReveal.tsx

Changed file — complete source.

````tsx
"use client";

import { useEffect } from "react";

/** Progressive enhancement: content stays visible without JavaScript. */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => { element.classList.add("reveal-pending"); observer.observe(element); });
    return () => { observer.disconnect(); elements.forEach((element) => element.classList.remove("reveal-pending")); };
  }, []);
  return null;
}
````

## frontend/components/layout/footer.tsx

Changed file - complete source.

````tsx
import { GrillrBrand } from "@/components/GrillrLogo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-wordmark" aria-label="Grillr home"><GrillrBrand /></Link>
          <p>Practice. Reflect. Grow.</p>
        </div>
        <nav className="site-footer-explore" aria-label="Footer navigation">
          <Link href="/#landing-title">About</Link>
          <Link href="/#how-it-works">How it works</Link>
          <a href="https://github.com/Sarthak-madan334/Grillr" target="_blank" rel="noreferrer">Repository <span aria-hidden="true">↗</span></a>
          <Link href="/interview/setup">Start practicing</Link>
          <Link href="/privacy">Privacy policy</Link>
        </nav>
      </div>
      <div className="site-footer-bottom"><span>© 2026 Grillr</span><span>A little more ready.</span></div>
    </footer>
  );
}
````

## frontend/components/LiveInterviewCard.tsx

Changed file — complete source.

````tsx
import React, { useEffect, useState } from "react";

export interface LiveInterviewCardProps {
  role: string;
  interviewMode: "Behavioral" | "Technical" | "System Design";
  question: string;
  questionNumber: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  isListening: boolean;
  onRetry: () => void;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getLevelColor = (value: number) => {
  if (value > 75) return "from-emerald-400 to-emerald-500";
  if (value > 55) return "from-[var(--foreground)] to-[var(--foreground)]";
  return "from-[var(--warning)] to-[var(--warning)]";
};

const MicIcon = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-4 w-4 ${active ? "text-[var(--success)]" : "text-[var(--muted)] dark:text-[var(--muted)]"}`}
    aria-hidden="true"
  >
    <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
    <path d="M19 11a7 7 0 0 1-14 0" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
  </svg>
);

const BranchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 6h8" />
    <path d="M18 8v8" />
    <path d="M8 7l8 9" />
  </svg>
);

const RotateIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export default function LiveInterviewCard({
  role,
  interviewMode,
  question,
  questionNumber,
  totalQuestions,
  timeRemainingSeconds,
  isListening,
  onRetry,
}: LiveInterviewCardProps) {
  const [metrics, setMetrics] = useState({
    pace: 74,
    clarity: 81,
    confidence: 78,
  });
  const [waveSeed, setWaveSeed] = useState(0);

  useEffect(() => {
    const metricsTimer = window.setInterval(() => {
      setMetrics((prev) => ({
        pace: Math.min(
          98,
          Math.max(42, prev.pace + (Math.random() > 0.5 ? 1 : -1) * 8),
        ),
        clarity: Math.min(
          98,
          Math.max(46, prev.clarity + (Math.random() > 0.5 ? 1 : -1) * 7),
        ),
        confidence: Math.min(
          99,
          Math.max(50, prev.confidence + (Math.random() > 0.5 ? 1 : -1) * 9),
        ),
      }));
      setWaveSeed((prev) => prev + 1);
    }, 1600);

    return () => window.clearInterval(metricsTimer);
  }, []);

  const progressPercent =
    ((questionNumber - 1) / Math.max(totalQuestions, 1)) * 100;
  const safeProgress = Math.min(100, Math.max(8, progressPercent));

  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-5">
      <style>{`
        @keyframes livePulse {
          0% { transform: scale(0.96); opacity: 0.45; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.45; }
        }

        @keyframes waveformFloat {
          0%, 100% { transform: scaleY(0.5); opacity: 0.55; }
          50% { transform: scaleY(1.15); opacity: 1; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--success)] bg-[var(--success-surface)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--success)] dark:border-[var(--success)] dark:bg-[var(--success-surface)] dark:text-[var(--success)]">
          <span className="h-2 w-2 rounded-full bg-[var(--success-surface)] shadow-[var(--shadow-soft)] animate-pulse" />
          Live
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] dark:border-[var(--border)] dark:bg-[var(--surface)]">
            {isListening && (
              <span className="absolute inset-0 rounded-full border border-[var(--success)] animate-[livePulse_1.8s_ease-out_infinite]" />
            )}
            <MicIcon active={isListening} />
          </div>

          {isListening && (
            <div className="flex h-5 items-end gap-1">
              {[0.45, 0.65, 0.8, 1, 0.7, 0.9].map((scale, index) => (
                <span
                  key={`${scale}-${waveSeed}-${index}`}
                  className="block w-1.5 rounded-full bg-[var(--success-surface)]"
                  style={{
                    height: `${18 + scale * 18}px`,
                    animation: `waveformFloat 1.1s ease-in-out ${index * 0.12}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-[var(--foreground)] dark:text-[var(--muted)]">
            {role}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)]">
          {interviewMode}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-inner shadow-[var(--shadow-soft)] dark:border-[var(--border)] dark:bg-[var(--surface)] dark:shadow-[var(--shadow-soft)] sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground)] text-xs font-semibold text-[var(--foreground)] shadow-lg shadow-[var(--shadow-soft)]">
            AI
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] dark:text-[var(--muted)]">
              Interviewer
            </p>
            <p className="mt-2 text-base font-medium leading-relaxed text-[var(--foreground)] dark:text-[var(--muted)] sm:text-[15px]">
              {question}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Pace", value: metrics.pace },
          { label: "Clarity", value: metrics.clarity },
          { label: "Confidence", value: metrics.confidence },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 dark:border-[var(--border)] dark:bg-[var(--surface)]"
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] dark:text-[var(--muted)]">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface)] dark:bg-[var(--surface)]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(metric.value)} transition-all duration-700 ease-out`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] text-[var(--muted)] dark:text-[var(--muted)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success-surface)] text-[var(--success)] dark:bg-[var(--success-surface)] dark:text-[var(--success)]">
          <BranchIcon />
        </span>
        <span>May ask a follow-up based on your answer.</span>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-4 dark:border-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] dark:text-[var(--muted)]">
              <span>
                Question {questionNumber} of {totalQuestions}
              </span>
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)] dark:bg-[var(--surface)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--foreground)] via-[var(--foreground)] to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[11px] font-medium text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] active:scale-[0.98] dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)] dark:hover:border-[var(--border)] dark:hover:bg-[var(--surface)] dark:hover:text-[var(--foreground)]"
          >
            <RotateIcon />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/*
  Usage example:

  import LiveInterviewCard from "@/components/LiveInterviewCard";

  export default function DemoPage() {
    return (
      <div className="min-h-screen bg-[var(--surface)] p-6 dark:bg-[var(--surface)]">
        <LiveInterviewCard
          role="Software Engineer"
          interviewMode="Technical"
          question="Tell me about a time you optimized a slow system and how you measured the impact."
          questionNumber={2}
          totalQuestions={6}
          timeRemainingSeconds={92}
          isListening={true}
          onRetry={() => console.log("Retry answer")}
        />
      </div>
    );
  }
*/
````

## frontend/components/OAuthButtons.tsx

Changed file — complete source.

````tsx
import type { OAuthProvider } from "@/lib/oauth";

function ProviderIcon({ provider }: { provider: OAuthProvider }) {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center text-xs font-bold">{provider === "google" ? "G" : "GH"}</span>;
}

export function OAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const href = (provider: OAuthProvider) => `/api/auth/oauth/${provider}?next=${encodeURIComponent(next)}`;
  return <div className="grid w-full gap-3"><a href={href("google")} className="oauth-button glass-button glass-button--primary"><ProviderIcon provider="google" />Sign in with Google</a><a href={href("github")} className="oauth-button glass-button glass-button--secondary"><ProviderIcon provider="github" />Sign in with GitHub</a></div>;
}
````

## frontend/components/QuestionAudioPlayer.tsx

Changed file — complete source.

````tsx
"use client";

import { useEffect, useRef, useState } from "react";

type AudioState = "loading" | "ready" | "unavailable";

type QuestionAudioPlayerProps = {
  questionId: string;
  shouldStop?: boolean;
};

const API_BASE = "/api";

function SpeakerIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>;
}

export function QuestionAudioPlayer({ questionId, shouldStop = false }: QuestionAudioPlayerProps) {
  const [state, setState] = useState<AudioState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = `${API_BASE}/questions/${encodeURIComponent(questionId)}/audio`;

  useEffect(() => {
    if (!shouldStop || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  }, [shouldStop]);

  function retry() {
    setAttempt((current) => current + 1);
    setState("loading");
    setIsPlaying(false);
  }

  function togglePlayback() {
    if (!audioRef.current || state !== "ready") return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }

  if (state === "unavailable") {
    return <div className="mt-5 flex items-center justify-between gap-3 text-xs leading-5 text-[var(--muted)]" role="status"><span className="flex items-center gap-2"><SpeakerIcon /> Audio isn&apos;t available for this question. You can continue with the text prompt.</span><button type="button" onClick={retry} className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Retry</button></div>;
  }

  return (
    <div className="mt-5 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--muted)]"><SpeakerIcon /></span>Listen to the question</div>
        {state === "ready" ? <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--success)]">{isPlaying ? "Playing" : "Ready"}</span> : null}
      </div>
      {state === "loading" ? <div className="mt-3 h-10 animate-pulse rounded-xl bg-[var(--surface)] motion-reduce:animate-none" aria-label="Loading question audio" /> : null}
      {state === "ready" ? <button type="button" onClick={togglePlayback} aria-label={isPlaying ? "Pause question audio" : "Play question audio"} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none">{isPlaying ? "Pause audio" : "Play question audio"}</button> : null}
      <audio ref={audioRef} key={`${questionId}-${attempt}`} className="hidden" preload="metadata" src={audioUrl} onLoadStart={() => setState("loading")} onCanPlay={(event) => { setState("ready"); void event.currentTarget.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onError={() => setState("unavailable")} aria-label="Question audio" />
    </div>
  );
}
````

## frontend/components/ui/badge.tsx

Changed file — complete source.

````tsx
import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--muted)] ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
````

## frontend/components/ui/card.tsx

Changed file — complete source.

````tsx
import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`surface-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
````

## frontend/components/ui/input.tsx

Changed file — complete source.

````tsx
import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`field-input w-full px-3.5 py-3 text-sm ${className}`}
      {...props}
    />
  );
}
````

## frontend/components/ui/select.tsx

Changed file - complete source.

````tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id: string;
  name?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function Select({ id, name, value, options, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function openList() {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }

  function selectOption(index: number) {
    onChange(options[index].value);
    setActiveIndex(index);
    setIsOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (currentIndex) =>
          (currentIndex + direction + options.length) % options.length,
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!isOpen) openList();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left text-sm text-[var(--foreground)] outline-none backdrop-blur-sm transition focus:border-[var(--border)] focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        <span>{selectedOption.label}</span>
        <span
          aria-hidden="true"
          className={`ml-3 text-xs text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          &#9662;
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)] backdrop-blur-xl"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <button
                key={option.value}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-active={isActive}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className="dropdown-option px-3 py-2.5 text-left font-medium"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
````

## frontend/components/VoiceAnswerPanel.tsx

Changed file — complete source.

````tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { microphoneService } from "../lib/audio/microphone-service";
import { useVoiceActivityDetection } from "../lib/audio/use-voice-activity-detection";

type VoiceStatus = "checking" | "ready" | "recording" | "denied" | "no-device" | "unsupported" | "revoked";
type AiAudioState = "idle" | "loading" | "ready" | "playing" | "paused" | "completed" | "error";
export type TurnState = "asking" | "listening" | "processing" | "completed";

type VoiceAnswerPanelProps = {
  sessionId?: string;
  questionText?: string;
  disabled?: boolean;
  hidden?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  onTranscript?: (transcript: string) => void;
  onTurnStateChange?: (state: TurnState) => void;
  onAnswerEvaluated?: () => void;
  onQuestionReady?: (question: { id: string; text: string; questionNumber: number; questionType?: string; isFollowUp: boolean }) => void;
  onCompleted?: () => void;
};

function MicrophoneIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>;
}

function StopIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1.5" /></svg>;
}

function SpeakerIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>;
}

function audioStatusCopy(state: AiAudioState) {
  switch (state) {
    case "loading": return "Preparing the question";
    case "ready": return "Question ready";
    case "playing": return "AI interviewer is speaking";
    case "paused": return "Question paused";
    case "completed": return "Question finished";
    case "error": return "Couldn\'t play the question";
    default: return "Question audio ready when available";
  }
}

function getErrorName(error: unknown) {
  return error instanceof DOMException ? error.name : error instanceof Error ? error.name : "";
}

function statusCopy(status: VoiceStatus) {
  switch (status) {
    case "denied":
      return { title: "Microphone access denied", body: "Voice is required for this interview. Please allow microphone access and retry." };
    case "no-device":
      return { title: "No microphone detected", body: "Connect a microphone and retry. Voice responses are required for this interview." };
    case "unsupported":
      return { title: "Voice is unavailable here", body: "This browser does not support microphone input. Please switch to a browser with microphone access to continue." };
    case "revoked":
      return { title: "Microphone access ended", body: "Your microphone became unavailable during recording. Please retry voice recording to continue." };
    default:
      return null;
  }
}

export function VoiceAnswerPanel({ sessionId, questionText = "", disabled = false, hidden = false, onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted }: VoiceAnswerPanelProps) {
  const [status, setStatus] = useState<VoiceStatus>(() =>
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
      ? "ready"
      : "unsupported",
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [socketError, setSocketError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [aiAudioState, setAiAudioState] = useState<AiAudioState>("idle");
  const [aiAudioError, setAiAudioError] = useState("");
  const [aiAudioTime, setAiAudioTime] = useState(0);
  const [aiAudioDuration, setAiAudioDuration] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const socketAuthenticatedRef = useRef(false);
  const turnIdRef = useRef<string | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const aiAudioUrlRef = useRef<string | null>(null);
  const pendingChunksRef = useRef<Blob[]>([]);
  const callbacks = useRef({ onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted });
  const questionTextRef = useRef(questionText);
  const browserVoiceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const connectRef = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    callbacks.current = { onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted };
    questionTextRef.current = questionText;
  }, [onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted, questionText]);
  const { isSpeaking, level } = useVoiceActivityDetection(activeStream);

  const stopStream = useCallback(() => {
    microphoneService.releaseMicrophone();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActiveStream(null);
    pendingChunksRef.current = [];
    callbacks.current.onRecordingChange?.(false);
  }, []);

  useEffect(() => () => {
    aiAudioRef.current?.pause();
    if (browserVoiceRef.current) window.speechSynthesis?.cancel();
    if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
  }, []);

  useEffect(() => {
    return stopStream;
  }, [stopStream]);

  const prepareBrowserVoice = useCallback((text: string) => {
    if (!text || typeof window.speechSynthesis === "undefined" || typeof SpeechSynthesisUtterance === "undefined") {
      setAiAudioState("error");
      setAiAudioError("Question audio is unavailable. You can still answer the question shown below.");
      return;
    }
    aiAudioRef.current?.pause();
    aiAudioRef.current = null;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    browserVoiceRef.current = utterance;
    utterance.onstart = () => {
      if (browserVoiceRef.current === utterance) setAiAudioState("playing");
    };
    utterance.onend = () => {
      if (browserVoiceRef.current === utterance) setAiAudioState("completed");
    };
    utterance.onerror = () => {
      if (browserVoiceRef.current !== utterance) return;
      setAiAudioState("ready");
      setAiAudioError("Select Play to hear the question using your device voice.");
    };
    setAiAudioDuration(0);
    setAiAudioTime(0);
    setAiAudioState("ready");
    setAiAudioError("Using your device voice. Select Play to hear the question.");
  }, []);

  useEffect(() => {
    if (!sessionId || typeof WebSocket === "undefined") return;
    let cancelled = false;
    let socket: WebSocket | null = null;

    let connecting: Promise<void> | null = null;
    let rejectConnection: ((error: Error) => void) | undefined;
    let attempt = 0;
    let connectionTimer: ReturnType<typeof setTimeout> | undefined;
    const connect = (): Promise<void> => {
      if (socketAuthenticatedRef.current && socket?.readyState === WebSocket.OPEN) return Promise.resolve();
      if (connecting) return connecting;
      const connectionAttempt = ++attempt;
      connecting = new Promise<void>((resolve, reject) => {
        rejectConnection = reject;
        connectionTimer = setTimeout(() => {
          attempt++;
          setSocketError("Connecting took too long. Please retry recording.");
          reject(new Error("Connecting took too long. Please retry recording."));
          socket?.close();
        }, 15000);
        void openConnection(resolve, reject, connectionAttempt);
      }).finally(() => {
        clearTimeout(connectionTimer);
        connecting = null;
      });
      return connecting;
    };
    async function openConnection(resolve: () => void, reject: (error: Error) => void, connectionAttempt: number) {
      try {
        const tokenResponse = await fetch("/api/auth/realtime-token", { cache: "no-store", credentials: "include" });
        if (!tokenResponse.ok) throw new Error("Realtime authentication failed");
        const { token } = (await tokenResponse.json()) as { token?: string };
        if (!token || cancelled) throw new Error("Realtime authentication failed");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://grillr-acev.onrender.com";
        if (cancelled || connectionAttempt !== attempt) return;
        socketAuthenticatedRef.current = false;
        socket?.close();
        socket = new WebSocket(`${apiUrl.replace(/^http/, "ws")}/api/v1/ws/interviews/${sessionId}`);
        socketRef.current = socket;
        const activeSocket = socket;
        socket.addEventListener("open", () => activeSocket.send(JSON.stringify({ type: "auth", token })));
        socket.addEventListener("message", (event) => {
          if (cancelled || socketRef.current !== activeSocket || connectionAttempt !== attempt) return;
          try {
            const message = JSON.parse(event.data) as { type?: string; data?: { text?: string; code?: string; question_text?: string; state?: TurnState; message?: string; audio_base64?: string; media_type?: string; question_id?: string; question_number?: number; question_type?: string; is_follow_up?: boolean } };
            if (message.type === "auth.ok") {
              socketAuthenticatedRef.current = true;
              setSocketError("");
              resolve();
              socket?.send(JSON.stringify({ type: "session.start" }));
            }
            if (message.type === "audio.unavailable") {
              prepareBrowserVoice(message.data?.text ?? questionTextRef.current);
            }
            if (message.type === "audio.ai" && message.data?.audio_base64) {
              const bytes = Uint8Array.from(atob(message.data.audio_base64), (character) => character.charCodeAt(0));
              const audioUrl = URL.createObjectURL(new Blob([bytes], { type: message.data.media_type ?? "audio/mpeg" }));
              if (browserVoiceRef.current) window.speechSynthesis?.cancel();
              browserVoiceRef.current = null;
              aiAudioRef.current?.pause();
              if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
              const audio = new Audio(audioUrl);
              aiAudioRef.current = audio;
              aiAudioUrlRef.current = audioUrl;
              setAiAudioState("loading");
              setAiAudioError("");
              setAiAudioTime(0);
              setAiAudioDuration(0);
              audio.onloadedmetadata = () => {
                if (aiAudioRef.current !== audio) return;
                setAiAudioDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
                setAiAudioState((current) => current === "playing" ? current : "ready");
              };
              audio.ontimeupdate = () => {
                if (aiAudioRef.current === audio) setAiAudioTime(audio.currentTime);
              };
              audio.onplay = () => setAiAudioState("playing");
              audio.onpause = () => {
                if (aiAudioRef.current === audio && !audio.ended) setAiAudioState("paused");
              };
              audio.onended = () => {
                if (aiAudioRef.current === audio) {
                  setAiAudioState("completed");
                }
              };
              audio.onerror = () => {
                if (aiAudioRef.current !== audio) return;
                prepareBrowserVoice(questionTextRef.current);
              };
              if (microphoneService.isRecording()) { setAiAudioState("ready"); return; }
              void audio.play().catch(() => {
                if (aiAudioRef.current !== audio) return;
                setAiAudioState("ready");
                setAiAudioError("Select Play to hear the question.");
              });
            }
            if (message.type === "turn.state_changed" && message.data?.state) {
              setIsProcessing(message.data.state === "processing");
              if (message.data.state !== "processing") setIsStopping(false);
              callbacks.current.onTurnStateChange?.(message.data.state);
            }
            if (message.type === "transcript.final" && message.data?.text) {
              callbacks.current.onTranscript?.(message.data.text);
              setIsStopping(false);
              stopStream();
              setStatus("ready");
            }
            if (message.type === "answer.evaluated") callbacks.current.onAnswerEvaluated?.();
            if ((message.type === "question.created" || message.type === "question.follow_up") && message.data?.question_id && message.data.text) {
              questionTextRef.current = message.data.text;
              callbacks.current.onQuestionReady?.({
                id: message.data.question_id,
                text: message.data.text,
                questionNumber: message.data.question_number ?? 0,
                ...(message.data.question_type ? { questionType: message.data.question_type } : {}),
                isFollowUp: Boolean(message.data.is_follow_up),
              });
            }
            if (message.type === "session.completed") {
              setIsProcessing(false);
              setIsStopping(false);
              callbacks.current.onTurnStateChange?.("completed");
              callbacks.current.onCompleted?.();
            }
            if (message.type === "error") {
              if (message.data?.code === "tts_unavailable") {
                prepareBrowserVoice(message.data?.question_text ?? questionTextRef.current);
                return;
              }
              // Turn errors do not revoke authentication on an otherwise healthy socket.
              setIsProcessing(false);
              setIsStopping(false);
              callbacks.current.onTurnStateChange?.("listening");
              setSocketError(message.data?.message ?? "The live interview connection returned an error. Please retry your voice answer.");
              stopStream();
              setStatus("ready");
            }
          } catch {
            setSocketError("Live interview returned an unreadable response.");
          }
        });
        socket.addEventListener("close", () => {
          if (cancelled || socketRef.current !== activeSocket || connectionAttempt !== attempt) return;
          socketAuthenticatedRef.current = false;
          setIsProcessing(false);
          setIsStopping(false);
          stopStream();
          setStatus("ready");
          callbacks.current.onTurnStateChange?.("listening");
          setSocketError("The interview connection closed. Start recording to reconnect.");
          reject(new Error("The interview connection closed. Please retry recording."));
        });
        socket.addEventListener("error", () => {
          if (cancelled || socketRef.current !== activeSocket || connectionAttempt !== attempt) return;
          setSocketError("The live interview connection failed. Please retry your voice answer.");
          reject(new Error("The live interview connection failed. Please retry your voice answer."));
        }, { once: true });
      } catch (error) {
        const failure = error instanceof Error ? error : new Error("Realtime authentication failed");
        if (!cancelled) setSocketError(failure.message);
        reject(failure);
      }
    }

    connectRef.current = connect;
    void connect().catch(() => undefined);
    return () => {
      cancelled = true;
      clearTimeout(connectionTimer);
      rejectConnection?.(new Error("Interview connection ended"));
      connectRef.current = null;
      socketAuthenticatedRef.current = false;
      socket?.close();
      socketRef.current = null;
    };
  }, [sessionId, stopStream, prepareBrowserVoice]);

  const recordingUrl = useMemo(() => {
    if (!recordingBlob || typeof URL.createObjectURL !== "function") return "";
    return URL.createObjectURL(recordingBlob);
  }, [recordingBlob]);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  const handleTrackEnded = useCallback(() => {
    stopStream();
    setStatus("revoked");
  }, [stopStream]);

  async function startRecording() {
    if (disabled || isRetrying || isStopping || isProcessing || status === "recording") return;
    if (sessionId && (typeof WebSocket === "undefined" || !socketAuthenticatedRef.current || socketRef.current?.readyState !== WebSocket.OPEN)) {
      setIsRetrying(true);
      try {
        if (!connectRef.current) throw new Error("Live recording is unavailable in this browser.");
        await connectRef.current();
      } catch (error) {
        setSocketError(error instanceof Error ? error.message : "Could not reconnect. Please retry recording.");
        setIsRetrying(false);
        return;
      }
      setIsRetrying(false);
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setIsRetrying(true);
    setSocketError("");
    setIsProcessing(false);
    setIsStopping(false);
    try {
      aiAudioRef.current?.pause();
      if (browserVoiceRef.current) {
        window.speechSynthesis.cancel();
        setAiAudioState("ready");
      }
      const devices = navigator.mediaDevices.enumerateDevices
        ? await navigator.mediaDevices.enumerateDevices()
        : [];
      if (devices.length > 0 && !devices.some((device) => device.kind === "audioinput")) {
        setStatus("no-device");
        return;
      }
      if (!await microphoneService.requestPermission()) {
        setStatus("denied");
        return;
      }
      const stream = microphoneService.getStream();
      if (!stream) {
        setStatus("denied");
        return;
      }
      if (aiAudioRef.current) aiAudioRef.current.pause();
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", handleTrackEnded, { once: true });
      });
      streamRef.current = stream;
      setActiveStream(stream);
      pendingChunksRef.current = [];
      setRecordingBlob(null);
      turnIdRef.current = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      socketRef.current?.send(JSON.stringify({ type: "speech.start", turn_id: turnIdRef.current }));
      const handleAudioChunk = (chunk: Blob) => {
        pendingChunksRef.current.push(chunk);
        setRecordingBlob(new Blob([...pendingChunksRef.current], { type: chunk.type || "audio/webm" }));
        if (socketAuthenticatedRef.current && typeof WebSocket !== "undefined" && socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(chunk);
      };
      if (!microphoneService.startRecording(handleAudioChunk)) {
        microphoneService.releaseMicrophone();
        streamRef.current = null;
        setStatus("denied");
        return;
      }
      setStatus("recording");
      onRecordingChange?.(true);
    } catch (error) {
      stopStream();
      streamRef.current = null;
      const errorName = getErrorName(error);
      setStatus(errorName === "NotFoundError" ? "no-device" : "denied");
    } finally {
      setIsRetrying(false);
    }
  }

  function stopRecording() {
    if (microphoneService.isRecording()) {
      setIsStopping(true);
      setIsProcessing(true);
      callbacks.current.onTurnStateChange?.("processing");
      microphoneService.stopRecording(() => {
        if (socketAuthenticatedRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "speech.stop", turn_id: turnIdRef.current }));
        } else {
          setIsProcessing(false);
          setIsStopping(false);
          stopStream();
        }
      });
    } else {
      setIsStopping(false);
      stopStream();
    }
    if (!sessionId || !socketRef.current) setStatus("ready");
  }

  function toggleAiAudio() {
    if (microphoneService.isRecording()) return;
    const utterance = browserVoiceRef.current;
    if (utterance) {
      if (aiAudioState === "playing") {
        window.speechSynthesis.pause();
        setAiAudioState("paused");
      } else if (aiAudioState === "paused") {
        window.speechSynthesis.resume();
        setAiAudioState("playing");
      } else {
        window.speechSynthesis.cancel();
        setAiAudioError("");
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    const audio = aiAudioRef.current;
    if (!audio) {
      prepareBrowserVoice(questionTextRef.current);
      return;
    }
    if (aiAudioState === "completed") {
      audio.currentTime = 0;
      setAiAudioTime(0);
    }
    if (aiAudioState === "playing") {
      audio.pause();
      return;
    }
    void audio.play().catch(() => {
      setAiAudioState("ready");
      setAiAudioError("Playback was blocked. Select Play to try again.");
    });
  }

  function seekAiAudio(value: string) {
    const audio = aiAudioRef.current;
    const nextTime = Number(value);
    if (!audio || !Number.isFinite(nextTime)) return;
    audio.currentTime = nextTime;
    setAiAudioTime(nextTime);
  }

  function formatAudioTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  }

  const message = statusCopy(status);

  return (
    <section className={`${hidden ? "hidden" : ""} mb-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4`} aria-labelledby="voice-answer-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--muted)]"><MicrophoneIcon /></span>
            <h3 id="voice-answer-heading" className="text-sm font-semibold text-[var(--foreground)]">Answer by voice <span className="ml-1 text-xs font-normal text-[var(--muted)]">Required</span></h3>
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Speak naturally and answer out loud. This interview is designed for voice responses only.</p>
        </div>
        {status !== "unsupported" ? <button type="button" onClick={status === "recording" ? stopRecording : () => void startRecording()} disabled={disabled || isRetrying || isStopping || isProcessing || status === "checking"} aria-label={status === "recording" ? "Stop recording" : "Start recording"} aria-pressed={status === "recording"} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none">{status === "recording" ? <StopIcon /> : <MicrophoneIcon />}{isRetrying ? "Checking microphone..." : isStopping || isProcessing ? "Finishing answer..." : status === "recording" ? "Stop recording" : "Start recording"}</button> : null}
      </div>
      {status === "checking" ? <p className="mt-4 animate-pulse text-xs text-[var(--muted)] motion-reduce:animate-none" aria-live="polite">Checking microphone support...</p> : null}
      <div className={`live-waveform ${activeStream && isSpeaking ? "is-active" : ""}`} aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <span key={index} style={{ "--bar-height": `${10 + ((index * 17) % 35) * Math.max(.3, level)}px`, "--bar-delay": `${index * -75}ms` } as CSSProperties} />)}</div>
      {status === "recording" ? <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--success)]" aria-live="polite"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success-surface)] motion-reduce:animate-none" /> Recording in progress. Stop when you finish.</p> : null}
      {isProcessing ? <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--muted)]" aria-live="polite"><span className="h-3 w-3 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" /> Processing your answer...</p> : null}
      {aiAudioState !== "idle" ? <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5" aria-live="polite"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${aiAudioState === "playing" ? "bg-[var(--success-surface)] text-[var(--success)]" : "bg-[var(--surface)] text-[var(--muted)]"}`}><SpeakerIcon /></span><span className="min-w-0 flex-1 text-xs font-medium text-[var(--muted)]">{audioStatusCopy(aiAudioState)}{aiAudioError ? <span className="mt-0.5 block text-[11px] font-normal text-[var(--error)]">{aiAudioError}</span> : null}</span>{aiAudioState === "loading" ? <span className="flex gap-1" aria-label="Loading question audio"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--surface)] [animation-delay:150ms] motion-reduce:animate-none" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--surface)] [animation-delay:300ms] motion-reduce:animate-none" /></span> : null}{aiAudioState !== "loading" ? <button disabled={status === "recording"} type="button" onClick={toggleAiAudio} aria-label={aiAudioState === "playing" ? "Pause question audio" : aiAudioState === "completed" ? "Replay question audio" : aiAudioState === "paused" ? "Resume question audio" : "Play question audio"} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none">{aiAudioState === "playing" ? "Pause" : aiAudioState === "completed" ? "Replay" : aiAudioState === "paused" ? "Resume" : "Play"}</button> : null}</div>{aiAudioState !== "loading" && aiAudioState !== "error" && aiAudioDuration > 0 ? <div className="mt-2 flex items-center gap-2"><input type="range" min="0" max={aiAudioDuration} step="0.1" value={Math.min(aiAudioTime, aiAudioDuration)} onChange={(event) => seekAiAudio(event.target.value)} aria-label="Question audio progress" className="h-1.5 min-w-0 flex-1 accent-[var(--foreground)]" /><span className="w-16 text-right text-[10px] tabular-nums text-[var(--muted)]">{formatAudioTime(aiAudioTime)} / {formatAudioTime(aiAudioDuration)}</span></div> : null}</div> : null}
      {activeStream ? <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2" aria-live="polite"><span className={`h-2.5 w-2.5 rounded-full transition-colors motion-reduce:transition-none ${isSpeaking ? "bg-[var(--success-surface)] shadow-[var(--shadow-soft)]" : "bg-[var(--surface)]"}`} /><span className="text-xs font-medium text-[var(--muted)]">{isSpeaking ? "Your microphone is picking up your voice" : "Listening for your voice"}</span><span className="ml-auto text-[10px] tabular-nums text-[var(--muted)]">{Math.round(level * 100)}%</span></div> : null}
      {recordingUrl ? <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Captured locally</p><audio className="mt-2 h-9 w-full" controls src={recordingUrl} aria-label="Recorded answer preview" /></div> : null}
      {socketError ? <div role="alert" className="mt-3 rounded-xl border border-[var(--error)] bg-[var(--error-surface)] px-3 py-2 text-xs leading-5 text-[var(--error)]">{socketError}</div> : null}
      {message ? <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--error)] bg-[var(--error-surface)] p-3 text-sm text-[var(--error)] sm:flex-row sm:items-center sm:justify-between"><div><strong className="block font-semibold">{message.title}</strong><span className="mt-1 block text-xs leading-5 text-[var(--error)]">{message.body}</span></div>{status !== "unsupported" ? <button type="button" onClick={() => void startRecording()} disabled={isRetrying} className="shrink-0 self-start rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 sm:self-center">Retry voice</button> : null}</div> : null}
    </section>
  );
}
````

## frontend/src/app/globals.css

Changed file — complete source.

````css
@import "../../app/globals.css";
````

## frontend/src/app/layout.tsx

Changed file — complete source.

````tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grillr",
  description:
    "Voice-first AI interview practice with realtime interaction and mock mock live transcript flow.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
````

## frontend/src/app/page.tsx

Changed file — complete source.

````tsx
import { VoiceInterviewPanel } from "@/components/live-interview/VoiceInterviewPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020817_60%)] px-4 py-8 text-[var(--muted)] md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <VoiceInterviewPanel />
      </div>
    </main>
  );
}
````

## frontend/src/components/live-interview/AudioVisualizer.tsx

Changed file — complete source.

````tsx
interface AudioVisualizerProps {
  level: number;
  active: boolean;
  label: string;
}

export function AudioVisualizer({
  level,
  active,
  label,
}: AudioVisualizerProps) {
  const bars = Array.from({ length: 16 }, (_, index) => {
    const base = 18 + (index % 4) * 6;
    const swing = active ? level * 0.8 : 8;
    const height = Math.max(base, Math.min(92, base + swing - index * 1.5));

    return {
      id: index,
      height,
    };
  });

  return (
    <div className="flex items-end gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-inner shadow-[var(--shadow-soft)]">
      {bars.map((bar) => (
        <span
          key={bar.id}
          aria-label={label}
          className={`w-1.5 rounded-full transition-all duration-200 ${
            active ? "bg-[var(--surface)]" : "bg-[var(--surface)]"
          }`}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  );
}
````

## frontend/src/components/live-interview/TranscriptPanel.tsx

Changed file — complete source.

````tsx
import type { TranscriptEntry } from "@/lib/realtime";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  return (
    <section
      className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-5"
      aria-live="polite"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
            Transcript
          </div>
          <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Live response
          </h3>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Waiting for the interview to begin…
          </p>
        ) : (
          entries.map((entry, index) => {
            const isAi = entry.speaker === "ai";

            return (
              <article
                key={`${entry.speaker}-${index}`}
                className={`flex gap-3 rounded-2xl border p-3 ${
                  isAi
                    ? "border-[var(--border)] bg-[var(--surface)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isAi
                      ? "bg-[var(--surface)] text-[var(--foreground)]"
                      : "bg-[var(--surface)] text-[var(--foreground)]"
                  }`}
                >
                  {isAi ? "AI" : "You"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    <span>{isAi ? "AI interviewer" : "Candidate"}</span>
                    <time>
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  <p
                    className={`text-sm leading-6 ${
                      entry.isPartial
                        ? "italic text-[var(--muted)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {entry.text}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
````

## frontend/src/components/live-interview/VoiceInterviewPanel.tsx

Changed file - complete source.

````tsx
"use client";

import { GrillrLogo } from "@/components/GrillrLogo";
import { useEffect, useMemo, useRef, useState } from "react";

import { AudioVisualizer } from "@/components/live-interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/live-interview/TranscriptPanel";
import { AudioPlaybackController, type PlaybackSnapshot } from "@/lib/audio-playback";
import { microphoneService } from "@/services/audio/MicrophoneService";
import {
  MockRealtimeClient,
  type RealtimeEvent,
  type TranscriptEntry,
} from "@/lib/realtime";
import {
  applyVoiceEvent,
  initialVoiceState,
  type VoiceState,
  type VoiceStateMachineEvent,
} from "@/lib/voice-state";

const demoQuestion =
  "Tell me about yourself and why this role fits your background.";

export function VoiceInterviewPanel() {
  const realtime = useMemo(() => new MockRealtimeClient(), []);
  const playback = useMemo(() => new AudioPlaybackController(), []);
  const intervalRef = useRef<number | null>(null);
  const voiceStageRef = useRef<VoiceState["stage"]>(initialVoiceState.stage);
  const playbackSnapshotRef = useRef<PlaybackSnapshot>(playback.snapshot());
  const invalidatedGenerationsRef = useRef(new Set<string>());
  const questionRef = useRef(demoQuestion);
  const [voiceState, setVoiceState] = useState<VoiceState>(initialVoiceState);
  const [question, setQuestion] = useState(demoQuestion);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    { speaker: "ai", text: demoQuestion },
  ]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [audioLevel, setAudioLevel] = useState(42);
  const [errorMessage, setErrorMessage] = useState("");
  const [playbackSnapshot, setPlaybackSnapshot] = useState<PlaybackSnapshot>(() => playback.snapshot());

  const currentStatus =
    voiceState.stage === "ai_speaking"
      ? "AI speaking"
      : voiceState.stage === "user_speaking"
        ? "You’re speaking"
        : voiceState.stage === "processing"
          ? "Processing"
          : voiceState.stage === "error"
            ? "Disconnected"
            : "Listening";

  const connectionState = errorMessage ? "Reconnecting" : "Connected";

  useEffect(() => {
    const unsubscribe = realtime.subscribe((event: RealtimeEvent) => {
      const data = (event.data ?? {}) as Record<string, unknown>;
      const generationId = typeof data.generation_id === "string" ? data.generation_id : null;
      if (event.type === "session.state" && typeof data.interrupted_generation_id === "string") {
        invalidatedGenerationsRef.current.add(data.interrupted_generation_id);
      }
      if (generationId && invalidatedGenerationsRef.current.has(generationId)) return;
      const voiceEventMap: Record<string, VoiceStateMachineEvent> = {
        "ai.question": { type: "NEXT_QUESTION_RECEIVED" },
        "ai.speech.start": { type: "AI_STARTED_SPEAKING" },
        "ai.speech.end": { type: "AI_FINISHED_SPEAKING" },
        "user.speech.start": { type: "USER_STARTED_SPEAKING" },
        "answer.processing": { type: "ANSWER_PROCESSING" },
        "next.question": { type: "NEXT_QUESTION_RECEIVED" },
        "connection.error": {
          type: "ERROR",
          message:
            typeof data.message === "string"
              ? data.message
              : "Connection error",
        },
      };

      if (event.type === "session.state") {
        const stateEvent = data.speech_state === "ai_speaking"
          ? ({ type: "AI_STARTED_SPEAKING" } as const)
          : data.speech_state === "user_speaking"
            ? ({ type: "USER_STARTED_SPEAKING" } as const)
            : null;
        if (stateEvent) setVoiceState((previous) => applyVoiceEvent(previous, stateEvent));
      }

      const voiceEvent = voiceEventMap[event.type];
      if (voiceEvent) {
        setVoiceState((previous) => applyVoiceEvent(previous, voiceEvent));
      }

      if (event.type === "ai.question" || event.type === "next.question") {
        const nextQuestion =
          typeof data.text === "string" ? data.text : demoQuestion;
        setQuestion(nextQuestion);
        setTranscripts((previous) => [
          ...previous,
          { speaker: "ai", text: nextQuestion },
        ]);
      }

      if (event.type === "user.partial_transcript") {
        const text = typeof data.text === "string" ? data.text : "";
        if (!text) return;
        setTranscripts((previous) => [
          ...previous,
          { speaker: "user", text, isPartial: true },
        ]);
      }

      if (event.type === "user.final_transcript") {
        const text = typeof data.text === "string" ? data.text : "";
        if (!text) return;
        setTranscripts((previous) => [
          ...previous,
          { speaker: "user", text, isPartial: false },
        ]);
      }

      if (event.type === "connection.error") {
        const message =
          typeof data.message === "string" ? data.message : "Connection error";
        setErrorMessage(message);
      }

      if (event.type === "connection.reconnect") {
        setErrorMessage("");
      }

      if (event.type === "user.speech.start") {
        if (playbackSnapshotRef.current.generationId) {
          invalidatedGenerationsRef.current.add(playbackSnapshotRef.current.generationId);
          playback.stop(playbackSnapshotRef.current.generationId);
          realtime.send("interview.interrupt", { generation_id: playbackSnapshotRef.current.generationId });
        }
        setAudioLevel(70);
      }

      if (event.type === "ai.speech.start") {
        if (!generationId) {
          realtime.send("ai.speech.start", { question_id: data.id, text: questionRef.current });
        } else if (typeof data.audio_url === "string") {
          void playback.play(data.audio_url, generationId).catch(() => {
            setErrorMessage("The question audio could not be played.");
          });
        }
        setAudioLevel(58);
      }

      if (event.type === "audio.chunk" && generationId && typeof data.audio_base64 === "string") {
        void playback.play(`data:${typeof data.content_type === "string" ? data.content_type : "audio/mpeg"};base64,${data.audio_base64}`, generationId).catch(() => {
          setErrorMessage("The question audio could not be played.");
        });
      }

      if (event.type === "answer.processing") {
        setAudioLevel(20);
      }
    });

    const unsubscribePlaybackRef = playback.subscribe((snapshot) => {
      playbackSnapshotRef.current = snapshot;
      setPlaybackSnapshot(snapshot);
    });
    realtime.startMockInterview();

    intervalRef.current = window.setInterval(() => {
      setAudioLevel((previous) => {
        if (voiceStageRef.current === "user_speaking" || voiceStageRef.current === "ai_speaking") {
          return Math.max(
            18,
            Math.min(92, previous + (Math.random() > 0.5 ? 6 : -6)),
          );
        }
        return Math.max(12, previous - 2);
      });
    }, 600);

    return () => {
      unsubscribe();
      unsubscribePlaybackRef();
      realtime.disconnect();
      playback.dispose();
      microphoneService.releaseMicrophone();
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [playback, realtime]);

  useEffect(() => {
    voiceStageRef.current = voiceState.stage;
  }, [voiceState.stage]);

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const requestMicAccess = async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setErrorMessage("Microphone access is not supported in this browser.");
      setVoiceState((previous) =>
        applyVoiceEvent(previous, {
          type: "ERROR",
          message: "Microphone unsupported",
        }),
      );
      return;
    }

    try {
      if (isMicOn) {
        microphoneService.stopRecording();
        microphoneService.releaseMicrophone();
        setIsMicOn(false);
        realtime.send("speech.stop");
        return;
      }
      const enabled = await microphoneService.requestPermission();
      if (!enabled) throw new Error("permission denied");
      microphoneService.startRecording(() => undefined);
      microphoneService.startVoiceDetection(() => {
        if (playbackSnapshotRef.current.generationId) {
          playback.stop(playbackSnapshotRef.current.generationId);
          realtime.send("interview.interrupt", { generation_id: playbackSnapshotRef.current.generationId });
        }
        realtime.send("speech.start");
        setVoiceState((previous) => applyVoiceEvent(previous, { type: "USER_STARTED_SPEAKING" }));
      }, () => realtime.send("speech.stop"));
      setIsMicOn(true);
      setErrorMessage("");
      setVoiceState((previous) =>
        applyVoiceEvent(previous, { type: "USER_STARTED_SPEAKING" }),
      );
    } catch {
      setErrorMessage(
        "Microphone permission was denied. Please allow access to continue.",
      );
      setVoiceState((previous) =>
        applyVoiceEvent(previous, {
          type: "ERROR",
          message: "Permission denied",
        }),
      );
    }
  };

  const handleInterrupt = () => {
    const generationId = playbackSnapshotRef.current.generationId;
    if (generationId) {
      invalidatedGenerationsRef.current.add(generationId);
      playback.stop(generationId);
    }
    realtime.send("interview.interrupt", { generation_id: generationId });
    setVoiceState((previous) => applyVoiceEvent(previous, { type: "USER_INTERRUPTED_AI" }));
    setVoiceState((previous) =>
      applyVoiceEvent(previous, { type: "USER_INTERRUPTED_AI" }),
    );
    setAudioLevel(32);
  };

  return (
    <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--focus-ring)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
          <GrillrLogo size={40} />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Grillr
            </div>
            <h1 className="text-base font-semibold text-[var(--foreground)]">
              Interview room
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Progress
            </div>
            <div className="mt-1 font-medium text-[var(--foreground)]">02 / 05</div>
          </div>
          <div className="h-8 w-px bg-[var(--surface)]" />
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--success-surface)]"
              aria-hidden="true"
            />
            <span className="font-medium text-[var(--foreground)]">
              {connectionState}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)]">
            SA
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Profile
            </div>
            <div className="text-sm font-medium text-[var(--foreground)]">Sarthak</div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-6">
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] md:p-6">
              <div className="mb-5 flex items-center justify-between text-sm text-[var(--muted)]">
                <span className="font-medium text-[var(--foreground)]">
                  Question 2 of 5
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-medium text-[var(--muted)]">
                  <span
                    className="h-2 w-2 rounded-full bg-[var(--surface)]"
                    aria-hidden="true"
                  />
                  03:45
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
                  Interview prompt
                </p>
                <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-[2rem]">
                  {question}
                </h2>
              </div>
            </div>

            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label={
                      isMicOn ? "Stop microphone" : "Start microphone"
                    }
                    onClick={requestMicAccess}
                    className={`flex h-20 w-20 items-center justify-center rounded-full border text-xl font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
                      isMicOn
                        ? "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-lg shadow-[var(--shadow-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    {isMicOn ? "●" : "◉"}
                  </button>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                      Voice state
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                      {currentStatus}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--success-surface)]"
                    aria-hidden="true"
                  />
                  {currentStatus}
                </div>
                <div className="sr-only" aria-live="polite">
                  {voiceState.stage === "listening" ? "Listening for your answer" : currentStatus}
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-medium text-[var(--muted)]">
                    Live waveform
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                      AI speaking
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                      Listening
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                      You’re speaking
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                      Processing
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-5 shadow-inner shadow-[var(--shadow-soft)]">
                  <AudioVisualizer
                    level={audioLevel}
                    active={
                      voiceState.stage === "user_speaking" ||
                      voiceState.stage === "ai_speaking"
                    }
                    label={
                      voiceState.stage === "user_speaking"
                        ? "User speaking"
                        : "AI speaking"
                    }
                  />
                </div>
                <div className="mt-4 flex items-center gap-3" aria-label="AI audio playback">
                  <button
                    type="button"
                    aria-label={playbackSnapshot.state === "playing" ? "Pause AI question" : "Resume AI question"}
                    disabled={!playbackSnapshot.generationId}
                    onClick={() => playbackSnapshot.state === "playing" ? playback.pause() : undefined}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {playbackSnapshot.state === "playing" ? "Pause" : "AI audio idle"}
                  </button>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface)]" role="progressbar" aria-label="AI audio progress" aria-valuemin={0} aria-valuemax={playbackSnapshot.duration || 1} aria-valuenow={playbackSnapshot.currentTime}>
                    <div className="h-full bg-[var(--surface)] transition-[width] duration-150 motion-reduce:transition-none" style={{ width: `${playbackSnapshot.duration ? (playbackSnapshot.currentTime / playbackSnapshot.duration) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                    Controls
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                    Answer actions
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  aria-label="Start or stop answer"
                  className="rounded-full bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
                >
                  {isMicOn ? "Stop answer" : "Start answer"}
                </button>
                <button
                  type="button"
                  aria-label="Interrupt interviewer"
                  onClick={handleInterrupt}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--border)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
                >
                  Interrupt interviewer
                </button>
                <button
                  type="button"
                  aria-label="Mute microphone"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--border)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
                >
                  Mute
                </button>
                <button
                  type="button"
                  aria-label="End interview"
                  className="rounded-full border border-[var(--error)] bg-[var(--error-surface)] px-4 py-2.5 text-sm font-medium text-[var(--error)] transition hover:bg-[var(--error-surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--error)]"
                >
                  End interview
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                    Session
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                    State
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {voiceState.stage}
                </span>
              </div>

              <ul className="space-y-3 text-sm text-[var(--muted)]">
                <li className="flex items-center justify-between">
                  <span>Microphone</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {isMicOn ? "Active" : "Standby"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>AI audio</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {voiceState.stage === "ai_speaking" ? "Speaking" : "Idle"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Realtime</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {connectionState}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Last event</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {voiceState.lastEvent ?? "idle"}
                  </span>
                </li>
              </ul>
            </div>

            {errorMessage ? (
              <div
                className="rounded-[22px] border border-[var(--error)] bg-[var(--error-surface)] p-4 text-sm text-[var(--error)]"
                role="alert"
              >
                {errorMessage}
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-6">
          <TranscriptPanel entries={transcripts} />
        </div>
      </main>
    </div>
  );
}
````

## frontend/components/layout/top-nav.tsx

Changed file - complete source.

````tsx
"use client";

import { GrillrLogo } from "@/components/GrillrLogo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-client";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  activeOnHome?: boolean;
};

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navItems: NavItem[] = pathname === "/"
    ? [
        { href: "/#landing-title", label: "About", activeOnHome: true },
        { href: "/#how-it-works", label: "How it works" },
        { href: "https://github.com/Sarthak-madan334/Grillr", label: "Repository", external: true },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/interview/setup", label: "Practice" },
        { href: "/history", label: "History" },
        { href: "/ai-core", label: "AI Core" },
      ];

  const isActive = (href: string, activeOnHome = false) =>
    (activeOnHome && pathname === "/") || pathname === href || pathname.startsWith(`${href}/`);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "there";
  const greetingName = displayName.length > 12 ? `${displayName.slice(0, 12).trimEnd()}…` : displayName;
  const greetingInitial = (displayName?.[0] ?? "G").toUpperCase();

  useEffect(() => {
    if (!isMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  async function handleSignOut() {
    await signOut();
    setIsMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="grillr-nav-shell sticky top-0 z-30">
      <div className="grillr-nav mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Grillr home" className="grillr-brand group flex min-w-0 items-center gap-2.5">
          <GrillrLogo />
          <div className="max-[359px]:hidden">
            <div className="grillr-brand-name">GRILLR</div>
            <div className="grillr-brand-tagline">INTERVIEW COACH</div>
          </div>
        </Link>

        <nav className="grillr-nav-links hidden items-center md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const className = `grillr-nav-link ${isActive(item.href, item.activeOnHome) ? "is-active" : ""}`;
            return item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={className}>
                {item.label}<span className="grillr-nav-external" aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="flex min-w-0 max-w-[12rem] items-center gap-2 rounded-full border border-[#d7e0ee] bg-white/80 px-2.5 py-1.5 shadow-[0_2px_10px_rgba(16,35,63,0.03)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[10px] font-bold text-[#365bb4]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[11px] font-semibold text-[#4b5d77]">
                Welcome back, {greetingName}
              </span>
            </div>
          ) : null}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="grillr-nav-action grillr-nav-action-muted"
            >
              Log out
            </button>
          ) : !isLoading ? (
            <>
              <Link
                href="/login"
                className="grillr-nav-signin hidden sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="grillr-nav-signin grillr-nav-signup hidden sm:inline-flex"
              >
                Get started <span className="grillr-nav-cta-arrow" aria-hidden="true">→</span>
              </Link>
            </>
          ) : null}
        </div>

        <div ref={menuRef} className="relative flex items-center gap-2 md:hidden">
          {isAuthenticated && user ? (
            <div className="flex max-w-[8rem] min-w-0 items-center gap-1.5 rounded-full border border-[#d7e0ee] bg-white/80 px-2 py-1 shadow-[0_2px_10px_rgba(16,35,63,0.03)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[9px] font-bold text-[#365bb4]">
                {greetingInitial}
              </span>
              <span className="min-w-0 truncate text-[10px] font-semibold text-[#4b5d77]">
                {greetingName}
              </span>
            </div>
          ) : null}
          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grillr-menu-button"
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            {isMenuOpen ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          {isMenuOpen ? (
            <nav id="mobile-navigation-menu" aria-label="Mobile navigation" className="grillr-mobile-menu absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-2rem))]">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const className = `grillr-mobile-link ${isActive(item.href, item.activeOnHome) ? "is-active" : ""}`;
                  return item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noreferrer" onClick={closeMenu} className={className}>
                      {item.label}<span aria-hidden="true"> ↗</span>
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} onClick={closeMenu} className={className}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="my-3 border-t border-[#e7d8c5]" />
              <div className="space-y-1">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void handleSignOut();
                    }}
                    className="grillr-mobile-auth grillr-mobile-auth-button"
                  >
                    Sign out
                  </button>
                ) : !isLoading ? (
                  <>
                    <Link href="/login" onClick={closeMenu} className="grillr-mobile-auth">
                      Sign in
                    </Link>
                    <Link href="/signup" onClick={closeMenu} className="grillr-mobile-auth grillr-mobile-auth-primary">
                      Get started <span aria-hidden="true">→</span>
                    </Link>
                  </>
                ) : null}
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
````

## frontend/components/GrillrLogo.tsx

Changed file - complete source.

````tsx
import Image from "next/image";

interface GrillrLogoProps {
  size?: number;
  className?: string;
  decorative?: boolean;
}

/** Canonical navbar artwork, shared by every product logo. */
export function GrillrLogo({ size = 36, className = "", decorative = false }: GrillrLogoProps) {
  const artworkSize = Math.round(size * 8 / 9);
  return (
    <span
      className={`grillr-brand-mark grillr-logo relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, borderRadius: size * 11 / 36 }}
      aria-hidden={decorative || undefined}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_55%)]" />
      <Image src="/grillr-logo.svg" width={artworkSize} height={artworkSize} alt={decorative ? "" : "Grillr logo"} loading="eager" className="relative drop-shadow-[0_3px_10px_rgba(73,55,47,0.12)]" />
    </span>
  );
}

export function GrillrBrand({ size = 36, className = "", tagline = true }: { size?: number; className?: string; tagline?: boolean }) {
  return <span className={`grillr-logo-lockup ${className}`}><GrillrLogo size={size} decorative /><span className="grillr-logo-wordmark"><strong>GRILLR</strong>{tagline ? <small>INTERVIEW COACH</small> : null}</span></span>;
}
````

## frontend/public/grillr-logo.svg

Changed file - complete source.

````svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" fill="none">
  <defs>
    <linearGradient id="grillr-g-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#b8d1ff"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="48" height="48" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.24)"/>
  <path d="M37 13.5c-4.1-3.2-9.4-4.2-14.5-3.2-7 1.4-12.7 7.2-13.8 14.3-1.2 8.4 3.4 16.3 11.2 18.8 5.8 1.8 12.1.7 16.5-3.2" stroke="url(#grillr-g-glow)" stroke-width="4.3" stroke-linecap="round"/>
  <path d="M30 28h11" stroke="url(#grillr-g-glow)" stroke-width="3.7" stroke-linecap="round"/>
  <path d="M17 24v8M22 20v16M27 17v22" stroke="#f4b860" stroke-width="2.4" stroke-linecap="round" opacity="0.95"/>
  <circle cx="39" cy="28" r="2.4" fill="#f4b860"/>
</svg>
````
