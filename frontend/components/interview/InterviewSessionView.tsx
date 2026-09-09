"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";
import {
  getInterview,
  getLatestAnswer,
  getQuestions,
  getSummary,
  startInterview,
  type Answer,
  type Feedback,
  type InterviewQuestion,
  type InterviewSession,
  type Summary,
} from "@/lib/interview-api";

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LoadingState() {
  return (
    <div aria-live="polite" className="space-y-8">
      <div className="h-4 w-36 animate-pulse rounded-full bg-[#eadcc8] motion-reduce:animate-none" />
      <div className="h-16 max-w-3xl animate-pulse rounded-2xl bg-[#eadcc8] motion-reduce:animate-none" />
      <div className="h-56 animate-pulse rounded-[28px] bg-[#f3e9dc] motion-reduce:animate-none" />
    </div>
  );
}

function MicMark({ active }: { active: boolean }) {
  return (
    <span className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${active ? "bg-[#2d241d] text-[#fffaf4]" : "bg-[#f3e6d8] text-[#7a5f48]"}`} aria-hidden="true">
      {active ? <span className="absolute inset-2 rounded-xl border border-[#d8b797] motion-safe:animate-pulse" /> : null}
      <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="3" width="8" height="12" rx="4" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
      </svg>
    </span>
  );
}

function FeedbackPanel({ feedback, answer, isFinal, onContinue }: { feedback: Feedback; answer: Answer; isFinal: boolean; onContinue: () => void }) {
  return (
    <section aria-labelledby="feedback-heading" className="space-y-8" aria-live="polite">
      <div className="flex flex-col justify-between gap-6 border-b border-[#e7d8c5] pb-8 sm:flex-row sm:items-start">
        <div>
          <Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">Answer analyzed</Badge>
          <h2 id="feedback-heading" className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-[#201a17]">A useful signal for your next attempt.</h2>
          <p className="mt-3 text-sm text-[#7a5f48]">Attempt {answer.attempt_number} · {answer.speech_metrics?.word_count ?? 0} words · {Math.round(answer.duration)} seconds</p>
        </div>
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[22px] border border-[#ddc8b2] bg-[#f8eee4] text-center">
          <span className="text-3xl font-semibold text-[#201a17]">{feedback.overall_score}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a5f48]">Overall</span>
        </div>
      </div>
      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-3">
        <FeedbackList title="What worked" color="green" items={feedback.strengths} />
        <FeedbackList title="Next focus" color="orange" items={feedback.weaknesses.length ? feedback.weaknesses : feedback.suggestions} />
        <div>
          <h3 className="text-sm font-semibold text-[#7a5f48]">Try this next</h3>
          <p className="mt-3 text-sm leading-6 text-[#5e4d40]">{feedback.suggestions[0] ?? "Review your answer and choose one specific improvement."}</p>
        </div>
      </div>
      <Button size="lg" onClick={onContinue}>
        {isFinal ? "View interview results" : "Continue to next question"}
        <span aria-hidden="true" className="ml-2">→</span>
      </Button>
    </section>
  );
}

function FeedbackList({ title, color, items }: { title: string; color: "green" | "orange"; items: string[] }) {
  return (
    <div>
      <h3 className={`text-sm font-semibold ${color === "green" ? "text-[#26724d]" : "text-[#9a603c]"}`}>{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5e4d40]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color === "green" ? "bg-[#62a37a]" : "bg-[#c38a62]"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompletionPanel({ summary }: { summary: Summary }) {
  const stats = [
    ["Overall score", summary.overall_score],
    ["Questions", summary.total_questions],
    ["Average WPM", summary.average_wpm],
    ["Pauses", summary.total_pauses],
  ] as const;

  return (
    <section aria-labelledby="completion-heading" className="space-y-10" aria-live="polite">
      <div className="border-b border-[#e7d8c5] pb-8">
        <Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">Interview complete</Badge>
        <h1 id="completion-heading" className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#201a17]">Your practice signal is ready.</h1>
        <p className="mt-3 max-w-xl leading-7 text-[#5e4d40]">Review the patterns from this session, then carry one clear improvement into your next answer.</p>
      </div>
      <div className="grid gap-6 border-b border-[#e7d8c5] pb-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value], index) => (
          <div key={label} className={`border-l-2 pl-4 ${index === 0 ? "border-[#b8916d]" : "border-[#dfcdb9]"}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a5f48]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#201a17]">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <FeedbackList title="What worked" color="green" items={summary.strengths} />
        <FeedbackList title="Recommendations" color="orange" items={summary.recommendations} />
      </div>
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
  const [state, setState] = useState<"loading" | "ready" | "submitting" | "feedback" | "completed" | "error">("loading");
  const [error, setError] = useState("");
  const questionStartedAt = useRef<number | null>(null);

  const loadSession = useCallback(
    async (signal?: AbortSignal, restoreLatestFeedback = false) => {
      setState("loading");
      setError("");

      const loaded = await getInterview(sessionId, signal);
      const active = loaded.status === "created" ? await startInterview(sessionId, signal) : loaded;
      setSession(active);

      if (active.status === "completed") {
        setSummary(await getSummary(sessionId, signal));
        setState("completed");
        return;
      }

      const questionData = await getQuestions(sessionId, signal);

      if (restoreLatestFeedback) {
        try {
          const latest = await getLatestAnswer(sessionId, signal);
          const answeredQuestion = questionData.items.find((item) => item.id === latest.question_id);
          if (answeredQuestion && latest.evaluation) {
            setQuestion(answeredQuestion);
            setAnswer(latest);
            setFeedback(latest.evaluation);
            setState("feedback");
            return;
          }
        } catch (caught: unknown) {
          if (caught instanceof DOMException && caught.name === "AbortError") throw caught;
          if (!(caught instanceof Error && "status" in caught && (caught as { status?: number }).status === 404)) throw caught;
        }
      }

      const unanswered = questionData.items.find((item) => !item.answered_at);
      if (!unanswered) throw new Error("This interview has no unanswered question.");

      setQuestion(unanswered);
      questionStartedAt.current = Date.now();
      setState("ready");
    },
    [sessionId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => loadSession(controller.signal, true))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "We could not load this interview.");
        setState("error");
      });

    return () => controller.abort();
  }, [loadSession]);

  const progress = session && question ? Math.min(100, (question.question_number / session.question_count) * 100) : 0;
  const isFinal = Boolean(session && question && question.question_number >= session.question_count);

  async function continueAfterFeedback() {
    if (isFinal) {
      await loadSession();
      return;
    }

    setAnswer(null);
    setFeedback(null);
    await loadSession();
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#241d1a]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {state === "loading" ? (
          <LoadingState />
        ) : state === "completed" && summary ? (
          <CompletionPanel summary={summary} />
        ) : state === "error" ? (
          <section role="alert" className="max-w-xl border-l-2 border-[#b8916d] pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Interview room</p>
            <h1 className="mt-3 text-2xl font-semibold text-[#201a17]">We could not open this interview.</h1>
            <p className="mt-3 leading-7 text-[#5e4d40]">{error}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void loadSession()}>Try again</Button>
              <Link href="/dashboard">
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
            </div>
          </section>
        ) : session && question ? (
          <>
            <header className="mb-10 flex flex-col gap-6 border-b border-[#e7d8c5] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a5f48]">{formatLabel(session.interview_type)} interview</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#201a17]">{session.job_role}</h1>
                <p className="mt-2 text-sm text-[#5e4d40]">{formatLabel(session.personality)} interviewer · {formatLabel(session.experience_level)} level</p>
              </div>
              <div className="w-full sm:max-w-xs">
                <div className="flex justify-between text-sm font-medium text-[#5e4d40]">
                  <span>Question {question.question_number} of {session.question_count}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-[#eadcc8]"
                  role="progressbar"
                  aria-label="Interview progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="h-full rounded-full bg-[#a27c5b] transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </header>

            {state === "feedback" && feedback && answer ? (
              <FeedbackPanel feedback={feedback} answer={answer} isFinal={isFinal} onContinue={() => void continueAfterFeedback()} />
            ) : (
              <section aria-labelledby="question-heading" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="min-w-0">
                  <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b715c]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3e6d8] text-[#8b715c]">Q</span>
                    Current prompt
                  </div>

                  <h2 id="question-heading" className="max-w-4xl text-3xl font-semibold leading-[1.16] tracking-tight text-[#201a17] sm:text-5xl">
                    {question.question_text}
                  </h2>

                  <p className="mt-6 max-w-2xl text-sm leading-6 text-[#7a685b]">
                    Take a moment to think. A clear answer with one concrete example is usually stronger than a perfect one.
                  </p>

                  <div className="mt-10 rounded-[28px] border border-[#e7d8c5] bg-[#fffdf9] p-5 shadow-[0_18px_45px_rgba(103,75,49,0.07)] sm:p-7">
                    <div className="flex items-center gap-3">
                      <MicMark active={state === "submitting"} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b715c]">
                          {state === "submitting" ? "Working on it" : "Voice answer required"}
                        </p>
                        <p className="mt-1 text-sm text-[#5e4d40]">
                          {state === "submitting"
                            ? "Grillr is reviewing your response."
                            : "Speak naturally. This interview requires a spoken answer, and your delivery will be analyzed live."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="space-y-4 lg:pt-12">
                  <div className="border-y border-[#e7d8c5] py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b715c]">Session note</p>
                    <p className="mt-2 text-sm leading-6 text-[#5e4d40]">
                      The interviewer is {formatLabel(session.personality).toLowerCase()} and this is a {formatLabel(session.interview_type).toLowerCase()} session.
                    </p>
                  </div>
                  <div className="border-b border-[#e7d8c5] pb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b715c]">What happens next</p>
                    <ol className="mt-3 space-y-3 text-sm text-[#5e4d40]">
                      <li className="flex gap-3"><span className="font-semibold text-[#b8916d]">01</span>Answer out loud</li>
                      <li className="flex gap-3"><span className="font-semibold text-[#b8916d]">02</span>Review your coaching</li>
                      <li className="flex gap-3"><span className="font-semibold text-[#b8916d]">03</span>Continue the interview</li>
                    </ol>
                  </div>
                </aside>
              </section>
            )}

            {state !== "feedback" ? (
              <div className="mt-8 border-t border-[#e7d8c5] pt-5">
                <Link href="/dashboard" className="text-sm font-medium text-[#7a5f48] transition hover:text-[#201a17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d] focus-visible:ring-offset-4">
                  Exit interview
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
