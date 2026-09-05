export type VoiceStage =
  | "idle"
  | "ai_speaking"
  | "listening"
  | "user_speaking"
  | "processing"
  | "error";

export type VoiceStateMachineEvent =
  | { type: "AI_STARTED_SPEAKING" }
  | { type: "AI_FINISHED_SPEAKING" }
  | { type: "USER_STARTED_SPEAKING" }
  | { type: "USER_STOPS_SPEAKING" }
  | { type: "USER_INTERRUPTED_AI" }
  | { type: "ANSWER_PROCESSING" }
  | { type: "NEXT_QUESTION_RECEIVED" }
  | { type: "RECONNECT" }
  | { type: "RESET" }
  | { type: "ERROR"; message?: string };

export interface VoiceState {
  stage: VoiceStage;
  lastEvent: VoiceStateMachineEvent["type"] | null;
  errorMessage?: string;
}

export const initialVoiceState: VoiceState = {
  stage: "idle",
  lastEvent: null,
};

const nextStageByEvent: Record<VoiceStage, Partial<Record<VoiceStateMachineEvent["type"], VoiceStage>>> = {
  idle: {
    AI_STARTED_SPEAKING: "ai_speaking",
    USER_STARTED_SPEAKING: "user_speaking",
    NEXT_QUESTION_RECEIVED: "listening",
  },
  ai_speaking: {
    AI_FINISHED_SPEAKING: "listening",
    USER_INTERRUPTED_AI: "listening",
    ERROR: "error",
    USER_STARTED_SPEAKING: "user_speaking",
  },
  listening: {
    AI_STARTED_SPEAKING: "ai_speaking",
    USER_STARTED_SPEAKING: "user_speaking",
    ANSWER_PROCESSING: "processing",
    ERROR: "error",
  },
  user_speaking: {
    USER_STOPS_SPEAKING: "listening",
    ANSWER_PROCESSING: "processing",
    USER_INTERRUPTED_AI: "listening",
    ERROR: "error",
  },
  processing: {
    NEXT_QUESTION_RECEIVED: "listening",
    AI_STARTED_SPEAKING: "ai_speaking",
    ERROR: "error",
    RESET: "idle",
  },
  error: {
    RECONNECT: "listening",
    RESET: "idle",
  },
};

export function applyVoiceEvent(
  state: VoiceState,
  event: VoiceStateMachineEvent,
): VoiceState {
  const targetStage = nextStageByEvent[state.stage]?.[event.type] ?? state.stage;

  return {
    stage: targetStage,
    lastEvent: event.type,
    errorMessage:
      event.type === "ERROR" && event.message ? event.message : undefined,
  };
}
