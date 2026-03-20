import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createPetshopSchema = z.object({
  name:    z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone:   z.string().optional(),
  address: z.string().optional(),
  city:    z.string().min(2, "Cidade obrigatória"),
  state:   z.string().min(2, "Estado obrigatório"),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id: ownerId, role } = session.user;

    if (role !== "DONO") {
      return NextResponse.json({ error: "Apenas Donos podem criar um pet shop" }, { status: 403 });
    }

    // Verifica se DONO já tem um pet shop
    const db = createAdminClient();
    const { data: existing } = await db
      .from("PetShop")
      .select("id")
      .eq("ownerId", ownerId)
      .maybeSingle();

    if (existing) {
      // Recupera o petShopId no JWT caso tenha sido perdido
      await db.auth.admin.updateUserById(ownerId, {
        user_metadata: { petShopId: existing.id },
      });
      return NextResponse.json({ data: existing }, { status: 200 });
    }

    const body = await request.json();
    const parsed = createPetshopSchema.parse(body);

    // Gera slug único
    let slug = generateSlug(parsed.name);
    const { data: slugExists } = await db
      .from("PetShop")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const now = new Date().toISOString();
    const { data: petShop, error } = await db
      .from("PetShop")
      .insert({
        id:        crypto.randomUUID(),
        name:      parsed.name,
        slug,
        phone:     parsed.phone ?? null,
        address:   parsed.address ?? null,
        city:      parsed.city,
        state:     parsed.state,
        ownerId,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;

    // Cria subscription FREE automaticamente
    await db.from("Subscription").insert({
      id:          crypto.randomUUID(),
      petShopId:   petShop.id,
      plan:        "FREE",
      status:      "ACTIVE",
      createdAt:   now,
      updatedAt:   now,
    });

    // Persiste petShopId no user_metadata → middleware lê sem DB call
    await db.auth.admin.updateUserById(ownerId, {
      user_metadata: { petShopId: petShop.id },
    });

    return NextResponse.json({ data: petShop }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Erro ao criar pet shop:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
