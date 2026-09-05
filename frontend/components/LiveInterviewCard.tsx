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
  if (value > 55) return "from-indigo-400 to-indigo-500";
  return "from-amber-400 to-orange-400";
};

const MicIcon = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-4 w-4 ${active ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"}`}
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
  const [remainingSeconds, setRemainingSeconds] = useState(timeRemainingSeconds);
  const [metrics, setMetrics] = useState({ pace: 74, clarity: 81, confidence: 78 });
  const [waveSeed, setWaveSeed] = useState(0);

  useEffect(() => {
    setRemainingSeconds(timeRemainingSeconds);
  }, [timeRemainingSeconds]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const metricsTimer = window.setInterval(() => {
      setMetrics((prev) => ({
        pace: Math.min(98, Math.max(42, prev.pace + (Math.random() > 0.5 ? 1 : -1) * 8)),
        clarity: Math.min(98, Math.max(46, prev.clarity + (Math.random() > 0.5 ? 1 : -1) * 7)),
        confidence: Math.min(99, Math.max(50, prev.confidence + (Math.random() > 0.5 ? 1 : -1) * 9)),
      }));
      setWaveSeed((prev) => prev + 1);
    }, 1600);

    return () => window.clearInterval(metricsTimer);
  }, []);

  const progressPercent = ((questionNumber - 1) / Math.max(totalQuestions, 1)) * 100;
  const safeProgress = Math.min(100, Math.max(8, progressPercent));

  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_50px_-22px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 sm:p-5">
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
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.18)] animate-pulse" />
          Live
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {isListening && (
              <span className="absolute inset-0 rounded-full border border-emerald-400/80 animate-[livePulse_1.8s_ease-out_infinite]" />
            )}
            <MicIcon active={isListening} />
          </div>

          {isListening && (
            <div className="flex h-5 items-end gap-1">
              {[0.45, 0.65, 0.8, 1, 0.7, 0.9].map((scale, index) => (
                <span
                  key={`${scale}-${waveSeed}-${index}`}
                  className="block w-1.5 rounded-full bg-emerald-500/90"
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
          <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{role}</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-indigo-500/15 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300">
          {interviewMode}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5 shadow-inner shadow-slate-100/70 dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-slate-950/40 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20">
            AI
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Interviewer
            </p>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-700 dark:text-slate-200 sm:text-[15px]">
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
          <div key={metric.label} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(metric.value)} transition-all duration-700 ease-out`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <BranchIcon />
        </span>
        <span>May ask a follow-up based on your answer.</span>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <span>Question {questionNumber} of {totalQuestions}</span>
              <span>{formatTime(remainingSeconds)}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
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
      <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
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
