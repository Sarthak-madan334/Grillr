import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceAnswerPanel } from "../../components/VoiceAnswerPanel";
import { microphoneService } from "../../lib/audio/microphone-service";

type MediaMocks = {
  getUserMedia: ReturnType<typeof vi.fn>;
  enumerateDevices: ReturnType<typeof vi.fn>;
};

const realtimeTokenResponse = () => new Response(JSON.stringify({ token: "test-token" }), { status: 200, headers: { "Content-Type": "application/json" } });

class TestRecorder {
  static latest: TestRecorder | undefined;
  state = "recording";
  private listeners = new Map<string, (event: { data: Blob }) => void>();
  constructor(stream: MediaStream) { void stream; TestRecorder.latest = this; }
  addEventListener(event: string, callback: (event: { data: Blob }) => void) { this.listeners.set(event, callback); }
  start() { this.state = "recording"; }
  emitData(data = new Blob(["audio"])) { this.listeners.get("dataavailable")?.({ data }); }
  stop() { this.state = "inactive"; this.listeners.get("dataavailable")?.({ data: new Blob(["audio"]) }); this.listeners.get("stop")?.({ data: new Blob() }); }
}

class TestSocket {
  static OPEN = 1;
  static instances: TestSocket[] = [];
  readyState = TestSocket.OPEN;
  sent: unknown[] = [];
  closeCalls = 0;
  private listeners = new Map<string, Set<(event: MessageEvent) => void>>();

  constructor() {
    TestSocket.instances.push(this);
    queueMicrotask(() => this.emitEvent("open", undefined));
  }

  addEventListener(event: string, callback: (event: MessageEvent) => void) {
    const callbacks = this.listeners.get(event) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(event, callbacks);
  }

  send(value: unknown) {
    this.sent.push(value);
    if (typeof value === "string" && JSON.parse(value).type === "auth") {
      queueMicrotask(() => this.emit(JSON.stringify({ type: "auth.ok", data: {} })));
    }
  }

  close() {
    this.closeCalls += 1;
    this.readyState = 3;
  }

  emit(data: string) {
    this.emitEvent("message", new MessageEvent("message", { data }));
  }

  emitError() {
    this.emitEvent("error", new Event("error") as MessageEvent);
  }

  emitEventForTest(event: string) {
    this.emitEvent(event, undefined);
  }

  private emitEvent(event: string, payload: Event | undefined) {
    this.listeners.get(event)?.forEach((callback) => callback(payload as MessageEvent));
  }
}

beforeEach(() => {
  vi.stubGlobal("MediaRecorder", TestRecorder);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(realtimeTokenResponse()));
});

function mockMediaDevices(mocks: MediaMocks) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: mocks,
  });
}

function mockAvailableMicrophone(track = { addEventListener: vi.fn(), stop: vi.fn() }) {
  mockMediaDevices({
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  });
  return track;
}

afterEach(() => {
  microphoneService.releaseMicrophone();
  TestRecorder.latest = undefined;
  TestSocket.instances = [];
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
});

describe("VoiceAnswerPanel", () => {
  it("hides recording controls when microphone APIs are unavailable", async () => {
    render(<VoiceAnswerPanel />);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Voice is unavailable here"));
    expect(screen.queryByRole("button", { name: "Start recording" })).not.toBeInTheDocument();
  });

  it("shows a denial message while keeping voice as the required path", async () => {
    const getUserMedia = vi.fn().mockRejectedValue(Object.assign(new Error("blocked"), { name: "NotAllowedError" }));
    mockMediaDevices({ getUserMedia, enumerateDevices: vi.fn().mockResolvedValue([{ kind: "audioinput" }]) });
    render(<VoiceAnswerPanel />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Start recording" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Microphone access denied"));
    expect(screen.getByRole("button", { name: "Retry voice" })).toBeInTheDocument();
    expect(screen.queryByText(/typed answer/i)).not.toBeInTheDocument();
  });

  it("distinguishes a missing microphone device", async () => {
    const getUserMedia = vi.fn();
    mockMediaDevices({ getUserMedia, enumerateDevices: vi.fn().mockResolvedValue([{ kind: "videoinput" }]) });
    render(<VoiceAnswerPanel />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Start recording" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No microphone detected"));
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("falls back when the active audio track ends", async () => {
    let onEnded: (() => void) | undefined;
    const track = {
      addEventListener: vi.fn((_event: string, callback: () => void) => { onEnded = callback; }),
      stop: vi.fn(),
    };
    const stream = { getTracks: () => [track] };
    mockMediaDevices({ getUserMedia: vi.fn().mockResolvedValue(stream), enumerateDevices: vi.fn().mockResolvedValue([]) });
    render(<VoiceAnswerPanel />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Start recording" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop recording" })).toBeInTheDocument());

    onEnded?.();

    expect(await screen.findByRole("alert")).toHaveTextContent("Microphone access ended");
    expect(screen.getByRole("button", { name: "Retry voice" })).toBeInTheDocument();
  });

  it("releases the microphone when local recording stops", async () => {
    const track = { addEventListener: vi.fn(), stop: vi.fn() };
    mockMediaDevices({ getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }), enumerateDevices: vi.fn().mockResolvedValue([]) });
    render(<VoiceAnswerPanel />);

    fireEvent.click(await screen.findByRole("button", { name: "Start recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop recording" }));

    expect(track.stop).toHaveBeenCalled();
  });

  it("streams audio and applies the final transcript", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    const onTranscript = vi.fn();
    const track = { addEventListener: vi.fn(), stop: vi.fn() };
    mockMediaDevices({ getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }), enumerateDevices: vi.fn().mockResolvedValue([]) });
    render(<VoiceAnswerPanel sessionId="session-1" onTranscript={onTranscript} />);

    fireEvent.click(await screen.findByRole("button", { name: "Start recording" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop recording" }));

    const socket = TestSocket.instances[0];
    expect(onTranscript).not.toHaveBeenCalled();
    expect(screen.getByText("Processing your answer...")).toBeInTheDocument();
    socket?.emit(JSON.stringify({ type: "transcript.final", data: { text: "I improved the deployment pipeline." } }));
    expect(onTranscript).toHaveBeenCalledWith("I improved the deployment pipeline.");
  });

  it("authenticates with the realtime token and starts the session on the same socket", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    render(<VoiceAnswerPanel sessionId="session-auth" />);

    await waitFor(() => expect(TestSocket.instances[0]?.sent).toHaveLength(2));

    expect(fetch).toHaveBeenCalledWith("/api/auth/realtime-token", { cache: "no-store", credentials: "include" });
    expect(TestSocket.instances[0]?.sent.map((value) => JSON.parse(String(value)))).toEqual([
      { type: "auth", token: "test-token" },
      { type: "session.start" },
    ]);
  });

  it("forwards microphone chunks and speech start/stop events", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    const track = { addEventListener: vi.fn(), stop: vi.fn() };
    mockMediaDevices({ getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }), enumerateDevices: vi.fn().mockResolvedValue([]) });
    render(<VoiceAnswerPanel sessionId="session-recording" />);

    fireEvent.click(await screen.findByRole("button", { name: "Start recording" }));
    const socket = TestSocket.instances[0];
    await waitFor(() => expect(socket?.sent.some((value) => JSON.parse(String(value)).type === "speech.start")).toBe(true));
    TestRecorder.latest?.emitData(new Blob(["chunk"]));
    fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));

    await waitFor(() => expect(socket?.sent.some((value) => value instanceof Blob)).toBe(true));
    expect(socket?.sent.filter((value): value is string => typeof value === "string").some((value) => JSON.parse(value).type === "speech.stop")).toBe(true);
    expect(track.stop).not.toHaveBeenCalled();
  });

  it("handles evaluation, planned questions, follow-ups, and completion without reconnecting", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    const onAnswerEvaluated = vi.fn();
    const onQuestionReady = vi.fn();
    const onCompleted = vi.fn();
    mockAvailableMicrophone();
    render(<VoiceAnswerPanel sessionId="session-progression" onAnswerEvaluated={onAnswerEvaluated} onQuestionReady={onQuestionReady} onCompleted={onCompleted} />);
    await waitFor(() => expect(TestSocket.instances).toHaveLength(1));
    const socket = TestSocket.instances[0];
    await waitFor(() => expect(socket.sent).toHaveLength(2));

    socket?.emit(JSON.stringify({ type: "answer.evaluated", data: { answer_id: "answer-1", question_id: "question-1", overall_score: 86 } }));
    socket?.emit(JSON.stringify({ type: "question.created", data: { question_id: "question-2", text: "Tell me about scale.", question_number: 2, is_follow_up: false } }));
    socket?.emit(JSON.stringify({ type: "question.follow_up", data: { question_id: "question-2-follow-up", text: "What trade-off did you make?", question_number: 3, is_follow_up: true } }));
    socket?.emit(JSON.stringify({ type: "session.completed", data: { session_id: "session-progression", answer_id: "answer-2", overall_score: 88 } }));

    expect(onAnswerEvaluated).toHaveBeenCalledOnce();
    expect(onQuestionReady).toHaveBeenNthCalledWith(1, { id: "question-2", text: "Tell me about scale.", questionNumber: 2, isFollowUp: false });
    expect(onQuestionReady).toHaveBeenNthCalledWith(2, { id: "question-2-follow-up", text: "What trade-off did you make?", questionNumber: 3, isFollowUp: true });
    expect(onCompleted).toHaveBeenCalledOnce();
    expect(TestSocket.instances).toHaveLength(1);
    expect(socket?.closeCalls).toBe(0);
  });

  it("releases the WebSocket and microphone resources on unmount", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    const track = mockAvailableMicrophone();
    const { unmount } = render(<VoiceAnswerPanel sessionId="session-cleanup" />);
    fireEvent.click(await screen.findByRole("button", { name: "Start recording" }));
    await screen.findByRole("button", { name: "Stop recording" });
    const socket = TestSocket.instances[0];
    unmount();

    expect(socket?.closeCalls).toBe(1);
    expect(track.stop).toHaveBeenCalled();
    expect(TestRecorder.latest?.state).toBe("inactive");
  });

  it("keeps voice as the required response path after a WebSocket failure", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    mockAvailableMicrophone();
    const pushState = vi.spyOn(window.history, "pushState");
    render(<VoiceAnswerPanel sessionId="session-failure" />);
    await waitFor(() => expect(TestSocket.instances).toHaveLength(1));
    const socket = TestSocket.instances[0];
    act(() => socket.emitError());

    expect(await screen.findByRole("alert")).toHaveTextContent("live interview connection failed");
    expect(screen.queryByText(/answer by typing/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /typed answer/i })).not.toBeInTheDocument();
    expect(pushState).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Start recording" })).toBeEnabled();
  });

  it("surfaces token failures without falling back to mock transcripts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "expired" }), { status: 401 })));
    mockAvailableMicrophone();
    render(<VoiceAnswerPanel sessionId="session-token-failure" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Realtime authentication failed");
    expect(screen.queryByText(/I have spent the last/i)).not.toBeInTheDocument();
  });

  it("surfaces a clean WebSocket disconnect and keeps retry available", async () => {
    vi.stubGlobal("WebSocket", TestSocket);
    mockAvailableMicrophone();
    render(<VoiceAnswerPanel sessionId="session-disconnect" />);
    await waitFor(() => expect(TestSocket.instances).toHaveLength(1));
    TestSocket.instances[0].emitEventForTest("close");

    expect(await screen.findByRole("alert")).toHaveTextContent("connection closed");
    expect(screen.getByRole("button", { name: "Start recording" })).toBeEnabled();
  });

});
