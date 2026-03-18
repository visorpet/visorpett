import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Endpoint chamado via Webhook/CRON diariamente
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // Descomentar acima em produção. Para testes locais, deixo aberto:
    }

    // Calcula a data de 28 dias atrás
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 28);
    
    // Pets que tiveram banho há exatos 28 dias ou mais
    const pets = await db.pet.findMany({
      where: {
        appointments: {
          some: {
            date: { lte: cutoffDate },
            status: "concluido",
            service: { type: "banho" }
          }
        }
      },
      include: {
        client: true,
      }
    });

    // Simulando o envio de WhatsApp via Evolution API ou Email via Resend
    let sentCount = 0;
    for (const pet of pets) {
      if (pet.client?.phone) {
        // Envio: await sendWhatsApp(pet.client.phone, `Olá ${pet.client.name}, está na hora do banho do ${pet.name}!`);
        sentCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${sentCount} lembretes de retorno disparados.`,
      pets: pets.length 
    });
  } catch (error) {
    console.error("Erro no CRON de retorno:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
