"use client";

import { useState } from "react";

type AudioState = "idle" | "loading" | "ready" | "unavailable" | "error";

type QuestionAudioPlayerProps = {
  sessionId: string;
  questionId: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function SpeakerIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>;
}

export function QuestionAudioPlayer({ sessionId, questionId }: QuestionAudioPlayerProps) {
  const [state, setState] = useState<AudioState>("loading");
  const [attempt, setAttempt] = useState(0);
  const audioUrl = `${API_BASE}/api/v1/interviews/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}/audio`;

  function retry() {
    setAttempt((current) => current + 1);
    setState("loading");
  }

  if (state === "unavailable") {
    return <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#7a5f48]" role="status"><SpeakerIcon /> Audio isn&apos;t available for this question. You can continue with the text prompt.</p>;
  }

  return (
    <div className="mt-5 max-w-md rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.5)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5e4d40]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f1e6da] text-[#6b503d]"><SpeakerIcon /></span>Listen to the question</div>
        {state === "ready" ? <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#26724d]">Ready</span> : null}
      </div>
      {state === "loading" ? <div className="mt-3 h-10 animate-pulse rounded-xl bg-[#eadcc8] motion-reduce:animate-none" aria-label="Loading question audio" /> : null}
      <audio key={`${questionId}-${attempt}`} className={`mt-3 w-full accent-[#7a5f48] ${state === "ready" ? "" : "hidden"}`} controls preload="metadata" src={audioUrl} onLoadStart={() => setState("loading")} onCanPlay={() => setState("ready")} onError={() => setState("unavailable")} aria-label="Play interview question audio" />
      {state === "error" ? <div role="alert" className="mt-3 flex items-center justify-between gap-3 text-xs text-[#8a4f36]"><span>Question audio could not be loaded.</span><button type="button" onClick={retry} className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d]">Retry</button></div> : null}
    </div>
  );
}