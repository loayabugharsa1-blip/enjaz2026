"use client";
import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm text-zinc-400">{label}</label>}
      <input
        id={id}
        className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
