import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b77c4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4efe9] disabled:pointer-events-none disabled:opacity-60 active:translate-y-px";

  const variants = {
    primary:
      "border border-[#1f1f1f] bg-[#1f1f1f] text-[#f7f3ee] shadow-[0_14px_28px_rgba(17,24,39,0.16)] hover:-translate-y-0.5 hover:bg-[#2b2b2b]",
    secondary:
      "border border-[#e7d7c5] bg-white/85 text-[#1b2430] shadow-[0_10px_22px_rgba(18,24,39,0.05)] hover:-translate-y-0.5 hover:border-[#d7b99a] hover:bg-[#fffaf5]",
    ghost: "text-[#2d3847] hover:bg-[#f0e4d9]",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
