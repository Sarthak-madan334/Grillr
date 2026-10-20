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
