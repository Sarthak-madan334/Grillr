import { describe, expect, it } from "vitest";
import { BrowserRealtimeClient } from "../lib/realtime";

class FakeSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = FakeSocket.OPEN;
  sent: unknown[] = [];
  private listeners = new Map<string, (event: MessageEvent) => void>();

  addEventListener(event: string, listener: (event: MessageEvent) => void) {
    this.listeners.set(event, listener);
  }

  send(value: unknown) {
    this.sent.push(value);
  }

  close() {
    this.readyState = FakeSocket.CLOSED;
  }

  emit(payload: unknown) {
    this.listeners.get("message")?.(new MessageEvent("message", { data: JSON.stringify(payload) }));
  }
}

describe("BrowserRealtimeClient", () => {
  it("authenticates and sends lifecycle events and binary audio", () => {
    const socket = new FakeSocket();
    const client = new BrowserRealtimeClient("ws://example.test/interview", () => socket as unknown as WebSocket);

    client.authenticate("token-1");
    client.send("speech.start", { turn_id: "turn-1" });
    const audio = new Blob(["audio"]);
    client.sendAudio(audio);

    expect(socket.sent[0]).toBe(JSON.stringify({ type: "auth", token: "token-1" }));
    expect(socket.sent[1]).toBe(JSON.stringify({ type: "speech.start", data: { turn_id: "turn-1" } }));
    expect(socket.sent[2]).toBe(audio);
  });

  it("dispatches backend transcript events to subscribers", () => {
    const socket = new FakeSocket();
    const client = new BrowserRealtimeClient("ws://example.test/interview", () => socket as unknown as WebSocket);
    const events: string[] = [];

    client.subscribe((event) => events.push(event.type));
    socket.emit({ type: "transcript.final", data: { text: "captured answer" } });

    expect(events).toEqual(["transcript.final"]);
  });
});
