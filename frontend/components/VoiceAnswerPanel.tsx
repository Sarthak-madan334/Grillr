"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { microphoneService } from "../lib/audio/microphone-service";
import { useVoiceActivityDetection } from "../lib/audio/use-voice-activity-detection";

type VoiceStatus = "checking" | "ready" | "recording" | "denied" | "no-device" | "unsupported" | "revoked";
export type TurnState = "asking" | "listening" | "processing" | "completed";

type VoiceAnswerPanelProps = {
  sessionId?: string;
  disabled?: boolean;
  hidden?: boolean;
  turnState?: TurnState;
  onRecordingChange?: (recording: boolean) => void;
  onTranscript?: (transcript: string) => void;
  onTurnStateChange?: (state: TurnState) => void;
  onAnswerEvaluated?: () => void;
  onQuestionReady?: (question: { id: string; text: string; questionNumber: number; isFollowUp: boolean }) => void;
  onCompleted?: () => void;
};

const waveformPattern = Array.from({ length: 31 }, (_, index) =>
  0.25 + Math.abs(Math.sin(index * 0.61)) * 0.75,
);

function MicrophoneIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>;
}

function StopIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1.5" /></svg>;
}

function getErrorName(error: unknown) {
  return error instanceof DOMException ? error.name : error instanceof Error ? error.name : "";
}

function statusCopy(status: VoiceStatus) {
  switch (status) {
    case "denied":
      return { title: "Microphone access denied", body: "Allow microphone access in your browser settings, then retry." };
    case "no-device":
      return { title: "No microphone detected", body: "Connect a microphone, then retry your answer." };
    case "unsupported":
      return { title: "Voice is unavailable here", body: "Open this interview in a browser with microphone support." };
    case "revoked":
      return { title: "Microphone access ended", body: "Reconnect your microphone, then retry your answer." };
    default:
      return null;
  }
}

export function VoiceAnswerPanel({ sessionId, disabled = false, hidden = false, turnState = "listening", onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted }: VoiceAnswerPanelProps) {
  const [status, setStatus] = useState<VoiceStatus>(() =>
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
      ? "ready"
      : "unsupported",
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [socketError, setSocketError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const socketAuthenticatedRef = useRef(false);
  const turnIdRef = useRef<string | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const aiAudioUrlRef = useRef<string | null>(null);
  const pendingChunksRef = useRef<Blob[]>([]);
  const { isSpeaking, level } = useVoiceActivityDetection(activeStream);
  const isActivelyRecording = status === "recording" && !isStopping && !isProcessing;
  const voiceLevel = activeStream ? Math.min(1, level * 8) : 0;

  useEffect(() => {
    if (!isActivelyRecording) return;
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isActivelyRecording]);

  const stopStream = useCallback((closeSocket = true) => {
    microphoneService.releaseMicrophone();
    if (closeSocket) {
      socketRef.current?.close();
      socketRef.current = null;
      socketAuthenticatedRef.current = false;
    }
    aiAudioRef.current?.pause();
    aiAudioRef.current = null;
    if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
    aiAudioUrlRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActiveStream(null);
    pendingChunksRef.current = [];
    onRecordingChange?.(false);
  }, [onRecordingChange]);

  useEffect(() => () => {
    if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
  }, []);

  useEffect(() => {
    return stopStream;
  }, [stopStream]);

  useEffect(() => {
    if (!sessionId || typeof WebSocket === "undefined") return;
    let cancelled = false;
    let socket: WebSocket | null = null;

    async function connect() {
      try {
        const tokenResponse = await fetch("/api/auth/realtime-token", { cache: "no-store", credentials: "include" });
        if (!tokenResponse.ok) throw new Error("Realtime authentication failed");
        const { token } = (await tokenResponse.json()) as { token?: string };
        if (!token || cancelled) throw new Error("Realtime authentication failed");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://grillr-acev.onrender.com";
        socket = new WebSocket(`${apiUrl.replace(/^http/, "ws")}/api/v1/ws/interviews/${sessionId}`);
        socketRef.current = socket;
        socket.addEventListener("open", () => socket?.send(JSON.stringify({ type: "auth", token })));
        socket.addEventListener("message", (event) => {
          try {
            const message = JSON.parse(event.data) as { type?: string; data?: { text?: string; state?: TurnState; message?: string; audio_base64?: string; media_type?: string; question_id?: string; question_number?: number; is_follow_up?: boolean } };
            if (message.type === "auth.ok") {
              socketAuthenticatedRef.current = true;
              setIsSocketReady(true);
              socket?.send(JSON.stringify({ type: "session.start" }));
            }
            if (message.type === "audio.ai" && message.data?.audio_base64) {
              const bytes = Uint8Array.from(atob(message.data.audio_base64), (character) => character.charCodeAt(0));
              const audioUrl = URL.createObjectURL(new Blob([bytes], { type: message.data.media_type ?? "audio/mpeg" }));
              aiAudioRef.current?.pause();
              if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
              const audio = new Audio(audioUrl);
              aiAudioRef.current = audio;
              aiAudioUrlRef.current = audioUrl;
              audio.onended = () => {
                if (aiAudioRef.current === audio) {
                  aiAudioRef.current = null;
                  URL.revokeObjectURL(audioUrl);
                  aiAudioUrlRef.current = null;
                }
              };
              void audio.play().catch(() => setSocketError("Question audio could not be played. Continue with the text prompt."));
            }
            if (message.type === "turn.state_changed" && message.data?.state) {
              setIsProcessing(message.data.state === "processing");
              onTurnStateChange?.(message.data.state);
            }
            if (message.type === "transcript.final" && message.data?.text) {
              onTranscript?.(message.data.text);
              setIsProcessing(false);
              setIsStopping(false);
              onTurnStateChange?.("listening");
              stopStream(false);
              setStatus("ready");
            }
            if (message.type === "answer.evaluated") onAnswerEvaluated?.();
            if ((message.type === "question.created" || message.type === "question.follow_up") && message.data?.question_id && message.data.text) {
              onQuestionReady?.({
                id: message.data.question_id,
                text: message.data.text,
                questionNumber: message.data.question_number ?? 0,
                isFollowUp: Boolean(message.data.is_follow_up),
              });
            }
            if (message.type === "session.completed") {
              setIsProcessing(false);
              setIsStopping(false);
              onTurnStateChange?.("completed");
              onCompleted?.();
            }
            if (message.type === "error") {
              setIsSocketReady(false);
              socketAuthenticatedRef.current = false;
              setIsProcessing(false);
              setIsStopping(false);
              onTurnStateChange?.("listening");
              setSocketError(message.data?.message ?? "The live interview connection returned an error. Please retry your voice answer.");
              stopStream();
              setStatus("ready");
            }
          } catch {
            setSocketError("Live interview returned an unreadable response.");
          }
        });
        socket.addEventListener("error", () => setSocketError("The live interview connection failed. Please retry your voice answer."), { once: true });
      } catch (error) {
        if (!cancelled) setSocketError(error instanceof Error ? error.message : "Realtime authentication failed");
      }
    }

    void connect();
    return () => {
      cancelled = true;
      setIsSocketReady(false);
      socketAuthenticatedRef.current = false;
      if (socket && socketRef.current === socket && socket.readyState !== WebSocket.CLOSED) socket.close();
      socketRef.current = null;
    };
  }, [onAnswerEvaluated, onCompleted, onQuestionReady, onTranscript, onTurnStateChange, sessionId, stopStream]);

  const recordingUrl = useMemo(() => {
    if (!recordingBlob || typeof URL.createObjectURL !== "function") return "";
    return URL.createObjectURL(recordingBlob);
  }, [recordingBlob]);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  const handleTrackEnded = useCallback(() => {
    stopStream();
    setStatus("revoked");
  }, [stopStream]);

  async function startRecording() {
    if (disabled || status === "recording") return;
    if (sessionId && (typeof WebSocket === "undefined" || !isSocketReady || socketRef.current?.readyState !== WebSocket.OPEN)) {
      setSocketError("The interview connection is still starting. Please try again in a moment.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setIsRetrying(true);
    setSocketError("");
    setIsProcessing(false);
    setIsStopping(false);
    setRecordingSeconds(0);
    try {
      const devices = navigator.mediaDevices.enumerateDevices
        ? await navigator.mediaDevices.enumerateDevices()
        : [];
      if (devices.length > 0 && !devices.some((device) => device.kind === "audioinput")) {
        setStatus("no-device");
        return;
      }
      if (!await microphoneService.requestPermission()) {
        setStatus("denied");
        return;
      }
      const stream = microphoneService.getStream();
      if (!stream) {
        setStatus("denied");
        return;
      }
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", handleTrackEnded, { once: true });
      });
      streamRef.current = stream;
      setActiveStream(stream);
      pendingChunksRef.current = [];
      setRecordingBlob(null);
      turnIdRef.current = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      socketRef.current?.send(JSON.stringify({ type: "speech.start", turn_id: turnIdRef.current }));
      const handleAudioChunk = (chunk: Blob) => {
        pendingChunksRef.current.push(chunk);
        setRecordingBlob(new Blob([...pendingChunksRef.current], { type: chunk.type || "audio/webm" }));
        if (socketAuthenticatedRef.current && typeof WebSocket !== "undefined" && socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(chunk);
      };
      if (!microphoneService.startRecording(handleAudioChunk)) {
        microphoneService.releaseMicrophone();
        streamRef.current = null;
        setStatus("denied");
        return;
      }
      setStatus("recording");
      onRecordingChange?.(true);
    } catch (error) {
      stopStream();
      streamRef.current = null;
      const errorName = getErrorName(error);
      setStatus(errorName === "NotFoundError" ? "no-device" : "denied");
    } finally {
      setIsRetrying(false);
    }
  }

  function stopRecording() {
    if (microphoneService.isRecording()) {
      setIsStopping(true);
      setIsProcessing(true);
      onTurnStateChange?.("processing");
      microphoneService.stopRecording(() => {
        if (socketAuthenticatedRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "speech.stop", turn_id: turnIdRef.current }));
        } else {
          setIsProcessing(false);
          setIsStopping(false);
          stopStream();
        }
      });
    } else {
      setIsStopping(false);
      stopStream();
    }
    if (!sessionId || !socketRef.current) setStatus("ready");
  }

  const message = statusCopy(status);
  const statusLabel = isProcessing || isStopping
    ? "Processing your answer..."
    : isActivelyRecording
      ? isSpeaking ? "Speaking detected" : "Recording · listening"
      : turnState === "asking"
        ? "Listen to the next question"
        : status === "checking"
          ? "Checking microphone"
          : "Your turn · start when ready";
  const actionLabel = isRetrying
    ? "Checking microphone..."
    : isStopping || isProcessing
      ? "Processing answer..."
      : isActivelyRecording
        ? "Stop recording"
        : message && status !== "unsupported"
          ? "Retry voice"
          : "Start answer";
  const elapsedLabel = `${String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:${String(recordingSeconds % 60).padStart(2, "0")}`;

  return (
    <section className={`${hidden ? "hidden" : ""} mx-auto mt-10 w-full max-w-3xl sm:mt-14`} aria-labelledby="voice-answer-heading">
      <h3 id="voice-answer-heading" className="sr-only">Voice answer</h3>
      <div className="flex h-24 items-center justify-center gap-1 sm:h-28" role="img" aria-label={activeStream ? "Live microphone input waveform" : "Microphone ready"}>
        {waveformPattern.map((height, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`w-1 rounded-full transition-transform duration-100 motion-reduce:transition-none ${activeStream ? "bg-[#4f8ff7]" : "bg-[#cbd3df]"}`}
            style={{
              height: `${18 + height * 44}px`,
              opacity: activeStream ? 0.45 + voiceLevel * 0.55 : 0.42,
              transform: `scaleY(${activeStream ? 0.12 + voiceLevel * height * 0.88 : 0.08})`,
            }}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-col items-center justify-between gap-5 border-t border-[#e7eaf0] pt-5 sm:flex-row">
        <div className="flex min-h-11 items-center gap-3" role="status" aria-live="polite">
          <span className={`h-2 w-2 shrink-0 rounded-full ${isProcessing || isStopping ? "animate-pulse bg-[#4f8ff7] motion-reduce:animate-none" : isActivelyRecording ? "bg-[#24a875]" : message || socketError ? "bg-[#d94b55]" : "bg-[#8993a3]"}`} />
          <span className="text-sm text-[#4c5665]">{message?.title ?? (socketError || statusLabel)}</span>
          {isActivelyRecording ? <time className="font-mono text-xs tabular-nums text-[#737b89]" dateTime={`PT${recordingSeconds}S`}>{elapsedLabel}</time> : null}
        </div>
        {status !== "unsupported" ? (
          <button
            type="button"
            onClick={isActivelyRecording ? stopRecording : () => void startRecording()}
            disabled={disabled || isRetrying || isStopping || isProcessing || status === "checking"}
            aria-label={isActivelyRecording ? "Stop recording" : message ? "Retry voice" : "Start recording"}
            aria-pressed={isActivelyRecording}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171a21] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#303744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ff7] focus-visible:ring-offset-2 active:bg-[#101217] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none sm:w-auto"
          >
            {isActivelyRecording ? <StopIcon /> : <MicrophoneIcon />}
            {actionLabel}
          </button>
        ) : null}
      </div>
      {message || socketError ? (
        <div role="alert" className="mt-4 flex flex-col gap-3 border-l-2 border-[#d94b55] pl-4 text-sm text-[#5d3337] sm:flex-row sm:items-center sm:justify-between">
          <div>
            {message ? <><strong className="block font-semibold">{message.title}</strong><span className="mt-1 block text-sm text-[#737b89]">{message.body}</span></> : null}
            {socketError ? <span className="block text-sm">{socketError}</span> : null}
          </div>
        </div>
      ) : null}
      {recordingUrl ? (
        <details className="mt-5 text-sm text-[#737b89]">
          <summary className="w-fit cursor-pointer rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ff7]">Review captured audio</summary>
          <audio className="mt-3 h-10 w-full" controls src={recordingUrl} aria-label="Recorded answer preview" />
        </details>
      ) : null}
    </section>
  );
}
