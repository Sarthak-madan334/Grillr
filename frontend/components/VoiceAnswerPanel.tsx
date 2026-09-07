"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceStatus = "checking" | "ready" | "recording" | "denied" | "no-device" | "unsupported" | "revoked";

type VoiceAnswerPanelProps = {
  disabled?: boolean;
  onRecordingChange?: (recording: boolean) => void;
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

export function VoiceAnswerPanel({ disabled = false, onRecordingChange }: VoiceAnswerPanelProps) {
  const [status, setStatus] = useState<VoiceStatus>(() =>
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
      ? "ready"
      : "unsupported",
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    onRecordingChange?.(false);
  }, [onRecordingChange]);

  useEffect(() => {
    return stopStream;
  }, [stopStream]);

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
    try {
      const devices = navigator.mediaDevices.enumerateDevices
        ? await navigator.mediaDevices.enumerateDevices()
        : [];
      if (devices.length > 0 && !devices.some((device) => device.kind === "audioinput")) {
        setStatus("no-device");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", handleTrackEnded, { once: true });
      });
      streamRef.current = stream;
      setStatus("recording");
      onRecordingChange?.(true);
    } catch (error) {
      const errorName = getErrorName(error);
      setStatus(errorName === "NotFoundError" ? "no-device" : "denied");
    } finally {
      setIsRetrying(false);
    }
  }

  function stopRecording() {
    stopStream();
    setStatus("ready");
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
      {message ? <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#d8b9a7] bg-[#fff7f1] p-3 text-sm text-[#713f2c] sm:flex-row sm:items-center sm:justify-between"><div><strong className="block font-semibold">{message.title}</strong><span className="mt-1 block text-xs leading-5 text-[#805542]">{message.body}</span></div>{status !== "unsupported" ? <button type="button" onClick={() => void startRecording()} disabled={isRetrying} className="shrink-0 self-start rounded-full border border-[#b8916d] px-3 py-2 text-xs font-semibold text-[#5e402e] transition hover:bg-[#f3e3d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d] focus-visible:ring-offset-2 sm:self-center">Retry voice</button> : null}</div> : null}
    </section>
  );
}