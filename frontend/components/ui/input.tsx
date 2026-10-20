import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`field-input w-full px-3.5 py-3 text-sm ${className}`}
      {...props}
    />
  );
}
