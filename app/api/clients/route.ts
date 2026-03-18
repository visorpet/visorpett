import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientSchema } from "@/lib/validations/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;

    if (!petShopId) return NextResponse.json({ error: "Você não possui um pet shop" }, { status: 403 });
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const db = createAdminClient();
    let query = db
      .from("Client")
      .select("*, pets:Pet!clientId(*, appointments:Appointment!petId(date, status))")
      .eq("petShopId", petShopId)
      .order("createdAt", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: clients, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: clients ?? [] });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;

    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }
    if (!petShopId) {
      return NextResponse.json({ error: "Você não possui um pet shop associado" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = clientSchema.parse(body);

    if (parsedData.petShopId !== petShopId && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Você só pode criar clientes para o seu pet shop" }, { status: 403 });
    }

    const db = createAdminClient();

    let linkedUserId: string | null = null;
    if (parsedData.email) {
      const { data: existingUser } = await db
        .from("User")
        .select("id")
        .eq("email", parsedData.email)
        .maybeSingle();
      if (existingUser) linkedUserId = existingUser.id;
    }

    const { data: newClient, error } = await db
      .from("Client")
      .insert({
        id: crypto.randomUUID(),
        name: parsedData.name,
        email: parsedData.email ?? null,
        phone: parsedData.phone ?? null,
        petShopId,
        userId: linkedUserId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: newClient }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
