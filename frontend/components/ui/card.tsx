import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`transform-gpu rounded-[28px] border border-[#e8d9ca] bg-[rgba(255,255,255,0.75)] shadow-[0_20px_52px_rgba(17,24,39,0.06)] backdrop-blur-md transition-all duration-300 [transform:perspective(900px)_translateZ(0)] hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(17,24,39,0.09)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
