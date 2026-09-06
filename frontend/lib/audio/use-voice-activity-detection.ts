"use client";

import { useEffect, useState } from "react";

export const DEFAULT_VAD_THRESHOLD = 0.08;
export const DEFAULT_VAD_HOLD_MS = 300;

export function calculateAudioLevel(samples: Uint8Array) {
  if (!samples.length) return 0;
  let squaredTotal = 0;
  for (const sample of samples) {
    const centered = (sample - 128) / 128;
    squaredTotal += centered * centered;
  }
  return Math.sqrt(squaredTotal / samples.length);
}

type VoiceActivityOptions = {
  threshold?: number;
  holdMs?: number;
};

type VoiceActivityState = {
  isSpeaking: boolean;
  level: number;
};

type AudioContextConstructor = new () => AudioContext;

function getAudioContextConstructor() {
  if (typeof window === "undefined") return null;
  return (window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext) as AudioContextConstructor | null;
}

export function useVoiceActivityDetection(
  stream: MediaStream | null,
  { threshold = DEFAULT_VAD_THRESHOLD, holdMs = DEFAULT_VAD_HOLD_MS }: VoiceActivityOptions = {},
): VoiceActivityState {
  const [state, setState] = useState<VoiceActivityState>({ isSpeaking: false, level: 0 });

  useEffect(() => {
    const AudioContextClass = getAudioContextConstructor();
    if (!stream || !AudioContextClass) return;

    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);
    const samples = new Uint8Array(analyser.fftSize);
    let animationFrame = 0;
    let belowThresholdSince: number | null = null;
  let speaking = false;

    analyser.fftSize = 512;
    source.connect(analyser);
    void context.resume().catch(() => undefined);

    const inspect = (timestamp: number) => {
      analyser.getByteTimeDomainData(samples);
      const level = calculateAudioLevel(samples);
      if (level >= threshold) {
        belowThresholdSince = null;
        if (!speaking) speaking = true;
      } else if (speaking) {
        belowThresholdSince ??= timestamp;
        if (timestamp - belowThresholdSince >= holdMs) speaking = false;
      }
      setState({ isSpeaking: speaking, level });
      animationFrame = window.requestAnimationFrame(inspect);
    };

    animationFrame = window.requestAnimationFrame(inspect);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      source.disconnect();
      analyser.disconnect();
      void context.close().catch(() => undefined);
    };
  }, [holdMs, stream, threshold]);

  return stream && getAudioContextConstructor() ? state : { isSpeaking: false, level: 0 };
}
