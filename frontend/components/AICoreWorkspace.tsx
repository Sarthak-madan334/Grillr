"use client";

import { useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  code?: string;
};

const starterMessages: Message[] = [
  { role: "assistant", content: "I’m ready to help you shape a stronger interview answer. What would you like to practice?" },
  { role: "user", content: "Help me turn a technical project into a concise STAR answer." },
  { role: "assistant", content: "Great prompt. Start with the outcome, then give just enough technical detail to make your contribution clear. This structure keeps the answer focused:", code: `const answer = {
  situation: "Set the context in one sentence",
  task: "Name the responsibility you owned",
  action: "Explain the decisions you made",
  result: "Close with measurable impact",
};` },
];

function Icon({ name }: { name: "spark" | "send" | "stop" | "plus" | "copy" | "check" | "chevron" | "sliders" | "trash" | "alert" }) {
  const paths = {
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    send: <path d="m4 4 16 8-16 8 3-8-3-8Zm3 8h13" />,
    stop: <rect x="7" y="7" width="10" height="10" rx="1" />,
    plus: <path d="M12 5v14M5 12h14" />,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="18" r="2" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    alert: <><path d="M12 4 21 20H3L12 4Z" /><path d="M12 10v4M12 17h.01" /></>,
  };
  return <svg aria-hidden="true" className="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copyCode() {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <div className="ai-code-block"><div className="ai-code-heading"><span>typescript</span><button type="button" onClick={copyCode} aria-label="Copy code"><Icon name={copied ? "check" : "copy"} /> {copied ? "Copied" : "Copy"}</button></div><pre><code>{code}</code></pre></div>;
}

function MessageContent({ message }: { message: Message }) {
  return <><p>{message.content}</p>{message.code ? <CodeBlock code={message.code} /> : null}</>;
}

export function AICoreWorkspace() {
  const [messages, setMessages] = useState(starterMessages);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showError, setShowError] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const generationTimer = useRef<number | null>(null);

  function submitPrompt() {
    const value = prompt.trim();
    if (!value || isGenerating) return;
    setMessages((current) => [...current, { role: "user", content: value }]);
    setPrompt("");
    setIsGenerating(true);
    generationTimer.current = window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", content: "I’ll work with that. Try leading with the measurable result, then connect it to the decision you made." }]);
      setIsGenerating(false);
    }, 900);
  }

  function stopGeneration() {
    if (generationTimer.current !== null) window.clearTimeout(generationTimer.current);
    generationTimer.current = null;
    setIsGenerating(false);
  }

  function clearConversation() {
    setMessages([]);
    setShowError(false);
  }

  async function copyJson() {
    const value = JSON.stringify({ model: "Atlas 2.1", temperature: 0.4, max_tokens: 1200 }, null, 2);
    await navigator.clipboard?.writeText(value);
    setCopiedJson(true);
    window.setTimeout(() => setCopiedJson(false), 1600);
  }

  return <main className="ai-core-shell"><div className="ai-core-container">
    <header className="ai-core-header"><div><div className="ai-eyebrow"><span className="ai-live-dot" /> AI Core <span className="ai-eyebrow-divider" /> Workspace</div><h1>Build better answers, in real time.</h1><p>Shape prompts, compare model output, and keep your interview context close.</p></div><div className="ai-header-actions"><span className="ai-status-pill"><span className="ai-status-dot" /> All systems operational</span><button type="button" className="ai-icon-button" aria-label="Workspace settings"><Icon name="sliders" /></button></div></header>
    <div className="ai-workspace-grid"><section className="ai-conversation-panel" aria-label="AI conversation"><div className="ai-panel-toolbar"><div><p className="ai-panel-kicker">Live session</p><h2>Interview answer lab</h2></div><button type="button" className="ai-text-button" onClick={clearConversation}><Icon name="trash" /> Clear</button></div><div className="ai-message-list" aria-live="polite">{messages.length === 0 ? <div className="ai-empty-state"><div className="ai-empty-icon"><Icon name="spark" /></div><h3>Start with a question</h3><p>Ask for a rewrite, a follow-up, or a sharper way to explain your experience.</p></div> : messages.map((message, index) => <article className={`ai-message ai-message-${message.role}`} key={`${message.role}-${index}`}><div className="ai-message-avatar">{message.role === "assistant" ? <Icon name="spark" /> : "You"}</div><div className="ai-message-body"><div className="ai-message-meta"><strong>{message.role === "assistant" ? "Atlas" : "You"}</strong><span>{message.role === "assistant" ? "AI Core" : "Just now"}</span></div><MessageContent message={message} /></div></article>)}{isGenerating ? <article className="ai-message ai-message-assistant"><div className="ai-message-avatar"><Icon name="spark" /></div><div className="ai-message-body"><div className="ai-message-meta"><strong>Atlas</strong><span>Generating</span></div><div className="ai-typing"><span /><span /><span /></div></div></article> : null}</div>{showError ? <div role="alert" className="ai-error-banner"><Icon name="alert" /><div><strong>Generation paused</strong><span>The model took too long to respond. Check your connection and try again.</span></div><button type="button" onClick={() => setShowError(false)}>Retry</button></div> : null}<div className="ai-composer-wrap"><div className="ai-composer"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitPrompt(); } }} placeholder="Ask Atlas anything about your interview..." aria-label="Message AI Core" rows={1} /><div className="ai-composer-footer"><button type="button" className="ai-attach-button" aria-label="Attach context"><Icon name="plus" /><span>Add context</span></button><span className="ai-shortcut">Enter to send <kbd>Shift</kbd> <span>+</span> <kbd>Enter</kbd> for newline</span><button type="button" className="ai-send-button" onClick={isGenerating ? stopGeneration : submitPrompt} aria-label={isGenerating ? "Stop generation" : "Send message"}>{isGenerating ? <Icon name="stop" /> : <Icon name="send" />}</button></div></div><div className="ai-composer-note"><span className="ai-secure-mark">●</span> Your context is private to this workspace</div></div></section>
      <aside className="ai-control-rail" aria-label="Model controls"><div className="ai-rail-section"><div className="ai-rail-heading"><span>Model</span><span className="ai-model-badge">PRO</span></div><button type="button" className="ai-select-control"><span className="ai-model-orb">A</span><span className="ai-select-copy"><strong>Atlas 2.1</strong><small>Fast · 128k context</small></span><Icon name="chevron" /></button></div><div className="ai-rail-divider" /><div className="ai-rail-section"><div className="ai-rail-heading"><span>System prompt</span><button type="button" className="ai-help-button" aria-label="About system prompts">?</button></div><button type="button" className="ai-select-control ai-prompt-select"><span className="ai-prompt-mark">✦</span><span className="ai-select-copy"><strong>Interview coach</strong><small>Focused and constructive</small></span><Icon name="chevron" /></button><button type="button" className="ai-add-prompt"><Icon name="plus" /> Create prompt</button></div><div className="ai-rail-divider" /><div className="ai-rail-section"><div className="ai-rail-heading"><span>Generation</span><span className="ai-tuning-label">Balanced</span></div><label className="ai-slider-label" htmlFor="temperature"><span>Temperature</span><output>0.4</output></label><input id="temperature" className="ai-slider" type="range" min="0" max="1" step="0.1" defaultValue="0.4" /><div className="ai-slider-ends"><span>Precise</span><span>Creative</span></div><label className="ai-slider-label ai-token-label" htmlFor="tokens"><span>Max tokens</span><output>1,200</output></label><input id="tokens" className="ai-slider" type="range" min="200" max="2000" step="100" defaultValue="1200" /></div><div className="ai-rail-divider" /><div className="ai-rail-section"><div className="ai-rail-heading"><span>Context payload</span><button type="button" className="ai-copy-json" onClick={copyJson}><Icon name={copiedJson ? "check" : "copy"} /> {copiedJson ? "Copied" : "JSON"}</button></div><div className="ai-json-viewer"><span className="json-brace">&#123;</span><span><b>model</b>: <em>&quot;Atlas 2.1&quot;</em>,</span><span><b>temperature</b>: <i>0.4</i>,</span><span><b>max_tokens</b>: <i>1200</i></span><span className="json-brace">&#125;</span></div></div></aside></div>
    <footer className="ai-footer-meta"><span><span className="ai-pulse-dot" /> Streaming ready</span><span>Session autosaves</span><span>v2.4.0</span></footer>
  </div></main>;
}