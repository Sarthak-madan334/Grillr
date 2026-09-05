import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`transform-gpu rounded-[28px] border border-[#e7d8c5] bg-[rgba(255,255,255,0.78)] shadow-[0_18px_50px_rgba(120,92,68,0.08)] backdrop-blur-md transition-[transform,box-shadow] duration-300 [transform:perspective(900px)_translateZ(0)] hover:[transform:perspective(900px)_translateY(-6px)_rotateX(1deg)_rotateY(-1deg)] hover:shadow-[0_28px_65px_rgba(120,92,68,0.16)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
