export function ScoreBar({ value }: { value: number }) {
  const progress = Math.min(100, Math.max(0, value));
  return <div className="result-score"><div className="feedback-score-label"><span>Overall score</span><span><strong>{value}</strong> / 100</span></div><div className="feedback-score-track" role="progressbar" aria-label="Overall interview score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div></div>;
}
