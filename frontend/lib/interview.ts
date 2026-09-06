export type InterviewType = "behavioral" | "technical" | "hr";
export type Difficulty = "easy" | "medium" | "hard";
export type ExperienceLevel = "junior" | "mid" | "senior";
export type InterviewPersonality = "friendly" | "professional" | "tough";

export interface InterviewConfig {
  interviewType: InterviewType;
  jobRole: string;
  experienceLevel: ExperienceLevel;
  difficulty: Difficulty;
  personality: InterviewPersonality;
  duration: number;
}

export interface Question {
  id: string;
  text: string;
  type: InterviewType;
  isFollowUp: boolean;
  questionNumber: number;
}

export interface AnswerEvaluation {
  overallScore: number;
  scores: {
    relevance: number;
    clarity: number;
    structure: number;
    specificity: number;
    technicalAccuracy: number;
    conciseness: number;
    communication: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedAnswer: string;
}

const baseQuestionBank: Record<InterviewType, string[]> = {
  behavioral: [
    "Tell me about yourself and why you are interested in this role.",
    "Describe a time you solved a difficult problem at work.",
    "How do you handle conflict or disagreement with a teammate?",
  ],
  technical: [
    "Walk me through a technical project you led and the trade-offs you made.",
    "How would you design a scalable backend for a high-traffic product?",
    "Describe a performance issue you debugged and how you improved it.",
  ],
  hr: [
    "Why do you want to join this company?",
    "What are your career goals over the next few years?",
    "What kind of work environment helps you perform your best?",
  ],
};

export function generateQuestions(config: InterviewConfig): Question[] {
  const bank = baseQuestionBank[config.interviewType];
  const roleLabel = config.jobRole || "this role";

  return bank.map((text, index) => ({
    id: `q-${index + 1}`,
    text: text.replace("this role", roleLabel),
    type: config.interviewType,
    isFollowUp: false,
    questionNumber: index + 1,
  }));
}

export function evaluateAnswer({
  transcript,
  interviewType,
  jobRole,
  difficulty,
}: {
  transcript: string;
  interviewType: InterviewType;
  jobRole?: string;
  difficulty?: Difficulty;
}): AnswerEvaluation {
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const metrics = {
    relevance: Math.min(
      95,
      Math.max(
        60,
        78 +
          (transcript.toLowerCase().includes(jobRole?.toLowerCase() ?? "")
            ? 8
            : 0) +
          (interviewType === "technical" ? 6 : 0),
      ),
    ),
    clarity: Math.min(95, 65 + Math.min(words / 10, 18)),
    structure: Math.min(96, 58 + Math.min(words / 12, 24)),
    specificity: Math.min(96, 52 + Math.min(words / 14, 30)),
    technicalAccuracy:
      interviewType === "technical"
        ? Math.min(97, 60 + Math.min(words / 9, 26))
        : 74,
    conciseness: Math.min(
      94,
      78 + (words < 120 ? 8 : 0) - (words > 200 ? 10 : 0),
    ),
    communication: Math.min(95, 60 + Math.min(words / 8, 28)),
  };

  const strengths = [
    "Clear, goal-oriented explanation.",
    transcript.length > 140
      ? "Included measurable outcomes and concrete examples."
      : "Provided a focused answer with context.",
    interviewType === "technical"
      ? "Demonstrated technical reasoning and trade-off awareness."
      : "Communicated motivation and self-awareness clearly.",
  ];

  const weaknesses = [
    "Could include more specific metrics or examples to strengthen the story.",
    "A few ideas could be prioritized more clearly for impact.",
  ];

  const suggestions = [
    "Open with a concise summary of the problem and your contribution.",
    "Add measurable outcomes, stakeholder impact, and one key lesson learned.",
    difficulty === "hard"
      ? "Explain your decision-making process and trade-offs in more detail."
      : "Use a simple structure: situation, action, result.",
  ];

  const overallScore = Math.round(
    (metrics.relevance +
      metrics.clarity +
      metrics.structure +
      metrics.specificity +
      metrics.technicalAccuracy +
      metrics.conciseness +
      metrics.communication) /
      7,
  );

  return {
    overallScore,
    scores: {
      relevance: Math.round(metrics.relevance),
      clarity: Math.round(metrics.clarity),
      structure: Math.round(metrics.structure),
      specificity: Math.round(metrics.specificity),
      technicalAccuracy: Math.round(metrics.technicalAccuracy),
      conciseness: Math.round(metrics.conciseness),
      communication: Math.round(metrics.communication),
    },
    strengths,
    weaknesses,
    suggestions,
    improvedAnswer:
      "A stronger answer would begin with the challenge, explain the actions you took, and finish with measurable results and the lesson learned.",
  };
}
