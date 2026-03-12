import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes Tailwind com clsx + tailwind-merge.
 * Uso: cn("base", isActive && "active", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valor monetário em BRL
 * Uso: formatCurrency(1500) → "R$ 1.500,00"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata data ISO para exibição brasileira
 * Uso: formatDate("2024-03-15") → "15 de março"
 */
export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }
): string {
  return new Date(iso).toLocaleDateString("pt-BR", opts);
}

/**
 * Formata data curta
 * Uso: formatDateShort("2024-03-15") → "15/03"
 */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

/**
 * Retorna saudação por hora do dia
 * Uso: getGreeting() → "Bom dia"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Pluraliza texto com contagem
 * Uso: pluralize(3, "pet", "pets") → "3 pets"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Retorna iniciais do nome (para avatars)
 * Uso: getInitials("João Silva") → "JS"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Trunca texto
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Calcula dias desde uma data
 */
export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
