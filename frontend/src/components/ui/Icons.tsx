import { cn } from "../../utils/cn";

interface IconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

// Auction icons
export function HammerIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19.7 6.3l-1.4-1.4-4.3 4.3L12.6 8l-1.4 1.4 1.4 1.4-8.5 8.5 2.8 2.8 8.5-8.5 1.4 1.4L18.3 12l-1.2-1.4 4.3-4.3z" />
    </svg>
  );
}

export function TimerIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

export function TrendingUpIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function UserIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function BellIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SearchIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function HeartIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function ShoppingBagIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function StarIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function ArrowRightIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

export function ArrowLeftIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12,19 5,12 12,5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

export function ChevronRightIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}

export function CheckIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

export function XIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function MenuIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function DollarSignIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function FireIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2s5 4.5 5 11a5 5 0 0 1-10 0c0-2 1.5-5 1.5-5S7 12 7 13a3 3 0 0 0 6 0c0-4-1-7-1-11z" />
    </svg>
  );
}

export function CalendarIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function ClockIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

export function GridIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function PlusIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function LiveIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="3" />
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
      <circle
        cx="12"
        cy="12"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}

export function AlertTriangleIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function DownloadIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function FileTextIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M14,2 L6,2 C4.9,2 4,2.9 4,4 L4,20 C4,21.1 4.9,22 6,22 L18,22 C19.1,22 20,21.1 20,20 L20,8 L14,2 Z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
}

export function MailIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={cn(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
