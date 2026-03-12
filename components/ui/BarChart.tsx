"use client";

import { cn } from "@/lib/utils";
import type { ChartData } from "@/types";

interface BarChartProps {
  data: ChartData[];
  maxValue?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  height?: "sm" | "md" | "lg";
}

const heightMap = {
  sm: "h-24",
  md: "h-36",
  lg: "h-48",
};

/**
 * Gráfico de barras puro em CSS/Tailwind — sem dependências externas.
 * Fiel ao design dos mockups (Hub Pets + Super Admin).
 * Uso:
 *   <BarChart data={weeklyData} showLabels showValues />
 */
export function BarChart({
  data,
  maxValue,
  className,
  showLabels = true,
  showValues = false,
  height = "md",
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("flex items-end gap-1.5 w-full", heightMap[height])}>
        {data.map((item, i) => {
          const pct = Math.round((item.value / max) * 100);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-1 h-full group"
            >
              {/* Value tooltip on hover */}
              {showValues && item.value > 0 && (
                <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}
                </span>
              )}

              {/* Bar */}
              <div
                className={cn(
                  "w-full rounded-t-lg transition-all duration-500 ease-out",
                  item.isHighlight || item.isCurrent
                    ? "bg-primary shadow-primary-sm"
                    : "bg-primary/20"
                )}
                style={{ height: `${pct}%`, minHeight: "4px" }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex gap-1.5 mt-2">
          {data.map((item, i) => (
            <div key={i} className="flex-1 text-center">
              <span
                className={cn(
                  "text-[10px] font-medium",
                  item.isHighlight || item.isCurrent
                    ? "text-primary font-bold"
                    : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
