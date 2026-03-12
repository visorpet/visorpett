"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;         // 0–100
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
};

const trackColorMap = {
  primary: "bg-primary/10",
  success: "bg-emerald-100",
  warning: "bg-amber-100",
  danger:  "bg-red-100",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

/**
 * Barra de progresso com label, sublabel e animação.
 * Uso: <ProgressBar value={68} label="Fidelidade" sublabel="68/100 pts" showPercent />
 */
export function ProgressBar({
  value,
  label,
  sublabel,
  showPercent = false,
  color = "primary",
  size = "md",
  animated = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-semibold text-gray-700">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-bold text-primary">{clamped}%</span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          sizeMap[size],
          trackColorMap[color]
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorMap[color],
            animated && "animate-pulse-soft"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {sublabel && (
        <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
