import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    const allowedRoles = ["CLIENTE", "DONO"];
    const userRole: "CLIENTE" | "DONO" = allowedRoles.includes(role) ? role : "CLIENTE";

    const supabase = createAdminClient();

    // Verificar e-mail duplicado via Auth
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === email);
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: userRole },
    });

    if (authError || !authData.user) {
      console.error("[register] Supabase error:", authError);
      return NextResponse.json({ error: authError?.message ?? "Erro ao criar conta." }, { status: 400 });
    }

    return NextResponse.json({ id: authData.user.id }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erro interno ao criar conta." }, { status: 500 });
  }
}
