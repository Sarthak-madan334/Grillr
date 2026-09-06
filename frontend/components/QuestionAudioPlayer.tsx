"use client";

import { useEffect, useRef, useState } from "react";

type AudioState = "loading" | "ready" | "unavailable";

type QuestionAudioPlayerProps = {
  sessionId: string;
  questionId: string;
  shouldStop?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function SpeakerIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>;
}

export function QuestionAudioPlayer({ sessionId, questionId, shouldStop = false }: QuestionAudioPlayerProps) {
  const [state, setState] = useState<AudioState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = `${API_BASE}/api/v1/interviews/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}/audio`;

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
    return <div className="mt-5 flex items-center justify-between gap-3 text-xs leading-5 text-[#7a5f48]" role="status"><span className="flex items-center gap-2"><SpeakerIcon /> Audio isn&apos;t available for this question. You can continue with the text prompt.</span><button type="button" onClick={retry} className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d]">Retry</button></div>;
  }

  return (
    <div className="mt-5 max-w-md rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.5)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5e4d40]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f1e6da] text-[#6b503d]"><SpeakerIcon /></span>Listen to the question</div>
        {state === "ready" ? <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#26724d]">{isPlaying ? "Playing" : "Ready"}</span> : null}
      </div>
      {state === "loading" ? <div className="mt-3 h-10 animate-pulse rounded-xl bg-[#eadcc8] motion-reduce:animate-none" aria-label="Loading question audio" /> : null}
      {state === "ready" ? <button type="button" onClick={togglePlayback} aria-label={isPlaying ? "Pause question audio" : "Play question audio"} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#b8916d] bg-[#f8eee4] text-sm font-semibold text-[#5e402e] transition hover:bg-[#f1dfcf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d] focus-visible:ring-offset-2 motion-reduce:transition-none">{isPlaying ? "Pause audio" : "Play question audio"}</button> : null}
      <audio ref={audioRef} key={`${questionId}-${attempt}`} className="hidden" preload="metadata" src={audioUrl} onLoadStart={() => setState("loading")} onCanPlay={(event) => { setState("ready"); void event.currentTarget.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onError={() => setState("unavailable")} aria-label="Question audio" />
    </div>
  );
}