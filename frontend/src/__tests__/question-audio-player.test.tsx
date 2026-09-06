import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionAudioPlayer } from "../../components/QuestionAudioPlayer";

describe("QuestionAudioPlayer", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads the question audio endpoint and exposes playback when ready", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    render(<QuestionAudioPlayer sessionId="session 1" questionId="question/1" />);

    const audio = screen.getByLabelText("Question audio");
    expect(audio).toHaveAttribute("src", expect.stringContaining("/api/v1/interviews/session%201/questions/question%2F1/audio"));
    expect(screen.getByLabelText("Loading question audio")).toBeInTheDocument();

    fireEvent.canPlay(audio);

    await waitFor(() => expect(screen.getByRole("button", { name: "Pause question audio" })).toBeInTheDocument());
  });

  it("falls back to the text prompt when audio is unavailable", async () => {
    render(<QuestionAudioPlayer sessionId="session-1" questionId="question-1" />);

    fireEvent.error(screen.getByLabelText("Question audio"));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Audio isn't available"));
    expect(screen.queryByRole("button", { name: "Play question audio" })).not.toBeInTheDocument();
  });
});
