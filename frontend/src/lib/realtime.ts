export type Speaker = "ai" | "user";

export type RealtimeEventType =
  | "ai.question"
  | "ai.speech.start"
  | "ai.speech.end"
  | "user.speech.start"
  | "user.partial_transcript"
  | "user.final_transcript"
  | "answer.processing"
  | "next.question"
  | "interview.complete"
  | "connection.error"
  | "connection.reconnect";

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType;
  data: T;
  timestamp: number;
}

export interface TranscriptEntry {
  speaker: Speaker;
  text: string;
  isPartial?: boolean;
}

export interface InterviewQuestion {
  id: string;
  text: string;
}

export class MockRealtimeClient {
  private listeners = new Set<(event: RealtimeEvent) => void>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  subscribe(listener: (event: RealtimeEvent) => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  startMockInterview() {
    this.clearTimers();

    const queue = [
      {
        type: "ai.question",
        data: { id: "q-1", text: "Tell me about yourself and why this role fits your background." },
      },
      { type: "ai.speech.start", data: {} },
      { type: "ai.speech.end", data: {} },
      { type: "user.speech.start", data: {} },
      { type: "user.partial_transcript", data: { speaker: "user", text: "I have spent the last " } },
      { type: "user.partial_transcript", data: { speaker: "user", text: "I have spent the last three years building products" } },
      { type: "user.final_transcript", data: { speaker: "user", text: "I have spent the last three years building products and leading cross-functional teams to ship customer-focused features." } },
      { type: "answer.processing", data: {} },
      { type: "next.question", data: { id: "q-2", text: "Describe a time you resolved a technical or product challenge under pressure." } },
      { type: "interview.complete", data: { status: "completed" } },
    ] as const;

    queue.forEach((item, index) => {
      const timer = setTimeout(() => {
        const event: RealtimeEvent = {
          type: item.type,
          data: item.data,
          timestamp: Date.now(),
        };

        this.listeners.forEach((listener) => listener(event));
      }, 800 + index * 1100);

      this.timers.push(timer);
    });
  }

  emitError(message: string) {
    const event: RealtimeEvent = {
      type: "connection.error",
      data: { message },
      timestamp: Date.now(),
    };

    this.listeners.forEach((listener) => listener(event));
  }

  reconnect() {
    const event: RealtimeEvent = {
      type: "connection.reconnect",
      data: { message: "Reconnected successfully." },
      timestamp: Date.now(),
    };

    this.listeners.forEach((listener) => listener(event));
  }

  disconnect() {
    this.clearTimers();
  }

  private clearTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
  }
}
