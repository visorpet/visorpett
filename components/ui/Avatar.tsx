"use client";

import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  ring?: boolean;
  ringColor?: string;
  statusDot?: "online" | "offline" | "busy";
  className?: string;
  alt?: string;
}

const sizeMap = {
  xs:  "w-6 h-6 text-[10px]",
  sm:  "w-8 h-8 text-xs",
  md:  "w-10 h-10 text-sm",
  lg:  "w-12 h-12 text-base",
  xl:  "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

const dotSizeMap = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
  "2xl": "w-4 h-4",
};

const dotColorMap = {
  online:  "bg-emerald-500",
  offline: "bg-gray-300",
  busy:    "bg-amber-500",
};

/**
 * Avatar com imagem, fallback iniciais, ring colorido e status dot.
 * Uso: <Avatar src={user.photoUrl} name="João Silva" size="lg" ring />
 */
export function Avatar({
  src,
  name = "",
  size = "md",
  ring = false,
  ringColor = "ring-primary",
  statusDot,
  className,
  alt,
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-flex flex-shrink-0 rounded-full overflow-hidden", sizeMap[size], className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name}
          className={cn(
            "rounded-full object-cover",
            sizeMap[size],
            ring && `ring-2 ${ringColor}`
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-primary/10 text-primary font-bold",
            "flex items-center justify-center flex-shrink-0",
            sizeMap[size],
            ring && `ring-2 ${ringColor}`
          )}
          aria-label={name}
        >
          {initials}
        </div>
      )}

      {statusDot && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            dotSizeMap[size],
            dotColorMap[statusDot]
          )}
        />
      )}
    </div>
  );
}
