"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { microphoneService } from "../lib/audio/microphone-service";

type VoiceStatus = "checking" | "ready" | "recording" | "denied" | "no-device" | "unsupported" | "revoked";
type TranscriptionState = "idle" | "processing" | "error";

type VoiceAnswerPanelProps = {
  sessionId?: string;
  disabled?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  onTranscript?: (transcript: string) => void;
};

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
      return { title: "Microphone access denied", body: "You can still answer by typing below. To use voice, allow microphone access in your browser settings and retry." };
    case "no-device":
      return { title: "No microphone detected", body: "Connect a microphone or continue with a typed answer. Your typed response is ready whenever you are." };
    case "unsupported":
      return { title: "Voice is unavailable here", body: "This browser does not support microphone input. Continue with a typed answer instead." };
    case "revoked":
      return { title: "Microphone access ended", body: "Your microphone became unavailable during recording. Nothing was lost; continue by typing your answer or retry voice." };
    default:
      return null;
  }
}

export function VoiceAnswerPanel({ sessionId, disabled = false, onRecordingChange, onTranscript }: VoiceAnswerPanelProps) {
  const [status, setStatus] = useState<VoiceStatus>(() =>
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
      ? "ready"
      : "unsupported",
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [socketError, setSocketError] = useState("");
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>("idle");
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pendingChunksRef = useRef<Blob[]>([]);

  function getSocketUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? window.location.origin;
    const socketUrl = apiUrl.replace(/^http/, "ws");
    return `${socketUrl}/api/v1/ws/interviews/${sessionId}`;
  }

  const stopStream = useCallback(() => {
    microphoneService.releaseMicrophone();
    socketRef.current?.close();
    socketRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pendingChunksRef.current = [];
    onRecordingChange?.(false);
  }, [onRecordingChange]);

  useEffect(() => {
    return stopStream;
  }, [stopStream]);

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
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setIsRetrying(true);
    setSocketError("");
    setLiveTranscript("");
    setTranscriptionState("idle");
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
      pendingChunksRef.current = [];
      setRecordingBlob(null);
      const handleAudioChunk = (chunk: Blob) => {
        pendingChunksRef.current.push(chunk);
        setRecordingBlob(new Blob([...pendingChunksRef.current], { type: chunk.type || "audio/webm" }));
        if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(chunk);
      };
      if (sessionId && typeof WebSocket !== "undefined" && typeof MediaRecorder !== "undefined") {
        const socket = new WebSocket(getSocketUrl());
        socketRef.current = socket;
        socket.addEventListener("open", () => {
          socket.send(JSON.stringify({ type: "speech.start" }));
          pendingChunksRef.current.forEach((chunk) => socket.send(chunk));
        }, { once: true });
        socket.addEventListener("message", (event) => {
          try {
            const message = JSON.parse(event.data) as { type?: string; data?: { text?: string; message?: string; code?: string } };
            if ((message.type === "transcript.partial" || message.type === "transcript.final") && message.data?.text) {
              setLiveTranscript(message.data.text);
              if (message.type === "transcript.final") {
                onTranscript?.(message.data.text);
                stopStream();
                setStatus("ready");
              }
            }
            if (message.type === "error") {
              const code = message.data?.code;
              const errorMessage = code === "no_speech_detected"
                ? "We did not catch any speech. Try recording again or type your answer below."
                : code === "transcription_timeout"
                  ? "Transcription took too long. Try again or continue with a typed answer."
                  : message.data?.message ?? "Transcription is unavailable. You can continue by typing.";
              setTranscriptionState("error");
              stopStream();
              setStatus("ready");
              setSocketError(errorMessage);
            }
          } catch {
            setSocketError("Live transcription returned an unreadable response. You can continue by typing.");
          }
        });
        socket.addEventListener("error", () => {
          setTranscriptionState("error");
          stopStream();
          setStatus("ready");
          setSocketError("Transcription is unavailable. Try again or continue with a typed answer.");
        }, { once: true });
      }
      if (!microphoneService.startRecording(handleAudioChunk)) {
        microphoneService.releaseMicrophone();
        streamRef.current = null;
        setStatus("denied");
        return;
      }
      setStatus("recording");
      onRecordingChange?.(true);
    } catch (error) {
      microphoneService.releaseMicrophone();
      streamRef.current = null;
      const errorName = getErrorName(error);
      setStatus(errorName === "NotFoundError" ? "no-device" : "denied");
    } finally {
      setIsRetrying(false);
    }
  }

  function stopRecording() {
    if (microphoneService.isRecording()) {
      microphoneService.stopRecording();
      if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify({ type: "speech.stop" }));
      if (sessionId) setTranscriptionState("processing");
    } else {
      stopStream();
    }
                setStatus("ready");
                setTranscriptionState("idle");
  }

  const message = statusCopy(status);

  return (
    <section className="mb-5 rounded-[22px] border border-[#e7d8c5] bg-[rgba(255,255,255,0.5)] p-4" aria-labelledby="voice-answer-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f1e6da] text-[#6b503d]"><MicrophoneIcon /></span>
            <h3 id="voice-answer-heading" className="text-sm font-semibold text-[#201a17]">Answer by voice <span className="ml-1 text-xs font-normal text-[#7a5f48]">Optional</span></h3>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#6e5a49]">Speak naturally, or use the typed answer below whenever voice is unavailable.</p>
        </div>
        {status !== "unsupported" ? <button type="button" onClick={status === "recording" ? stopRecording : () => void startRecording()} disabled={disabled || isRetrying || status === "checking"} aria-label={status === "recording" ? "Stop recording" : "Start recording"} aria-pressed={status === "recording"} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#2d241d] bg-[#2d241d] px-5 text-sm font-medium text-white shadow-[0_8px_18px_rgba(45,36,29,0.16)] transition hover:bg-[#1f1915] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none">{status === "recording" ? <StopIcon /> : <MicrophoneIcon />}{isRetrying ? "Checking microphone..." : status === "recording" ? "Stop recording" : "Start recording"}</button> : null}
      </div>
      {status === "checking" ? <p className="mt-4 animate-pulse text-xs text-[#7a5f48] motion-reduce:animate-none" aria-live="polite">Checking microphone support...</p> : null}
      {status === "recording" ? <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#26724d]" aria-live="polite"><span className="h-2 w-2 animate-pulse rounded-full bg-[#26724d] motion-reduce:animate-none" /> Recording in progress. Stop when you finish.</p> : null}
      {transcriptionState === "processing" ? <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#7a5f48]" aria-live="polite"><span className="h-3 w-3 animate-pulse rounded-full bg-[#b8916d] motion-reduce:animate-none" /> Processing your recording...</p> : null}
      {liveTranscript ? <div className="mt-4 rounded-xl border border-[#d4eadb] bg-[#f2fbf5] p-3" aria-live="polite"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#26724d]">Live transcript</p><p className="mt-1 text-sm leading-6 text-[#315743]">{liveTranscript}</p></div> : null}
      {recordingUrl ? <div className="mt-4 rounded-xl border border-[#e7d8c5] bg-white/60 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a5f48]">Captured locally</p><audio className="mt-2 h-9 w-full" controls src={recordingUrl} aria-label="Recorded answer preview" /></div> : null}
      {socketError ? <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#d8b9a7] bg-[#fff7f1] px-3 py-2 text-xs leading-5 text-[#805542]"><span>{socketError}</span><button type="button" onClick={() => void startRecording()} className="shrink-0 font-semibold text-[#5e402e] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d]">Retry</button></div> : null}
      {message ? <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#d8b9a7] bg-[#fff7f1] p-3 text-sm text-[#713f2c] sm:flex-row sm:items-center sm:justify-between"><div><strong className="block font-semibold">{message.title}</strong><span className="mt-1 block text-xs leading-5 text-[#805542]">{message.body}</span></div>{status !== "unsupported" ? <button type="button" onClick={() => void startRecording()} disabled={isRetrying} className="shrink-0 self-start rounded-full border border-[#b8916d] px-3 py-2 text-xs font-semibold text-[#5e402e] transition hover:bg-[#f3e3d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d] focus-visible:ring-offset-2 sm:self-center">Retry voice</button> : null}</div> : null}
    </section>
  );
}