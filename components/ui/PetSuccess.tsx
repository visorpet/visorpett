"use client";

/** Cachorro pulando de alegria + patinhas confete */
export function PetSuccess() {
  const confettiPaws = Array.from({ length: 8 }, (_, i) => ({
    left: `${10 + i * 11}%`,
    delay: `${i * 0.15}s`,
    size: i % 2 === 0 ? "text-lg" : "text-sm",
    rotate: `${-30 + i * 10}deg`,
  }));

  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Confete de patinhas */}
      {confettiPaws.map((p, i) => (
        <span
          key={i}
          className="absolute animate-confetti-fall pointer-events-none select-none"
          style={{ left: p.left, top: "-10px", animationDelay: p.delay, transform: `rotate(${p.rotate})` }}
        >
          🐾
        </span>
      ))}

      {/* Cachorro pulando */}
      <div className="animate-bounce-in">
        <svg viewBox="0 0 120 130" className="w-36 h-36" fill="none">
          {/* Corpo */}
          <ellipse cx="60" cy="75" rx="30" ry="24" fill="#fbbf24"/>
          {/* Cabeça */}
          <circle cx="60" cy="42" r="24" fill="#fbbf24"/>
          {/* Orelhas */}
          <ellipse cx="42" cy="24" rx="10" ry="14" fill="#f59e0b" className="animate-ear-wiggle"/>
          <ellipse cx="78" cy="24" rx="10" ry="14" fill="#f59e0b"/>
          {/* Olhos felizes (^.^) */}
          <path d="M50 40 Q53 36 56 40" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M64 40 Q67 36 70 40" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Bochechas coradas */}
          <ellipse cx="47" cy="48" rx="7" ry="4" fill="#fca5a5" opacity="0.5"/>
          <ellipse cx="73" cy="48" rx="7" ry="4" fill="#fca5a5" opacity="0.5"/>
          {/* Nariz */}
          <ellipse cx="60" cy="50" rx="6" ry="4" fill="#1f2937"/>
          {/* Boca feliz */}
          <path d="M52 56 Q60 64 68 56" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
          {/* Língua */}
          <ellipse cx="60" cy="63" rx="5" ry="4" fill="#fda4af"/>
          {/* Patinhas levantadas (comemorando) */}
          <path d="M30 80 Q12 60 18 48" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" fill="none"/>
          <path d="M90 80 Q108 60 102 48" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" fill="none"/>
          {/* Patas frontais estendidas */}
          <ellipse cx="18" cy="45" rx="9" ry="7" fill="#fbbf24"/>
          <ellipse cx="102" cy="45" rx="9" ry="7" fill="#fbbf24"/>
          {/* Pernas traseiras */}
          <ellipse cx="44" cy="98" rx="10" ry="6" fill="#f59e0b"/>
          <ellipse cx="76" cy="98" rx="10" ry="6" fill="#f59e0b"/>
          {/* Rabo abanando */}
          <path d="M88 72 Q102 55 96 44" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none" className="animate-dog-wag"/>
          {/* Coração */}
          <text x="54" y="18" fontSize="16" className="animate-heart-pop">❤️</text>
        </svg>
      </div>
    </div>
  );
}

/** Mini celebrating paw for toasts/badges */
export function PawCelebrate({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block animate-paw-bounce ${className}`}>🐾</span>
  );
}
