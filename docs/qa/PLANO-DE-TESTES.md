# PLANO DE TESTES — VisorPet
**QA Engineer Sênior | Versão 1.0 | 2026-03-18**

---

## VISÃO GERAL

| Item | Detalhe |
|------|---------|
| Sistema | VisorPet SaaS — Gestão de Pet Shops |
| Ambiente | https://visorpett.vercel.app |
| Banco | Supabase PostgreSQL |
| Roles testadas | CLIENTE, DONO, SUPER_ADMIN |
| Total de casos | 87 casos de teste |
| Prioridade | P1 (Crítico) → P3 (Baixo) |

---

## CREDENCIAIS DE TESTE

| Role | Email | Senha | Observação |
|------|-------|-------|------------|
| SUPER_ADMIN | admin@admin.com | admin | Já existe no banco |
| DONO | *(cadastrar via /cadastro)* | — | Criar durante os testes |
| CLIENTE | *(cadastrar via /cadastro)* | — | Criar durante os testes |

---

## MÓDULO 1 — AUTENTICAÇÃO & ACESSO

### 1.1 Cadastro
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-001 | Cadastro CLIENTE válido | Acessar /cadastro, preencher nome/email/senha, role=CLIENTE, submeter | Redireciona para /cliente/inicio | P1 |
| TC-002 | Cadastro DONO válido | Acessar /cadastro, preencher dados, role=DONO, submeter | Redireciona para /dono/inicio | P1 |
| TC-003 | Email duplicado | Tentar cadastrar com email já existente | Mensagem: "Este e-mail já está em uso" | P1 |
| TC-004 | Senha curta (< 6 chars) | Preencher senha com 5 caracteres | Mensagem: "A senha deve ter pelo menos 6 caracteres" | P2 |
| TC-005 | Campos obrigatórios vazios | Submeter formulário sem preencher | Validação de campos obrigatórios | P2 |

### 1.2 Login
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-006 | Login CLIENTE | Email + senha corretos, role=CLIENTE | Redireciona para /cliente/inicio | P1 |
| TC-007 | Login DONO | Email + senha corretos, role=DONO | Redireciona para /dono/inicio | P1 |
| TC-008 | Login SUPER_ADMIN | admin@admin.com + admin, role=SUPER_ADMIN | Redireciona para /admin/painel | P1 |
| TC-009 | Credenciais inválidas | Senha errada | Mensagem de erro, não loga | P1 |
| TC-010 | Role errada no login | CLIENTE tentando logar como DONO | Erro ou redirecionamento correto | P2 |

### 1.3 Controle de Acesso (RBAC)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-011 | CLIENTE tenta acessar /dono/inicio | URL direta | Redireciona para /cliente/inicio | P1 |
| TC-012 | CLIENTE tenta acessar /admin/painel | URL direta | Redireciona para /cliente/inicio | P1 |
| TC-013 | DONO tenta acessar /cliente/inicio | URL direta | Redireciona para /dono/inicio | P1 |
| TC-014 | DONO tenta acessar /admin/painel | URL direta | Redireciona para /dono/inicio | P1 |
| TC-015 | Não autenticado acessa rota protegida | URL direta sem login | Redireciona para /login | P1 |
| TC-016 | SUPER_ADMIN acessa qualquer rota | Navegar para /cliente, /dono, /admin | Acesso liberado em todas | P1 |

### 1.4 Logout
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-017 | Logout do CLIENTE | Perfil → Sair da Conta | Redireciona para /login, sessão encerrada | P1 |
| TC-018 | Logout do DONO | Perfil → Sair da Conta | Redireciona para /login, sessão encerrada | P1 |
| TC-019 | Sessão expirada | Aguardar expiração ou limpar cookies | Redireciona para /login | P2 |

---

## MÓDULO 2 — ÁREA DO CLIENTE

### 2.1 Dashboard (/cliente/inicio)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-020 | Dashboard sem pets | Login CLIENTE sem pets cadastrados | Exibe estado vazio, sem erros | P1 |
| TC-021 | Dashboard com pets e agendamento | Login CLIENTE com pets e agendamento futuro | Exibe próximo agendamento e total | P1 |
| TC-022 | Loading state | Observar ao carregar | Skeleton/loading visível enquanto carrega | P3 |

### 2.2 Meus Pets (/cliente/meus-pets)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-023 | Listar pets (lista vazia) | Acessar /cliente/meus-pets sem pets | Exibe mensagem de lista vazia | P1 |
| TC-024 | **Cadastrar pet** | /meus-pets/novo → preencher dados → Cadastrar | Pet salvo, redireciona para lista | P1 |
| TC-025 | Campos obrigatórios no pet | Submeter sem nome ou espécie | Validação ativa, não salva | P1 |
| TC-026 | Cadastrar pet com todos campos | Nome, espécie, raça, data, peso, observações | Todos os dados salvos corretamente | P2 |
| TC-027 | Ver detalhe do pet | Clicar em pet da lista | Abre /cliente/meus-pets/[id] com dados | P1 |
| TC-028 | Editar pet | Detalhe → Editar → alterar nome → Salvar | Nome atualizado no banco | P1 |
| TC-029 | Deletar pet | Detalhe → Deletar → Confirmar | Pet removido da lista | P2 |
| TC-030 | Listar vacinas do pet | Abrir detalhe de pet com vacina | Vacinas listadas corretamente | P2 |

### 2.3 Agendamento (/cliente/agendamento)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-031 | Tela de agendamento sem pet shop | Acessar sem pet shop cadastrado | Instrução para buscar pet shop | P2 |
| TC-032 | Criar agendamento | Selecionar pet shop, pet, serviço, data → Confirmar | Agendamento criado com status "agendado" | P1 |
| TC-033 | Agendamento sem pet cadastrado | Tentar sem ter pet | Solicita cadastro de pet primeiro | P2 |

### 2.4 Histórico (/cliente/historico)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-034 | Histórico vazio | Acessar sem agendamentos | Estado vazio exibido | P2 |
| TC-035 | Histórico com agendamentos | Acessar com agendamentos passados | Lista correta de agendamentos | P1 |

### 2.5 Perfil do Cliente (/cliente/perfil)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-036 | Visualizar perfil | Acessar /cliente/perfil | Nome e email exibidos corretamente | P2 |
| TC-037 | Logout pelo perfil | Clicar em "Sair da Conta" | Sessão encerrada, vai para /login | P1 |

---

## MÓDULO 3 — ÁREA DO DONO

### 3.1 Dashboard (/dono/inicio)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-038 | Dashboard DONO sem pet shop | Login DONO sem petShopId | Tela de onboarding ou estado vazio | P1 |
| TC-039 | Dashboard DONO com pet shop | Login DONO com pet shop cadastrado | Métricas do dia visíveis | P1 |

### 3.2 Agenda (/dono/agenda)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-040 | Agenda do dia atual | Acessar /dono/agenda | Agendamentos de hoje listados | P1 |
| TC-041 | Filtrar por data | Alterar data no filtro | Agendamentos da data selecionada | P1 |
| TC-042 | Filtrar por tosador | Selecionar tosador específico | Somente agendamentos do tosador | P2 |
| TC-043 | Agenda vazia | Dia sem agendamentos | Mensagem de agenda livre | P2 |

### 3.3 Clientes (/dono/clientes)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-044 | Listar clientes | Acessar /dono/clientes | Lista de clientes do pet shop | P1 |
| TC-045 | Buscar cliente por nome | Digitar nome no campo de busca | Filtro em tempo real | P1 |
| TC-046 | Buscar cliente por telefone | Digitar telefone na busca | Resultado filtrado | P1 |
| TC-047 | Adicionar cliente | Botão "+" → Preencher → Salvar | Cliente criado no banco | P1 |
| TC-048 | Link WhatsApp | Clicar no ícone de WhatsApp do cliente | Abre wa.me/55{telefone} | P2 |

### 3.4 Financeiro (/dono/financeiro)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-049 | Financeiro sem agendamentos | Acessar sem movimentação | Gráfico com zeros, sem erro | P2 |
| TC-050 | Financeiro com agendamentos | Acessar com agendamentos concluídos | Gráfico dos 6 meses correto | P1 |
| TC-051 | % de variação mensal | Comparar mês atual vs anterior | Percentual positivo/negativo exibido | P2 |

### 3.5 Área do Tosador (/dono/tosador)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-052 | Lista pendentes | Acessar com agendamentos de hoje | Aba Pendentes com agendamentos | P1 |
| TC-053 | Lista concluídos | Aba "Concluídos hoje" | Agendamentos com status concluido/em_atendimento | P1 |
| TC-054 | Sem agendamentos | Acessar em dia sem agendamentos | Estado vazio com mensagem | P2 |

### 3.6 Perfil do Pet Shop (/dono/perfil)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-055 | Exibe nome do shop | Acessar /dono/perfil | Nome real do pet shop exibido | P1 |
| TC-056 | Exibe plano atual | Visualizar perfil | Plano (FREE/PRO/etc.) exibido | P2 |
| TC-057 | Navegar para Dados do Pet Shop | Menu → Dados do Pet Shop | Abre /dono/perfil/dados | P2 |
| TC-058 | Navegar para Serviços | Menu → Serviços e Preços | Abre /dono/perfil/servicos | P2 |
| TC-059 | Logout do dono | Menu → Sair da Conta | Sessão encerrada | P1 |

---

## MÓDULO 4 — ÁREA SUPER ADMIN

### 4.1 Painel (/admin/painel)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-060 | Acesso ao painel | Login admin@admin.com → /admin/painel | Dashboard com métricas carregadas | P1 |
| TC-061 | Métricas carregam | Aguardar carregamento | MRR, assinantes, shops sem erro | P1 |

### 4.2 Gestão de Pet Shops (/admin/petshops)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-062 | Listar pet shops | Acessar /admin/petshops | Todos os pet shops cadastrados | P1 |
| TC-063 | Buscar por nome | Digitar nome no campo | Filtro funciona em tempo real | P1 |
| TC-064 | Buscar por email do dono | Digitar email no campo | Filtra pelo email do proprietário | P1 |
| TC-065 | Bloquear pet shop | Botão de bloco em shop ATIVO | Status muda para CANCELLED | P1 |
| TC-066 | Reativar pet shop | Botão em shop CANCELADO | Status muda para ACTIVE | P1 |

### 4.3 Financeiro Admin (/admin/financeiro)
| # | Caso de Teste | Passos | Resultado Esperado | P |
|---|--------------|--------|-------------------|---|
| TC-067 | Métricas financeiras | Acessar /admin/financeiro | MRR, assinantes, churn exibidos | P1 |
| TC-068 | Cálculo do MRR | Verificar: assinantes × R$99 | Valor correto no card | P2 |

---

## MÓDULO 5 — APIs (Testes Diretos)

### 5.1 Segurança de Endpoints
| # | Caso de Teste | Request | Resultado Esperado | P |
|---|--------------|---------|-------------------|---|
| TC-069 | GET /api/me sem auth | Sem cookie de sessão | 401 Unauthorized | P1 |
| TC-070 | GET /api/clients sem auth | Sem cookie | 401 Unauthorized | P1 |
| TC-071 | GET /api/admin/metrics como CLIENTE | Cookie CLIENTE | 403 Forbidden | P1 |
| TC-072 | GET /api/admin/petshops como DONO | Cookie DONO | 403 Forbidden | P1 |
| TC-073 | PATCH /api/appointments/[id] como CLIENTE | Cookie CLIENTE | 403 Forbidden | P1 |

### 5.2 CRUD Pets via API
| # | Caso de Teste | Request | Resultado Esperado | P |
|---|--------------|---------|-------------------|---|
| TC-074 | POST /api/pets campos válidos | {name, species} | 201 + pet criado com id | P1 |
| TC-075 | POST /api/pets sem species | {name} only | 400 Validation error | P1 |
| TC-076 | GET /api/pets como CLIENTE | Cookie CLIENTE | 200 + apenas pets do usuário | P1 |
| TC-077 | PUT /api/pets/[id] de outro usuário | Cookie CLIENTE, pet alheio | 403 Forbidden | P1 |
| TC-078 | DELETE /api/pets/[id] próprio | Cookie CLIENTE, pet próprio | 200 + pet deletado | P2 |

---

## MÓDULO 6 — FLUXOS END-TO-END (E2E)

| # | Fluxo Completo | Passos | Resultado Esperado | P |
|---|---------------|--------|-------------------|---|
| TC-079 | **E2E: Novo CLIENTE** | Cadastro → Login → Dashboard → Cadastrar Pet → Ver Pet | Todo o fluxo sem erros | P1 |
| TC-080 | **E2E: Novo DONO** | Cadastro DONO → Login → Criar Pet Shop → Adicionar Cliente → Ver Agenda | Fluxo completo funcional | P1 |
| TC-081 | **E2E: Agendamento** | CLIENTE agenda → DONO vê na agenda → DONO atualiza status → CLIENTE vê no histórico | Status sincronizado | P1 |
| TC-082 | **E2E: Admin bloqueia DONO** | Admin bloqueia shop → DONO tenta logar → Acesso restrito | Bloqueio efetivo | P1 |

---

## MÓDULO 7 — UX & RESPONSIVIDADE

| # | Caso de Teste | Dispositivo | Resultado Esperado | P |
|---|--------------|-------------|-------------------|---|
| TC-083 | Layout mobile CLIENTE | 375px (iPhone SE) | BottomNav visível, sem overflow | P1 |
| TC-084 | Layout mobile DONO | 375px | Navegação funcional no mobile | P1 |
| TC-085 | Layout admin desktop | 1440px | Sidebar visível, grid correto | P1 |
| TC-086 | Loading states | Conexão lenta (throttle 3G) | Skeletons visíveis, sem tela branca | P2 |
| TC-087 | Estados de erro | Desligar internet → tentar ação | Mensagem de erro amigável | P2 |

---

## RESUMO POR PRIORIDADE

| Prioridade | Qtd | Descrição |
|-----------|-----|-----------|
| **P1 — Crítico** | 52 | Deve passar 100% antes de qualquer release |
| **P2 — Alto** | 25 | Deve passar antes de go-live |
| **P3 — Médio** | 10 | Melhorias de UX e edge cases |
| **Total** | **87** | — |

---

## CHECKLIST DE APROVAÇÃO

Para considerar o sistema **APROVADO para produção**, os seguintes critérios devem ser atendidos:

- [ ] 100% dos casos P1 com status PASS
- [ ] ≥ 90% dos casos P2 com status PASS
- [ ] Nenhum erro 500 em fluxos normais
- [ ] Nenhum dado de usuário exposto sem autenticação
- [ ] RBAC funcionando em todas as rotas
- [ ] Fluxos E2E (TC-079 a TC-082) todos PASS

---

## REGISTRO DE EXECUÇÃO

| # | Caso | Status | Data | Observação |
|---|------|--------|------|------------|
| TC-001 | Cadastro CLIENTE válido | ⬜ | — | — |
| TC-002 | Cadastro DONO válido | ⬜ | — | — |
| TC-003 | Email duplicado | ⬜ | — | — |
| ... | ... | ... | ... | ... |

**Legenda:** ✅ PASS | ❌ FAIL | ⚠️ PARCIAL | ⬜ PENDENTE

---

*Documento gerado por QA Engineer Sênior — VisorPet v1.0*
