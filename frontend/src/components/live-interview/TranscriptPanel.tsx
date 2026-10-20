import type { TranscriptEntry } from "@/lib/realtime";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  return (
    <section
      className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:p-5"
      aria-live="polite"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
            Transcript
          </div>
          <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Live response
          </h3>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Waiting for the interview to begin…
          </p>
        ) : (
          entries.map((entry, index) => {
            const isAi = entry.speaker === "ai";

            return (
              <article
                key={`${entry.speaker}-${index}`}
                className={`flex gap-3 rounded-2xl border p-3 ${
                  isAi
                    ? "border-[var(--border)] bg-[var(--surface)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isAi
                      ? "bg-[var(--surface)] text-[var(--foreground)]"
                      : "bg-[var(--surface)] text-[var(--foreground)]"
                  }`}
                >
                  {isAi ? "AI" : "You"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    <span>{isAi ? "AI interviewer" : "Candidate"}</span>
                    <time>
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  <p
                    className={`text-sm leading-6 ${
                      entry.isPartial
                        ? "italic text-[var(--muted)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {entry.text}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
