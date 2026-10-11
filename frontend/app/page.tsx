"use client";

import Link from "next/link";
import { useState } from "react";

const proofPoints = ["Built for real interviews", "Voice-first practice", "Honest feedback"];

function GrillrMark() {
  return <svg viewBox="0 0 56 56" aria-hidden="true" className="grillr-home-mark"><path d="M39 16c-3.1-3.2-7.5-5-12.1-5-9.4 0-17 7.6-17 17s7.6 17 17 17c4.6 0 9-1.8 12.1-5" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" /><path d="M18.5 24v8M23.5 20v16M28.5 17v22" stroke="#f4a261" strokeWidth="2.7" strokeLinecap="round" opacity=".9" /><circle cx="39" cy="28" r="2.8" fill="#f4a261" /></svg>;
}

function Waveform() {
  return <div className="grillr-waveform" aria-hidden="true">{[18, 30, 48, 26, 56, 36, 22, 42, 62, 34, 20, 44, 28, 52, 24, 38, 18, 30].map((height, index) => <span key={`${height}-${index}`} style={{ height }} />)}</div>;
}

export default function HomePage() {
  const [isListening, setIsListening] = useState(true);

  return (
    <main className="grillr-homepage">
      <nav className="grillr-home-nav" aria-label="Homepage navigation">
        <Link href="/" className="grillr-home-brand" aria-label="Grillr home"><span className="grillr-home-logo"><GrillrMark /></span><span>GRILLR</span></Link>
        <div className="grillr-home-links">
          <a href="#method">Method</a><a href="#stories">Stories</a><a href="#pricing">Pricing</a>
        </div>
        <div className="grillr-home-actions"><Link href="/login" className="grillr-home-login">Log in</Link><Link href="/signup" className="grillr-home-cta">Begin for free <span aria-hidden="true">???</span></Link></div>
      </nav>

      <section className="grillr-hero" aria-labelledby="hero-heading">
        <div className="grillr-hero-copy">
          <p className="grillr-eyebrow"><span className="grillr-eyebrow-dot" />The interview room, reimagined</p>
          <h1 id="hero-heading">Practice the part no one can rehearse for you.</h1>
          <p className="grillr-hero-lede">A deeply responsive interview simulator that listens, follows up, and helps you sound unmistakably ready.</p>
          <div className="grillr-hero-actions"><Link href="/signup" className="grillr-primary-button">Start practicing <span aria-hidden="true">???</span></Link><a href="#method" className="grillr-text-link">See how it works <span aria-hidden="true">???</span></a></div>
        </div>

        <div className="grillr-room" aria-label="Interview room preview">
          <div className="grillr-room-glow" />
          <div className="grillr-room-top"><span className="grillr-room-label">LIVE SESSION / 03</span><span className="grillr-room-time">00:42:18</span></div>
          <div className="grillr-interviewer">
            <div className={`grillr-orb ${isListening ? "is-listening" : ""}`}><div className="grillr-orb-core" /><div className="grillr-orb-ring" /></div>
            <div><p className="grillr-listening"><span />{isListening ? "Maya is listening" : "Maya is paused"}</p><p className="grillr-interviewer-role">AI interviewer ?? Product sense</p></div>
          </div>
          <div className="grillr-question"><span className="grillr-question-number">QUESTION 03</span><p>???Tell me about a time you made a difficult trade-off.???</p></div>
          <div className="grillr-response"><div className="grillr-response-meta"><span>Your response</span><span>{isListening ? "01:26" : "Paused"}</span></div><Waveform /><div className="grillr-response-controls"><span className="grillr-response-state"><i className={isListening ? "is-live" : ""} />{isListening ? "Listening to your answer" : "Response paused"}</span><button type="button" className="grillr-pause-button" onClick={() => setIsListening((value) => !value)} aria-label={isListening ? "Pause response" : "Resume response"}>{isListening ? "???" : "???"}</button></div></div>
        </div>
      </section>

      <section className="grillr-proof-row" aria-label="Grillr benefits">{proofPoints.map((point) => <div key={point}><span className="grillr-proof-check">???</span>{point}</div>)}</section>

      <section id="method" className="grillr-method" aria-labelledby="method-heading"><div><p className="grillr-eyebrow">A better kind of preparation</p><h2 id="method-heading">The room gets smarter<br /><em>when you do.</em></h2></div><p>Grillr turns the messy, human parts of interviewing into a practice loop you can return to. Speak naturally. Get challenged. Learn exactly what to change next.</p></section>
      <section id="stories" className="grillr-story-strip"><p>???The first time an AI interview felt like an actual conversation.???</p><span>??? Early Grillr tester, Product Manager</span></section>
      <section id="pricing" className="grillr-pricing"><span>READY WHEN YOU ARE</span><h2>Your next great answer<br />starts with a first try.</h2><Link href="/signup" className="grillr-primary-button">Begin for free <span aria-hidden="true">???</span></Link></section>
    </main>
  );
}
