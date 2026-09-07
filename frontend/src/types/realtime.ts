export type VoiceState =
  | "idle"
  | "ai_speaking"
  | "listening"
  | "user_speaking"
  | "processing"
  | "next_question"
  | "error";

type EmptyEventData = Record<string, never>;

export interface BaseEvent {
  type: string;
}

export interface PartialTranscriptEvent extends BaseEvent {
  type: "transcript.partial";
  data: {
    text: string;
  };
}

export interface FinalTranscriptEvent extends BaseEvent {
  type: "transcript.final";
  data: {
    answer_id: string;
    text: string;
  };
}

export interface AIQuestionEvent extends BaseEvent {
  type: "question.created";
  data: {
    text: string;
    audio_url?: string;
  };
}

export interface ErrorEvent extends BaseEvent {
  type: "error";
  data: {
    code: string;
    message: string;
  };
}

export type RealtimeEvent =
  | PartialTranscriptEvent
  | FinalTranscriptEvent
  | AIQuestionEvent
  | ErrorEvent
  | { type: "speech.start"; data: EmptyEventData }
  | { type: "speech.stop"; data: EmptyEventData }
  | { type: "interview.interrupt"; data: EmptyEventData }
  | { type: "audio.ai"; data: EmptyEventData }
  | { type: "answer.evaluated"; data: EmptyEventData }
  | { type: "question.follow_up"; data: EmptyEventData }
  | { type: "session.completed"; data: EmptyEventData }
  | { type: "session.ready"; data: EmptyEventData };
