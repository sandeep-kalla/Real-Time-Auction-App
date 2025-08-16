import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

interface TimerProps {
  endTime: string;
  className?: string;
  variant?: "default" | "compact" | "large";
  showLabels?: boolean;
}

export function Timer({
  endTime,
  className,
  variant = "default",
  showLabels = true,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endTime).getTime() - new Date().getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const variants = {
    default: {
      container: "flex items-center gap-4",
      segment:
        "bg-surface-800 border border-surface-600 rounded-xl p-3 min-w-[60px] text-center",
      number: "text-2xl font-bold text-gradient",
      label: "text-xs text-dark-400 uppercase tracking-wide mt-1",
    },
    compact: {
      container: "flex items-center gap-2",
      segment: "bg-surface-700 rounded-lg px-2 py-1 min-w-[40px] text-center",
      number: "text-lg font-bold text-primary-400",
      label: "text-xs text-dark-500 mt-0.5",
    },
    large: {
      container: "flex items-center gap-6",
      segment:
        "bg-gradient-primary rounded-2xl p-6 min-w-[100px] text-center shadow-glow",
      number: "text-4xl font-bold text-white",
      label: "text-sm text-gray-200 uppercase tracking-wide mt-2",
    },
  };

  const style = variants[variant];
  const isExpired = timeLeft.total <= 0;
  const isUrgent = timeLeft.total <= 5 * 60 * 1000; // Less than 5 minutes

  if (isExpired) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-red-400 font-medium">Auction Ended</span>
      </div>
    );
  }

  const segments = [
    { value: timeLeft.days, label: "Days", show: timeLeft.days > 0 },
    {
      value: timeLeft.hours,
      label: "Hours",
      show: timeLeft.days > 0 || timeLeft.hours > 0,
    },
    { value: timeLeft.minutes, label: "Minutes", show: true },
    { value: timeLeft.seconds, label: "Seconds", show: true },
  ];

  return (
    <div className={cn(style.container, className)}>
      {isUrgent && variant !== "compact" && (
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
      )}

      {segments.map((segment, index) => {
        if (!segment.show) return null;

        return (
          <div key={segment.label} className="flex items-center gap-2">
            <div
              className={cn(
                style.segment,
                isUrgent && "border-red-500/50 bg-red-500/10"
              )}
            >
              <div className={cn(style.number, isUrgent && "text-red-400")}>
                {String(segment.value).padStart(2, "0")}
              </div>
              {showLabels && <div className={style.label}>{segment.label}</div>}
            </div>

            {index < segments.filter((s) => s.show).length - 1 && (
              <div
                className={cn(
                  "text-dark-500 font-bold",
                  variant === "large" ? "text-2xl" : "text-lg"
                )}
              >
                :
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
