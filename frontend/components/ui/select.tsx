"use client";

import { useEffect, useId, useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id: string;
  name?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function Select({ id, name, value, options, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function openList() {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }

  function selectOption(index: number) {
    onChange(options[index].value);
    setActiveIndex(index);
    setIsOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (currentIndex) =>
          (currentIndex + direction + options.length) % options.length,
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!isOpen) openList();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#111513] px-3.5 py-3 text-left text-sm text-[#e9e9e1] outline-none backdrop-blur-sm transition focus:border-[#c9f55a]/60 focus:ring-2 focus:ring-[#c9f55a]/15"
      >
        <span>{selectedOption.label}</span>
        <span
          aria-hidden="true"
          className={`ml-3 text-xs text-[#a3a99b] transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          &#9662;
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#151917]/[0.98] p-1.5 text-sm text-[#e9e9e1] shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <button
                key={option.value}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={`w-full rounded-xl px-3 py-2.5 text-left font-medium transition-colors ${isActive || isSelected ? "bg-[#c9f55a]/10 text-[#d9f794]" : "text-[#b4b9af] hover:bg-white/[0.05] hover:text-[#f2f3ed]"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
