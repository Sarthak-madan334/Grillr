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
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9f55a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d0c] disabled:pointer-events-none disabled:opacity-55 active:translate-y-[1px]";

  const variants = {
    primary:
      "bg-[#c9f55a] text-[#15190e] hover:bg-[#d8ff79] shadow-[0_10px_24px_rgba(179,218,79,0.12)] border border-[#c9f55a]",
    secondary:
      "bg-white/[0.04] text-[#e5e7e0] hover:bg-white/[0.09] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.14)]",
    ghost: "text-[#c1c5bc] hover:bg-white/[0.06]",
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
