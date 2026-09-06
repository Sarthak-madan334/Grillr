import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceAnswerPanel } from "../../components/VoiceAnswerPanel";

type MediaMocks = {
  getUserMedia: ReturnType<typeof vi.fn>;
  enumerateDevices: ReturnType<typeof vi.fn>;
};

class TestRecorder {
  state = "recording";
  private listeners = new Map<string, (event: { data: Blob }) => void>();
  constructor(stream: MediaStream) { void stream; }
  addEventListener(event: string, callback: (event: { data: Blob }) => void) { this.listeners.set(event, callback); }
  start() { this.state = "recording"; }
  stop() { this.state = "inactive"; this.listeners.get("dataavailable")?.({ data: new Blob(["audio"]) }); this.listeners.get("stop")?.({ data: new Blob() }); }
}

beforeEach(() => {
  vi.stubGlobal("MediaRecorder", TestRecorder);
});

function mockMediaDevices(mocks: MediaMocks) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: mocks,
  });
}

afterEach(() => {
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

  it("shows a denial message while keeping retry available", async () => {
    const getUserMedia = vi.fn().mockRejectedValue(Object.assign(new Error("blocked"), { name: "NotAllowedError" }));
    mockMediaDevices({ getUserMedia, enumerateDevices: vi.fn().mockResolvedValue([{ kind: "audioinput" }]) });
    render(<VoiceAnswerPanel />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Start recording" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Microphone access denied"));
    expect(screen.getByRole("button", { name: "Retry voice" })).toBeInTheDocument();
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

  it("streams binary chunks and renders partial and final transcripts", async () => {
    class FakeSocket {
      static OPEN = 1;
      static latest: FakeSocket | undefined;
      readyState = 0;
      sent: unknown[] = [];
      listeners = new Map<string, (event: MessageEvent) => void>();
      constructor() { FakeSocket.latest = this; }
      addEventListener(event: string, callback: (event: MessageEvent) => void) {
        this.listeners.set(event, callback);
        if (event === "open") {
          this.readyState = FakeSocket.OPEN;
          callback(new MessageEvent("open"));
        }
      }
      send(value: unknown) { this.sent.push(value); }
      close() { this.readyState = 3; }
      emit(event: string, data: string) { this.listeners.get(event)?.(new MessageEvent(event, { data })); }
    }
    class FakeRecorder {
      static latest: FakeRecorder | undefined;
      state = "recording";
      listeners = new Map<string, (event: { data: Blob }) => void>();
      constructor(stream: MediaStream) { void stream; FakeRecorder.latest = this; }
      start(timeslice: number) { void timeslice; }
      stop() { this.state = "inactive"; }
      addEventListener(event: string, callback: (event: { data: Blob }) => void) { this.listeners.set(event, callback); }
      emitChunk() { this.listeners.get("dataavailable")?.({ data: new Blob(["audio"]) }); }
    }
    const onTranscript = vi.fn();
    vi.stubGlobal("WebSocket", FakeSocket);
    vi.stubGlobal("MediaRecorder", FakeRecorder);
    const track = { addEventListener: vi.fn(), stop: vi.fn() };
    mockMediaDevices({ getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }), enumerateDevices: vi.fn().mockResolvedValue([]) });
    render(<VoiceAnswerPanel sessionId="session-1" onTranscript={onTranscript} />);

    fireEvent.click(await screen.findByRole("button", { name: "Start recording" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop recording" })).toBeInTheDocument());
    const socket = FakeSocket.latest;
    const recorder = FakeRecorder.latest;
    expect(socket).toBeDefined();
    expect(recorder).toBeDefined();
    if (!socket || !recorder) throw new Error("Realtime fakes were not initialized");
    act(() => recorder?.emitChunk());
    expect(socket.sent).toEqual([JSON.stringify({ type: "speech.start" }), expect.any(Blob)]);

    act(() => socket?.emit("message", JSON.stringify({ type: "transcript.partial", data: { text: "I improved" } })));
    expect(screen.getByText("I improved")).toBeInTheDocument();
    act(() => socket?.emit("message", JSON.stringify({ type: "transcript.final", data: { text: "I improved the deployment pipeline." } })));
    expect(onTranscript).toHaveBeenCalledWith("I improved the deployment pipeline.");
    expect(track.stop).toHaveBeenCalled();
  });
});
