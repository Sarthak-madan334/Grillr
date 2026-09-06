"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";
import { QuestionAudioPlayer } from "@/components/QuestionAudioPlayer";
import { VoiceAnswerPanel } from "@/components/VoiceAnswerPanel";
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

function formatInterviewType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LoadingState() {
  return (
    <div aria-live="polite" className="space-y-5">
      <div className="h-4 w-32 animate-pulse rounded-full bg-[#eadcc8] motion-reduce:animate-none" />
      <div className="h-12 max-w-2xl animate-pulse rounded-2xl bg-[#eadcc8] motion-reduce:animate-none" />
      <div className="h-32 animate-pulse rounded-[24px] bg-[#eadcc8] motion-reduce:animate-none" />
    </div>
  );
}

function FeedbackPanel({
  feedback,
  answer,
  isFinal,
  onContinue,
}: {
  feedback: Feedback;
  answer: Answer;
  isFinal: boolean;
  onContinue: () => void;
}) {
  return (
    <section
      aria-labelledby="feedback-heading"
      className="border-t border-[#e7d8c5] pt-8"
      aria-live="polite"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">
            Answer analyzed
          </Badge>
          <h2
            id="feedback-heading"
            className="mt-4 text-2xl font-semibold text-[#201a17]"
          >
            A useful signal for your next attempt.
          </h2>
          <p className="mt-2 text-sm text-[#5e4d40]">
            Attempt {answer.attempt_number} ·{" "}
            {answer.speech_metrics?.word_count ?? 0} words
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-[#e7d8c5] bg-[#f8eee4] text-center">
          <span className="text-2xl font-semibold text-[#201a17]">
            {feedback.overall_score}
          </span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#7a5f48]">
            Score
          </span>
        </div>
      </div>
      <div className="mt-7 grid gap-6 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-[#26724d]">Strengths</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#5e4d40]">
            {feedback.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#9a603c]">Next focus</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#5e4d40]">
            {(feedback.weaknesses.length
              ? feedback.weaknesses
              : feedback.suggestions
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#7a5f48]">Try this</h3>
          <p className="mt-2 text-sm leading-6 text-[#5e4d40]">
            {feedback.suggestions[0] ??
              "Review your answer and look for one specific improvement."}
          </p>
        </div>
      </div>
      <Button className="mt-8" onClick={onContinue}>
        {isFinal ? "View results" : "Continue to next question"}
      </Button>
    </section>
  );
}

function CompletionPanel({ summary }: { summary: Summary }) {
  return (
    <section
      aria-labelledby="completion-heading"
      className="space-y-8"
      aria-live="polite"
    >
      <div className="border-b border-[#e7d8c5] pb-8">
        <Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">
          Interview complete
        </Badge>
        <h1
          id="completion-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-[#201a17]"
        >
          Your practice signal is ready.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-[#5e4d40]">
          Review the patterns from this session, then carry one clear
          improvement into your next answer.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-2 border-[#b8916d] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7a5f48]">
            Overall score
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#201a17]">
            {summary.overall_score}
          </p>
        </div>
        <div className="border-l-2 border-[#dfcdb9] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7a5f48]">
            Questions
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#201a17]">
            {summary.total_questions}
          </p>
        </div>
        <div className="border-l-2 border-[#dfcdb9] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7a5f48]">
            Average WPM
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#201a17]">
            {summary.average_wpm}
          </p>
        </div>
        <div className="border-l-2 border-[#dfcdb9] pl-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7a5f48]">
            Pauses
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#201a17]">
            {summary.total_pauses}
          </p>
        </div>
      </div>
      <div className="grid gap-6 border-t border-[#e7d8c5] pt-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-[#201a17]">What worked</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#5e4d40]">
            {summary.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#201a17]">
            Recommendations
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#5e4d40]">
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
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<
    "loading" | "ready" | "submitting" | "feedback" | "completed" | "error"
  >("loading");
  const [error, setError] = useState("");
  const questionStartedAt = useRef<number | null>(null);

  const loadSession = useCallback(
    async (signal?: AbortSignal, restoreLatestFeedback = false) => {
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
      if (restoreLatestFeedback) {
        try {
          const latest = await getLatestAnswer(sessionId, signal);
          const answeredQuestion = questionData.items.find(
            (item) => item.id === latest.question_id,
          );
          if (answeredQuestion && latest.evaluation) {
            setQuestion(answeredQuestion);
            setAnswer(latest);
            setFeedback(latest.evaluation);
            setState("feedback");
            return;
          }
        } catch (caught: unknown) {
          if (caught instanceof DOMException && caught.name === "AbortError")
            throw caught;
          if (!(
            caught instanceof Error &&
            "status" in caught &&
            (caught as { status?: number }).status === 404
          ))
            throw caught;
        }
      }
      const unanswered = questionData.items.find((item) => !item.answered_at);
      if (!unanswered)
        throw new Error("This interview has no unanswered question.");
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
  const isFinal = Boolean(
    session && question && question.question_number >= session.question_count,
  );
  const wordCount = useMemo(
    () => (draft.trim() ? draft.trim().split(/\s+/).length : 0),
    [draft],
  );

  async function handleSubmit() {
    if (!question || !draft.trim() || state === "submitting") return;
    setState("submitting");
    setError("");
    try {
      const submitted = await submitAnswer(
        question.id,
        draft.trim(),
        Math.max(
          1,
          (Date.now() - (questionStartedAt.current ?? Date.now())) / 1000,
        ),
      );
      if (!submitted.evaluation)
        throw new Error(
          "The answer was saved, but feedback is not available yet.",
        );
      setAnswer(submitted);
      setFeedback(submitted.evaluation);
      setState("feedback");
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not submit your answer.",
      );
      setState("error");
    }
  }

  async function continueAfterFeedback() {
    if (isFinal) {
      await loadSession();
      return;
    }
    setDraft("");
    setAnswer(null);
    setFeedback(null);
    await loadSession();
  }

  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {state === "loading" ? (
          <LoadingState />
        ) : state === "completed" && summary ? (
          <CompletionPanel summary={summary} />
        ) : state === "error" ? (
          <section
            role="alert"
            className="max-w-xl border-l-2 border-[#b8916d] pl-5"
          >
            <h1 className="text-2xl font-semibold text-[#201a17]">
              We could not open this interview.
            </h1>
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a5f48]">
                  {formatInterviewType(session.interview_type)} interview
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#201a17]">
                  {session.job_role}
                </h1>
                <p className="mt-2 text-sm text-[#5e4d40]">
                  {formatInterviewType(session.personality)} interviewer ·{" "}
                  {session.experience_level} level
                </p>
              </div>
              <div className="w-full sm:max-w-xs">
                <div className="flex justify-between text-sm font-medium text-[#5e4d40]">
                  <span>
                    Question {question.question_number} of{" "}
                    {session.question_count}
                  </span>
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
              <FeedbackPanel
                feedback={feedback}
                answer={answer}
                isFinal={isFinal}
                onContinue={() => void continueAfterFeedback()}
              />
            ) : (
              <section aria-labelledby="question-heading" className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a5f48]">
                  Grillr asks
                </p>
                <h2
                  id="question-heading"
                  className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-[#201a17] sm:text-4xl"
                >
                  {question.question_text}
                </h2>
                <QuestionAudioPlayer key={question.id} sessionId={session.id} questionId={question.id} shouldStop={state === "submitting"} />
                <div className="mt-10">
                  <VoiceAnswerPanel
                    sessionId={session.id}
                    disabled={state === "submitting"}
                    onTranscript={setDraft}
                  />
                  <label
                    htmlFor="answer"
                    className="text-sm font-semibold text-[#3d3028]"
                  >
                    Your answer
                  </label>
                  <textarea
                    id="answer"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={state === "submitting"}
                    placeholder="Start with the situation, explain what you did, and finish with the outcome."
                    rows={10}
                    className="mt-3 w-full resize-y rounded-[24px] border border-[#e7d8c5] bg-[rgba(255,255,255,0.56)] px-5 py-4 text-base leading-7 text-[#201a17] outline-none transition placeholder:text-[#aa9582] focus:border-[#b8916d] focus:ring-2 focus:ring-[#b8916d]/20 disabled:opacity-70 motion-reduce:transition-none"
                    aria-describedby="answer-hint answer-count"
                  />
                  <div className="mt-3 flex flex-col gap-1 text-xs text-[#7a5f48] sm:flex-row sm:items-center sm:justify-between">
                    <span id="answer-hint">
                      Aim for a specific example and outcome.
                    </span>
                    <span id="answer-count" aria-live="polite">
                      {wordCount} {wordCount === 1 ? "word" : "words"}
                    </span>
                  </div>
                  <Button
                    className="mt-6"
                    onClick={() => void handleSubmit()}
                    disabled={!draft.trim() || state === "submitting"}
                  >
                    {state === "submitting" ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                        Analyzing answer...
                      </span>
                    ) : (
                      "Submit answer"
                    )}
                  </Button>
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
