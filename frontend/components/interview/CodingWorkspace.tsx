"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const languages = ["TypeScript", "JavaScript", "Python", "Java"] as const;
type CodingLanguage = (typeof languages)[number];

const starterCode: Record<CodingLanguage, string> = {
  TypeScript: "function solution(input: unknown): unknown {\n  // Write your solution here\n}\n",
  JavaScript: "function solution(input) {\n  // Write your solution here\n}\n",
  Python: "def solution(input):\n    # Write your solution here\n    pass\n",
  Java: "class Solution {\n    // Write your solution here\n}\n",
};

type SavedDraft = { code: string; language: CodingLanguage };

export function CodingWorkspace({ questionId }: { questionId: string }) {
  const [language, setLanguage] = useState<CodingLanguage>("TypeScript");
  const [code, setCode] = useState(starterCode.TypeScript);
  const [loadedQuestionId, setLoadedQuestionId] = useState("");
  const [saveState, setSaveState] = useState("Draft saves on this device");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let saved: SavedDraft | null = null;
    try {
      const value = localStorage.getItem(`grillr:coding-draft:${questionId}`);
      saved = value ? (JSON.parse(value) as SavedDraft) : null;
    } catch {
      saved = null;
    }
    const nextLanguage = saved && languages.includes(saved.language)
      ? saved.language
      : "TypeScript";
    const restoreTimer = window.setTimeout(() => {
      setLanguage(nextLanguage);
      setCode(typeof saved?.code === "string" ? saved.code : starterCode[nextLanguage]);
      setSaveState(saved ? "Draft restored from this device" : "Draft saves on this device");
      setLoadedQuestionId(questionId);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, [questionId]);

  useEffect(() => {
    if (loadedQuestionId !== questionId) return;
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(
          `grillr:coding-draft:${questionId}`,
          JSON.stringify({ code, language } satisfies SavedDraft),
        );
        setSaveState("Draft saved on this device");
      } catch {
        setSaveState("Draft is only available until you leave this page");
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [code, language, loadedQuestionId, questionId]);

  function handleTab(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const textarea = event.currentTarget;
    textarea.setRangeText("  ", textarea.selectionStart, textarea.selectionEnd, "end");
    setCode(textarea.value);
  }

  function syncGutter() {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setSaveState("Code copied to clipboard");
    } catch {
      setSaveState("Clipboard unavailable; select the code to copy it");
    }
  }

  function resetCode() {
    setCode(starterCode[language]);
    setSaveState("Starter code restored");
    textareaRef.current?.focus();
  }

  return (
    <section className="coding-workspace" aria-labelledby="coding-workspace-title">
      <header className="coding-workspace-header">
        <div>
          <p className="interview-overline">Technical exercise</p>
          <h3 id="coding-workspace-title">Code workspace</h3>
        </div>
        <div className="coding-workspace-actions">
          <label className="coding-language-label" htmlFor={`coding-language-${questionId}`}>Language</label>
          <select
            id={`coding-language-${questionId}`}
            value={language}
            onChange={(event) => setLanguage(event.target.value as CodingLanguage)}
            className="coding-language-select"
          >
            {languages.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" className="coding-tool-button" onClick={() => void copyCode()}>Copy</button>
          <button type="button" className="coding-tool-button" onClick={resetCode}>Reset</button>
        </div>
      </header>
      <div className="coding-editor">
        <div className="coding-editor-gutter" ref={gutterRef} aria-hidden="true">
          {code.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={handleTab}
          onScroll={syncGutter}
          aria-label={`${language} code editor`}
          aria-describedby={`coding-workspace-note-${questionId}`}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="coding-editor-input"
        />
      </div>
      <footer className="coding-workspace-footer">
        <p id={`coding-workspace-note-${questionId}`}>Your code draft stays in this browser. Explain your approach aloud for interview feedback.</p>
        <span role="status" aria-live="polite">{saveState}</span>
      </footer>
    </section>
  );
}
