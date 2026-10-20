import React, { useEffect, useState } from "react";

export interface LiveInterviewCardProps {
  role: string;
  interviewMode: "Behavioral" | "Technical" | "System Design";
  question: string;
  questionNumber: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  isListening: boolean;
  onRetry: () => void;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getLevelColor = (value: number) => {
  if (value > 75) return "from-emerald-400 to-emerald-500";
  if (value > 55) return "from-[var(--foreground)] to-[var(--foreground)]";
  return "from-[var(--warning)] to-[var(--warning)]";
};

const MicIcon = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-4 w-4 ${active ? "text-[var(--success)]" : "text-[var(--muted)] dark:text-[var(--muted)]"}`}
    aria-hidden="true"
  >
    <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
    <path d="M19 11a7 7 0 0 1-14 0" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
  </svg>
);

const BranchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 6h8" />
    <path d="M18 8v8" />
    <path d="M8 7l8 9" />
  </svg>
);

const RotateIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export default function LiveInterviewCard({
  role,
  interviewMode,
  question,
  questionNumber,
  totalQuestions,
  timeRemainingSeconds,
  isListening,
  onRetry,
}: LiveInterviewCardProps) {
  const [metrics, setMetrics] = useState({
    pace: 74,
    clarity: 81,
    confidence: 78,
  });
  const [waveSeed, setWaveSeed] = useState(0);

  useEffect(() => {
    const metricsTimer = window.setInterval(() => {
      setMetrics((prev) => ({
        pace: Math.min(
          98,
          Math.max(42, prev.pace + (Math.random() > 0.5 ? 1 : -1) * 8),
        ),
        clarity: Math.min(
          98,
          Math.max(46, prev.clarity + (Math.random() > 0.5 ? 1 : -1) * 7),
        ),
        confidence: Math.min(
          99,
          Math.max(50, prev.confidence + (Math.random() > 0.5 ? 1 : -1) * 9),
        ),
      }));
      setWaveSeed((prev) => prev + 1);
    }, 1600);

    return () => window.clearInterval(metricsTimer);
  }, []);

  const progressPercent =
    ((questionNumber - 1) / Math.max(totalQuestions, 1)) * 100;
  const safeProgress = Math.min(100, Math.max(8, progressPercent));

  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-5">
      <style>{`
        @keyframes livePulse {
          0% { transform: scale(0.96); opacity: 0.45; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.45; }
        }

        @keyframes waveformFloat {
          0%, 100% { transform: scaleY(0.5); opacity: 0.55; }
          50% { transform: scaleY(1.15); opacity: 1; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--success)] bg-[var(--success-surface)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--success)] dark:border-[var(--success)] dark:bg-[var(--success-surface)] dark:text-[var(--success)]">
          <span className="h-2 w-2 rounded-full bg-[var(--success-surface)] shadow-[var(--shadow-soft)] animate-pulse" />
          Live
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] dark:border-[var(--border)] dark:bg-[var(--surface)]">
            {isListening && (
              <span className="absolute inset-0 rounded-full border border-[var(--success)] animate-[livePulse_1.8s_ease-out_infinite]" />
            )}
            <MicIcon active={isListening} />
          </div>

          {isListening && (
            <div className="flex h-5 items-end gap-1">
              {[0.45, 0.65, 0.8, 1, 0.7, 0.9].map((scale, index) => (
                <span
                  key={`${scale}-${waveSeed}-${index}`}
                  className="block w-1.5 rounded-full bg-[var(--success-surface)]"
                  style={{
                    height: `${18 + scale * 18}px`,
                    animation: `waveformFloat 1.1s ease-in-out ${index * 0.12}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-[var(--foreground)] dark:text-[var(--muted)]">
            {role}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)]">
          {interviewMode}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-inner shadow-[var(--shadow-soft)] dark:border-[var(--border)] dark:bg-[var(--surface)] dark:shadow-[var(--shadow-soft)] sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground)] text-xs font-semibold text-[var(--foreground)] shadow-lg shadow-[var(--shadow-soft)]">
            AI
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] dark:text-[var(--muted)]">
              Interviewer
            </p>
            <p className="mt-2 text-base font-medium leading-relaxed text-[var(--foreground)] dark:text-[var(--muted)] sm:text-[15px]">
              {question}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Pace", value: metrics.pace },
          { label: "Clarity", value: metrics.clarity },
          { label: "Confidence", value: metrics.confidence },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 dark:border-[var(--border)] dark:bg-[var(--surface)]"
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] dark:text-[var(--muted)]">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface)] dark:bg-[var(--surface)]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(metric.value)} transition-all duration-700 ease-out`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] text-[var(--muted)] dark:text-[var(--muted)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success-surface)] text-[var(--success)] dark:bg-[var(--success-surface)] dark:text-[var(--success)]">
          <BranchIcon />
        </span>
        <span>May ask a follow-up based on your answer.</span>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-4 dark:border-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] dark:text-[var(--muted)]">
              <span>
                Question {questionNumber} of {totalQuestions}
              </span>
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)] dark:bg-[var(--surface)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--foreground)] via-[var(--foreground)] to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[11px] font-medium text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] active:scale-[0.98] dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)] dark:hover:border-[var(--border)] dark:hover:bg-[var(--surface)] dark:hover:text-[var(--foreground)]"
          >
            <RotateIcon />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/*
  Usage example:

  import LiveInterviewCard from "@/components/LiveInterviewCard";

  export default function DemoPage() {
    return (
      <div className="min-h-screen bg-[var(--surface)] p-6 dark:bg-[var(--surface)]">
        <LiveInterviewCard
          role="Software Engineer"
          interviewMode="Technical"
          question="Tell me about a time you optimized a slow system and how you measured the impact."
          questionNumber={2}
          totalQuestions={6}
          timeRemainingSeconds={92}
          isListening={true}
          onRetry={() => console.log("Retry answer")}
        />
      </div>
    );
  }
*/
