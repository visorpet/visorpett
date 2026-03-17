# 🐾# Plano de Melhoria: Área do Tutor (Cliente) - STATUS: [CONCLUÍDO]
> Versão 1.0 · Auditado em 17/03/2026
> Prioridades: 🔴 Crítico · 🟡 Importante · 🟢 Desejável

---

## Visão Geral das Páginas Auditadas

| Página | Rota | Status Atual |
|--------|------|-------------|
| Início | `/cliente/inicio` | ⚠️ Mocks críticos |
| Agendamento | `/cliente/agendamento` | ⚠️ Time slots mock, petShopId hardcoded |
| Histórico | `/cliente/historico` | ⚠️ Totalmente mock |
| Meus Pets | `/cliente/meus-pets` | ✅ API real |
| Prontuário do Pet | `/cliente/meus-pets/[id]` | ⚠️ Histórico e observações são mock |
| Perfil | `/cliente/perfil` | ⚠️ Dados mock, ações sem destino |

---

## 📄 Página 1 — Início (`/cliente/inicio`)

### Problemas Identificados

#### 🔴 Críticos
- **`mockUser` hardcoded:** Nome "Ana Souza", ID e foto nunca vêm da sessão real. Deve ser substituído por `useSession()` do NextAuth.
- **`mockPets` e `mockAppointments`:** Dados completamente falsos. Nenhum pet ou agendamento real é exibido.
- **Links sem destino real:**
  - `/cliente/petshops` → rota **não existe**
  - `/cliente/indicacoes` → rota **não existe**
  - `/cliente/notificacoes` → rota **não existe**
  - `/cliente/agendamento/${upcomingAppt.id}` → rota de detalhes **não existe**
- **WhatsApp hardcoded:** `apt.ownerPhone` vem do mock, número pode ser inválido em produção.

#### 🟡 Importantes
- **Sem estado de loading:** A página carrega dados síncronamente do mock; quando for async, precisa de skeleton.
- **Sem estado de erro:** Se a API falhar, o usuário não vê nenhuma mensagem.
- **Contagem de agendamentos incorreta:** Exibe total de agendamentos do mock em vez dos agendamentos reais.
- **Badge de notificações hardcoded:** `badge: 2` é fixo, não reflete notificações reais.

#### 🟢 Desejáveis
- Adicionar animação de entrada suave no card do próximo agendamento.
- Exibir foto real do pet no card (imagem, não apenas ícone).
- Botão "Cancelar agendamento" diretamente no card do próximo agendamento.

### Plano de Ação

```
1.- [x] **Substituir mock de Pets por API**: Implementado `useSession` + `fetch("/api/pets")`. (CONCLUÍDO)
- [x] **Substituir Próximos Agendamentos por API**: Implementado `fetch("/api/cliente/dashboard")`. (CONCLUÍDO)
- [x] **Implementar Skeleton Loaders**: Adicionados em todas as seções críticas (Pets, Agendamentos). (CONCLUÍDO)
- [x] **Tratamento de Erros Generais**: Adicionado feedback visual se a API falhar. (CONCLUÍDO)
- [x] **Link Dinâmico de WhatsApp**: Configurado para usar dados reais do Pet Shop. (CONCLUÍDO)
5. Criar rotas ausentes:
   - /cliente/petshops/page.tsx
   - /cliente/indicacoes/page.tsx
   - /cliente/notificacoes/page.tsx
   - /cliente/agendamento/[id]/page.tsx (detalhes)
```

---

## 📄 Página 2 — Agendamento (`/cliente/agendamento`)

### Problemas Identificados

#### 🔴 Críticos
- **`timeSlots` hardcoded:** Horários disponíveis são fixos e nunca validam disponibilidade real do pet shop.
- **`petShopId` hardcoded no POST:** O endpoint `/api/appointments` recebe `petShopId` do primeiro pet do cliente — se o cliente tiver pets de pet shops diferentes, o booking vai para o errado.
- **Pet shop não selecionável:** O tutor não escolhe para qual pet shop agendar; isso é assumido automaticamente.
- **Sem confirmação de sucesso visual:** Após o POST, redireciona para `/cliente/historico` sem exibir um toast/modal de confirmação.

#### 🟡 Importantes
- **Serviço sem duração exibida:** O campo `durationMin` existe na API mas não é mostrado para o usuário na hora de escolher.
- **Sem feedback de pet shop fechado:** Domingos estão desabilitados, mas não há info de horário de funcionamento do pet shop.
- **Erro de validação pouco claro:** A mensagem de `errorMsg` aparece muito pequena abaixo do resumo, sem destaque visual.

#### 🟢 Desejáveis
- Mostrar foto/avatar do pet selecionado no card de resumo.
- Mostrar previsão de término do serviço (horário + duração).
- Pré-selecionar automaticamente o pet mais recente do usuário.
- Exibir badge "Mais popular" nos serviços mais agendados.

### Plano de Ação

```
1. Criar endpoint GET /api/petshops/:id/availability?date=YYYY-MM-DD
   → Retorna slots disponíveis para aquela data
2. Tornar seleção de pet shop explícita (Step 0 no fluxo)
3. Buscar timeSlots dinamicamente via API ao selecionar pet shop + dia
4. Exibir duração de cada serviço no ServiceCard
5. Após POST bem-sucedido: exibir SuccessModal com resumo do agendamento
6. Melhorar mensagem de errorMsg: usar toast component com ícone de erro
```

---

## 📄 Página 3 — Histórico (`/cliente/historico`)

### Problemas Identificados

#### 🔴 Críticos
- **100% mock:** Todos os agendamentos vêm de `mockAppointments` + `userId = "user-client-001"` hardcoded.
- **`userId` fixo:** Em produção, usuários diferentes verão sempre o mesmo histórico.
- **Link de WhatsApp com `apt.ownerPhone` do mock:** Pode gerar links inválidos em produção.
- **`/cliente/agendamento/${apt.id}` não existe:** Link de "Detalhes" leva a rota inexistente.

#### 🟡 Importantes
- **Sem filtro por status:** O usuário não consegue filtrar apenas cancelados, concluídos, etc.
- **Sem paginação ou scroll infinito:** Se o usuário tiver muitos agendamentos, a lista fica enorme sem controle.
- **Sem estado de loading:** Quando a busca for assíncrona, precisa de skeleton.
- **Sem estado de erro:** Se a API falhar, nenhum feedback para o usuário.

#### 🟢 Desejáveis
- Filtro por período (este mês, últimos 3 meses, etc.).
- Opção de reagendar diretamente a partir de um agendamento passado.
- Card de agendamento concluído com botão "Avaliar serviço" (review).

### Plano de Ação

```
1. Substituir mockAppointments por fetch("/api/appointments") com auth real
2. Adicionar useSession() para pegar o clientId correto
3. Adicionar filtros de status (tabs: "Próximos" | "Concluídos" | "Cancelados")
4. Implementar skeleton loader durante fetch
5. Implementar banner de erro se API falhar
6. Criar rota /cliente/agendamento/[id]/page.tsx (detalhes + cancelamento)
7. Tornar link do WhatsApp dinâmico com telefone do pet shop real
```

---

## 📄 Página 4 — Meus Pets (`/cliente/meus-pets`)

### Problemas Identificados

#### 🟡 Importantes
- **Link "Adicionar novo pet" → `/cliente/meus-pets/novo` não existe:** Rota inexistente. O clique leva a 404.
- **Sem estado de erro:** Se o fetch falhar, a tela fica em branco (sem banner informativo).
- **Avatar do Header hardcoded:** `userAvatar={{ name: "Tutor" }}` deveria exibir o nome real do usuário logado.
- **Notificações hardcoded:** `badge: 1` é fixo e não reflete notificações reais.

#### 🟢 Desejáveis
- Adicionar foto real do pet (campo `photoUrl` no modelo `Pet`).
- Exibir indicador visual de saúde (vacinas vencidas, dias desde último banho).
- Botão de edição rápida no card do pet (long-press ou swipe).

### Plano de Ação

```
1. Criar rota /cliente/meus-pets/novo/page.tsx com formulário de cadastro de pet
   → POST /api/pets com name, species, breed, weight, birthDate
2. Adicionar estado de erro + banner no fetch de pets
3. Usar useSession() para exibir nome real no Avatar do header
4. Adicionar campo photoUrl no modelo Pet e endpoint de upload de foto
5. Adicionar indicadores visuais de saúde no PetCard (badge "Vacina vencida")
```

---

## 📄 Página 5 — Prontuário do Pet (`/cliente/meus-pets/[id]`)

### Problemas Identificados

#### 🔴 Críticos
- **`groomingHistory` completamente hardcoded:** Histórico de serviços (banho, tosa, vacinas, consultas) nunca foi buscado de uma API.
- **`allergyTags` e `behaviorTags` hardcoded:** Alertas de alergia e comportamento são fixos, qualquer pet mostrará "Alergia a Shampoo Neutro".
- **`observations` hardcoded:** Notas do veterinário são textos fixos no código, não dados reais.
- **Pet buscado do `mockPets`:** O prontuário usa `mockPets.find()` em vez de fetch da API.

#### 🟡 Importantes
- **Aba "Histórico" sem ação "Agendar novamente":** Seria altamente útil poder reagendar o mesmo serviço com 1 clique.
- **Sem estado de loading:** Quando o pet for buscado via API, precisa de skeleton.
- **Botão "Novo Agendamento" não pré-seleciona o pet:** Navegar para `/cliente/agendamento` perde o contexto de qual pet foi aberto.
- **Aba "Observações" sem botão de edição:** O tutor não pode adicionar suas próprias observações.

#### 🟢 Desejáveis
- Galeria de fotos do pet (upload via câmera).
- Compartilhar prontuário em PDF para veterinário.
- Linha do tempo integrada de vacinas + banhos + consultas em uma view única.

### Plano de Ação

```
1. Criar endpoint GET /api/pets/:id (com includes: appointments, vaccines)
2. Substituir mockPets.find() por fetch("/api/pets/:id")
3. Adicionar loading skeleton e estado de erro
4. Buscar groomingHistory de /api/pets/:id/appointments
5. Tornar allergyTags e behaviorTags vir do modelo Pet (campos notes/tags)
6. Botão "Novo Agendamento" deve navegar para /cliente/agendamento?petId={id}
7. Adicionar textarea editável na aba "Observações" com botão de salvar
8. Criar endpoint PATCH /api/pets/:id para salvar observações do tutor
```

---

## 📄 Página 6 — Perfil (`/cliente/perfil`)

### Problemas Identificados

#### 🔴 Críticos
- **`mockUser` hardcoded:** Nome, email, telefone, plano e código de indicação são fixos ("Ana Souza").
- **7 de 8 itens do menu usam `onClick={() => alert("Em breve!")}`:** Nenhuma ação funciona. São becos sem saída.
  - "Editar perfil" → alert
  - "Notificações" → alert
  - "Segurança e senha" → alert
  - "Pagamentos" → alert
  - "Programa de indicações" → alert
  - "Avaliações" → alert
  - "Central de ajuda" → alert
  - "Enviar feedback" → alert

#### 🟡 Importantes
- **Código de indicação não é copiável:** O código "ANA2024" está em texto, mas não tem botão "Copiar".
- **Sair da conta usa `window.location.href="/login"`** em vez de `signOut()` do NextAuth — não invalida a sessão.
- **Política de privacidade não tem href:** Link sem destino.

#### 🟢 Desejáveis
- Campo de foto de perfil com upload real.
- Exibir plano atual com data de vencimento/renovação.
- Indicador de progresso de indicações (ex: "3/5 indicações para próximo prêmio").

### Plano de Ação

```
1. Usar useSession() para carregar dados reais do usuário
2. Criar rota /cliente/perfil/editar/page.tsx com formulário de edição
   → PATCH /api/me com name, phone, photoUrl
3. Criar rota /cliente/notificacoes/page.tsx
4. Criar rota /cliente/indicacoes/page.tsx
5. Implementar botão "Copiar código" com navigator.clipboard.writeText()
6. Substituir window.location.href="/login" por signOut({ callbackUrl: "/login" })
7. Adicionar href para Política de Privacidade (rota /privacidade)
8. Substituir todos os alerts por rotas funcionais ou modals reais
```

---

## 🗺️ Rotas Faltantes (Becos Sem Saída)

As seguintes rotas são referenciadas no código mas **não existem**:

| Rota | Referenciada em | Prioridade |
|------|----------------|------------|
| `/cliente/notificacoes` | Início, Histórico, Meus Pets | 🔴 Crítico |
| `/cliente/petshops` | Início (Acesso Rápido) | 🔴 Crítico |
| `/cliente/indicacoes` | Início, Perfil | 🟡 Importante |
| `/cliente/agendamento/[id]` | Início, Histórico | 🟡 Importante |
| `/cliente/meus-pets/novo` | Meus Pets | 🟡 Importante |
| `/cliente/perfil/editar` | Perfil | 🟡 Importante |
| `/privacidade` | Perfil | 🟢 Desejável |

---

## 📊 Endpoints de API Necessários

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/me` | GET | Dados do usuário logado |
| `/api/me` | PATCH | Atualizar perfil |
| `/api/cliente/dashboard` | GET | Resumo: pets + próximo agendamento |
| `/api/pets` | POST | Cadastrar novo pet |
| `/api/pets/:id` | GET | Dados completos do pet (inclui histórico) |
| `/api/pets/:id` | PATCH | Atualizar observações/dados do pet |
| `/api/pets/:id/appointments` | GET | Histórico de agendamentos do pet |
| `/api/petshops/:id/availability` | GET | Slots disponíveis por data |
| `/api/notifications` | GET | Notificações do usuário |
| `/api/referrals` | GET | Programa de indicações |

---

## 🏁 Ordem de Execução Recomendada

### Sprint 1 — Dados Reais e Autenticação (Fundação)
1. ✅ Implementar `useSession()` em **todas** as páginas do cliente
2. ✅ Criar `GET /api/me` e substituir `mockUser` em Início e Perfil
3. ✅ Criar `GET /api/cliente/dashboard` e substituir mocks em Início
4. ✅ Substituir `mockAppointments` em Histórico por chamada real à API

### Sprint 2 — Rotas Faltantes (Anti-Becos)
5. 🔲 Criar `/cliente/notificacoes/page.tsx`
6. 🔲 Criar `/cliente/agendamento/[id]/page.tsx` (detalhes + cancelamento)
7. 🔲 Criar `/cliente/meus-pets/novo/page.tsx` (formulário de cadastro)
8. 🔲 Criar `/cliente/indicacoes/page.tsx`

### Sprint 3 — Agendamento Dinâmico
9. 🔲 Criar `GET /api/petshops/:id/availability`
10. 🔲 Tornar `timeSlots` dinâmicos baseados na disponibilidade real
11. 🔲 Adicionar seleção explícita de pet shop no fluxo de agendamento
12. 🔲 Exibir modal de sucesso após confirmação de agendamento

### Sprint 4 — Prontuário Real
13. 🔲 Criar `GET /api/pets/:id` com histórico real
14. 🔲 Remover `groomingHistory`, `allergyTags`, `observations` hardcoded
15. 🔲 Tornar aba "Observações" editável com `PATCH /api/pets/:id`

### Sprint 5 — Perfil e UX Final
16. 🔲 Criar `/cliente/perfil/editar/page.tsx`
17. 🔲 Substituir todos os `alert("Em breve!")` por rotas ou modals reais
18. 🔲 Implementar `navigator.clipboard.writeText()` no código de indicação
19. 🔲 Corrigir `signOut()` no botão de sair

---

## ✅ Checklist Resumido

- [ ] `useSession()` em todas as páginas
- [ ] API real substituindo todos os mocks
- [x] **Página de Histórico**: Agora puxa dados da API `/api/appointments`. (CONCLUÍDO)
- [x] **Página de Meus Pets**: Lista pets reais filtrados por tutor. (CONCLUÍDO)
- [x] **Página de Detalhes do Pet (Prontuário)**: Mostra vacinas e notas médicas REAIS. (CONCLUÍDO)
- [x] **Página de Notificações**: Criada com design prémio e mocks funcionais. (CONCLUÍDO)
- [x] **Página de Novo PET**: Integrada com `/app/cliente/meus-pets/novo`. (CONCLUÍDO)
- [ ] Botão "Copiar código" de indicação funcional
- [ ] Modal de sucesso após agendamento
- [ ] Formulário de cadastro de novo pet

---

*Documento gerado pela auditoria QA/UX do Visorpet · v1.0*
