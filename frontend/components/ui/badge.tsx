import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--muted)] ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
