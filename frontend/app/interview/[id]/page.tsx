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
      {summary.score_available ? <ScoreBar value={summary.overall_score} /> : <p role="status" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 leading-7 text-[var(--muted)]">AI scoring was unavailable for this session, so there is no overall score yet. Your answers were saved below and can still guide your next practice.</p>}
      <div className="interview-completion-stats grid gap-5 border-b border-[var(--border)] pb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-2 border-[var(--border)] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Overall score
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {summary.score_available ? summary.overall_score : "—"}
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
      <section aria-labelledby="answer-review-heading" className="space-y-5">
        <div><p className="interview-overline">Your answers</p><h2 id="answer-review-heading" className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Question by question</h2></div>
        {summary.question_feedback.map((item) => (
          <article key={item.question_number} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{item.is_follow_up ? "Follow-up based on your answer" : `Question ${String(item.question_number).padStart(2, "0")}`}</p><h3 className="max-w-3xl text-lg font-semibold leading-7 text-[var(--foreground)]">{item.question_text}</h3></div><span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)]">{item.overall_score === null ? "Not scored" : `${item.overall_score}/100`}</span></div>
            {item.transcript ? <p className="mt-4 whitespace-pre-wrap border-l-2 border-[var(--border)] pl-4 leading-7 text-[var(--muted)]">{item.transcript}</p> : <p className="mt-4 text-sm text-[var(--muted)]">No saved answer for this question.</p>}
            {(item.strengths.length > 0 || item.weaknesses.length > 0 || item.suggestions.length > 0) && <div className="mt-6 grid gap-5 sm:grid-cols-3"><div><h4 className="font-semibold text-[var(--foreground)]">What worked</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">{item.strengths.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></div><div><h4 className="font-semibold text-[var(--foreground)]">Next focus</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">{item.weaknesses.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></div><div><h4 className="font-semibold text-[var(--foreground)]">Try next</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">{item.suggestions.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></div></div>}
          </article>
        ))}
      </section>
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
