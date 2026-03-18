import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    // Verificar se já existe no Supabase Auth
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = listData?.users?.find((u) => u.email === "admin@admin.com");

    let authUserId: string;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
    } else {
      // Criar no Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@admin.com",
        password: "admin",
        email_confirm: true,
        user_metadata: { name: "Admin Visorpet", role: "SUPER_ADMIN" },
      });

      if (authError || !authData.user) {
        return NextResponse.json({ error: authError?.message ?? "Erro ao criar auth" }, { status: 500 });
      }

      authUserId = authData.user.id;
    }

    // Criar ou atualizar no Prisma
    const admin = await db.user.upsert({
      where: { email: "admin@admin.com" },
      update: { role: "SUPER_ADMIN", name: "Admin Visorpet" },
      create: {
        id: authUserId,
        name: "Admin Visorpet",
        email: "admin@admin.com",
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin criado/verificado com sucesso!",
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (error: any) {
    console.error("[seed-admin]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
