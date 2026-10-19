import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`transform-gpu rounded-[28px] border border-white/10 bg-[#151917]/85 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 [transform:perspective(900px)_translateZ(0)] hover:border-[#c9f55a]/20 hover:[transform:perspective(900px)_translateY(-4px)] hover:shadow-[0_28px_65px_rgba(0,0,0,0.3)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
