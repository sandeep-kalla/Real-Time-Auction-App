import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "glass";
  size?: "sm" | "md" | "lg";
}

export function Input({
  label,
  error,
  className,
  icon,
  iconPosition = "left",
  variant = "default",
  size = "md",
  ...props
}: InputProps) {
  const baseClasses =
    "block w-full rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-surface-800 border border-surface-600 text-dark-100 placeholder-dark-400 focus:border-primary-500 hover:border-surface-500",
    glass:
      "glass backdrop-blur-xl text-dark-100 placeholder-dark-400 focus:border-primary-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const paddingWithIcon = icon
    ? iconPosition === "left"
      ? "pl-10"
      : "pr-10"
    : "";

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-dark-200">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={cn(
              "absolute inset-y-0 flex items-center pointer-events-none text-dark-400",
              iconPosition === "left" ? "left-3" : "right-3"
            )}
          >
            <div className={iconSizes[size]}>{icon}</div>
          </div>
        )}
        <input
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            paddingWithIcon,
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
