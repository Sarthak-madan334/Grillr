import { afterEach, describe, expect, it, vi } from "vitest";
import { MicrophoneService } from "../../lib/audio/microphone-service";

class FakeRecorder {
  static latest: FakeRecorder | undefined;
  state = "inactive";
  deferStop = false;
  private listeners = new Map<string, (event: { data: Blob }) => void>();

  constructor(public stream: MediaStream) {
    FakeRecorder.latest = this;
  }

  addEventListener(event: string, callback: (event: { data: Blob }) => void) {
    this.listeners.set(event, callback);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    if (!this.deferStop) this.finishStop();
  }

  finishStop() {
    this.listeners.get("dataavailable")?.({ data: new Blob(["final audio"]) });
    this.listeners.get("stop")?.({ data: new Blob() });
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MicrophoneService", () => {
  it("keeps late chunks and stop events attached to their original recording", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
    vi.stubGlobal("MediaRecorder", FakeRecorder);
    const service = new MicrophoneService();
    await service.requestPermission();
    const first = vi.fn();
    const second = vi.fn();
    const stopped = vi.fn();
    service.startRecording(first);
    const oldRecorder = FakeRecorder.latest!;
    oldRecorder.deferStop = true;
    service.stopRecording(stopped);
    service.startRecording(second);
    oldRecorder.finishStop();
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    expect(stopped).toHaveBeenCalledOnce();
    expect(service.isRecording()).toBe(true);
    service.stopRecording();
    expect(second).toHaveBeenCalledOnce();
    service.releaseMicrophone();
  });
  it("requests permission, captures chunks, and releases the track", async () => {
    const track = { stop: vi.fn() };
    const stream = { getTracks: () => [track] } as unknown as MediaStream;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    vi.stubGlobal("MediaRecorder", FakeRecorder);
    const service = new MicrophoneService();
    const chunks: Blob[] = [];

    expect(await service.requestPermission()).toBe(true);
    expect(service.startRecording((chunk) => chunks.push(chunk))).toBe(true);
    expect(service.isRecording()).toBe(true);
    service.stopRecording();
    service.releaseMicrophone();

    expect(chunks).toHaveLength(1);
    expect(track.stop).toHaveBeenCalledOnce();
    expect(service.getStream()).toBeNull();
  });

  it("returns false when permission is denied", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    const service = new MicrophoneService();

    expect(await service.requestPermission()).toBe(false);
    expect(service.getStream()).toBeNull();
  });
});
