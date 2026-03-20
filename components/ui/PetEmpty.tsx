"use client";

type PetEmptyProps = {
  title: string;
  subtitle?: string;
  type?: "dog" | "cat" | "paw";
};

/** Estado vazio com cachorrinho dormindo */
export function PetEmpty({ title, subtitle, type = "dog" }: PetEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-4">
        {type === "dog" && <SleepingDog />}
        {type === "cat" && <SleepingCat />}
        {type === "paw" && <LonelyPaw />}
      </div>
      <p className="font-bold text-gray-700 text-base mb-1">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm max-w-xs">{subtitle}</p>}
    </div>
  );
}

function SleepingDog() {
  return (
    <div className="relative w-32 h-28">
      <svg viewBox="0 0 130 110" className="w-32 h-28" fill="none">
        {/* Corpo dormindo (deitado) */}
        <ellipse cx="65" cy="78" rx="48" ry="22" fill="#fbbf24"/>
        {/* Cabeça */}
        <circle cx="100" cy="65" r="22" fill="#fbbf24"/>
        {/* Orelha */}
        <ellipse cx="112" cy="50" rx="9" ry="12" fill="#f59e0b" className="animate-ear-wiggle"/>
        {/* Olhos fechados (dormindo) */}
        <path d="M94 64 Q97 61 100 64" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M103 64 Q106 61 109 64" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Nariz */}
        <ellipse cx="108" cy="70" rx="5" ry="3" fill="#1f2937"/>
        {/* Boca feliz dormindo */}
        <path d="M104 75 Q108 79 112 75" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* Rabo */}
        <path d="M18 72 Q8 50 14 40" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none" className="animate-dog-wag"/>
        {/* Patinhas */}
        <ellipse cx="45" cy="96" rx="12" ry="7" fill="#f59e0b"/>
        <ellipse cx="72" cy="98" rx="12" ry="7" fill="#f59e0b"/>
      </svg>

      {/* ZZZ animados */}
      <span className="absolute top-0 right-0 text-xl font-black text-primary animate-zzz-float" style={{animationDelay:"0s"}}>z</span>
      <span className="absolute top-2 right-6 text-base font-black text-primary/70 animate-zzz-float" style={{animationDelay:"0.6s"}}>z</span>
      <span className="absolute top-5 right-1 text-sm font-black text-primary/50 animate-zzz-float" style={{animationDelay:"1.2s"}}>z</span>
    </div>
  );
}

function SleepingCat() {
  return (
    <div className="relative w-32 h-28">
      <svg viewBox="0 0 130 110" className="w-32 h-28" fill="none">
        {/* Corpo */}
        <ellipse cx="65" cy="80" rx="45" ry="20" fill="#94a3b8"/>
        {/* Cabeça */}
        <circle cx="98" cy="65" r="20" fill="#94a3b8"/>
        {/* Orelhas pontudas */}
        <polygon points="88,48 82,32 96,44" fill="#64748b" className="animate-ear-wiggle"/>
        <polygon points="108,48 114,32 100,44" fill="#64748b"/>
        {/* Olhos fechados */}
        <path d="M91 64 Q94 61 97 64" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M99 64 Q102 61 105 64" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Focinho */}
        <ellipse cx="98" cy="70" rx="8" ry="5" fill="#fda4af" opacity="0.6"/>
        <ellipse cx="103" cy="68" rx="3" ry="2" fill="#1f2937"/>
        {/* Bigodes */}
        <line x1="79" y1="68" x2="92" y2="70" stroke="#64748b" strokeWidth="1" opacity="0.7"/>
        <line x1="79" y1="72" x2="92" y2="72" stroke="#64748b" strokeWidth="1" opacity="0.7"/>
        <line x1="104" y1="70" x2="117" y2="68" stroke="#64748b" strokeWidth="1" opacity="0.7"/>
        <line x1="104" y1="72" x2="117" y2="72" stroke="#64748b" strokeWidth="1" opacity="0.7"/>
        {/* Rabo curvo */}
        <path d="M20 78 Q5 55 18 42 Q25 36 22 50" stroke="#64748b" strokeWidth="7" strokeLinecap="round" fill="none"/>
      </svg>

      <span className="absolute top-0 right-2 text-xl font-black text-primary animate-zzz-float" style={{animationDelay:"0s"}}>z</span>
      <span className="absolute top-3 right-8 text-base font-black text-primary/70 animate-zzz-float" style={{animationDelay:"0.7s"}}>z</span>
      <span className="absolute top-6 right-3 text-sm font-black text-primary/50 animate-zzz-float" style={{animationDelay:"1.3s"}}>z</span>
    </div>
  );
}

function LonelyPaw() {
  return (
    <div className="w-24 h-24 flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none">
        <ellipse cx="32" cy="42" rx="16" ry="13" fill="#e2e8f0"/>
        <ellipse cx="14" cy="27" rx="8"  ry="7"  fill="#e2e8f0"/>
        <ellipse cx="27" cy="20" rx="8"  ry="7"  fill="#e2e8f0"/>
        <ellipse cx="40" cy="20" rx="8"  ry="7"  fill="#e2e8f0"/>
        <ellipse cx="53" cy="27" rx="8"  ry="7"  fill="#e2e8f0"/>
        <ellipse cx="27" cy="40" rx="5" ry="4"   fill="white" opacity="0.5"/>
      </svg>
    </div>
  );
}
