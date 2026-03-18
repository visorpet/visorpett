# Visorpet — Plano de Produto
**Versão:** 1.0 | **Data:** Março 2026 | **Autor:** Morgan (PM)

---

## 1. Visão de Produto

> **"Ser o sistema operacional do pet shop brasileiro — da agenda ao financeiro, do WhatsApp ao crescimento."**

O Visorpet não é só um sistema de agendamento. É a plataforma de gestão que transforma pet shops amadores em negócios profissionais, enquanto cria uma experiência de tutor que fideliza.

### Onde estaremos em:
| Horizonte | Estado |
|-----------|--------|
| **6 meses** | 50 pet shops pagantes, R$ 4.000 MRR |
| **12 meses** | 200 pet shops, R$ 16.000 MRR, produto validado |
| **2 anos** | 1.000 pet shops, R$ 80.000 MRR, referência no setor |
| **5 anos** | Rede de marketplace pet + B2B2C consolidado no Brasil |

---

## 2. O Mercado

### Números do setor pet no Brasil
- **R$ 68 bilhões** movimentados pelo setor pet em 2024
- **~55.000** pet shops formalizados (ABINPET)
- **90%** ainda gerenciam agenda por **WhatsApp + caderno**
- **73%** dos donos de pets têm smartphone
- Brasil é o **3º maior mercado pet do mundo**

### O problema real
O dono de pet shop hoje vive assim:
- Agenda pelo WhatsApp pessoal (mistura vida pessoal e profissional)
- Não sabe quantos clientes inativos tem
- Perde vacina, histórico e notas do animal
- Não sabe a receita do mês sem contar manualmente
- O tutor não sabe quando foi o último banho do pet

**Esse é o gap. Visorpet resolve.**

---

## 3. Perfil de Cliente Ideal (ICP)

### ICP Primário — DONO (quem paga)
| Atributo | Perfil |
|----------|--------|
| **Quem** | Dono/a de pet shop com 1 loja, 1-3 tosadores |
| **Idade** | 28–45 anos |
| **Cidade** | Capitais + cidades acima de 100k habitantes |
| **Volume** | 10–50 agendamentos/semana |
| **Dor #1** | Agenda caótica pelo WhatsApp |
| **Dor #2** | Não sabe quais clientes sumiram |
| **Dor #3** | Não controla o financeiro |
| **Disposição** | Paga R$ 79–149/mês se resolver o problema real |

### ICP Secundário — CLIENTE (usuário gratuito, mas alavanca o DONO)
| Atributo | Perfil |
|----------|--------|
| **Quem** | Tutor(a) com 1-2 pets, classe B/C |
| **Comportamento** | Usa o app para agendar, ver histórico e vacinas |
| **Valor** | Não paga, mas **leva o DONO ao produto** |
| **Retenção** | Retorna quando recebe notificação de retorno/vacina |

---

## 4. Jobs to be Done

### DONO
1. *"Quero que o cliente agende sem me mandar mensagem."*
2. *"Quero saber quais clientes sumiram para tentar recuperar."*
3. *"Quero saber quanto ganhei esse mês sem calcular na mão."*
4. *"Quero que meu tosador saiba o que fazer sem eu precisar falar."*
5. *"Quero que o cliente receba um lembrete automático antes do horário."*

### CLIENTE
1. *"Quero agendar o banho do meu pet sem precisar ligar."*
2. *"Quero ver quando foi o último banho e a próxima vacina."*
3. *"Quero receber um lembrete quando estiver na hora de ir ao pet shop."*

---

## 5. Estado Atual do Produto

### ✅ Pronto e funcional
| Feature | Impacto |
|---------|---------|
| Autenticação (3 roles) | Base — fundamental |
| Agendamento online (CLIENTE) | Core feature do produto |
| Dashboard DONO com KPIs reais | Alto impacto |
| Gestão de serviços e tosadores | Necessário para operação |
| Crons WhatsApp (lembretes D-1, retorno 28d, pós-atendimento) | Diferencial competitivo |
| PWA (instalável no celular) | Canal direto com usuário |
| Infraestrutura de planos (FREE/PRO/PREMIUM/ENTERPRISE) | Pronto no banco e na UI |
| Painel Admin (métricas, pet shops, bloqueio) | Operação interna |

### ⚠️ Incompleto — bloqueia receita
| Feature | Status | Urgência |
|---------|--------|----------|
| **Integração Stripe** | Schema pronto, código não | 🔴 CRÍTICO |
| Notificações por email (Resend) | SDK instalado, não conectado | 🔴 CRÍTICO |
| Perfil do DONO editável (logo, endereço) | Parcial | 🟡 ALTO |
| Financeiro do DONO com gráficos reais | Mock data | 🟡 ALTO |
| Avaliações de clientes | Página existe, sem lógica | 🟢 MÉDIO |

### ❌ Não construído — próximos sprints
| Feature | Prioridade |
|---------|-----------|
| Checkout Stripe (upgrade de plano) | Sprint 4 |
| Email de boas-vindas / confirmação | Sprint 4 |
| Tela de configurações WhatsApp/Evolution | Sprint 4 |
| Relatório financeiro completo | Sprint 5 |
| Sistema de avaliações real | Sprint 5 |
| Programa de indicações (CLIENTE) | Sprint 6 |

---

## 6. O que NÃO construir (agora)

> Foco mata o produto errado. Clareza é estratégia.

| Ideia | Por que não agora |
|-------|------------------|
| App nativo iOS/Android | PWA resolve. Custo alto, impacto semelhante |
| IA de atendimento autônomo | Complexidade alta, validar mercado primeiro |
| Marketplace de produtos pet | Outro modelo de negócio. Desvio de foco |
| Gestão de estoque | Feature de ERP, não de agendamento |
| Múltiplas filiais | Enterprise feature — só após 200 clientes |
| Integração com veterinários | Vertical diferente, persona diferente |
| Pagamento dentro do app (tutor paga pelo Visorpet) | Requer PCI compliance, regulação financeira |

---

## 7. Roadmap por Fase

### 🔴 Sprint 4 — Monetização (Prioridade Máxima)
**Objetivo:** Visorpet começa a gerar receita real.

| Task | Descrição |
|------|-----------|
| Integração Asaas — cobrança de assinaturas | DONO faz upgrade via PIX, boleto ou cartão |
| Asaas Webhooks | Atualizar status da subscription em tempo real |
| Portal de fatura Asaas | DONO vê boletos, histórico de pagamentos |
| Email de boas-vindas (Resend) | Onboarding por email ao criar conta |
| Email de confirmação de agendamento | CLIENTE recebe email ao agendar |
| Tela Configurações Asaas (admin) ✅ | API Key + sandbox toggle no painel admin |
| Enforcement de limites por plano | FREE: max 50 pets / PRO: ilimitado |

**Meta:** Primeiro DONO pagante.

---

### 🟡 Sprint 5 — Retenção e Experiência
**Objetivo:** DONOs que chegam, ficam.

| Task | Descrição |
|------|-----------|
| Financeiro DONO real | Receita por serviço, por período, por tosador |
| Histórico de mensagens WhatsApp | DONO vê o que foi enviado a cada cliente |
| Avaliações funcionais | CLIENTE avalia após atendimento, DONO vê nota média |
| Notificação push PWA | Lembrete de agendamento no celular |
| Perfil do DONO completo | Logo, horário de funcionamento, descrição |
| Trial controlado (14 dias PRO) | Novo DONO entra no PRO por 14 dias, depois cai para FREE |

**Meta:** Taxa de ativação de 60% em 7 dias.

---

### 🟢 Sprint 6 — Aquisição
**Objetivo:** DONOs trazem DONOs. CLIENTEs trazem CLIENTEs.

| Task | Descrição |
|------|-----------|
| Programa de indicação DONO | DONO indica outro pet shop → 1 mês grátis |
| Referral CLIENTE | CLIENTE indica amigo → desconto no próximo banho |
| Página pública do pet shop | `/petshop/[slug]` — link compartilhável pelo DONO |
| SEO básico | Meta tags, OG, sitemap para páginas públicas |
| Onboarding guiado (checklist) | DONO novo vê progresso: cadastre serviço → adicione tosador → compartilhe link |

**Meta:** 30% dos novos DONOs vindos de indicação.

---

### 🔵 Sprint 7+ — Escala
**Objetivo:** Produto que cresce sozinho.

| Feature | Fase |
|---------|------|
| Dashboard Analytics avançado (DONO) | Sprint 7 |
| Múltiplos groomers com agenda individual | Sprint 7 |
| Exportação de dados (CSV, relatório PDF) | Sprint 8 |
| API pública para integrações | Sprint 9 (Enterprise) |
| Múltiplas unidades (franquias) | Sprint 10 (Enterprise) |

---

## 8. Modelo de Receita

### Estrutura de Planos (revisão)

| Plano | Preço | Limite | Conversão esperada |
|-------|-------|--------|-------------------|
| **Básico (FREE)** | Grátis | 50 pets, 1 tosador | 100% dos cadastros |
| **Pro** | R$ 79/mês | Ilimitado + WhatsApp auto | 30% dos usuários ativos |
| **Premium** | R$ 149/mês | Pro + relatórios + IA | 10% dos DONOs |
| **Enterprise** | Customizado | Multi-filial + API | Vendas diretas |

### Projeção de MRR

| Mês | DONOs FREE | DONOs PRO | DONOs Premium | MRR |
|-----|-----------|-----------|---------------|-----|
| 3 | 30 | 10 | 2 | R$ 1.088 |
| 6 | 80 | 35 | 8 | R$ 3.957 |
| 12 | 200 | 100 | 25 | R$ 11.625 |
| 24 | 600 | 350 | 100 | R$ 42.150 |

### Por que o modelo funciona
1. **FREE** remove toda fricção de entrada — o DONO experimenta sem risco
2. **Limite de 50 pets** é o gatilho natural de upgrade (pet shop médio tem 80–120 pets)
3. **WhatsApp automation** é o diferencial que justifica o PRO — não existe em concorrentes
4. **Retenção alta** porque o histórico de pets fica no sistema (custo de saída alto)

---

## 9. KPIs e Métricas de Sucesso

### Aquisição
- **CAC (Custo de Aquisição):** Meta < R$ 50 (growth orgânico via indicação)
- **Taxa de cadastro → ativação:** Meta 60% em 7 dias (DONO cadastra 1 serviço + 1 agendamento)
- **Fonte de tráfego:** 40% orgânico, 30% indicação, 30% pago

### Ativação
- **Onboarding completion:** % de DONOs que completam (serviço + tosador + 1 agendamento)
- **Time to value:** Meta < 10 min do cadastro ao primeiro agendamento

### Retenção
- **Churn mensal:** Meta < 5%
- **DAU/MAU ratio (DONO):** Meta > 40% (usa toda semana)
- **NPS:** Meta > 50

### Receita
- **MRR:** Acompanhar mensalmente
- **ARPU (Average Revenue Per User):** Meta R$ 95/mês (mix PRO + Premium)
- **LTV:** Meta 18 meses × ARPU = R$ 1.710

### Produto
- **Agendamentos processados/mês:** Proxy de valor entregue
- **Mensagens WhatsApp enviadas:** Prova do diferencial
- **Taxa de retorno clientes inativos** após cron de retorno

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| DONO não adota sistema digital | Alta | Alto | Onboarding ultra-simples (< 5 min), vídeo de boas-vindas |
| Concorrente grande entra no nicho | Média | Alto | Diferencial WhatsApp + histórico de pet (moat de dados) |
| Churn por preço | Média | Médio | Trial 14 dias PRO, annual pricing com desconto |
| Problema técnico em cron de notificações | Baixa | Alto | Monitoring, retry logic, fallback wa.me manual |
| Evolution API fora do ar | Baixa | Médio | Fallback para wa.me links sempre presente |
| LGPD / dados de saúde do pet | Média | Alto | Política de privacidade, termos claros, dados criptografados |

---

## 11. Próximos 3 Passos Imediatos

> Do planejamento para execução, esta semana.

### 1. Stripe — integração de pagamento (Sprint 4)
Sem isso não existe receita. Prioridade absoluta.
- Instalar `stripe` SDK
- Criar checkout session para upgrade de plano
- Webhook para sincronizar `Subscription.status` no banco

### 2. Tela de Configurações WhatsApp no Admin
Já solicitado pelo usuário. Campo para `EVOLUTION_API_URL` e `EVOLUTION_API_KEY` no painel admin.

### 3. Email de confirmação de agendamento (Resend)
Resend já está instalado. Conectar o envio ao criar um `Appointment`.

---

## 12. Definição de Sucesso — 90 dias

> **Sprint 4–6 entregues. 50 DONOs ativos. 10 pagantes. Stripe funcionando.**

Se em 90 dias tivermos:
- ✅ Stripe operacional
- ✅ 10 DONOs no plano PRO (R$ 790/mês)
- ✅ NPS > 40
- ✅ Taxa de churn < 10%

**→ O produto está validado. Hora de escalar com marketing.**

---

*Visorpet Product Plan v1.0 — Morgan (PM) × Synkra AIOX*
*Próxima revisão: Junho 2026*
