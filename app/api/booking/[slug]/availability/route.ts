import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/booking/[slug]/availability?date=YYYY-MM-DD
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Parâmetro 'date' obrigatório" }, { status: 400 });
    }

    const db = createAdminClient();

    const { data: petShop } = await db
      .from("PetShop")
      .select("id")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!petShop) {
      return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });
    }

    const startOfDay = `${dateParam}T00:00:00.000Z`;
    const endOfDay   = `${dateParam}T23:59:59.999Z`;

    const { data: occupied } = await db
      .from("Appointment")
      .select("date")
      .eq("petShopId", petShop.id)
      .gte("date", startOfDay)
      .lte("date", endOfDay)
      .not("status", "eq", "cancelado");

    const occupiedHours = new Set(
      (occupied ?? []).map((a: { date: string }) => new Date(a.date).getUTCHours())
    );

    const now = new Date();
    const selectedDate = new Date(dateParam + "T00:00:00Z");
    const isToday = selectedDate.toDateString() === now.toDateString();

    // Horários disponíveis: 08:00 às 17:00
    const slots: string[] = [];
    for (let h = 8; h <= 17; h++) {
      if (occupiedHours.has(h)) continue;
      if (isToday && h <= now.getHours()) continue;
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }

    return NextResponse.json({ data: slots });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
