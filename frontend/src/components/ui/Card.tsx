import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient" | "elevated";
  hover?: boolean;
}

export function Card({
  children,
  className,
  variant = "default",
  hover = true,
}: CardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300";

  const variants = {
    default: "bg-surface-800 border border-surface-600 shadow-dark",
    glass: "glass backdrop-blur-xl",
    gradient: "gradient-border bg-surface-800",
    elevated: "bg-surface-800 border border-surface-600 shadow-glow",
  };

  const hoverClasses = hover ? "card-hover cursor-pointer" : "";

  return (
    <div
      className={cn(baseClasses, variants[variant], hoverClasses, className)}
    >
      {variant === "gradient" ? (
        <div className="bg-surface-800 rounded-2xl p-6">{children}</div>
      ) : (
        <div className="p-6">{children}</div>
      )}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("border-b border-surface-600 pb-4 mb-6", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function CardTitle({
  children,
  className,
  gradient = false,
}: CardTitleProps) {
  const textClass = gradient ? "text-gradient" : "text-dark-100";

  return (
    <h3
      className={cn("text-xl font-bold tracking-tight", textClass, className)}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("border-t border-surface-600 pt-4 mt-6", className)}>
      {children}
    </div>
  );
}
