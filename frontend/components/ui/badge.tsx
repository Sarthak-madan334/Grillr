import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#e8d8c8] bg-[#f8efe7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f503d] ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
