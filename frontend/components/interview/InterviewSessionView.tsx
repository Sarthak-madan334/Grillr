"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";
import { SpeechAnalysis } from "@/components/interview/SpeechAnalysis";
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
      <div className="interview-feedback-heading flex flex-col justify-between gap-6 border-b border-[#e7d8c5] pb-8 sm:flex-row sm:items-start">
        <div>
          <Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">Answer analyzed</Badge>
          <h2 id="feedback-heading" className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-[#201a17]">A useful signal for your next attempt.</h2>
          <p className="mt-3 text-sm text-[#7a5f48]">Attempt {answer.attempt_number} · {answer.speech_metrics?.word_count ?? answer.transcript.trim().split(/\s+/).filter(Boolean).length} words · {Math.round(answer.duration)} seconds</p>
        </div>
        <div className="interview-score flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[22px] border border-[#ddc8b2] bg-[#f8eee4] text-center">
          <span className="text-3xl font-semibold text-[#201a17]">{feedback.overall_score}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a5f48]">Overall</span>
        </div>
      </div>

      <SpeechAnalysis answer={answer} />

      <div className="interview-feedback-grid grid gap-x-8 gap-y-7 sm:grid-cols-3">
        <FeedbackList title="What worked" color="green" items={feedback.strengths} />
        <FeedbackList title="Next focus" color="orange" items={feedback.weaknesses.length ? feedback.weaknesses : feedback.suggestions} />
        <div><h3 className="text-sm font-semibold text-[#7a5f48]">Try this next</h3><p className="mt-3 text-sm leading-6 text-[#5e4d40]">{feedback.suggestions[0] ?? "Review your answer and choose one specific improvement."}</p></div>
      </div>
      <Button size="lg" onClick={onContinue}>{isFinal ? "View interview results" : "Continue to next question"}<span aria-hidden="true" className="ml-2">→</span></Button>
    </section>
  );
}

function FeedbackList({ title, color, items }: { title: string; color: "green" | "orange"; items: string[] }) {
  return <div><h3 className={`text-sm font-semibold ${color === "green" ? "text-[#26724d]" : "text-[#9a603c]"}`}>{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#5e4d40]">{items.map((item) => <li key={item} className="flex gap-2"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color === "green" ? "bg-[#62a37a]" : "bg-[#c38a62]"}`} />{item}</li>)}</ul></div>;
}

function CompletionPanel({ summary }: { summary: Summary }) {
  const stats = [["Overall score", summary.overall_score], ["Questions", summary.total_questions], ["Average WPM", summary.average_wpm], ["Pauses", summary.total_pauses]] as const;
  return (
    <section aria-labelledby="completion-heading" className="interview-completion space-y-10" aria-live="polite">
      <div className="interview-completion-heading border-b border-[#e7d8c5] pb-8"><Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">Interview complete</Badge><h1 id="completion-heading" className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#201a17]">Your practice signal is ready.</h1><p className="mt-3 max-w-xl leading-7 text-[#5e4d40]">Review the patterns from this session, then carry one clear improvement into your next answer.</p></div>
      <div className="interview-completion-stats grid gap-6 border-b border-[#e7d8c5] pb-8 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value], index) => <div key={label} className={`border-l-2 pl-4 ${index === 0 ? "border-[#b8916d]" : "border-[#dfcdb9]"}`}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a5f48]">{label}</p><p className="mt-2 text-3xl font-semibold text-[#201a17]">{value}</p></div>)}</div>
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
    <main className="interview-room min-h-screen bg-[#fbf8f3] text-[#241d1a]"><TopNav /><div className="interview-room-container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {state === "loading" ? <LoadingState /> : state === "completed" && summary ? <CompletionPanel summary={summary} /> : state === "error" ? <section role="alert" className="max-w-xl border-l-2 border-[#b8916d] pl-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Interview room</p><h1 className="mt-3 text-2xl font-semibold text-[#201a17]">We could not open this interview.</h1><p className="mt-3 leading-7 text-[#5e4d40]">{error}</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => void loadSession()}>Try again</Button><Link href="/dashboard"><Button variant="secondary">Back to dashboard</Button></Link></div></section> : session && question ? <>
  <header className="interview-session-header"><div className="interview-session-title"><p className="interview-overline"><span className="interview-live-indicator" /> Live practice session <span className="interview-overline-separator">/</span> {formatLabel(session.interview_type)}</p><h1>{session.job_role}</h1><p className="interview-session-detail">{formatLabel(session.experience_level)} level <span aria-hidden="true">·</span> {formatLabel(session.personality)} interviewer</p></div><div className="interview-progress"><div className="interview-progress-label"><span>Question <strong>{String(question.question_number).padStart(2, "0")}</strong> <span className="interview-progress-total">of {String(session.question_count).padStart(2, "0")}</span></span><span>{Math.round(progress)}% complete</span></div><div className="interview-progress-track" role="progressbar" aria-label="Interview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div></div></header>
        {state === "feedback" && feedback && answer ? <FeedbackPanel feedback={feedback} answer={answer} isFinal={isFinal} onContinue={() => void continueAfterFeedback()} /> : <section aria-labelledby="question-heading" className="interview-workspace"><div className="interview-main-column"><div className="interview-prompt"><div className="interview-prompt-topline"><div className="interview-interviewer-mark" aria-hidden="true"><span>G</span><i /></div><div className="interview-interviewer-copy"><span>Grillr interviewer</span><span>{formatLabel(session.personality)} · {formatLabel(session.interview_type)}</span></div><span className="interview-prompt-label">QUESTION {String(question.question_number).padStart(2, "0")}</span></div><div className="interview-prompt-rule" /><p className="interview-overline">Let’s get into it</p><h2 id="question-heading">{question.question_text}</h2><p className="interview-prompt-hint">Take a moment to think. A clear answer with one concrete example is usually stronger than a perfect one.</p><div className="interview-prompt-foot"><span><span className="interview-live-indicator" /> Interview in progress</span><span>{formatLabel(session.experience_level)} level</span></div></div>
          <div className="interview-answer"><div className="interview-answer-header"><div><p className="interview-overline">Your response</p><h3>{state === "submitting" ? "Reviewing your answer" : "Take the floor"}</h3></div><span className="interview-word-count"><strong>{wordCount}</strong> words</span></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} disabled={state === "submitting"} aria-label="Your interview answer" placeholder="Start with the situation, then explain what you did and what changed..." className="interview-answer-input" /><div className="interview-answer-footer"><p>{state === "submitting" ? "Your response is being reviewed. This usually takes a few seconds." : "Be specific. You can take a breath and organize your thoughts before submitting."}</p><Button size="lg" disabled={!draft.trim() || state === "submitting"} onClick={() => void handleSubmit()}>{state === "submitting" ? "Reviewing..." : "Submit answer"}<span aria-hidden="true" className="ml-2">→</span></Button></div></div></div>
          <aside className="interview-sidebar"><div className="interview-sidebar-person"><div className="interview-avatar" aria-hidden="true"><span>G</span><div className="interview-avatar-orbit" /></div><p className="interview-overline">Your interviewer</p><h3>Grillr</h3><p className="interview-sidebar-personality">{formatLabel(session.personality)} style</p><span className="interview-listening-status"><i /> Ready for your answer</span></div><div className="interview-sidebar-section"><p className="interview-overline">A useful answer</p><ol className="interview-answer-cues"><li><span>01</span><div><strong>Be direct</strong><small>Lead with your main point.</small></div></li><li><span>02</span><div><strong>Get specific</strong><small>Use a real example or detail.</small></div></li><li><span>03</span><div><strong>Close the loop</strong><small>Share the result or takeaway.</small></div></li></ol></div><div className="interview-sidebar-note"><span aria-hidden="true">i</span><p>Your answer is evaluated for clarity, structure, and relevance.</p></div></aside></section>}
        {state !== "feedback" ? <div className="interview-exit"><Link href="/dashboard">← <span>Exit interview</span></Link><span>One question at a time</span></div> : null}
      </> : null}
    </div></main>
  );
}
