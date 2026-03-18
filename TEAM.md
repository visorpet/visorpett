# Time IA — Visorpet

## Contexto

O **Visorpet** é uma plataforma SaaS para gestão inteligente de pet shops (Next.js 14 + TypeScript + Supabase). O projeto já possui MVP funcional com autenticação multi-papel (CLIENTE / DONO / SUPER_ADMIN), gestão de pets, agendamentos, financeiro e painel admin.

Este documento é a **referência central do time de agentes IA** que conduz o desenvolvimento do Visorpet — mapeando cargos de startup, agentes AIOX, skills disponíveis e regras de colaboração.

---

## Mapeamento: Cargo de Startup → Agente AIOX

### 🏛️ Fase 1 — Fundação

| Cargo | Agente | Persona | Responsabilidade |
|-------|--------|---------|-----------------|
| **CEO / Co-founder** | `@aiox-master` | **Orion** | Visão do produto, orquestração cross-funcional, decisões estratégicas |
| **CTO / Co-founder técnico** | `@architect` | **Aria** | Arquitetura, stack, APIs, segurança, performance |
| **Full Stack Developer** | `@dev` | **Dex** | Implementação de features, bug fixes, código front e backend |

### 📦 Fase 2 — Produto

| Cargo | Agente | Persona | Responsabilidade |
|-------|--------|---------|-----------------|
| **Product Manager** | `@pm` | **Morgan** | Roadmap, PRDs, épicos, priorização, alinhamento negócio × engenharia |
| **UX/UI Designer** | `@ux-design-expert` | **Uma** | Design system, wireframes, componentes, acessibilidade |
| **DevOps / SRE** | `@devops` | **Gage** | CI/CD, git push (exclusivo), PRs, Vercel, migrations de produção |

### 🚀 Fase 3 — Crescimento

| Cargo | Agente | Persona | Responsabilidade |
|-------|--------|---------|-----------------|
| **Business Analyst** | `@analyst` | **Atlas** | Pesquisa, análise competitiva, requisitos, viabilidade |
| **QA Engineer** | `@qa` | **Quinn** | Plano de testes, quality gates, prevenção de regressões |
| **Data Engineer / DBA** | `@data-engineer` | **Dara** | Schema Supabase, RLS, migrations, índices, query optimization |

### 📋 Gestão de Processo

| Cargo | Agente | Persona | Responsabilidade |
|-------|--------|---------|-----------------|
| **Product Owner** | `@po` | **Pax** | Validação de stories (10-pontos), critérios de aceitação, backlog |
| **Scrum Master** | `@sm` | **River** | Criação de stories, branch local, facilitação de sprint |

---

## Skills por Agente

### 🧠 @aiox-master (Orion) — Orquestração & Framework

| Skill | Comando | O que faz |
|-------|---------|-----------|
| Executar qualquer task | `*task {nome}` | Roda qualquer task do catálogo abaixo |
| Criar story | `*create-next-story` | Cria próxima story do épico ativo |
| Criar documento | `*create-doc` | Gera documento a partir de template |
| Documentar projeto | `*document-project` | Gera documentação completa do projeto |
| Analisar framework | `*analyze-framework` | Inspeciona estrutura e padrões AIOX |
| Elicitação avançada | `*advanced-elicitation` | Coleta requisitos com técnicas avançadas |
| Criar agente | `*create` | Cria novo agente AIOX |
| Status atual | `*status` | Mostra contexto e progresso da sessão |
| Corrigir desvios | `*correct-course` | Analisa e corrige desvios de qualidade |
| IDS check | `*ids check` | Verifica se código/feature já existe |
| IDS registro | `*ids register` | Registra nova entidade no registry |
| Saúde do registry | `*ids health` | Checa saúde do registry de entidades |
| Sincronizar registry | `*sync-registry-intel` | Enriquece registry com dados de code intelligence |
| Modo conversa | `*chat-mode` | Assistência conversacional |

**Tasks de orquestração disponíveis:**
`orchestrate` · `orchestrate-resume` · `orchestrate-status` · `orchestrate-stop` · `execute-epic-plan` · `run-workflow` · `run-workflow-engine` · `waves` · `build-autonomous` · `session-resume`

---

### 💻 @dev (Dex) — Implementação

| Skill | Comando / Task | O que faz |
|-------|---------------|-----------|
| Desenvolver story | `dev-develop-story` | Implementa story completa com checklist |
| Aplicar fixes QA | `dev-apply-qa-fixes` | Aplica correções apontadas pelo QA |
| Melhorar qualidade | `dev-improve-code-quality` | Refatora para melhor qualidade |
| Otimizar performance | `dev-optimize-performance` | Analisa e otimiza hot paths |
| Sugerir refatoração | `dev-suggest-refactoring` | Propõe refatorações baseadas em padrões |
| Débito técnico | `dev-backlog-debt` | Mapeia e prioriza débito técnico |
| Validar story (dev) | `dev-validate-next-story` | Valida story antes de implementar |
| Construir componente | `build-component` | Cria componente seguindo design system |
| Criar serviço | `create-service` | Cria serviço/módulo novo |
| Construir projeto | `build` · `build-status` | Roda build e verifica status |
| Auditar código | `audit-codebase` | Auditoria completa do codebase |
| Consolidar padrões | `consolidate-patterns` · `extract-patterns` | Identifica e consolida padrões |
| Simplify | `/simplify` | Review code → reuse, quality, efficiency (Claude Code skill) |

---

### 🏗️ @architect (Aria) — Arquitetura

| Skill | Task | O que faz |
|-------|------|-----------|
| Analisar impacto | `architect-analyze-impact` | Avalia impacto de mudança arquitetural |
| Análise brownfield | `analyze-brownfield` | Avalia projeto legado/existente |
| Análise de performance | `analyze-performance` | Identifica gargalos arquiteturais |
| Análise de projeto | `analyze-project-structure` | Mapeia estrutura e dependências |
| Análise cross-artifact | `analyze-cross-artifact` | Valida consistência entre artefatos |
| Segurança | `security-audit` · `security-scan` | Auditoria de segurança |
| Especificação | `spec-assess-complexity` · `spec-gather-requirements` · `spec-write-spec` · `spec-critique` · `spec-research-dependencies` | Pipeline completo de spec |
| Estratégia de migração | `generate-migration-strategy` | Planeja migrações de tecnologia |
| Shock report | `generate-shock-report` | Relatório de riscos críticos |

---

### 🗄️ @data-engineer (Dara) — Database

| Skill | Task | O que faz |
|-------|------|-----------|
| **Supabase Postgres Best Practices** | `.agents/skills/supabase-postgres-best-practices` | 8 categorias de regras: queries N+1, indexes, connection pooling, RLS, batch inserts, paginação, full-text search, locks |
| Modelagem de domínio | `db-domain-modeling` | Projeta schema a partir do domínio |
| Bootstrap do banco | `db-bootstrap` · `db-supabase-setup` | Configura banco do zero |
| Aplicar migration | `db-apply-migration` · `db-dry-run` | Aplica ou simula migration |
| Rollback | `db-rollback` | Reverte migration |
| Auditoria de schema | `db-schema-audit` | Inspeciona schema atual |
| Auditoria RLS | `db-rls-audit` · `db-policy-apply` | Verifica e aplica Row-Level Security |
| Analisar hot paths | `db-analyze-hotpaths` | Identifica queries lentas |
| Explain query | `db-explain` | Analisa plano de execução |
| Seed de dados | `db-seed` · `db-load-csv` | Popula banco com dados |
| Snapshot | `db-snapshot` | Cria snapshot do banco |
| Smoke test | `db-smoke-test` | Testa integridade do banco |
| Verificar ambiente | `db-env-check` | Checa variáveis e conexão |
| Impersonar usuário | `db-impersonate` | Testa RLS como usuário específico |
| Verificar ordem | `db-verify-order` | Valida ordem de migrations |

**Skill exclusiva instalada:**
> `supabase-postgres-best-practices` (v1.1.0 by Supabase) — 8 categorias de otimização Postgres: query performance, indexes compostos/parciais, connection management, batch operations, paginação eficiente, full-text search, deadlock prevention, skip-locked pattern.

---

### 🎨 @ux-design-expert (Uma) — UX/UI

| Skill | Task | O que faz |
|-------|------|-----------|
| Criar wireframe | `ux-create-wireframe` | Gera wireframe de tela |
| Scan de artefato | `ux-ds-scan-artifact` | Analisa componente vs. design system |
| Pesquisa de usuário | `ux-user-research` | Conduz pesquisa qualitativa |
| Construir componente | `build-component` · `compose-molecule` | Cria componente UI |
| Setup design system | `setup-design-system` · `run-design-system-pipeline` | Configura e executa pipeline de DS |
| Bootstrap shadcn | `bootstrap-shadcn-library` | Instala e configura shadcn/ui |
| Design tokens | `export-design-tokens-dtcg` · `extract-tokens` | Exporta tokens no formato DTCG |
| Tailwind | `audit-tailwind-config` · `tailwind-upgrade` | Audita e atualiza config Tailwind |
| Gerar prompt frontend | `generate-ai-frontend-prompt` | Cria prompt para geração de UI com IA |
| Estender padrão | `extend-pattern` | Estende padrão existente de componente |

---

### 🚀 @devops (Gage) — DevOps & CI/CD

| Skill | Task / Comando | O que faz |
|-------|---------------|-----------|
| PR automation | `github-devops-github-pr-automation` · `pr-automation` | Cria e gerencia PRs automaticamente |
| Quality gate pré-push | `github-devops-pre-push-quality-gate` | Roda checks antes de todo push |
| Limpeza de repositório | `github-devops-repository-cleanup` | Remove branches, tags obsoletos |
| Gestão de versão | `github-devops-version-management` · `release-management` | Semver, changelogs, releases |
| CI/CD | `ci-cd-configuration` | Configura pipelines CI/CD |
| Setup GitHub | `setup-github` | Configura repositório e permissões |
| Publicar npm | `publish-npm` | Publica pacote npm |
| Worktrees | `create-worktree` · `list-worktrees` · `merge-worktree` · `remove-worktree` · `cleanup-worktrees` | Gerencia git worktrees isolados |
| MCPs | `add-mcp` · `remove-mcp` · `list-mcps` · `search-mcp` · `setup-mcp-docker` · `mcp-workflow` | Gerencia MCP servers |
| Setup LLM routing | `setup-llm-routing` | Configura roteamento de modelos IA |

---

### 🔍 @qa (Quinn) — Qualidade

| Skill | Task | O que faz |
|-------|------|-----------|
| QA Gate | `qa-gate` | Executa os 7 quality checks de uma story |
| Gerar testes | `qa-generate-tests` | Cria suite de testes para feature |
| Rodar testes | `qa-run-tests` · `create-suite` | Executa e organiza testes |
| Testar como usuário | `test-as-user` | Simula fluxo de usuário real |
| Review de story | `qa-review-story` · `qa-review-proposal` | Revisa story e proposta técnica |
| Review de build | `qa-review-build` | Valida artefatos de build |
| Fix issues | `qa-fix-issues` · `apply-qa-fixes` | Corrige issues identificados |
| Criar fix request | `qa-create-fix-request` | Formaliza pedido de correção para @dev |
| Checklist de segurança | `qa-security-checklist` | Valida aspectos de segurança |
| Validação de migração | `qa-migration-validation` | Testa migration antes de aplicar |
| Validação de biblioteca | `qa-library-validation` | Valida upgrade de dependências |
| Detectar falso-positivo | `qa-false-positive-detection` | Filtra falsos positivos de testes |
| Perfil de risco | `qa-risk-profile` · `qa-nfr-assess` | Avalia riscos e não-funcionais |
| Evidências | `qa-evidence-requirements` | Documenta evidências de qualidade |
| Browser check | `qa-browser-console-check` | Verifica erros de console no browser |
| Triagem de issues | `github-issue-triage` · `triage-github-issues` | Classifica e prioriza issues do GitHub |
| Rastrear requisitos | `qa-trace-requirements` | Rastreia cobertura de requisitos |
| Design de testes | `qa-test-design` | Projeta estratégia de testes |

---

### 📊 @analyst (Atlas) — Análise & Pesquisa

| Skill | Task | O que faz |
|-------|------|-----------|
| Brainstorming | `analyst-facilitate-brainstorming` · `facilitate-brainstorming-session` | Facilita sessão de ideação |
| Pesquisa profunda | `create-deep-research-prompt` | Cria prompt para pesquisa aprofundada |
| Calcular ROI | `calculate-roi` | Estima retorno sobre investimento de feature |
| Documentar gotchas | `document-gotchas` · `gotcha` · `gotchas` | Registra armadilhas e aprendizados |
| Triagem de issues | `github-issue-triage` · `resolve-github-issue` · `review-contributor-pr` | Analisa issues e PRs do GitHub |
| Documentação | `generate-documentation` · `sync-documentation` · `check-docs-links` | Gera e sincroniza docs |

---

### 📋 @pm (Morgan) — Product Management

| Skill | Task | O que faz |
|-------|------|-----------|
| Criar epic brownfield | `brownfield-create-epic` · `brownfield-create-story` · `create-brownfield-story` | Épicos e stories para projeto existente |
| Executar epic plan | `execute-epic-plan` | Executa plano de épico completo |
| Spec pipeline | `spec-gather-requirements` → `spec-assess-complexity` → `spec-research-dependencies` → `spec-write-spec` → `spec-critique` | Pipeline completo spec → story |
| Resumo de build | `build-resume` | Relatório executivo de build |
| Loop | `/loop` | Executa task em intervalo recorrente (Claude Code skill) |

---

### 📌 @po (Pax) — Product Owner

| Skill | Task | O que faz |
|-------|------|-----------|
| Validar story | `validate-next-story` · `dev-validate-next-story` | Checklist de 10 pontos GO/NO-GO |
| Gerenciar backlog | `po-backlog-add` · `po-stories-index` · `po-manage-story-backlog` | Gestão do backlog de stories |
| Pull story | `po-pull-story` · `po-pull-story-from-clickup` | Puxa próxima story para sprint |
| Sync story | `po-sync-story` · `po-sync-story-to-clickup` | Sincroniza story com ClickUp |
| Fechar story | `po-close-story` | Fecha story com critérios atendidos |
| Checkpoint | `story-checkpoint` | Verifica progresso da story em andamento |

---

### 🔄 @sm (River) — Scrum Master

| Skill | Task | O que faz |
|-------|------|-----------|
| Criar story | `sm-create-next-story` · `create-next-story` | Cria próxima story do épico |
| Validar story (sm) | `validate-next-story` | Valida story antes de ir para @po |
| Colaboração | `collaborative-edit` | Edição colaborativa de artefatos |
| Health check | `health-check.yaml` | Verifica saúde do projeto |
| Init status | `init-project-status` | Inicializa tracking de status do projeto |

---

## Skills Globais (Claude Code — qualquer agente)

| Skill | Comando | O que faz |
|-------|---------|-----------|
| **Simplify** | `/simplify` | Review de código: reuse, qualidade, eficiência → fix automático |
| **Update Config** | `/update-config` | Configura hooks, permissões, settings.json do Claude Code |
| **Loop** | `/loop {intervalo} {task}` | Executa task recorrentemente (ex: `/loop 5m /simplify`) |
| **Claude API** | `/claude-api` | Build de apps com Anthropic SDK |

---

## Checklists Disponíveis

| Checklist | Uso |
|-----------|-----|
| `agent-quality-gate` | Gate de qualidade antes de fechar story |
| `self-critique-checklist` | Auto-revisão de qualquer agente antes de entregar |
| `brownfield-compatibility-checklist` | Validação de compatibilidade em projeto existente |
| `memory-audit-checklist` | Auditoria da memória dos agentes |
| `issue-triage-checklist` | Triagem padronizada de issues |

---

## Fluxo de Trabalho Standard

```
@pm  →  Cria PRD / define Epic
 ↓
@sm  →  Cria stories (*sm-create-next-story)
 ↓
@po  →  Valida story (*validate-next-story) — GO / NO-GO
 ↓
@architect → Revisa decisões técnicas (se necessário)
 ↓
@dev →  Implementa (*dev-develop-story)
 ↓
@qa  →  QA Gate (*qa-gate) — PASS / FAIL
 ↓
@devops → Push + PR + Deploy Vercel
```

**Ativações transversais:**
- `@architect` → decisão de arquitetura, nova integração, mudança de schema
- `@ux-design-expert` → tela nova, revisão de componente visual
- `@data-engineer` → migration, índice, query complexa Supabase
- `@analyst` → pesquisa, análise de feature, benchmarking
- `@aiox-master` → conflitos, decisões cross-funcional, orquestração

---

## Domínios do Codebase por Agente

| Agente | Arquivos / Pastas |
|--------|------------------|
| `@dev` | `app/` · `app/api/` · `lib/` · `components/` |
| `@architect` | `middleware.ts` · `lib/supabase/` · `lib/session.ts` |
| `@data-engineer` | `prisma/schema.prisma` · `supabase/migrations/` |
| `@ux-design-expert` | `app/cliente/` · `app/dono/` · `components/ui/` · `/desing ux ui obrigatorio no projeto telas/` |
| `@devops` | Vercel · GitHub · `.env` · secrets |
| `@qa` | `docs/qa/PLANO-DE-TESTES.md` · testes de regressão |

---

## Stack de Referência

```
Framework:    Next.js 14 + TypeScript
Auth:         Supabase Auth (SSR cookies) — roles via user_metadata
Database:     PostgreSQL via Supabase (PostgREST API)
ORM:          Prisma (schema reference) + Supabase JS (queries)
ID format:    UUID — crypto.randomUUID() (não CUID)
Deploy:       Vercel (branch master → auto-deploy)
Email:        Resend
AI:           Gemini (@google/generative-ai)
Validação:    Zod (lib/validations/)
```

---

## Regras de Ouro

1. `@devops` tem **autoridade exclusiva** para `git push` e criação de PRs
2. Toda **decisão de schema** passa por `@architect` → `@data-engineer`
3. Toda **story** segue: `@sm` draft → `@po` validate → `@dev` implement → `@qa` gate → `@devops` push
4. **IDs são UUIDs** (`crypto.randomUUID()`) — não CUIDs
5. **`updatedAt`** deve ser incluído manualmente em inserts/updates (Supabase JS não preenche `@updatedAt` do Prisma)
6. **Cookies Supabase SSR**: `sb-{ref}-auth-token=encodeURIComponent(JSON.stringify(session))`
7. **Tabela `User` pública está vazia** — usar `auth.admin.listUsers()` para dados de owners
8. **FK constraints** para `User` pública foram removidas — `ownerId` referencia auth users direto
9. Toda query Supabase com `@data-engineer` deve seguir a skill **`supabase-postgres-best-practices`**

---

## Backlog de Próximas Iniciativas

| Prioridade | Feature | Agente Líder |
|-----------|---------|--------------|
| 🔴 Alta | Onboarding DONO: criar PetShop pelo app | `@pm` → `@dev` |
| 🔴 Alta | Dashboard Dono completo (métricas reais) | `@dev` + `@ux-design-expert` |
| 🟡 Média | Cadastro de serviços e groomers pelo DONO | `@dev` |
| 🟡 Média | Agendamento pelo CLIENTE (fluxo completo) | `@dev` + `@ux-design-expert` |
| 🟡 Média | Notificações WhatsApp (cron de lembretes) | `@dev` + `@architect` |
| 🟢 Baixa | Planos de assinatura e cobrança | `@architect` + `@dev` |
| 🟢 Baixa | App mobile (React Native ou PWA) | `@architect` |

---

*Time IA Visorpet — @aiox-master (Orion)*
