import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/booking/[slug] — info pública do petshop + serviços
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const db = createAdminClient();

    const { data: petShop, error } = await db
      .from("PetShop")
      .select("id, name, slug, phone, address, city, state, logoUrl")
      .eq("slug", params.slug)
      .maybeSingle();

    if (error || !petShop) {
      return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });
    }

    const { data: services } = await db
      .from("Service")
      .select("id, type, label, price, durationMin")
      .eq("petShopId", petShop.id)
      .eq("active", true)
      .order("label");

    return NextResponse.json({ data: { petShop, services: services ?? [] } });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/booking/[slug] — cria agendamento sem autenticação
const bookingSchema = z.object({
  // Dados do cliente
  clientName:  z.string().min(2),
  clientPhone: z.string().min(8),
  clientEmail: z.string().email().optional().or(z.literal("")),
  // Dados do pet
  petName:    z.string().min(1),
  petSpecies: z.enum(["cachorro", "gato", "outro"]),
  petBreed:   z.string().optional(),
  // Agendamento
  serviceId: z.string().uuid(),
  date:      z.string(), // ISO string
  notes:     z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);
    const db = createAdminClient();

    // 1. Busca petshop pelo slug
    const { data: petShop } = await db
      .from("PetShop")
      .select("id, name")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!petShop) {
      return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });
    }

    // 2. Busca ou cria Client pelo telefone
    let { data: client } = await db
      .from("Client")
      .select("id")
      .eq("petShopId", petShop.id)
      .eq("phone", data.clientPhone)
      .maybeSingle();

    if (!client) {
      const now = new Date().toISOString();
      const { data: newClient, error: clientError } = await db
        .from("Client")
        .insert({
          id:        crypto.randomUUID(),
          petShopId: petShop.id,
          name:      data.clientName,
          phone:     data.clientPhone,
          email:     data.clientEmail || null,
          createdAt: now,
          updatedAt: now,
        })
        .select("id")
        .single();

      if (clientError) throw clientError;
      client = newClient;
    }

    // 3. Busca ou cria Pet pelo nome + clientId
    let { data: pet } = await db
      .from("Pet")
      .select("id")
      .eq("clientId", client.id)
      .ilike("name", data.petName)
      .maybeSingle();

    if (!pet) {
      const now = new Date().toISOString();
      const { data: newPet, error: petError } = await db
        .from("Pet")
        .insert({
          id:        crypto.randomUUID(),
          clientId:  client.id,
          name:      data.petName,
          species:   data.petSpecies,
          breed:     data.petBreed || null,
          createdAt: now,
          updatedAt: now,
        })
        .select("id")
        .single();

      if (petError) throw petError;
      pet = newPet;
    }

    // 4. Busca preço do serviço
    const { data: service } = await db
      .from("Service")
      .select("id, price, label")
      .eq("id", data.serviceId)
      .eq("petShopId", petShop.id)
      .maybeSingle();

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // 5. Cria agendamento
    const now = new Date().toISOString();
    const { data: appointment, error: aptError } = await db
      .from("Appointment")
      .insert({
        id:         crypto.randomUUID(),
        petId:      pet.id,
        petShopId:  petShop.id,
        serviceId:  service.id,
        date:       new Date(data.date).toISOString(),
        notes:      data.notes || null,
        totalPrice: service.price,
        status:     "agendado",
        updatedAt:  now,
      })
      .select("id, date, status, totalPrice")
      .single();

    if (aptError) throw aptError;

    return NextResponse.json({
      data: {
        appointment,
        petShopName:  petShop.name,
        serviceLabel: service.label,
        clientName:   data.clientName,
        petName:      data.petName,
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.issues }, { status: 400 });
    }
    console.error("Erro ao criar booking:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
