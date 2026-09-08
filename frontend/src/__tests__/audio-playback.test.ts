import { describe, expect, it, vi } from "vitest";

import { AudioPlaybackController } from "@/lib/audio-playback";

function fakeAudio() {
  const audio = new EventTarget() as EventTarget & Record<string, unknown>;
  audio.paused = true;
  audio.currentTime = 0;
  audio.duration = 10;
  audio.play = vi.fn(async () => { audio.paused = false; });
  audio.pause = vi.fn(() => { audio.paused = true; });
  audio.load = vi.fn();
  audio.removeAttribute = vi.fn();
  return audio as unknown as HTMLAudioElement;
}

describe("audio playback controller", () => {
  it("resets playback immediately and rejects stale stop requests", async () => {
    const audio = fakeAudio();
    const controller = new AudioPlaybackController(() => audio);

    await controller.play("question-a.mp3", "generation-a");
    controller.stop("generation-old");
    expect(controller.snapshot().generationId).toBe("generation-a");

    controller.stop("generation-a");
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(controller.snapshot().state).toBe("idle");
    expect(controller.snapshot().generationId).toBeNull();
  });
});