import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { appointmentSchema } from "@/lib/validations/appointment";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const statusParam = searchParams.get("status");

    const db = createAdminClient();

    if (role === "CLIENTE") {
      const { data: pets } = await db
        .from("Pet")
        .select("id")
        .eq("ownerId", userId);
      const petIds = (pets ?? []).map((p: { id: string }) => p.id);
      if (petIds.length === 0) return NextResponse.json({ data: [] });

      let query = db
        .from("Appointment")
        .select("*, pet:Pet!petId(*), petShop:PetShop!petShopId(id,name,address), service:Service!serviceId(id,label,price), groomer:Groomer!groomerId(id,name)")
        .in("petId", petIds)
        .order("date", { ascending: true });

      if (dateParam) {
        const startOfDay = new Date(dateParam);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateParam);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query = query.gte("date", startOfDay.toISOString()).lte("date", endOfDay.toISOString());
      }
      if (statusParam) query = query.eq("status", statusParam);

      const { data: appointments, error } = await query;
      if (error) throw error;
      return NextResponse.json({ data: appointments ?? [] });
    }

    if (role === "DONO" && petShopId) {
      let query = db
        .from("Appointment")
        .select("*, pet:Pet!petId(*, client:Client!clientId(*)), service:Service!serviceId(id,label,price), groomer:Groomer!groomerId(id,name)")
        .eq("petShopId", petShopId)
        .order("date", { ascending: true });

      if (dateParam) {
        const startOfDay = new Date(dateParam);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateParam);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query = query.gte("date", startOfDay.toISOString()).lte("date", endOfDay.toISOString());
      }
      if (statusParam) query = query.eq("status", statusParam);

      const { data: appointments, error } = await query;
      if (error) throw error;
      return NextResponse.json({ data: appointments ?? [] });
    }

    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId } = session.user;
    const body = await request.json();
    const parsedData = appointmentSchema.parse(body);

    const db = createAdminClient();

    const { data: pet } = await db
      .from("Pet")
      .select("id, ownerId")
      .eq("id", parsedData.petId)
      .maybeSingle();

    if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && pet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado", message: "Este pet não pertence a você" }, { status: 403 });
    }

    const { data: service } = await db
      .from("Service")
      .select("id, price")
      .eq("id", parsedData.serviceId)
      .maybeSingle();

    if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

    const { data: appointment, error } = await db
      .from("Appointment")
      .insert({
        petId: parsedData.petId,
        petShopId: parsedData.petShopId,
        serviceId: parsedData.serviceId,
        groomerId: parsedData.groomerId ?? null,
        date: new Date(parsedData.date).toISOString(),
        notes: parsedData.notes ?? null,
        totalPrice: service.price,
        status: "agendado",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
