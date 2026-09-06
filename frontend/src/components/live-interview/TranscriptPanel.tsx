import type { TranscriptEntry } from "@/lib/realtime";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  return (
    <section
      className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)] md:p-5"
      aria-live="polite"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
            Transcript
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Live response
          </h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
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
                    ? "border-slate-200 bg-slate-50"
                    : "border-indigo-100 bg-indigo-50/70"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isAi
                      ? "bg-slate-900 text-white"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {isAi ? "AI" : "You"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">
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
                        ? "italic text-slate-500"
                        : "text-slate-700"
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
