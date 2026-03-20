"use client";

/** Paw-print loader — substitui spinners em todo o sistema */
export function PetLoader({ size = "md", label }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const sizes = { sm: "w-8 h-8", md: "w-14 h-14", lg: "w-20 h-20" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizes[size]}`}>
        {/* Central paw */}
        <svg viewBox="0 0 64 64" className={`${sizes[size]} animate-pet-float`} fill="none">
          {/* Paw pad principal */}
          <ellipse cx="32" cy="40" rx="14" ry="12" fill="#2b5bad" opacity="0.9"/>
          {/* Dedos */}
          <ellipse cx="16" cy="26" rx="7"  ry="6"  fill="#2b5bad" className="animate-paw-bounce" style={{animationDelay:"0ms"}}/>
          <ellipse cx="28" cy="20" rx="7"  ry="6"  fill="#2b5bad" className="animate-paw-bounce" style={{animationDelay:"100ms"}}/>
          <ellipse cx="40" cy="20" rx="7"  ry="6"  fill="#2b5bad" className="animate-paw-bounce" style={{animationDelay:"200ms"}}/>
          <ellipse cx="52" cy="26" rx="7"  ry="6"  fill="#2b5bad" className="animate-paw-bounce" style={{animationDelay:"300ms"}}/>
          {/* Highlights */}
          <ellipse cx="27" cy="38" rx="4" ry="3" fill="white" opacity="0.3"/>
        </svg>
      </div>
      {label && (
        <p className={`text-gray-500 font-medium ${textSizes[size]} animate-pulse-soft`}>{label}</p>
      )}
    </div>
  );
}

/** Loading full screen com dog running */
export function PetPageLoader({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light gap-4">
      <div className="relative">
        {/* Dog running SVG */}
        <svg viewBox="0 0 120 80" className="w-32 h-20" fill="none">
          {/* Body */}
          <ellipse cx="60" cy="50" rx="28" ry="18" fill="#f59e0b" className="animate-pet-float"/>
          {/* Head */}
          <circle cx="88" cy="38" r="16" fill="#f59e0b" className="animate-pet-float"/>
          {/* Ear */}
          <ellipse cx="94" cy="26" rx="8" ry="10" fill="#d97706" className="animate-ear-wiggle"/>
          {/* Eye */}
          <circle cx="93" cy="36" r="3" fill="#1f2937"/>
          <circle cx="94" cy="35" r="1" fill="white"/>
          {/* Nose */}
          <ellipse cx="100" cy="41" rx="4" ry="2.5" fill="#1f2937"/>
          {/* Mouth */}
          <path d="M98 44 Q100 47 103 44" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          {/* Tail */}
          <path d="M32 45 Q18 25 22 18" stroke="#d97706" strokeWidth="6" strokeLinecap="round" fill="none" className="animate-dog-wag"/>
          {/* Legs */}
          <rect x="72" y="62" width="8" height="14" rx="4" fill="#d97706" className="animate-paw-bounce" style={{animationDelay:"0ms"}}/>
          <rect x="58" y="62" width="8" height="14" rx="4" fill="#d97706" className="animate-paw-bounce" style={{animationDelay:"150ms"}}/>
          <rect x="44" y="62" width="8" height="14" rx="4" fill="#d97706" className="animate-paw-bounce" style={{animationDelay:"80ms"}}/>
          <rect x="30" y="62" width="8" height="14" rx="4" fill="#d97706" className="animate-paw-bounce" style={{animationDelay:"200ms"}}/>
        </svg>
        {/* Shadow */}
        <div className="w-20 h-3 bg-gray-200 rounded-full mx-auto mt-1 animate-pulse-soft"/>
      </div>
      <p className="text-gray-500 font-medium text-sm animate-pulse-soft">{label}</p>
    </div>
  );
}
