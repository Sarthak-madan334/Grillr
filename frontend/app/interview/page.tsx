"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNav } from "@/components/layout/top-nav";
import LiveInterviewCard from "@/components/LiveInterviewCard";
import { evaluateAnswer, generateQuestions, type InterviewConfig, type Question } from "@/lib/interview";

type InterviewState = "ai_speaking" | "listening" | "user_speaking" | "processing" | "paused";

const interviewConfig: InterviewConfig = {
  interviewType: "technical",
  jobRole: "Software Engineer",
  experienceLevel: "mid",
  difficulty: "medium",
  personality: "professional",
  duration: 30,
};

const stateDetails: Record<InterviewState, { label: string; description: string; color: string }> = {
  ai_speaking: {
    label: "AI interviewer speaking",
    description: "Listen closely. You can interrupt whenever you are ready to respond.",
    color: "#866244",
  },
  listening: {
    label: "Listening for your answer",
    description: "Take a breath, then begin when you are ready.",
    color: "#2f8b62",
  },
  user_speaking: {
    label: "You are speaking",
    description: "Grillr is capturing your response in real time.",
    color: "#b27743",
  },
  processing: {
    label: "Analyzing your answer",
    description: "Reviewing clarity, structure, and communication.",
    color: "#786b5d",
  },
  paused: {
    label: "Interview paused",
    description: "Resume when you are ready to continue.",
    color: "#786b5d",
  },
};

const sampleTranscript = "I led the migration from a monolith to a service-based architecture. I started by mapping the highest-risk dependencies, then moved the authentication service first so we could validate the pattern safely. The result was a 40 percent reduction in deploy time and a clearer ownership model for the team.";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function InterviewPage() {
  const questions = useMemo<Question[]>(() => generateQuestions(interviewConfig), []);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewState, setInterviewState] = useState<InterviewState>("ai_speaking");
  const [transcript, setTranscript] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasRetried, setHasRetried] = useState(false);

  const currentQuestion = questions[questionIndex];
  const evaluation = evaluateAnswer({
    transcript: transcript || sampleTranscript,
    interviewType: interviewConfig.interviewType,
    jobRole: interviewConfig.jobRole,
    difficulty: interviewConfig.difficulty,
  });
  const progress = ((questionIndex + (isComplete ? 1 : 0)) / questions.length) * 100;
  const state = stateDetails[interviewState];

  useEffect(() => {
    if (isComplete || interviewState === "paused") {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [interviewState, isComplete]);

  function advanceQuestion() {
    if (questionIndex === questions.length - 1) {
      setIsComplete(true);
      setInterviewState("processing");
      return;
    }

    setQuestionIndex((currentIndex) => currentIndex + 1);
    setTranscript("");
    setInterviewState("ai_speaking");
  }

  function togglePause() {
    setInterviewState((currentState) => (currentState === "paused" ? "listening" : "paused"));
  }

  function retryAnswer() {
    setHasRetried(true);
    setIsComplete(false);
    setInterviewState("listening");
    setTranscript("");
    setQuestionIndex(Math.max(0, questionIndex - 1));
  }

  return (
    <main className="min-h-screen text-[#241d1a]">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a5f48]">Live interview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#201a17]">Software Engineer</h1>
            <p className="mt-2 text-sm text-[#5e4d40]">Technical interview · Professional interviewer</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#5e4d40]">
            <span>Time elapsed</span>
            <span className="rounded-full border border-[#e7d8c5] bg-[rgba(255,255,255,0.55)] px-3 py-1.5 font-medium text-[#201a17] backdrop-blur-md">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {!isComplete ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex justify-center lg:justify-start">
              <LiveInterviewCard
                role={interviewConfig.jobRole}
                interviewMode="Technical"
                question={currentQuestion.text}
                questionNumber={questionIndex + 1}
                totalQuestions={questions.length}
                timeRemainingSeconds={Math.max(0, interviewConfig.duration * 60 - elapsedSeconds)}
                isListening={interviewState === "listening" || interviewState === "user_speaking"}
                onRetry={retryAnswer}
              />
            </div>

            <Card className="p-6 sm:p-8">
              <div className="mt-6">
                <label htmlFor="transcript" className="mb-2 block text-sm font-medium text-[#5e4d40]">Live transcript</label>
                <textarea
                  id="transcript"
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                  placeholder="Your words will appear here as you speak..."
                  rows={6}
                  className="w-full resize-none rounded-[22px] border border-[#e7d8c5] bg-[rgba(255,255,255,0.5)] px-4 py-3 text-sm leading-6 text-[#201a17] outline-none backdrop-blur-sm transition placeholder:text-[#aa9582] focus:border-[#b8916d] focus:ring-2 focus:ring-[#b8916d]/20"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setInterviewState("user_speaking")} disabled={interviewState === "user_speaking"}>
                  Start speaking
                </Button>
                <Button variant="secondary" onClick={() => setInterviewState("processing")} disabled={!transcript && interviewState !== "user_speaking"}>
                  Process answer
                </Button>
                <Button onClick={advanceQuestion} disabled={interviewState !== "processing"}>
                  {questionIndex === questions.length - 1 ? "Finish interview" : "Next question"}
                </Button>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Interview state</p>
                    <h2 className="mt-2 text-xl font-semibold text-[#201a17]">{state.label}</h2>
                  </div>
                  <span className="mt-1 flex h-3 w-3 rounded-full" style={{ backgroundColor: state.color, boxShadow: `0 0 0 6px ${state.color}20` }} />
                </div>
                <p className="mt-4 text-sm leading-6 text-[#5e4d40]">{state.description}</p>

                <div className="mt-6 h-2 overflow-hidden rounded-full border border-[#eadcc8] bg-[rgba(255,255,255,0.48)]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#7a5f48,#d1aa83)] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-[#7a5f48]">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </Card>

              <Card className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Controls</p>
                <div className="mt-4 grid gap-3">
                  <Button variant="secondary" onClick={togglePause}>{interviewState === "paused" ? "Resume interview" : "Pause interview"}</Button>
                  <Button variant="ghost" onClick={() => setIsComplete(true)}>End and review</Button>
                </div>
                <p className="mt-4 text-xs leading-5 text-[#8a7564]">You can interrupt the interviewer at any time by starting your response.</p>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge className="border-[#d4eadb] bg-[#e5f6eb] text-[#26724d]">Interview complete</Badge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#201a17]">A thoughtful start. Here is your signal.</h2>
                  <p className="mt-3 max-w-2xl text-[#5e4d40]">Your answer shows clear technical reasoning. Use the notes below to make the next attempt even sharper.</p>
                </div>
                <div className="rounded-[24px] border border-[#eadcc8] bg-[rgba(255,255,255,0.52)] px-6 py-4 text-center backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a5f48]">Overall score</p>
                  <p className="mt-1 text-4xl font-semibold text-[#201a17]">{evaluation.overallScore}</p>
                  <p className="text-xs text-[#7a5f48]">out of 100</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#201a17]">Feedback</h2>
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-sm font-medium text-[#26724d]">What worked</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-[#5e4d40]">
                      {evaluation.strengths.map((strength) => <li key={strength}>+ {strength}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#9a603c]">Next focus</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-[#5e4d40]">
                      {evaluation.suggestions.map((suggestion) => <li key={suggestion}>- {suggestion}</li>)}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#201a17]">Answer snapshot</h2>
                <p className="mt-4 rounded-[20px] border border-[#eadcc8] bg-[rgba(255,255,255,0.42)] p-4 text-sm leading-6 text-[#5e4d40] backdrop-blur-sm">{transcript || sampleTranscript}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-lg font-semibold text-[#201a17]">117</p><p className="text-xs text-[#7a5f48]">WPM</p></div>
                  <div><p className="text-lg font-semibold text-[#201a17]">8</p><p className="text-xs text-[#7a5f48]">Fillers</p></div>
                  <div><p className="text-lg font-semibold text-[#201a17]">5</p><p className="text-xs text-[#7a5f48]">Pauses</p></div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5f48]">Retry comparison</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#201a17]">Make the next attempt more specific.</h2>
                </div>
                <Button onClick={retryAnswer}>{hasRetried ? "Retry once more" : "Retry this answer"}</Button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] border border-[#eadcc8] bg-[rgba(255,255,255,0.42)] p-4"><p className="text-xs text-[#7a5f48]">Attempt 1</p><p className="mt-2 text-2xl font-semibold text-[#201a17]">{evaluation.overallScore - 8}</p></div>
                <div className="rounded-[20px] border border-[#eadcc8] bg-[rgba(255,255,255,0.42)] p-4"><p className="text-xs text-[#7a5f48]">Current</p><p className="mt-2 text-2xl font-semibold text-[#201a17]">{evaluation.overallScore}</p></div>
                <div className="rounded-[20px] border border-[#d4eadb] bg-[#e5f6eb]/70 p-4"><p className="text-xs text-[#26724d]">Improvement</p><p className="mt-2 text-2xl font-semibold text-[#26724d]">+8</p></div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
