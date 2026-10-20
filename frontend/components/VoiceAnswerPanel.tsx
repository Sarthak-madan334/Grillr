"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { microphoneService } from "../lib/audio/microphone-service";
import { useVoiceActivityDetection } from "../lib/audio/use-voice-activity-detection";

type VoiceStatus = "checking" | "ready" | "recording" | "denied" | "no-device" | "unsupported" | "revoked";
type AiAudioState = "idle" | "loading" | "ready" | "playing" | "paused" | "completed" | "error";
export type TurnState = "asking" | "listening" | "processing" | "completed";

type VoiceAnswerPanelProps = {
  sessionId?: string;
  questionText?: string;
  disabled?: boolean;
  hidden?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  onTranscript?: (transcript: string) => void;
  onTurnStateChange?: (state: TurnState) => void;
  onAnswerEvaluated?: () => void;
  onQuestionReady?: (question: { id: string; text: string; questionNumber: number; questionType?: string; isFollowUp: boolean }) => void;
  onCompleted?: () => void;
};

function MicrophoneIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>;
}

function StopIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1.5" /></svg>;
}

function SpeakerIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>;
}

function audioStatusCopy(state: AiAudioState) {
  switch (state) {
    case "loading": return "Preparing the question";
    case "ready": return "Question ready";
    case "playing": return "AI interviewer is speaking";
    case "paused": return "Question paused";
    case "completed": return "Question finished";
    case "error": return "Couldn\'t play the question";
    default: return "Question audio ready when available";
  }
}

function getErrorName(error: unknown) {
  return error instanceof DOMException ? error.name : error instanceof Error ? error.name : "";
}

function statusCopy(status: VoiceStatus) {
  switch (status) {
    case "denied":
      return { title: "Microphone access denied", body: "Voice is required for this interview. Please allow microphone access and retry." };
    case "no-device":
      return { title: "No microphone detected", body: "Connect a microphone and retry. Voice responses are required for this interview." };
    case "unsupported":
      return { title: "Voice is unavailable here", body: "This browser does not support microphone input. Please switch to a browser with microphone access to continue." };
    case "revoked":
      return { title: "Microphone access ended", body: "Your microphone became unavailable during recording. Please retry voice recording to continue." };
    default:
      return null;
  }
}

export function VoiceAnswerPanel({ sessionId, questionText = "", disabled = false, hidden = false, onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted }: VoiceAnswerPanelProps) {
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
  const [isStopping, setIsStopping] = useState(false);
  const [aiAudioState, setAiAudioState] = useState<AiAudioState>("idle");
  const [aiAudioError, setAiAudioError] = useState("");
  const [aiAudioTime, setAiAudioTime] = useState(0);
  const [aiAudioDuration, setAiAudioDuration] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const socketAuthenticatedRef = useRef(false);
  const turnIdRef = useRef<string | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const aiAudioUrlRef = useRef<string | null>(null);
  const pendingChunksRef = useRef<Blob[]>([]);
  const callbacks = useRef({ onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted });
  const questionTextRef = useRef(questionText);
  const browserVoiceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const connectRef = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    callbacks.current = { onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted };
    questionTextRef.current = questionText;
  }, [onRecordingChange, onTranscript, onTurnStateChange, onAnswerEvaluated, onQuestionReady, onCompleted, questionText]);
  const { isSpeaking, level } = useVoiceActivityDetection(activeStream);

  const stopStream = useCallback(() => {
    microphoneService.releaseMicrophone();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActiveStream(null);
    pendingChunksRef.current = [];
    callbacks.current.onRecordingChange?.(false);
  }, []);

  useEffect(() => () => {
    aiAudioRef.current?.pause();
    if (browserVoiceRef.current) window.speechSynthesis?.cancel();
    if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
  }, []);

  useEffect(() => {
    return stopStream;
  }, [stopStream]);

  const prepareBrowserVoice = useCallback((text: string) => {
    if (!text || typeof window.speechSynthesis === "undefined" || typeof SpeechSynthesisUtterance === "undefined") {
      setAiAudioState("error");
      setAiAudioError("Question audio is unavailable. You can still answer the question shown below.");
      return;
    }
    aiAudioRef.current?.pause();
    aiAudioRef.current = null;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    browserVoiceRef.current = utterance;
    utterance.onstart = () => {
      if (browserVoiceRef.current === utterance) setAiAudioState("playing");
    };
    utterance.onend = () => {
      if (browserVoiceRef.current === utterance) setAiAudioState("completed");
    };
    utterance.onerror = () => {
      if (browserVoiceRef.current !== utterance) return;
      setAiAudioState("ready");
      setAiAudioError("Select Play to hear the question using your device voice.");
    };
    setAiAudioDuration(0);
    setAiAudioTime(0);
    setAiAudioState("ready");
    setAiAudioError("Using your device voice. Select Play to hear the question.");
  }, []);

  useEffect(() => {
    if (!sessionId || typeof WebSocket === "undefined") return;
    let cancelled = false;
    let socket: WebSocket | null = null;

    let connecting: Promise<void> | null = null;
    let rejectConnection: ((error: Error) => void) | undefined;
    let attempt = 0;
    let connectionTimer: ReturnType<typeof setTimeout> | undefined;
    const connect = (): Promise<void> => {
      if (socketAuthenticatedRef.current && socket?.readyState === WebSocket.OPEN) return Promise.resolve();
      if (connecting) return connecting;
      const connectionAttempt = ++attempt;
      connecting = new Promise<void>((resolve, reject) => {
        rejectConnection = reject;
        connectionTimer = setTimeout(() => {
          attempt++;
          setSocketError("Connecting took too long. Please retry recording.");
          reject(new Error("Connecting took too long. Please retry recording."));
          socket?.close();
        }, 15000);
        void openConnection(resolve, reject, connectionAttempt);
      }).finally(() => {
        clearTimeout(connectionTimer);
        connecting = null;
      });
      return connecting;
    };
    async function openConnection(resolve: () => void, reject: (error: Error) => void, connectionAttempt: number) {
      try {
        const tokenResponse = await fetch("/api/auth/realtime-token", { cache: "no-store", credentials: "include" });
        if (!tokenResponse.ok) throw new Error("Realtime authentication failed");
        const { token } = (await tokenResponse.json()) as { token?: string };
        if (!token || cancelled) throw new Error("Realtime authentication failed");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://grillr-acev.onrender.com";
        if (cancelled || connectionAttempt !== attempt) return;
        socketAuthenticatedRef.current = false;
        socket?.close();
        socket = new WebSocket(`${apiUrl.replace(/^http/, "ws")}/api/v1/ws/interviews/${sessionId}`);
        socketRef.current = socket;
        const activeSocket = socket;
        socket.addEventListener("open", () => activeSocket.send(JSON.stringify({ type: "auth", token })));
        socket.addEventListener("message", (event) => {
          if (cancelled || socketRef.current !== activeSocket || connectionAttempt !== attempt) return;
          try {
            const message = JSON.parse(event.data) as { type?: string; data?: { text?: string; code?: string; question_text?: string; state?: TurnState; message?: string; audio_base64?: string; media_type?: string; question_id?: string; question_number?: number; question_type?: string; is_follow_up?: boolean } };
            if (message.type === "auth.ok") {
              socketAuthenticatedRef.current = true;
              setSocketError("");
              resolve();
              socket?.send(JSON.stringify({ type: "session.start" }));
            }
            if (message.type === "audio.unavailable") {
              prepareBrowserVoice(message.data?.text ?? questionTextRef.current);
            }
            if (message.type === "audio.ai" && message.data?.audio_base64) {
              const bytes = Uint8Array.from(atob(message.data.audio_base64), (character) => character.charCodeAt(0));
              const audioUrl = URL.createObjectURL(new Blob([bytes], { type: message.data.media_type ?? "audio/mpeg" }));
              if (browserVoiceRef.current) window.speechSynthesis?.cancel();
              browserVoiceRef.current = null;
              aiAudioRef.current?.pause();
              if (aiAudioUrlRef.current) URL.revokeObjectURL(aiAudioUrlRef.current);
              const audio = new Audio(audioUrl);
              aiAudioRef.current = audio;
              aiAudioUrlRef.current = audioUrl;
              setAiAudioState("loading");
              setAiAudioError("");
              setAiAudioTime(0);
              setAiAudioDuration(0);
              audio.onloadedmetadata = () => {
                if (aiAudioRef.current !== audio) return;
                setAiAudioDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
                setAiAudioState((current) => current === "playing" ? current : "ready");
              };
              audio.ontimeupdate = () => {
                if (aiAudioRef.current === audio) setAiAudioTime(audio.currentTime);
              };
              audio.onplay = () => setAiAudioState("playing");
              audio.onpause = () => {
                if (aiAudioRef.current === audio && !audio.ended) setAiAudioState("paused");
              };
              audio.onended = () => {
                if (aiAudioRef.current === audio) {
                  setAiAudioState("completed");
                }
              };
              audio.onerror = () => {
                if (aiAudioRef.current !== audio) return;
                prepareBrowserVoice(questionTextRef.current);
              };
              if (microphoneService.isRecording()) { setAiAudioState("ready"); return; }
              void audio.play().catch(() => {
                if (aiAudioRef.current !== audio) return;
                setAiAudioState("ready");
                setAiAudioError("Select Play to hear the question.");
              });
            }
            if (message.type === "turn.state_changed" && message.data?.state) {
              setIsProcessing(message.data.state === "processing");
              if (message.data.state !== "processing") setIsStopping(false);
              callbacks.current.onTurnStateChange?.(message.data.state);
            }
            if (message.type === "transcript.final" && message.data?.text) {
              callbacks.current.onTranscript?.(message.data.text);
              setIsStopping(false);
              stopStream();
              setStatus("ready");
            }
            if (message.type === "answer.evaluated") callbacks.current.onAnswerEvaluated?.();
            if ((message.type === "question.created" || message.type === "question.follow_up") && message.data?.question_id && message.data.text) {
              questionTextRef.current = message.data.text;
              callbacks.current.onQuestionReady?.({
                id: message.data.question_id,
                text: message.data.text,
                questionNumber: message.data.question_number ?? 0,
                ...(message.data.question_type ? { questionType: message.data.question_type } : {}),
                isFollowUp: Boolean(message.data.is_follow_up),
              });
            }
            if (message.type === "session.completed") {
              setIsProcessing(false);
              setIsStopping(false);
              callbacks.current.onTurnStateChange?.("completed");
              callbacks.current.onCompleted?.();
            }
            if (message.type === "error") {
              if (message.data?.code === "tts_unavailable") {
                prepareBrowserVoice(message.data?.question_text ?? questionTextRef.current);
                return;
              }
              // Turn errors do not revoke authentication on an otherwise healthy socket.
              setIsProcessing(false);
              setIsStopping(false);
              callbacks.current.onTurnStateChange?.("listening");
              setSocketError(message.data?.message ?? "The live interview connection returned an error. Please retry your voice answer.");
              stopStream();
              setStatus("ready");
            }
          } catch {
            setSocketError("Live interview returned an unreadable response.");
          }
        });
        socket.addEventListener("close", () => {
          if (cancelled || socketRef.current !== activeSocket || connectionAttempt !== attempt) return;
          socketAuthenticatedRef.current = false;
          setIsProcessing(false);
          setIsStopping(false);
          stopStream();
          setStatus("ready");
          callbacks.current.onTurnStateChange?.("listening");
          setSocketError("The interview connection closed. Start recording to reconnect.");
          reject(new Error("The interview connection closed. Please retry recording."));
        });
        socket.addEventListener("error", () => {
          if (cancelled || socketRef.current !== activeSocket || connectionAttempt !== attempt) return;
          setSocketError("The live interview connection failed. Please retry your voice answer.");
          reject(new Error("The live interview connection failed. Please retry your voice answer."));
        }, { once: true });
      } catch (error) {
        const failure = error instanceof Error ? error : new Error("Realtime authentication failed");
        if (!cancelled) setSocketError(failure.message);
        reject(failure);
      }
    }

    connectRef.current = connect;
    void connect().catch(() => undefined);
    return () => {
      cancelled = true;
      clearTimeout(connectionTimer);
      rejectConnection?.(new Error("Interview connection ended"));
      connectRef.current = null;
      socketAuthenticatedRef.current = false;
      socket?.close();
      socketRef.current = null;
    };
  }, [sessionId, stopStream, prepareBrowserVoice]);

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
    if (disabled || isRetrying || isStopping || isProcessing || status === "recording") return;
    if (sessionId && (typeof WebSocket === "undefined" || !socketAuthenticatedRef.current || socketRef.current?.readyState !== WebSocket.OPEN)) {
      setIsRetrying(true);
      try {
        if (!connectRef.current) throw new Error("Live recording is unavailable in this browser.");
        await connectRef.current();
      } catch (error) {
        setSocketError(error instanceof Error ? error.message : "Could not reconnect. Please retry recording.");
        setIsRetrying(false);
        return;
      }
      setIsRetrying(false);
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setIsRetrying(true);
    setSocketError("");
    setIsProcessing(false);
    setIsStopping(false);
    try {
      aiAudioRef.current?.pause();
      if (browserVoiceRef.current) {
        window.speechSynthesis.cancel();
        setAiAudioState("ready");
      }
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
      if (aiAudioRef.current) aiAudioRef.current.pause();
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
      callbacks.current.onTurnStateChange?.("processing");
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

  function toggleAiAudio() {
    if (microphoneService.isRecording()) return;
    const utterance = browserVoiceRef.current;
    if (utterance) {
      if (aiAudioState === "playing") {
        window.speechSynthesis.pause();
        setAiAudioState("paused");
      } else if (aiAudioState === "paused") {
        window.speechSynthesis.resume();
        setAiAudioState("playing");
      } else {
        window.speechSynthesis.cancel();
        setAiAudioError("");
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    const audio = aiAudioRef.current;
    if (!audio) {
      prepareBrowserVoice(questionTextRef.current);
      return;
    }
    if (aiAudioState === "completed") {
      audio.currentTime = 0;
      setAiAudioTime(0);
    }
    if (aiAudioState === "playing") {
      audio.pause();
      return;
    }
    void audio.play().catch(() => {
      setAiAudioState("ready");
      setAiAudioError("Playback was blocked. Select Play to try again.");
    });
  }

  function seekAiAudio(value: string) {
    const audio = aiAudioRef.current;
    const nextTime = Number(value);
    if (!audio || !Number.isFinite(nextTime)) return;
    audio.currentTime = nextTime;
    setAiAudioTime(nextTime);
  }

  function formatAudioTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  }

  const message = statusCopy(status);

  return (
    <section className={`${hidden ? "hidden" : ""} mb-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4`} aria-labelledby="voice-answer-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--muted)]"><MicrophoneIcon /></span>
            <h3 id="voice-answer-heading" className="text-sm font-semibold text-[var(--foreground)]">Answer by voice <span className="ml-1 text-xs font-normal text-[var(--muted)]">Required</span></h3>
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Speak naturally and answer out loud. This interview is designed for voice responses only.</p>
        </div>
        {status !== "unsupported" ? <button type="button" onClick={status === "recording" ? stopRecording : () => void startRecording()} disabled={disabled || isRetrying || isStopping || isProcessing || status === "checking"} aria-label={status === "recording" ? "Stop recording" : "Start recording"} aria-pressed={status === "recording"} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none">{status === "recording" ? <StopIcon /> : <MicrophoneIcon />}{isRetrying ? "Checking microphone..." : isStopping || isProcessing ? "Finishing answer..." : status === "recording" ? "Stop recording" : "Start recording"}</button> : null}
      </div>
      {status === "checking" ? <p className="mt-4 animate-pulse text-xs text-[var(--muted)] motion-reduce:animate-none" aria-live="polite">Checking microphone support...</p> : null}
      <div className={`live-waveform ${activeStream && isSpeaking ? "is-active" : ""}`} aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <span key={index} style={{ "--bar-height": `${10 + ((index * 17) % 35) * Math.max(.3, level)}px`, "--bar-delay": `${index * -75}ms` } as CSSProperties} />)}</div>
      {status === "recording" ? <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--success)]" aria-live="polite"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success-surface)] motion-reduce:animate-none" /> Recording in progress. Stop when you finish.</p> : null}
      {isProcessing ? <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--muted)]" aria-live="polite"><span className="h-3 w-3 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" /> Processing your answer...</p> : null}
      {aiAudioState !== "idle" ? <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5" aria-live="polite"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${aiAudioState === "playing" ? "bg-[var(--success-surface)] text-[var(--success)]" : "bg-[var(--surface)] text-[var(--muted)]"}`}><SpeakerIcon /></span><span className="min-w-0 flex-1 text-xs font-medium text-[var(--muted)]">{audioStatusCopy(aiAudioState)}{aiAudioError ? <span className="mt-0.5 block text-[11px] font-normal text-[var(--error)]">{aiAudioError}</span> : null}</span>{aiAudioState === "loading" ? <span className="flex gap-1" aria-label="Loading question audio"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--surface)] [animation-delay:150ms] motion-reduce:animate-none" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--surface)] [animation-delay:300ms] motion-reduce:animate-none" /></span> : null}{aiAudioState !== "loading" ? <button disabled={status === "recording"} type="button" onClick={toggleAiAudio} aria-label={aiAudioState === "playing" ? "Pause question audio" : aiAudioState === "completed" ? "Replay question audio" : aiAudioState === "paused" ? "Resume question audio" : "Play question audio"} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none">{aiAudioState === "playing" ? "Pause" : aiAudioState === "completed" ? "Replay" : aiAudioState === "paused" ? "Resume" : "Play"}</button> : null}</div>{aiAudioState !== "loading" && aiAudioState !== "error" && aiAudioDuration > 0 ? <div className="mt-2 flex items-center gap-2"><input type="range" min="0" max={aiAudioDuration} step="0.1" value={Math.min(aiAudioTime, aiAudioDuration)} onChange={(event) => seekAiAudio(event.target.value)} aria-label="Question audio progress" className="h-1.5 min-w-0 flex-1 accent-[var(--foreground)]" /><span className="w-16 text-right text-[10px] tabular-nums text-[var(--muted)]">{formatAudioTime(aiAudioTime)} / {formatAudioTime(aiAudioDuration)}</span></div> : null}</div> : null}
      {activeStream ? <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2" aria-live="polite"><span className={`h-2.5 w-2.5 rounded-full transition-colors motion-reduce:transition-none ${isSpeaking ? "bg-[var(--success-surface)] shadow-[var(--shadow-soft)]" : "bg-[var(--surface)]"}`} /><span className="text-xs font-medium text-[var(--muted)]">{isSpeaking ? "Your microphone is picking up your voice" : "Listening for your voice"}</span><span className="ml-auto text-[10px] tabular-nums text-[var(--muted)]">{Math.round(level * 100)}%</span></div> : null}
      {recordingUrl ? <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Captured locally</p><audio className="mt-2 h-9 w-full" controls src={recordingUrl} aria-label="Recorded answer preview" /></div> : null}
      {socketError ? <div role="alert" className="mt-3 rounded-xl border border-[var(--error)] bg-[var(--error-surface)] px-3 py-2 text-xs leading-5 text-[var(--error)]">{socketError}</div> : null}
      {message ? <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--error)] bg-[var(--error-surface)] p-3 text-sm text-[var(--error)] sm:flex-row sm:items-center sm:justify-between"><div><strong className="block font-semibold">{message.title}</strong><span className="mt-1 block text-xs leading-5 text-[var(--error)]">{message.body}</span></div>{status !== "unsupported" ? <button type="button" onClick={() => void startRecording()} disabled={isRetrying} className="shrink-0 self-start rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 sm:self-center">Retry voice</button> : null}</div> : null}
    </section>
  );
}
