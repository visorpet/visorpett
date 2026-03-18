import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso reservado via Super Admin" }, { status: 403 });
    }

    const { status } = await request.json();

    await db.subscription.update({
      where: { petShopId: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, statusAtualizado: status });
  } catch (error) {
    console.error("Erro ao bloquear PetShop:", error);
    return NextResponse.json({ error: "Erro interno", details: error }, { status: 500 });
  }
}
