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
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8916d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1ea] disabled:pointer-events-none disabled:opacity-60 active:translate-y-[1px]";

  const variants = {
    primary:
      "bg-[#2d241d] text-[#f9f5f1] hover:bg-[#1f1915] shadow-[0_10px_24px_rgba(45,36,29,0.2)] border border-[#2d241d]",
    secondary:
      "bg-white/85 text-[#2d241d] hover:bg-[#fffaf4] border border-[#e7d8c5] shadow-[0_8px_20px_rgba(156,125,93,0.08)]",
    ghost: "text-[#473a2d] hover:bg-[#eadcc8]/60",
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
