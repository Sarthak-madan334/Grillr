import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import InterviewSessionPage from "../../app/interview/[id]/page";

const voice = vi.hoisted(() => ({
  props: {} as {
    questionText?: string;
    onTranscript: (text: string) => void;
    onRecordingChange: (recording: boolean) => void;
    onQuestionReady: (question: { id: string; text: string; questionNumber: number; isFollowUp: boolean }) => void;
  },
}));

vi.mock("next/navigation", () => ({ useParams: () => ({ id: "session" }) }));
vi.mock("../../components/layout/top-nav", () => ({ TopNav: () => null }));
vi.mock("../../components/interview/SessionClock", () => ({ SessionClock: () => null }));
vi.mock("../../components/VoiceAnswerPanel", () => ({
  VoiceAnswerPanel: (props: typeof voice.props) => {
    voice.props = props;
    return <button onClick={() => props.onRecordingChange(true)}>Record next answer</button>;
  },
}));
vi.mock("../../lib/interview-api", () => ({
  getInterview: vi.fn().mockResolvedValue({
    id: "session", status: "active", interview_type: "behavioral", personality: "professional",
    experience_level: "senior", duration: 30, question_count: 5, job_role: "Engineer",
  }),
  getQuestions: vi.fn().mockResolvedValue({ items: [{
    id: "first", question_number: 1, question_text: "Tell me about your project.",
    question_type: "behavioral", answered_at: null,
  }] }),
  getSummary: vi.fn(),
  startInterview: vi.fn(),
}));

it("preserves the real transcript across question progression and clears it for a fresh recording", async () => {
  render(<InterviewSessionPage />);
  await screen.findByText("Tell me about your project.");
  act(() => {
    voice.props.onTranscript("I reduced our deployment time by twenty minutes.");
    voice.props.onQuestionReady({ id: "second", text: "How did you measure it?", questionNumber: 2, isFollowUp: false });
  });
  expect(screen.getByText("I reduced our deployment time by twenty minutes.")).toBeInTheDocument();
  expect(screen.getByText("Your last recorded answer")).toBeInTheDocument();
  expect(voice.props.questionText).toBe("How did you measure it?");
  fireEvent.click(screen.getByRole("button", { name: "Record next answer" }));
  expect(screen.queryByText("I reduced our deployment time by twenty minutes.")).not.toBeInTheDocument();
  expect(screen.getByText(/after you stop recording/)).toBeInTheDocument();
});
