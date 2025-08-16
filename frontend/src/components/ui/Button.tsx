import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "ghost"
    | "gradient"
    | "solid";
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  isLoading = false,
  icon,
  iconPosition = "left",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "relative font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-3 overflow-hidden group whitespace-nowrap";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 shadow-purple hover:shadow-glow active:scale-95",
    secondary:
      "bg-surface-700 text-dark-100 hover:bg-surface-600 border border-surface-600 hover:border-surface-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/25 active:scale-95",
    outline:
      "border-2 border-primary-600 text-primary-400 hover:bg-primary-600 hover:text-white hover:shadow-glow",
    ghost: "text-dark-300 hover:text-white hover:bg-surface-700",
    gradient:
      "bg-gradient-primary text-white shadow-glow hover:shadow-glow-lg active:scale-95 relative overflow-hidden",
    solid:
      "bg-primary-600 text-white hover:bg-primary-700 border border-primary-500 shadow-lg hover:shadow-primary-500/25 active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px] min-w-[100px] sm:min-w-[120px]",
    md: "px-4 py-2.5 sm:px-5 sm:py-3 text-sm min-h-[40px] sm:min-h-[44px] min-w-[120px] sm:min-w-[140px]",
    lg: "px-5 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base min-h-[48px] sm:min-h-[52px] min-w-[140px] sm:min-w-[160px]",
    xl: "px-6 py-3.5 sm:px-8 sm:py-4 text-base sm:text-lg min-h-[56px] sm:min-h-[60px] min-w-[200px] sm:min-w-[240px]",
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}
