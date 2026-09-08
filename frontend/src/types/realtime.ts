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
    question_id: string;
    text: string;
    turn_id?: string | null;
  };
}

export interface AnswerEvaluatedEvent extends BaseEvent {
  type: "answer.evaluated";
  data: {
    answer_id: string;
    question_id: string;
    overall_score: number;
    turn_id?: string | null;
  };
}

export interface AIQuestionEvent extends BaseEvent {
  type: "question.created" | "question.follow_up";
  data: {
    session_id?: string;
    question_id?: string;
    text: string;
    question_text?: string;
    question_number?: number;
    is_follow_up?: boolean;
    audio_url?: string;
  };
}

export interface SessionCompletedEvent extends BaseEvent {
  type: "session.completed";
  data: {
    session_id: string;
    answer_id: string;
    overall_score: number;
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
  | AnswerEvaluatedEvent
  | SessionCompletedEvent
  | { type: "session.ready"; data: EmptyEventData };
