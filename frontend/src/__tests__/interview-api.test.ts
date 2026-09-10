import { afterEach, describe, expect, it, vi } from "vitest";
import {
  InterviewApiError,
  getInterview,
  getLatestAnswer,
  submitAnswer,
} from "../../lib/interview-api";

describe("interview API client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads a persisted session and sends credentials", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "session-1", status: "active" }), {
          status: 200,
        }),
      );

    await expect(getInterview("session-1")).resolves.toMatchObject({
      id: "session-1",
      status: "active",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/interviews/session-1",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("surfaces structured backend errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: "Interview not found" } }),
        { status: 404 },
      ),
    );

    await expect(getInterview("missing")).rejects.toEqual(
      new InterviewApiError(404, "Interview not found"),
    );
  });

  it("submits typed answers using the backend contract", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({ id: "answer-1", evaluation: { overall_score: 80 } }),
          { status: 201 },
        ),
      );

    await expect(
      submitAnswer("question-1", "A detailed answer", 8),
    ).resolves.toMatchObject({ id: "answer-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/interviews/questions/question-1/answer",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ transcript: "A detailed answer", duration: 8 }),
      }),
    );
  });

  it("supports refresh recovery of the latest persisted answer", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "answer-1",
          question_id: "question-1",
          evaluation: { overall_score: 80 },
        }),
        { status: 200 },
      ),
    );

    await expect(getLatestAnswer("session-1")).resolves.toMatchObject({
      question_id: "question-1",
    });
  });
});
