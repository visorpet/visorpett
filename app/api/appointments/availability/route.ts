import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const WORK_START = 8;   // 08:00
const WORK_END   = 18;  // até 17:00 (último slot)
const SLOT_MIN   = 60;  // intervalos de 1h

function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = WORK_START; h < WORK_END; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petShopId = searchParams.get("petShopId");
    const date      = searchParams.get("date"); // YYYY-MM-DD

    if (!petShopId || !date) {
      return NextResponse.json({ error: "petShopId e date são obrigatórios" }, { status: 400 });
    }

    const db = createAdminClient();
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay   = new Date(`${date}T23:59:59.999Z`);

    const { data: existingApts } = await db
      .from("Appointment")
      .select("date, service:Service!serviceId(durationMin)")
      .eq("petShopId", petShopId)
      .gte("date", startOfDay.toISOString())
      .lte("date", endOfDay.toISOString())
      .not("status", "in", '("cancelado","faltou")');

    // Horários ocupados (simplificado: bloqueia o slot exato do agendamento)
    const busySlots = new Set<string>(
      (existingApts ?? []).map((a: { date: string }) => {
        const d = new Date(a.date);
        return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
      })
    );

    // Não permite agendamentos no passado
    const now     = new Date();
    const isToday = date === now.toISOString().split("T")[0];

    const allSlots = generateSlots();
    const slots = allSlots.map((time) => {
      const [h] = time.split(":").map(Number);
      const isPast = isToday && h <= now.getHours();
      return {
        time,
        available: !busySlots.has(time) && !isPast,
      };
    });

    return NextResponse.json({ data: slots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
