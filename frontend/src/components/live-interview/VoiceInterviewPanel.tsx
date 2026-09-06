"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AudioVisualizer } from "@/components/live-interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/live-interview/TranscriptPanel";
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
  const intervalRef = useRef<number | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>(initialVoiceState);
  const [question, setQuestion] = useState(demoQuestion);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    { speaker: "ai", text: demoQuestion },
  ]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [audioLevel, setAudioLevel] = useState(42);
  const [errorMessage, setErrorMessage] = useState("");

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
        setAudioLevel(70);
      }

      if (event.type === "ai.speech.start") {
        setAudioLevel(58);
      }

      if (event.type === "answer.processing") {
        setAudioLevel(20);
      }
    });

    realtime.startMockInterview();

    intervalRef.current = window.setInterval(() => {
      setAudioLevel((previous) => {
        if (
          voiceState.stage === "user_speaking" ||
          voiceState.stage === "ai_speaking"
        ) {
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
      realtime.disconnect();
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [realtime, voiceState.stage]);

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
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicOn((previous) => !previous);
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
    setVoiceState((previous) =>
      applyVoiceEvent(previous, { type: "USER_INTERRUPTED_AI" }),
    );
    setAudioLevel(32);
  };

  return (
    <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm shadow-indigo-200">
            G
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Grillr
            </div>
            <h1 className="text-base font-semibold text-slate-900">
              Interview room
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Progress
            </div>
            <div className="mt-1 font-medium text-slate-900">02 / 05</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <span className="font-medium text-slate-700">
              {connectionState}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            SA
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Profile
            </div>
            <div className="text-sm font-medium text-slate-700">Sarthak</div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-6">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
              <div className="mb-5 flex items-center justify-between text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  Question 2 of 5
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
                  <span
                    className="h-2 w-2 rounded-full bg-indigo-500"
                    aria-hidden="true"
                  />
                  03:45
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  Interview prompt
                </p>
                <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-900 md:text-[2rem]">
                  {question}
                </h2>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(148,163,184,0.12)] md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label={
                      isMicOn ? "Stop microphone" : "Start microphone"
                    }
                    onClick={requestMicAccess}
                    className={`flex h-20 w-20 items-center justify-center rounded-full border text-xl font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
                      isMicOn
                        ? "border-indigo-200 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    {isMicOn ? "●" : "◉"}
                  </button>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      Voice state
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {currentStatus}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  {currentStatus}
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-medium text-slate-600">
                    Live waveform
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      AI speaking
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      Listening
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      You’re speaking
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      Processing
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center rounded-[20px] border border-slate-200 bg-white px-4 py-5 shadow-inner shadow-slate-100">
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
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    Controls
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    Answer actions
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  aria-label="Start or stop answer"
                  className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  {isMicOn ? "Stop answer" : "Start answer"}
                </button>
                <button
                  type="button"
                  aria-label="Interrupt interviewer"
                  onClick={handleInterrupt}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Interrupt interviewer
                </button>
                <button
                  type="button"
                  aria-label="Mute microphone"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Mute
                </button>
                <button
                  type="button"
                  aria-label="End interview"
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                >
                  End interview
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)] md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    Session
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    State
                  </h3>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {voiceState.stage}
                </span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center justify-between">
                  <span>Microphone</span>
                  <span className="font-medium text-slate-900">
                    {isMicOn ? "Active" : "Standby"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>AI audio</span>
                  <span className="font-medium text-slate-900">
                    {voiceState.stage === "ai_speaking" ? "Speaking" : "Idle"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Realtime</span>
                  <span className="font-medium text-slate-900">
                    {connectionState}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Last event</span>
                  <span className="font-medium text-slate-900">
                    {voiceState.lastEvent ?? "idle"}
                  </span>
                </li>
              </ul>
            </div>

            {errorMessage ? (
              <div
                className="rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
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
