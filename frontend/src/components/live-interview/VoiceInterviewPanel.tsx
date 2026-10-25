"use client";

import { GrillrLogo } from "@/components/GrillrLogo";
import { useEffect, useMemo, useRef, useState } from "react";

import { AudioVisualizer } from "@/components/live-interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/live-interview/TranscriptPanel";
import { AudioPlaybackController, type PlaybackSnapshot } from "@/lib/audio-playback";
import { microphoneService } from "@/services/audio/MicrophoneService";
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
