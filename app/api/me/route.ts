import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    return NextResponse.json({
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("[API_ME_GET]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { image, name } = body;

    if (image !== undefined && (typeof image !== "string" || !image)) {
      return NextResponse.json({ error: "URL de imagem inválida" }, { status: 400 });
    }

    const db = createAdminClient();
    const updateData: Record<string, string> = {};
    if (image) updateData.image = image;
    if (name) updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    // 1. Atualiza tabela User no banco
    const { error } = await db
      .from("User")
      .update(updateData)
      .eq("id", session.user.id);

    if (error) throw error;

    // 2. Sincroniza user_metadata no Supabase Auth para que useUser() reflita imediatamente
    const authAdmin = createAuthClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const metaUpdate: Record<string, string> = {};
    if (image) metaUpdate.avatar_url = image;
    if (name) metaUpdate.name = name;
    await authAdmin.auth.admin.updateUserById(session.user.id, {
      user_metadata: metaUpdate,
    });

    return NextResponse.json({ data: updateData });
  } catch (error) {
    console.error("[API_ME_PATCH]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
