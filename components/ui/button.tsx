"use client";
import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "default" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#dc2626] hover:bg-[#b91c1c] text-white",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100",
  ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300",
  danger: "bg-red-900/50 hover:bg-red-800 text-red-300 border border-red-800",
};

const sizes: Record<Size, string> = {
  default: "px-4 py-2",
  small: "px-3 py-1.5 text-sm",
};

export function Button({ variant = "primary", size = "default", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
