// Rota NextAuth removida — autenticação migrada para Supabase.
// Mantido para evitar 404 em deploys antigos.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth migrado para Supabase" }, { status: 404 });
}
export async function POST() {
  return NextResponse.json({ message: "Auth migrado para Supabase" }, { status: 404 });
}
