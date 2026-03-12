import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// API que recebe o ID pela URL [id] ou envia o bloqueio/cancelamento da Assinatura
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso reservado via Super Admin" }, { status: 403 });
    }

    const { status } = await request.json(); // Pega a string de status 
    
    // Altera a Assinatura vinculada ao PetShop (Isso bloqueia o uso real da plataforma no middleware futuro)
    const petShop = await db.subscription.update({
      where: { petShopId: params.id },
      data: { status: status }, 
    });

    return NextResponse.json({ success: true, statusAtualizado: status });
  } catch (error) {
    console.error("Erro ao bloquear PetShop:", error);
    return NextResponse.json({ error: "Erro interno", details: error }, { status: 500 });
  }
}
