import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const waitlistSchema = z.object({
  clientName:    z.string().min(2),
  clientPhone:   z.string().min(8),
  petName:       z.string().optional(),
  serviceId:     z.string().uuid().optional(),
  preferredDate: z.string(), // YYYY-MM-DD
});

// POST /api/booking/[slug]/waitlist — entra na lista de espera
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const data = waitlistSchema.parse(body);

    const db = createAdminClient();

    const { data: petShop } = await db
      .from("PetShop")
      .select("id, name")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!petShop) {
      return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });
    }

    // Evita duplicatas no mesmo dia + telefone
    const { data: existing } = await db
      .from("Waitlist")
      .select("id")
      .eq("petShopId", petShop.id)
      .eq("clientPhone", data.clientPhone)
      .eq("preferredDate", data.preferredDate)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ data: { message: "Você já está na lista para este dia!" } });
    }

    const { error } = await db.from("Waitlist").insert({
      id:            crypto.randomUUID(),
      petShopId:     petShop.id,
      clientName:    data.clientName,
      clientPhone:   data.clientPhone,
      petName:       data.petName || null,
      serviceId:     data.serviceId || null,
      preferredDate: data.preferredDate,
    });

    if (error) throw error;

    return NextResponse.json({ data: { message: "Você entrou na lista de espera! Te avisaremos pelo WhatsApp quando abrir um horário." } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
