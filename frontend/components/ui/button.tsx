import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function GlassButton({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`glass-button glass-button--${variant} glass-button--${size} ${className}`}
    >
      {loading ? <span className="glass-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

// Keep existing consumers and their behavior unchanged.
export const Button = GlassButton;
