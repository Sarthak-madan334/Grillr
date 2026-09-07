import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VoiceAnswerPanel } from "../../components/VoiceAnswerPanel";

type MediaMocks = {
  getUserMedia: ReturnType<typeof vi.fn>;
  enumerateDevices: ReturnType<typeof vi.fn>;
};

function mockMediaDevices(mocks: MediaMocks) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: mocks,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
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
});
