import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:     z.string().min(2).optional(),
  phone:    z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

async function authorize(groomerId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autorizado", status: 401 };

  const { role, petShopId } = session.user;
  if (role !== "DONO" && role !== "SUPER_ADMIN") return { error: "Acesso negado", status: 403 };
  if (!petShopId) return { error: "Pet shop não encontrado", status: 404 };

  const db = createAdminClient();
  const { data: g } = await db.from("Groomer").select("petShopId").eq("id", groomerId).maybeSingle();
  if (!g) return { error: "Tosador não encontrado", status: 404 };
  if (role !== "SUPER_ADMIN" && g.petShopId !== petShopId) return { error: "Acesso negado", status: 403 };

  return { db };
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await authorize(params.id);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const { data, error } = await auth.db
      .from("Groomer")
      .update({ ...parsed, photoUrl: parsed.photoUrl || null })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error updating groomer:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await authorize(params.id);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { error } = await auth.db.from("Groomer").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting groomer:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
