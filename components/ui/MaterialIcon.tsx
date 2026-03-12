"use client";

import { cn } from "@/lib/utils";

interface MaterialIconProps {
  icon: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fill?: boolean;
  thin?: boolean;
  bold?: boolean;
  className?: string;
  "aria-hidden"?: boolean;
}

const sizeMap = {
  xs: "text-base",      // 16px
  sm: "text-xl",        // 20px
  md: "text-2xl",       // 24px
  lg: "text-3xl",       // 30px
  xl: "text-4xl",       // 36px
};

/**
 * Wrapper para Material Symbols Outlined.
 * Uso: <MaterialIcon icon="calendar_today" fill size="md" />
 */
export function MaterialIcon({
  icon,
  size = "md",
  fill = false,
  thin = false,
  bold = false,
  className,
  "aria-hidden": ariaHidden = true,
}: MaterialIconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        sizeMap[size],
        fill && "icon-fill",
        thin && "icon-thin",
        bold && "icon-bold",
        className
      )}
      aria-hidden={ariaHidden}
    >
      {icon}
    </span>
  );
}
