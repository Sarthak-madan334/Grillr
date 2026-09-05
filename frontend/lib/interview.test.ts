import { describe, expect, it } from "vitest";
import { evaluateAnswer, generateQuestions } from "./interview";

describe("interview engine", () => {
  it("generates a realistic set of interview questions for the selected role", () => {
    const questions = generateQuestions({
      interviewType: "technical",
      jobRole: "Software Engineer",
      experienceLevel: "mid",
      difficulty: "medium",
      personality: "professional",
      duration: 30,
    });

    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].text).toMatch(/Software Engineer|technical|experience/i);
  });

  it("scores an answer with actionable feedback", () => {
    const result = evaluateAnswer({
      transcript:
        "I led a team of four engineers to redesign our API gateway, reduced p95 latency by 38%, and built a rollout plan with dashboards, alerts, and incident response protocols.",
      interviewType: "technical",
      jobRole: "Software Engineer",
      difficulty: "medium",
    });

    expect(result.overallScore).toBeGreaterThan(60);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.weaknesses.length).toBeGreaterThanOrEqual(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
