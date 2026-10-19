import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-2xl border border-white/10 bg-[#111513] px-3.5 py-3 text-sm text-[#e9e9e1] shadow-sm outline-none transition placeholder:text-[#888f83] focus:border-[#c9f55a]/60 focus:ring-2 focus:ring-[#c9f55a]/15 ${className}`}
      {...props}
    />
  );
}
