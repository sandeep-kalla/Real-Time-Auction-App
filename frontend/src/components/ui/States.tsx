import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "gradient";
}

export function Spinner({
  size = "md",
  className,
  variant = "default",
}: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  };

  const variants = {
    default: "border-surface-600 border-t-primary-500",
    gradient: "border-transparent",
  };

  if (variant === "gradient") {
    return (
      <div className={cn("relative", sizes[size], className)}>
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-spin",
            "bg-gradient-primary p-[3px]",
            "shadow-lg shadow-primary-500/25"
          )}
          style={{
            background:
              "conic-gradient(from 0deg, #ad49e1, #7a1cac, #2e073f, #7a1cac, #ad49e1)",
            animationDuration: "1.5s",
            animationTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        >
          <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full animate-pulse opacity-60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizes[size],
        variants[variant],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  children: ReactNode;
  className?: string;
  variant?: "minimal" | "detailed";
}

export function LoadingState({
  children,
  className,
  variant = "detailed",
}: LoadingStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Spinner variant="gradient" size="lg" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-20", className)}>
      <div className="text-center space-y-8">
        <div className="relative">
          <Spinner variant="gradient" size="xl" className="mx-auto" />
          <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="text-dark-200 font-medium text-lg bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            {children}
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-bounce shadow-lg shadow-primary-500/30" />
            <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-bounce delay-75 shadow-lg shadow-primary-500/30" />
            <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-bounce delay-150 shadow-lg shadow-primary-500/30" />
          </div>

          <div className="w-48 h-1 bg-surface-800 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse"
              style={{
                animation: "loading-progress 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
  icon,
}: ErrorStateProps) {
  return (
    <div className={cn("text-center py-16", className)}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="relative">
          {icon || (
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-dark-100">{title}</h3>
          <p className="text-dark-400 leading-relaxed">{message}</p>
        </div>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-20", className)}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="relative">
          {icon ? (
            <div className="flex items-center justify-center">{icon}</div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-surface-800 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-dark-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-dark-100">{title}</h3>
          <p className="text-dark-400 leading-relaxed">{message}</p>
        </div>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}
