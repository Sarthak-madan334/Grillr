import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_VAD_HOLD_MS,
  DEFAULT_VAD_THRESHOLD,
  calculateAudioLevel,
  useVoiceActivityDetection,
} from "../../lib/audio/use-voice-activity-detection";

describe("voice activity detection", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("samples exactly the configured buffer and distinguishes silence from speech", () => {
    let frame: FrameRequestCallback = () => undefined;
    let sample = 128;
    const disconnect = vi.fn();
    const analyser = {
      fftSize: 2048,
      disconnect,
      getByteTimeDomainData: vi.fn((buffer: Uint8Array) => {
        expect(buffer.length).toBe(analyser.fftSize);
        buffer.fill(sample, 0, analyser.fftSize);
      }),
    };
    const close = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("AudioContext", class {
      createAnalyser() { return analyser; }
      createMediaStreamSource() { return { connect: vi.fn(), disconnect }; }
      resume() { return Promise.resolve(); }
      close = close;
    });
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frame = callback; return 1; }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const stream = {} as MediaStream;
    const { result, unmount } = renderHook(() => useVoiceActivityDetection(stream));
    act(() => frame(0));
    expect(result.current).toEqual({ isSpeaking: false, level: 0 });
    sample = 160;
    act(() => frame(100));
    expect(result.current.isSpeaking).toBe(true);
    sample = 128;
    act(() => frame(200));
    expect(result.current.isSpeaking).toBe(true);
    act(() => frame(600));
    expect(result.current).toEqual({ isSpeaking: false, level: 0 });
    unmount();
    expect(close).toHaveBeenCalled();
  });
  it("calculates silence and signal levels from time-domain samples", () => {
    expect(calculateAudioLevel(new Uint8Array([128, 128, 128]))).toBe(0);
    expect(calculateAudioLevel(new Uint8Array([0, 255]))).toBeGreaterThan(0.9);
  });

  it("exposes tunable defaults for threshold and debounce", () => {
    expect(DEFAULT_VAD_THRESHOLD).toBeGreaterThan(0);
    expect(DEFAULT_VAD_HOLD_MS).toBe(300);
  });
});
