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
        className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left text-sm text-[var(--foreground)] outline-none backdrop-blur-sm transition focus:border-[var(--border)] focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        <span>{selectedOption.label}</span>
        <span
          aria-hidden="true"
          className={`ml-3 text-xs text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          &#9662;
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)] backdrop-blur-xl"
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
                data-active={isActive}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className="dropdown-option px-3 py-2.5 text-left font-medium"
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
