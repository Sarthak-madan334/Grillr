import type { Answer, Feedback } from "@/lib/interview-api";

type AnswerEvaluationPanelProps = {
  transcript: string;
  answer: Answer | null;
  status: "processing" | "complete" | "unavailable";
};

const scoreLabels: Array<[keyof Feedback["scores"], string]> = [
  ["relevance", "Relevance"],
  ["clarity", "Clarity"],
  ["structure", "Structure"],
  ["specificity", "Specificity"],
  ["technical_accuracy", "Technical accuracy"],
  ["conciseness", "Conciseness"],
  ["communication", "Communication"],
];

function ProcessingSteps() {
  return (
    <div className="mt-5 grid gap-3 text-xs text-[#7a685b] sm:grid-cols-3" aria-label="Answer analysis progress">
      {["Transcribing answer", "Analyzing delivery", "Evaluating response"].map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#26724d]" : "bg-[#d7c6b5]"}`} aria-hidden="true" />
          {step}
        </div>
      ))}
    </div>
  );
}

function Transcript({ transcript }: { transcript: string }) {
  return (
    <div className="mt-5 border-l-2 border-[#d8c5b3] pl-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b715c]">Your answer</p>
      <p className="mt-2 text-sm leading-6 text-[#4f3d35]">{transcript}</p>
    </div>
  );
}

function ScoreBreakdown({ feedback }: { feedback: Feedback }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {scoreLabels.map(([key, label]) => {
        const score = feedback.scores[key];
        return (
          <div key={key} className="border border-[#eee3d8] bg-[#fffdf9] px-3 py-3">
            <div className="flex items-center justify-between gap-2 text-xs text-[#7a685b]"><span>{label}</span><span className="font-semibold text-[#201a17]">{score ?? "Unavailable"}</span></div>
            {typeof score === "number" ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee3d8]" aria-hidden="true"><div className="h-full rounded-full bg-[#b8916d]" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} /></div> : null}
          </div>
        );
      })}
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <div><h4 className="text-sm font-semibold text-[#201a17]">{title}</h4><ul className="mt-2 space-y-2 text-sm leading-6 text-[#5e4d40]">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8916d]" aria-hidden="true" />{item}</li>)}</ul></div>;
}

export function AnswerEvaluationPanel({ transcript, answer, status }: AnswerEvaluationPanelProps) {
  const feedback = answer?.evaluation;

  return (
    <section aria-labelledby="answer-analysis-heading" className="mt-8 border-y border-[#e7d8c5] py-7" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b715c]">Answer review</p><h3 id="answer-analysis-heading" className="mt-2 text-xl font-semibold tracking-tight text-[#201a17]">{status === "processing" ? "Processing your answer" : status === "complete" ? "Your answer has been evaluated" : "Your answer was saved"}</h3></div>
        {status === "complete" ? <div className="border-l-2 border-[#b8916d] pl-4"><p className="text-[11px] uppercase tracking-[0.16em] text-[#8b715c]">Overall</p><p className="mt-1 text-3xl font-semibold text-[#201a17]">{feedback?.overall_score ?? "Unavailable"}</p></div> : null}
      </div>
      <Transcript transcript={transcript} />
      {answer?.speech_metrics ? <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#eee3d8] py-4 sm:grid-cols-4"><div><p className="text-xs text-[#8b715c]">Speaking pace</p><p className="mt-1 font-semibold text-[#201a17]">{Math.round(answer.speech_metrics.words_per_minute)} WPM</p></div><div><p className="text-xs text-[#8b715c]">Filler words</p><p className="mt-1 font-semibold text-[#201a17]">{answer.speech_metrics.filler_count}</p></div><div><p className="text-xs text-[#8b715c]">Significant pauses</p><p className="mt-1 font-semibold text-[#201a17]">{answer.speech_metrics.pause_count}</p></div><div><p className="text-xs text-[#8b715c]">Repetition</p><p className="mt-1 font-semibold text-[#201a17]">{answer.speech_metrics.repetition_count}</p></div></div> : null}
      {status === "processing" ? <><p className="mt-5 text-sm text-[#5e4d40]">We’re reviewing your speech and answer quality. You can continue when the next question is ready.</p><ProcessingSteps /></> : null}
      {status === "unavailable" ? <p className="mt-5 border-l-2 border-[#d8c5b3] pl-4 text-sm leading-6 text-[#5e4d40]">Your answer was saved, but detailed feedback is temporarily unavailable. You can continue the interview.</p> : null}
      {status === "complete" && feedback ? <><ScoreBreakdown feedback={feedback} /><div className="mt-7 grid gap-7 sm:grid-cols-3"><FeedbackList title="Strengths" items={feedback.strengths} /><FeedbackList title="Areas to improve" items={feedback.weaknesses} /><FeedbackList title="Suggestions" items={feedback.suggestions} /></div>{feedback.improved_answer ? <div className="mt-7 border-t border-[#eee3d8] pt-6"><p className="text-sm font-semibold text-[#201a17]">A stronger way to answer</p><p className="mt-2 text-sm leading-6 text-[#5e4d40]">{feedback.improved_answer}</p></div> : null}</> : null}
    </section>
  );
}
