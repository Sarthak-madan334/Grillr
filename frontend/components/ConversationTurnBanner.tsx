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
  return <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3" aria-live="polite" aria-label={`Conversation state: ${message.label}`}><span className={`h-2.5 w-2.5 rounded-full ${state === "processing" ? "animate-pulse bg-[var(--surface)]" : state === "listening" ? "bg-[var(--success-surface)]" : "bg-[var(--surface)]"}`} /><div><p className="text-sm font-semibold text-[var(--foreground)]">{message.label}</p><p className="text-xs text-[var(--muted)]">{message.detail}</p></div></div>;
}