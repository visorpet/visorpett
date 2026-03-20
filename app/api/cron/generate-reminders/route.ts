import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geminiService } from "@/lib/ai/gemini";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Autorização (Verifica se é o Cron ou se temos o secret válido)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Busca agendamentos antigos (mock de lógica do plano)
    // Na vida real, a query buscaria Pets cujo último agrupamento do tipo banho foi há 20 dias atrás
    // e criaria a lista dinâmica. Para fins de POC do Plano Automation:
    
    // Supondo que pegamos o pet "Thor" associado ao shop-1:
    const mockPetToAlert = {
      petShopId: "cm85jxxxb00021xyzv1", // ID válido ou seu CUID do DB
      petId: "pet-cuid-ficticio-1",
      clientId: "client-cuid-1",
      petName: "Thor",
      petSpecies: "Cachorro",
      clientName: "Matheus",
      petShopName: "Visorpet Demo",
      daysSinceLastBath: 22
    };

    // 3. Processa no Gemini
    const messageText = await geminiService.generateReturnMessage({
      petName: mockPetToAlert.petName,
      petSpecies: mockPetToAlert.petSpecies,
      clientName: mockPetToAlert.clientName,
      daysSinceLastBath: mockPetToAlert.daysSinceLastBath,
      petShopName: mockPetToAlert.petShopName,
    });

    // 4. Salva o Log no Banco (O MessageLog criado no Prisma)
    /* Como o banco está vazio com esses IDs fictícios, essa operação vai falhar por chave estrangeira 
       se não mockarmos uma Inserção válida, então deixamos comentado o Create, exibindo apenas o retorno
       da IA por hora para testarmos o Prompt:
       
    await db.messageLog.create({
      data: {
        petShopId: mockPetToAlert.petShopId,
        petId: mockPetToAlert.petId,
        clientId: mockPetToAlert.clientId,
        type: "return_reminder",
        prompt: "Context: Return reminder for 22 days",
        response: messageText,
        status: "generated",
      }
    });
    */

    return NextResponse.json({
      success: true,
      data: {
        to: mockPetToAlert.clientName,
        pet: mockPetToAlert.petName,
        messageDrawn: messageText
      }
    });
  } catch (error: any) {
    console.error("[CRON_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
