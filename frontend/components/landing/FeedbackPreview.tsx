"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

const notes = {
  Summary: "A thoughtful answer with a clear sense of ownership. Your example made the challenge easy to understand. A sharper ending will make the impact even stronger.",
  Strengths: "You explained your decisions clearly, used a specific example, and kept a steady speaking pace. Your contribution was easy to follow.",
  Improvements: "Give the outcome a little more room. Replace general statements with one concrete result, and pause briefly between your main ideas.",
  "Next steps": "Try the answer once more. Lead with your main point, keep the context short, and finish with the result and what you learned.",
};
type Tab = keyof typeof notes;
const tabs = Object.keys(notes) as Tab[];

export function FeedbackPreview() {
  const [active, setActive] = useState<Tab>("Summary");
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(tabs[next]);
    refs.current[next]?.focus();
  }

  return (
    <div className="feedback-preview surface-card" id="feedback-format" aria-label="Illustrative interview feedback">
      <div className="feedback-preview-heading"><span className="eyebrow">YOUR SESSION, REFLECTED</span><span className="sample-label">Example</span></div>
      <div className="feedback-tabs" role="tablist" aria-label="Example feedback sections">
        {tabs.map((tab, index) => <button key={tab} type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={active === tab} aria-controls={`${id}-panel`} tabIndex={active === tab ? 0 : -1} ref={(element) => { refs.current[index] = element; }} onKeyDown={(event) => navigate(event, index)} onClick={() => setActive(tab)} className={`glass-button glass-button--ghost ${active === tab ? "is-selected" : ""}`}>{tab}</button>)}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tabs.indexOf(active)}`} tabIndex={0} className="feedback-preview-content"><h3>{active === "Summary" ? "A strong start. A clearer next step." : active}</h3><p>{notes[active]}</p></div>
      <div className="feedback-score-label"><span>Overall score</span><span><strong>8.2</strong> / 10</span></div>
      <div className="feedback-score-track" role="progressbar" aria-label="Example overall score" aria-valuemin={0} aria-valuemax={10} aria-valuenow={8.2}><span /></div>
      <div className="feedback-tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 18h6m-5 3h4M8.5 14.5a6 6 0 1 1 7 0c-1 .7-1.5 1.5-1.5 3.5h-4c0-2-.5-2.8-1.5-3.5Z" /></svg><p><strong>One thing to try</strong>Close with a specific result. Small details make your impact memorable.</p></div>
    </div>
  );
}
