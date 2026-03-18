import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Lista pública de petshops para o CLIENTE escolher onde agendar
export async function GET() {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("PetShop")
      .select("id, name, city, state, phone, address, logoUrl")
      .order("name");

    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("Error listing petshops:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
