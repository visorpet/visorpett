import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa a IA do Google usando a chave API configurada
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Aviso: GEMINI_API_KEY não configurada no .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const geminiService = {
  /**
   * Gera uma mensagem humanizada de retorno para o tutor de um pet.
   */
  async generateReturnMessage({
    petName,
    petSpecies,
    clientName,
    daysSinceLastBath,
    petShopName,
  }: {
    petName: string;
    petSpecies: string;
    clientName: string;
    daysSinceLastBath: number;
    petShopName: string;
  }) {
    if (!apiKey) {
      throw new Error("Chave GEMINI_API_KEY ausente. Configuração necessária.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prompt construído com base nas instruções do PLANO_AUTOMATION_JOBS.md
    const prompt = `Você é o assistente virtual do petshop ${petShopName}.
Escreva uma mensagem de WhatsApp para ${clientName}, dizendo que já faz ${daysSinceLastBath} dias desde o último banho do ${petName} (${petSpecies}).
Convide-o a agendar o próximo banho no link: visorpet.app/agendar 
Regras:
1. Tom amigável, fofo e atencioso.
2. Use emojis.
3. Máximo de 3 ou 4 frases curtas.
4. Jamais escreva variáveis ou gere instruções extras, retorne apenas o texto exato da mensagem que será enviada.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return responseText.trim();
    } catch (error) {
      console.error("Erro ao gerar mensagem com Gemini:", error);
      throw error;
    }
  },
};
