"use client";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "orange"
  | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger:  "bg-red-100 text-red-600",
  neutral: "bg-gray-100 text-gray-600",
  orange:  "bg-orange-100 text-orange-600",
  purple:  "bg-purple-100 text-purple-700",
};

const dotColorMap: Record<BadgeVariant, string> = {
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  neutral: "bg-gray-400",
  orange:  "bg-orange-500",
  purple:  "bg-purple-500",
};

/**
 * Badge / Pill para status e categorias.
 * Uso: <Badge variant="success" dot>Confirmado</Badge>
 */
export function Badge({
  variant = "neutral",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        variantMap[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColorMap[variant])}
        />
      )}
      {children}
    </span>
  );
}
