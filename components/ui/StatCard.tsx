"use client";

import { cn } from "@/lib/utils";
import { MaterialIcon } from "./MaterialIcon";

type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: TrendDirection;
  iconBg?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

const defaultIconBg = "bg-primary/10";
const defaultIconColor = "text-primary";

const trendColorMap: Record<TrendDirection, string> = {
  up:      "text-emerald-600",
  down:    "text-red-500",
  neutral: "text-gray-500",
};

const trendIconMap: Record<TrendDirection, string> = {
  up:      "trending_up",
  down:    "trending_down",
  neutral: "trending_flat",
};

/**
 * Card de métrica usado no dashboard do dono e super admin.
 * Uso:
 *   <StatCard
 *     icon="calendar_today"
 *     label="Agendamentos hoje"
 *     value={12}
 *     trend="+3 vs ontem"
 *     trendDirection="up"
 *     iconBg="bg-primary/10"
 *   />
 */
export function StatCard({
  icon,
  label,
  value,
  trend,
  trendDirection = "neutral",
  iconBg = defaultIconBg,
  iconColor = defaultIconColor,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "card flex flex-col gap-3 animate-fade-in",
        onClick && "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {/* Icon */}
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
        <MaterialIcon icon={icon} size="md" className={iconColor} />
      </div>

      {/* Value + Label */}
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
      </div>

      {/* Trend */}
      {trend && (
        <div className={cn("flex items-center gap-1", trendColorMap[trendDirection])}>
          <MaterialIcon icon={trendIconMap[trendDirection]} size="xs" />
          <span className="text-xs font-semibold">{trend}</span>
        </div>
      )}
    </div>
  );
}
