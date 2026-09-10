import { describe, expect, it } from "vitest";
import {
  DEFAULT_VAD_HOLD_MS,
  DEFAULT_VAD_THRESHOLD,
  calculateAudioLevel,
} from "../../lib/audio/use-voice-activity-detection";

describe("voice activity detection", () => {
  it("calculates silence and signal levels from time-domain samples", () => {
    expect(calculateAudioLevel(new Uint8Array([128, 128, 128]))).toBe(0);
    expect(calculateAudioLevel(new Uint8Array([0, 255]))).toBeGreaterThan(0.9);
  });

  it("exposes tunable defaults for threshold and debounce", () => {
    expect(DEFAULT_VAD_THRESHOLD).toBeGreaterThan(0);
    expect(DEFAULT_VAD_HOLD_MS).toBe(300);
  });
});
