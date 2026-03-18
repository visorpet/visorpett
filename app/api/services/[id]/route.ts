import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  type:        z.enum(["banho", "tosa", "banho_e_tosa", "consulta", "vacina", "outro"]).optional(),
  label:       z.string().min(2).optional(),
  price:       z.number().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  active:      z.boolean().optional(),
});

async function authorize(serviceId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autorizado", status: 401 };

  const { role, petShopId } = session.user;
  if (role !== "DONO" && role !== "SUPER_ADMIN") return { error: "Acesso negado", status: 403 };
  if (!petShopId) return { error: "Pet shop não encontrado", status: 404 };

  const db = createAdminClient();
  const { data: svc } = await db.from("Service").select("petShopId").eq("id", serviceId).maybeSingle();
  if (!svc) return { error: "Serviço não encontrado", status: 404 };
  if (role !== "SUPER_ADMIN" && svc.petShopId !== petShopId) return { error: "Acesso negado", status: 403 };

  return { db, petShopId };
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await authorize(params.id);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const { data, error } = await auth.db
      .from("Service")
      .update(parsed)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await authorize(params.id);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // Soft delete — mantém histórico
    const { error } = await auth.db
      .from("Service")
      .update({ active: false })
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
