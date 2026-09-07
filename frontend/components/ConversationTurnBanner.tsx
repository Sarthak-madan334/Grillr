import type { TurnState } from "./VoiceAnswerPanel";

type ConversationTurnBannerProps = {
  state: TurnState;
};

const copy: Record<TurnState, { label: string; detail: string }> = {
  asking: { label: "AI is asking", detail: "Listen to the question before answering." },
  listening: { label: "Your turn", detail: "Take a moment, then answer by voice or text." },
  processing: { label: "Reviewing your answer", detail: "Your response is being analyzed." },
  completed: { label: "Interview complete", detail: "Your session summary is ready." },
};

export function ConversationTurnBanner({ state }: ConversationTurnBannerProps) {
  const message = copy[state];
  return <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e7d8c5] bg-[rgba(255,255,255,0.5)] px-4 py-3" aria-live="polite" aria-label={`Conversation state: ${message.label}`}><span className={`h-2.5 w-2.5 rounded-full ${state === "processing" ? "animate-pulse bg-[#b8916d]" : state === "listening" ? "bg-[#26724d]" : "bg-[#7a5f48]"}`} /><div><p className="text-sm font-semibold text-[#3d3028]">{message.label}</p><p className="text-xs text-[#7a5f48]">{message.detail}</p></div></div>;
}