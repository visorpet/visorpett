# 🧠 Visorpet — Plano de Automação & IA (Cron Jobs)

Um sistema SaaS para pet shop inteligente não apenas reage — ele **age ativamente para trazer receita recorrente** ao lojista de forma automatizada. 

Diferente dos sistemas convencionais de mensagens engessadas ("Seu agendamento está próximo"), o **Visorpet integrará a Inteligência Artificial do Google Gemini** para criar interações hiper-personalizadas, que parecem vir de um humano preocupado com a saúde do pet.

---

## 🎯 Objetivo das Automações
Garantir a retenção dos clientes e maximizar o "Life Time Value" (LTV). Cada cliente lembrado a retornar é uma receita que o pet shop ganharia apenas pelo esforço da máquina.

---

## 🏗️ 1. Arquitetura do "Cérebro"
- **Gatilho de Tempo:** `Vercel Cron Jobs` (Programados para rodar de hora em hora ou diariamente às 09:00h).
- **Controlador Lógico:** Next.js API Routes (ex: `/app/api/cron/return`).
- **Segurança:** Uso de uma chave secreta (`process.env.CRON_SECRET`) para que apenas nossos robôs acionem estas rotas.
- **Motor de IA:** Google **Gemini API** para humanização das mensagens com base no contexto (Espécie do animal, última visita, tipo de serviço oferecido).
- **Canal de Disparo:** Gateway do WhatsApp (ex: Evolution API) e/ou E-mails (Resend).

---

## 🤖 2. Casos de Uso com o Gemini (Inteligência Artificial)

### A. Lembrete Inteligente de Reincidência (Banho / Tosa)
- **Gatilho:** Se passou X dias desde o último banho completo (ex: 20 a 25 dias).
- **Prompt da IA (Contexto):**
  _"Você é o assistente virtual do petshop [Nome da Loja]. Escreva uma mensagem leve, amigável e fofa de WhatsApp para [Nome Cliente], dizendo que já faz [X dias] desde o último banho do [Nome do Pet, Cão/Gato]. Convide-o a agendar o próximo banho com o link: visorpet.app/agendar. Use emojis e um tom bem descontraído, com no máximo 3 frases concisas."_
- **Resultado Esperado (Gerado pelo Gemini):**
  > "Oi Matheus! Tudo bem? 🐾 Aqui é da PetLove Moema. Já faz 23 dias desde que o Thor veio tomar um banho gostoso aqui com a gente... aposto que ele já quer ficar cheiroso de novo! 🥰 Que tal dar um trato no pelo dele essa semana? Agende rapidinho por aqui: visorpet.app/agendar"

### B. Vencimento Anual da Vacinação
- **Gatilho:** Aniversário de 330 dias da última dose da Vacina (Polivalente/Raiva).
- **Prompt da IA (Contexto):**
  Gera um texto focado na "importância preventiva" atrelada à espécie cadastrada, lembrando o dono de atualizar a carteirinha.

### C. Agradecimento e Pedido de "Review" (Avaliação)
- **Gatilho:** 2 horas após a conclusão de um agendamento novo.
- **Resultado Esperado:** 
  > "Oie! Espero que a Mel tenha adorado o banho hoje. Ficamos muito felizes em recebê-la! Se não for pedir muito, poderia avaliar nosso atendimento no Google? Vai ajudar muito a tia do pet shop! ⭐ [Link]"

---

## ⚙️ 3. Fases de Implantação do Cérebro (Roadmap)

### Fase 1 — Pipeline de Dados (Background Sync)
- Criar a rota protegida `/app/api/cron/recorencia` no Next.js.
- Escrever a querie no Prisma ORM: `Buscar todos os Pets que tiveram agendamento "concluído" do tipo "Banho" nos últimos X dias e NÃO tenham agendamentos futuros marcados.`

### Fase 2 — Injeção do Google Gemini
- Configurar o SDK do Google Generative AI usando a nova chave `GEMINI_API_KEY`.
- Criar o motor em `/lib/ai/gemini.ts` que recebe os metadados do Prisma (Nome Cliente + Nome Pet + Dias + Loja) e gera o "Prompt Final".
- Salvar os `Logs das Mensagens` no banco para que o Super Admin controle exatamente o custo/gasto diário com as mensagens.

### Fase 3 — Fila de Disparos de Lembrete (Queue)
- Caso hajam 200 mensagens para o dia, garantir o funcionamento de envio parcelado.
- Exibir ao Dono (Tenant) do PetShop na Dashboard os "Pacientes com automação disparada hoje".

---

## 🔒 4. Requisitos para começar:
`npm install @google/generative-ai`

1. Criação da Model base no Prisma `MessageLog` só para auditar as IAs.
2. Endpoint Cron `/api/cron/generate-reminders`.
---
*Plano gerado com foco em LTV (Lifetime Value) para reter clientes automaticamente.*
