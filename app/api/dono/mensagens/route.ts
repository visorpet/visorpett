import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  retorno:         "Retorno (28 dias)",
  lembrete_d1:     "Lembrete D-1",
  pos_atendimento: "Pós-atendimento",
};

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (!petShopId) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "pending";

    const db = createAdminClient();
    const { data, error } = await db
      .from("MessageLog")
      .select("id, type, response, waLink, status, createdAt, pet:Pet!petId(name, species), client:Client!clientId(name, phone)")
      .eq("petShopId", petShopId)
      .eq("status", status)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (error) throw error;

    const messages = (data ?? []).map((m: any) => ({
      id:         m.id,
      type:       m.type,
      typeLabel:  TYPE_LABELS[m.type] ?? m.type,
      message:    m.response,
      waLink:     m.waLink,
      status:     m.status,
      createdAt:  m.createdAt,
      petName:    (Array.isArray(m.pet)    ? m.pet[0]    : m.pet)?.name    ?? "Pet",
      clientName: (Array.isArray(m.client) ? m.client[0] : m.client)?.name ?? "Cliente",
      phone:      (Array.isArray(m.client) ? m.client[0] : m.client)?.phone ?? "",
    }));

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error("Erro em dono/mensagens:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Marcar mensagem como enviada manualmente
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const db = createAdminClient();
    const { error } = await db
      .from("MessageLog")
      .update({ status: "sent" })
      .eq("id", id)
      .eq("petShopId", petShopId ?? "");

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao marcar mensagem:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
