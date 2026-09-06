import { describe, expect, it } from "vitest";

import {
  applyVoiceEvent,
  initialVoiceState,
  type VoiceStateMachineEvent,
} from "@/lib/voice-state";

describe("voice state machine", () => {
  it("moves from idle to ai speaking and back to listening", () => {
    const aiStarted: VoiceStateMachineEvent = { type: "AI_STARTED_SPEAKING" };
    const aiFinished: VoiceStateMachineEvent = { type: "AI_FINISHED_SPEAKING" };

    const started = applyVoiceEvent(initialVoiceState, aiStarted);
    expect(started.stage).toBe("ai_speaking");

    const listening = applyVoiceEvent(started, aiFinished);
    expect(listening.stage).toBe("listening");
  });

  it("handles interruption and answer processing", () => {
    const listening = applyVoiceEvent(initialVoiceState, {
      type: "USER_STARTED_SPEAKING",
    });
    expect(listening.stage).toBe("user_speaking");

    const interrupted = applyVoiceEvent(listening, {
      type: "USER_INTERRUPTED_AI",
    });
    expect(interrupted.stage).toBe("listening");

    const processing = applyVoiceEvent(interrupted, {
      type: "ANSWER_PROCESSING",
    });
    expect(processing.stage).toBe("processing");
  });
});
