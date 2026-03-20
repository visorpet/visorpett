import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// POST /api/booking/[slug]/lead — salva lead parcial (abandonment tracking)
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { clientPhone, clientName, petName, serviceId, step, leadId } = body;

    if (!clientPhone) {
      return NextResponse.json({ error: "Telefone obrigatório" }, { status: 400 });
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

    // Atualiza se já existe lead com mesmo id, senão cria novo
    if (leadId) {
      await db.from("BookingLead").update({
        clientName: clientName || null,
        petName: petName || null,
        serviceId: serviceId || null,
        step: step ?? 4,
      }).eq("id", leadId).eq("petShopId", petShop.id);

      return NextResponse.json({ data: { leadId } });
    }

    // Cria novo lead
    const id = crypto.randomUUID();
    await db.from("BookingLead").insert({
      id,
      petShopId: petShop.id,
      clientPhone,
      clientName: clientName || null,
      petName: petName || null,
      serviceId: serviceId || null,
      step: step ?? 4,
    });

    return NextResponse.json({ data: { leadId: id } });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/booking/[slug]/lead?leadId=xxx — marca como convertido
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    if (!leadId) return NextResponse.json({ ok: true });

    const db = createAdminClient();

    const { data: petShop } = await db
      .from("PetShop")
      .select("id")
      .eq("slug", params.slug)
      .maybeSingle();

    if (petShop) {
      await db.from("BookingLead")
        .update({ convertedAt: new Date().toISOString() })
        .eq("id", leadId)
        .eq("petShopId", petShop.id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
