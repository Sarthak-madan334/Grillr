import { RealtimeEvent, VoiceState } from "../../types/realtime";

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

export class MockRealtimeService {
  private listeners: RealtimeEventHandler[] = [];
  private state: VoiceState = "idle";
  private mockIntervals: number[] = [];

  connect() {
    console.log("Mock WebSocket connected");
    this.setState("idle");
    this.emit({ type: "session.ready", data: {} });

    // Simulate first question after 1s
    setTimeout(() => {
      this.simulateAIQuestion(
        "Tell me about yourself and your experience.",
        "https://mock-audio-url.com",
      );
    }, 1000);
  }

  disconnect() {
    console.log("Mock WebSocket disconnected");
    this.clearMocks();
  }

  addListener(handler: RealtimeEventHandler) {
    this.listeners.push(handler);
  }

  removeListener(handler: RealtimeEventHandler) {
    this.listeners = this.listeners.filter((l) => l !== handler);
  }

  private emit(event: RealtimeEvent) {
    this.listeners.forEach((l) => l(event));
  }

  private setState(newState: VoiceState) {
    this.state = newState;
  }

  // --- Mock Behaviors ---

  simulateAIQuestion(text: string, audioUrl?: string) {
    this.setState("ai_speaking");
    this.emit({
      type: "question.created",
      data: { text, audio_url: audioUrl },
    });
    this.emit({ type: "audio.ai", data: {} });
    // Simulate AI finishing speaking after 3s
    setTimeout(() => {
      if (this.state === "ai_speaking") {
        this.setState("listening");
      }
    }, 3000);
  }

  simulateUserSpeech(partialText: string) {
    if (this.state !== "user_speaking") {
      this.setState("user_speaking");
      this.emit({ type: "speech.start", data: {} });
    }
    this.emit({ type: "transcript.partial", data: { text: partialText } });
  }

  simulateFinalUserSpeech(finalText: string) {
    this.emit({
      type: "transcript.final",
      data: { text: finalText, answer_id: "mock-uuid" },
    });
    this.setState("processing");
    this.emit({ type: "speech.stop", data: {} });
    // Simulate processing -> new question
    setTimeout(() => {
      this.emit({ type: "answer.evaluated", data: {} });
      setTimeout(() => {
        this.simulateAIQuestion(
          "That makes sense. Can you dive deeper into a time you faced a difficult challenge?",
        );
      }, 1000);
    }, 2000);
  }

  simulateInterruption() {
    if (this.state === "ai_speaking") {
      this.emit({ type: "interview.interrupt", data: {} });
      this.setState("listening");
    }
  }

  clearMocks() {
    this.mockIntervals.forEach((id) => window.clearInterval(id));
    this.mockIntervals = [];
  }
}

export const mockRealtimeService = new MockRealtimeService();
