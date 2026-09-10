import type { TurnState } from "./VoiceAnswerPanel";

type ConversationTurnBannerProps = {
  state: TurnState;
};

const copy: Record<TurnState, { label: string; detail: string }> = {
  asking: { label: "AI is asking", detail: "Listen to the question before answering." },
  listening: { label: "Your turn", detail: "Take a moment, then answer by voice." },
  processing: { label: "Reviewing your answer", detail: "Your response is being analyzed." },
  completed: { label: "Interview complete", detail: "Your session summary is ready." },
};

export function ConversationTurnBanner({ state }: ConversationTurnBannerProps) {
  const message = copy[state];
  return (
    <div
      role="status"
      className="mb-6 flex items-center gap-3 rounded-[20px] border border-[#eaded1] bg-white/75 px-4 py-3 shadow-[0_10px_24px_rgba(16,24,39,0.04)]"
      aria-live="polite"
      aria-label={`Conversation state: ${message.label}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${state === "processing" ? "animate-pulse bg-[#ba7a4b]" : state === "listening" ? "bg-[#1f7d5d]" : "bg-[#7a5f48]"}`} />
      <div>
        <p className="text-sm font-semibold text-[#111827]">{message.label}</p>
        <p className="text-xs text-[#5b6472]">{message.detail}</p>
      </div>
    </div>
  );
}