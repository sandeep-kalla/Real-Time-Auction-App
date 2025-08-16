import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "primary"
    | "live"
    | "ended";
  className?: string;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function Badge({
  children,
  variant = "default",
  className,
  size = "md",
  glow = false,
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center font-medium rounded-xl transition-all duration-300";

  const variants = {
    default: "bg-surface-700 text-dark-200 border border-surface-600",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    primary: "bg-primary-500/20 text-primary-400 border border-primary-500/30",
    live: "bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse-glow",
    ended: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const glowClass = glow ? "shadow-glow" : "";

  return (
    <span
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        glowClass,
        className
      )}
    >
      {children}
    </span>
  );
}
