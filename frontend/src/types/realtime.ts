export type VoiceState =
  | 'idle'
  | 'ai_speaking'
  | 'listening'
  | 'user_speaking'
  | 'processing'
  | 'next_question'
  | 'error';

export interface BaseEvent {
  type: string;
}

export interface PartialTranscriptEvent extends BaseEvent {
  type: 'transcript.partial';
  data: {
    text: string;
  };
}

export interface FinalTranscriptEvent extends BaseEvent {
  type: 'transcript.final';
  data: {
    answer_id: string;
    text: string;
  };
}

export interface AIQuestionEvent extends BaseEvent {
  type: 'question.created';
  data: {
    text: string;
    audio_url?: string;
  };
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
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
  | { type: 'speech.start'; data: {} }
  | { type: 'speech.stop'; data: {} }
  | { type: 'interview.interrupt'; data: {} }
  | { type: 'audio.ai'; data: {} }
  | { type: 'answer.evaluated'; data: {} }
  | { type: 'question.follow_up'; data: {} }
  | { type: 'session.completed'; data: {} }
  | { type: 'session.ready'; data: {} };
