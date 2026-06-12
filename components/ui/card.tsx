import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div className={`bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 ${hover ? "hover:bg-zinc-800/80 hover:border-zinc-700 transition-colors duration-200" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}
