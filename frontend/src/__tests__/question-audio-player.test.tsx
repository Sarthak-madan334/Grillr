import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionAudioPlayer } from "../../components/QuestionAudioPlayer";

describe("QuestionAudioPlayer", () => {
  it("loads the question audio endpoint and exposes playback when ready", async () => {
    render(<QuestionAudioPlayer sessionId="session 1" questionId="question/1" />);

    const audio = screen.getByLabelText("Play interview question audio");
    expect(audio).toHaveAttribute("src", expect.stringContaining("/api/v1/interviews/session%201/questions/question%2F1/audio"));
    expect(screen.getByLabelText("Loading question audio")).toBeInTheDocument();

    fireEvent.canPlay(audio);

    await waitFor(() => expect(screen.getByText("Ready")).toBeInTheDocument());
  });

  it("falls back to the text prompt when audio is unavailable", async () => {
    render(<QuestionAudioPlayer sessionId="session-1" questionId="question-1" />);

    fireEvent.error(screen.getByLabelText("Play interview question audio"));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Audio isn't available"));
    expect(screen.queryByLabelText("Play interview question audio")).not.toBeInTheDocument();
  });
});
