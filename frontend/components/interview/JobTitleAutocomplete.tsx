"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "../ui/input";
import { filterJobTitles } from "../../lib/job-titles";

type JobTitleAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
};

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const matchStart = title.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || matchStart < 0) return <>{title}</>;

  const matchEnd = matchStart + query.trim().length;
  return <>{title.slice(0, matchStart)}<strong className="font-semibold text-[#4f5f9c]">{title.slice(matchStart, matchEnd)}</strong>{title.slice(matchEnd)}</>;
}

export function JobTitleAutocomplete({ value, onChange }: JobTitleAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const suggestions = useMemo(() => filterJobTitles(value), [value]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectTitle(title: string) {
    onChange(title);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!suggestions.length) return;
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.length) return;
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      selectTitle(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const showSuggestions = isOpen && value.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        id="jobTitle"
        name="jobTitle"
        value={value}
        onChange={(event) => { onChange(event.target.value); setActiveIndex(-1); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Software Engineer"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-activedescendant={showSuggestions && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        className="min-h-12 rounded-xl border-[#d9d7ed] bg-[#fffefd] text-[#201a17] shadow-none transition-colors hover:border-[#b9b5d0] focus:border-[#8f98cf] focus:ring-2 focus:ring-[#e7e8f7] motion-reduce:transition-none"
      />
      {showSuggestions ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-[#e4e1ee] bg-[#fffefd] shadow-[0_12px_28px_rgba(78,69,101,0.12)] motion-safe:animate-[fade-in_120ms_ease-out]" role="presentation">
          {suggestions.length ? (
            <ul id={listboxId} role="listbox" aria-label="Suggested job titles" className="max-h-64 overflow-y-auto p-1.5">
              {suggestions.map((title, index) => (
                <li key={title} id={`${listboxId}-option-${index}`} role="option" aria-selected={index === activeIndex}>
                  <button type="button" className={`flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-[#3f3833] transition-colors motion-reduce:transition-none ${index === activeIndex ? "bg-[#f1f0f8] text-[#28243d]" : "hover:bg-[#f7f5fa]"}`} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectTitle(title)}>
                    <HighlightedTitle title={title} query={value} />
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="px-4 py-3 text-sm text-[#8d8178]">No matching roles</p>}
        </div>
      ) : null}
    </div>
  );
}