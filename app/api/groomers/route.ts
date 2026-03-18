import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const groomerSchema = z.object({
  name:     z.string().min(2, "Nome obrigatório"),
  phone:    z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petShopId = searchParams.get("petShopId");

    const db = createAdminClient();
    let query = db.from("Groomer").select("id, name, phone, photoUrl, petShopId");
    if (petShopId) query = query.eq("petShopId", petShopId);

    const { data } = await query;
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("Error fetching groomers:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (!petShopId) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

    const body = await request.json();
    const parsed = groomerSchema.parse(body);

    const db = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await db
      .from("Groomer")
      .insert({
        id:        crypto.randomUUID(),
        petShopId,
        name:      parsed.name,
        phone:     parsed.phone ?? null,
        photoUrl:  parsed.photoUrl || null,
        createdAt: now,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error creating groomer:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
