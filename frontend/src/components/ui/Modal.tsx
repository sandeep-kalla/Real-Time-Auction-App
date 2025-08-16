import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { XIcon } from "./Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "glass" | "gradient";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
  variant = "default",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  const variants = {
    default: "bg-surface-800 border border-surface-600",
    glass: "glass backdrop-blur-xl",
    gradient: "bg-gradient-primary",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative rounded-2xl shadow-glow-lg w-full max-h-[90vh] overflow-hidden animate-slide-up",
          sizes[size],
          variants[variant],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-surface-600">
            <h2
              className={cn(
                "text-xl font-bold",
                variant === "gradient" ? "text-white" : "text-dark-100"
              )}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 hover:scale-110",
                variant === "gradient"
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-dark-400 hover:text-dark-100 hover:bg-surface-700"
              )}
            >
              <XIcon size="sm" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return <div className={cn("mb-6", className)}>{children}</div>;
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-6 border-t border-surface-600 mt-6",
        className
      )}
    >
      {children}
    </div>
  );
}
