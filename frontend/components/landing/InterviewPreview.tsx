"use client";

import { GrillrBrand } from "@/components/GrillrLogo";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";

const heights = [8, 13, 20, 12, 28, 37, 21, 46, 32, 19, 39, 54, 28, 43, 60, 37, 23, 49, 33, 56, 40, 25, 44, 31, 20, 36, 24, 17, 27, 12, 21, 9];

export function InterviewPreview() {
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  return (
    <div className="laptop-scene" aria-label="Interactive illustration of a Grillr practice room">
      <div className="laptop-halo" aria-hidden="true" />
      <div className="laptop-device">
        <div className="laptop-screen">
          <div className="laptop-camera" aria-hidden="true" />
          <div className="preview-toolbar"><GrillrBrand size={20} tagline={false} className="preview-brand" /><span className="preview-time">04:32</span><span className="preview-live"><i />{ended ? "Finished" : paused ? "Paused" : "Live"}</span></div>
          <div className="preview-question"><span className="eyebrow">{ended ? "A LITTLE MORE READY" : "QUESTION 02 / 05"}</span><h2>{ended ? "Every answer is a step forward." : "Tell me about a challenge you turned into an opportunity."}</h2><p>{ended ? "Your next conversation starts with practice." : "Take a breath. There’s room to think."}</p></div>
          <div className={`preview-waveform ${paused || ended || muted ? "is-paused" : ""}`} aria-hidden="true">{heights.map((height, index) => <span key={index} style={{ "--bar-height": `${height}px`, "--bar-delay": `${index * -91}ms` } as CSSProperties} />)}</div>
          <p className="preview-listening" role="status">{ended ? "Demo complete" : paused ? "Take your time" : muted ? "Microphone muted in this demo" : "Listening to your answer…"}</p>
          <div className="preview-controls">
            {ended ? <Button variant="secondary" size="sm" onClick={() => { setEnded(false); setPaused(false); setMuted(false); }}>Replay preview</Button> : <>
              <Button variant="icon" size="sm" aria-label={muted ? "Unmute demo microphone" : "Mute demo microphone"} aria-pressed={muted} onClick={() => setMuted(!muted)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />{muted ? <path d="m3 3 18 18" /> : null}</svg></Button>
              <Button variant="icon" size="sm" aria-label={paused ? "Resume demo" : "Pause demo"} aria-pressed={paused} onClick={() => setPaused(!paused)}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused ? <path d="m8 5 11 7-11 7Z" /> : <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>}</svg></Button>
              <Button variant="secondary" size="sm" onClick={() => setEnded(true)}><span className="preview-stop" aria-hidden="true" />End</Button>
            </>}
          </div>
        </div>
        <div className="laptop-base" aria-hidden="true"><span /></div>
      </div>
      <div className="laptop-caption"><span />A space to find your voice.</div>
    </div>
  );
}
