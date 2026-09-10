import type { Answer } from "@/lib/interview-api";

type SpeechMetrics = NonNullable<Answer["speech_metrics"]>;

type SpeechAnalysisProps = {
  answer: Answer;
};

export function formatSpeechDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "Unavailable";

  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

export function createSpeechOverview(metrics: Answer["speech_metrics"], answerDurationSeconds: number) {
  void answerDurationSeconds;
  if (!metrics) return [] as Array<{ label: string; value: string; tone: "neutral" | "accent" }>;

  return [
    { label: "Speaking pace", value: `${Math.round(metrics.words_per_minute)} WPM`, tone: "neutral" as const },
    { label: "Speaking time", value: formatSpeechDuration(metrics.duration_seconds), tone: "neutral" as const },
    { label: "Filler words", value: `${metrics.filler_count}`, tone: metrics.filler_count > 0 ? ("accent" as const) : ("neutral" as const) },
    { label: "Pauses", value: `${metrics.pause_count}`, tone: metrics.pause_count > 0 ? ("accent" as const) : ("neutral" as const) },
  ];
}

export function buildSpeechInsight(metrics: Answer["speech_metrics"], answerDurationSeconds: number) {
  void answerDurationSeconds;
  if (!metrics) {
    return "Detailed timing metrics were not available for this answer, but your transcript and interview feedback are still available.";
  }

  const paceValue = Math.round(metrics.words_per_minute);
  const paceText = metrics.words_per_minute >= 170
    ? `Your pace was ${paceValue} WPM, so a slightly slower rhythm could make key points easier to follow.`
    : metrics.words_per_minute <= 100
      ? `Your pace was ${paceValue} WPM and measured; a little more energy could help keep the answer moving.`
      : `Your pace was ${paceValue} WPM and steady, which is a clear baseline for your next answer.`;
  const fillerText = metrics.filler_count > 0
    ? `${metrics.filler_count} filler words were detected; replacing them with short pauses may make your delivery more deliberate.`
    : "No filler words were detected, which helped keep the answer crisp.";
  const pauseText = metrics.pause_count > 0
    ? `${metrics.pause_count} significant pauses appeared during the answer.`
    : "The answer stayed fairly smooth without significant pauses.";
  const repetitionText = metrics.repetition_count > 0
    ? "Removing repeated points could make the response tighter."
    : "The response did not show repeated points in the available analysis.";

  return `${paceText} ${fillerText} ${pauseText} ${repetitionText}`;
}

function paceLabel(wpm: number) {
  if (wpm >= 170) return "Fast-paced";
  if (wpm <= 100) return "Slower pace";
  return "Steady pace";
}

function speechSummary(metrics: SpeechMetrics) {
  const pace = paceLabel(metrics.words_per_minute).toLowerCase();
  const actions = [
    metrics.filler_count > 0 ? "reducing filler words" : null,
    metrics.pause_count > 0 ? "using pauses intentionally" : null,
    metrics.repetition_count > 0 ? "tightening repeated points" : null,
  ].filter(Boolean);

  if (!actions.length) return `Your delivery had a ${pace} with a clean set of communication signals in this answer.`;
  return `Your delivery had a ${pace}. ${actions.join(", ")} could make your next answer sound more deliberate.`;
}

function Metric({ label, value, supporting, primary = false }: { label: string; value: string; supporting: string; primary?: boolean }) {
  return (
    <div className={primary ? "border-l-2 border-[#b8916d] pl-5" : "border-l border-[#e4d7c8] pl-4"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b715c]">{label}</p>
      <p className={`mt-2 font-semibold tracking-tight text-[#201a17] ${primary ? "text-4xl" : "text-2xl"}`}>{value}</p>
      <p className="mt-1 text-sm text-[#7a685b]">{supporting}</p>
    </div>
  );
}

function DetailStat({ label, value, unavailable = false }: { label: string; value: string; unavailable?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[#8b715c]">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${unavailable ? "text-[#9b8b7c]" : "text-[#201a17]"}`}>{value}</p>
    </div>
  );
}

function PaceScale({ wpm }: { wpm: number }) {
  const position = Math.min(96, Math.max(4, ((wpm - 70) / 130) * 100));
  return (
    <div aria-label={`${Math.round(wpm)} words per minute, ${paceLabel(wpm)}`} className="mt-5">
      <div className="relative h-2 rounded-full bg-[#eadfd3]">
        <div className="absolute inset-y-0 left-1/3 right-1/3 border-x border-[#d5c4b3]" aria-hidden="true" />
        <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#fffdf9] bg-[#a27c5b] shadow-[0_0_0_1px_#a27c5b]" style={{ left: `${position}%` }} aria-hidden="true" />
      </div>
      <div className="mt-3 flex justify-between text-xs text-[#8b715c]"><span>Slower pace</span><span>Balanced</span><span>Faster pace</span></div>
      <p className="mt-3 text-sm text-[#5e4d40]">{paceLabel(wpm)} at <strong className="font-semibold text-[#201a17]">{Math.round(wpm)} WPM</strong></p>
    </div>
  );
}

function InsightList({ metrics }: { metrics: SpeechMetrics }) {
  const insights = [
    metrics.words_per_minute >= 170
      ? "A slightly slower rhythm may give key points more room to land."
      : metrics.words_per_minute <= 100
        ? "A little more pace could help your answer feel more energetic."
        : "Your pace sat in a steady range that should be easy to follow.",
    metrics.filler_count > 0
      ? `Replacing ${metrics.filler_count} detected filler word${metrics.filler_count === 1 ? "" : "s"} with a short pause may make your delivery more deliberate.`
      : "No filler words were detected in the available transcript analysis.",
    metrics.repetition_count > 0
      ? `${metrics.repetition_count} repeated pattern${metrics.repetition_count === 1 ? "" : "s"} suggest one opportunity to make the answer tighter.`
      : "The available analysis did not detect repeated points.",
  ];

  return <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4f3d35]">{insights.map((insight) => <li key={insight} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8916d]" aria-hidden="true" />{insight}</li>)}</ul>;
}

export function SpeechAnalysis({ answer }: SpeechAnalysisProps) {
  const metrics = answer.speech_metrics;

  return (
    <section aria-labelledby="speech-analysis-heading" className="border-y border-[#e7d8c5] py-8 sm:py-10">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b715c]">Speech analysis</p>
        <h3 id="speech-analysis-heading" className="mt-2 text-2xl font-semibold tracking-tight text-[#201a17] sm:text-3xl">How effectively did you communicate?</h3>
        <p className="mt-3 text-sm leading-6 text-[#5e4d40]">Your speaking patterns during this answer, translated into a few practical signals.</p>
      </div>

      {!metrics ? (
        <div className="mt-8 border-l-2 border-[#d4c1ac] bg-[#fbf6ef] px-5 py-4 text-sm leading-6 text-[#5e4d40]">
          <p className="font-medium text-[#201a17]">Speech timing is unavailable for this answer.</p>
          <p className="mt-1">Your transcript and interview feedback are still available. We do not estimate speech metrics when timing data is missing.</p>
        </div>
      ) : (
        <>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#4f3d35]">{speechSummary(metrics)}</p>
          <div className="mt-8 grid gap-8 border-y border-[#eee3d8] py-7 sm:grid-cols-3">
            <Metric label="Speaking pace" value={`${Math.round(metrics.words_per_minute)} WPM`} supporting="Active speaking time" primary />
            <Metric label="Response duration" value={formatSpeechDuration(answer.duration)} supporting="Total answer duration" />
            <Metric label="Word count" value={String(metrics.word_count)} supporting="Words spoken" />
          </div>

          <div className="grid gap-8 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border border-[#e7d8c5] bg-[#fffdf9] p-5 sm:p-6">
              <h4 className="text-base font-semibold text-[#201a17]">Speaking pace</h4>
              <p className="mt-1 text-sm text-[#7a685b]">A simple view of your speaking rhythm.</p>
              <PaceScale wpm={metrics.words_per_minute} />
            </div>
            <div className="border border-[#e7d8c5] bg-[#fffdf9] p-5 sm:p-6">
              <h4 className="text-base font-semibold text-[#201a17]">Pause behavior</h4>
              <p className="mt-1 text-sm text-[#7a685b]">Significant pauses detected in the answer.</p>
              <div className="mt-6 grid grid-cols-2 gap-y-5"><DetailStat label="Significant pauses" value={String(metrics.pause_count)} /><DetailStat label="Total pause time" value="Unavailable" unavailable /><DetailStat label="Longest pause" value="Unavailable" unavailable /><DetailStat label="Pause timeline" value="Not recorded" unavailable /></div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 border-t border-[#eee3d8] pt-8 sm:grid-cols-2">
            <div>
              <h4 className="text-base font-semibold text-[#201a17]">Filler words</h4>
              <p className="mt-1 text-sm leading-6 text-[#7a685b]">{metrics.filler_count > 0 ? "Reducing filler words may make your answers sound more deliberate." : "No filler words were detected in the available analysis."}</p>
              <div className="mt-5 flex items-end gap-3"><span className="text-3xl font-semibold text-[#201a17]">{metrics.filler_count}</span><span className="pb-1 text-sm text-[#8b715c]">detected</span></div>
              <p className="mt-3 text-xs text-[#9b8b7c]">Most frequent terms are not returned by the current speech-analysis API.</p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#201a17]">Repetition</h4>
              <p className="mt-1 text-sm leading-6 text-[#7a685b]">Repeated patterns that may be worth tightening.</p>
              <div className="mt-5 flex items-end gap-3"><span className="text-3xl font-semibold text-[#201a17]">{metrics.repetition_count}</span><span className="pb-1 text-sm text-[#8b715c]">detected</span></div>
              <p className="mt-3 text-xs text-[#9b8b7c]">Repeated words and phrases are not returned individually by the current API.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 border-t border-[#eee3d8] pt-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h4 className="text-base font-semibold text-[#201a17]">Focus signal</h4>
              <p className="mt-1 text-sm leading-6 text-[#7a685b]">A calm coaching signal based on the available speech fields.</p>
              <p className="mt-4 text-lg font-semibold text-[#201a17]">{metrics.repetition_count > 0 || metrics.filler_count > 0 ? "Could be tighter" : "Focused"}</p>
              <p className="mt-2 text-sm leading-6 text-[#5e4d40]">{metrics.repetition_count > 0 || metrics.filler_count > 0 ? "Some repetition or filler usage was detected. The signal is directional, not a score of communication quality." : "The available signals suggest your answer stayed focused and structured."}</p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#201a17]">What this means</h4>
              <InsightList metrics={metrics} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
