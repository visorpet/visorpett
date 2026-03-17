# 🐾 Relatório de QA — Visorpet Front-End
**Auditoria Senior QA + UX | Data: 17/03/2026**

---

## 🔍 Escopo Auditado

| Role | Páginas Analisadas |
|---|---|
| **Cliente (Tutor)** | `/inicio`, `/agendamento`, `/historico`, `/meus-pets`, `/perfil` |
| **Dono (Pet Shop)** | `/inicio`, `/agenda`, `/clientes`, `/financeiro`, `/perfil` |
| **Super Admin** | `/painel`, `/petshops` |
| **Componentes** | `BottomNav`, `PageHeader`, `Badge`, `Avatar`, `StatCard`, `BarChart` |
| **Design System** | `globals.css`, `tailwind.config.ts` |

---

## 🚨 PROBLEMAS CRÍTICOS — Etapas de Correção

### ETAPA 1 — BECOS SEM SAÍDA (Dead Links / Botões sem ação)

> [!CAUTION]
> Estes são os bugs mais graves. Usuário clica e nada acontece — mata a confiança no produto.

#### 1.1 — Agenda do Dono: FAB sem função
**Arquivo:** `app/dono/agenda/page.tsx` — Linha 197
```tsx
// ❌ PROBLEMA: Botão de adicionar agendamento não tem onClick nem href
<button className="fixed bottom-24 right-5 w-14 h-14 bg-primary...">
  <MaterialIcon icon="add" size="lg" />
</button>
```
**Como corrigir:**
```tsx
// ✅ SOLUÇÃO: Transformar em Link para a página de novo agendamento
<Link 
  href="/dono/agenda/novo" 
  className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
  aria-label="Novo agendamento"
>
  <MaterialIcon icon="add" size="lg" />
</Link>
```

#### 1.2 — Clientes do Dono: FAB sem função
**Arquivo:** `app/dono/clientes/page.tsx` — Linha 64
```tsx
// ❌ PROBLEMA: Botão de adicionar cliente não tem onClick nem href
<button className="fixed bottom-24 right-5 w-14 h-14 bg-primary...">
  <MaterialIcon icon="person_add" size="lg" />
</button>
```
**Como corrigir:** Adicionar `onClick` com modal de novo cliente ou href para `/dono/clientes/novo`.

#### 1.3 — Botão "Ver todos" da Automação de Retorno
**Arquivo:** `app/dono/inicio/page.tsx` — Linha 215
```tsx
// ❌ PROBLEMA: Botão sem onClick nem href
<button className="text-primary text-sm font-semibold hover:underline">
  Ver todos
</button>
```
**Como corrigir:** Adicionar `href="/dono/clientes?filter=inactive"` ou `onClick` com roteamento.

#### 1.4 — Financeiro do Dono: Botão "Relatório" sem função
**Arquivo:** `app/dono/financeiro/page.tsx` — Linha 21
```tsx
// ❌ PROBLEMA: rightAction sem onClick e sem href
rightAction={{ icon: "download", label: "Relatório" }}
```
**No PageHeader:** Quando `rightAction.href` é undefined e `rightAction.onClick` é undefined, o botão renderiza mas não faz nada.
**Como corrigir:**
```tsx
rightAction={{ icon: "download", label: "Relatório", onClick: () => alert("Em breve!") }}
// Ou adicionar href quando a rota existir
```

#### 1.5 — Notificações (Badge 1) do Dono/Cliente ApAgent sem destino
**Agenda:** `app/dono/agenda/page.tsx` — Linha 68
```tsx
// ❌ PROBLEMA: rightAction.badge=1 mas sem href nem onClick
rightAction={{ icon: "notifications", label: "Notificações", badge: 1 }}
```
**Como corrigir:**
```tsx
rightAction={{ icon: "notifications", label: "Notificações", href: "/dono/notificacoes", badge: 1 }}
```

#### 1.6 — MenuItem do Dono/Perfil: todos são `<div>` não-clicáveis
**Arquivo:** `app/dono/perfil/page.tsx` — Linha 8–17
```tsx
// ❌ PROBLEMA: MenuItem retorna <div> com cursor-pointer mas não tem Link nem button com onClick
function MenuItem({ icon, label, badge, danger }) {
  return (
    <div className="... cursor-pointer">  // div NÃO é acessível e não navega
```
No perfil do cliente, o MenuItem foi corrigido corretamente (usa `<Link>` ou `<button>`). 
**Como corrigir** (alinhar com o padrão do `cliente/perfil`):
```tsx
// Reutilizar o componente robusto de cliente/perfil/page.tsx
// Adicionar href a cada item: "Dados do Pet Shop" → /dono/perfil/dados, etc.
```

#### 1.7 — Rotas inexistentes linkadas no BottomNav Admin
**Arquivo:** `components/layout/BottomNav.tsx` — Linhas 35–37
```tsx
{ href: "/admin/usuarios",    label: "Usuários",   icon: "group" },         // ❌ ROTA NÃO EXISTE
{ href: "/admin/financeiro",  label: "Financeiro", icon: "account_balance"}, // ❌ ROTA NÃO EXISTE
```
**Como verificar:** Os diretórios `app/admin/usuarios` e `app/admin/financeiro` não foram encontrados no projeto.
**Como corrigir (curto prazo):** Desabilitar/ocultar os itens até as rotas existirem, ou criar páginas placeholder.

#### 1.8 — Links para rotas de perfil do cliente que não existem
**Arquivo:** `app/cliente/perfil/page.tsx` — Linhas 104–117
Links para: `/cliente/perfil/editar`, `/cliente/perfil/seguranca`, `/cliente/perfil/pagamentos`, `/cliente/indicacoes`, `/cliente/ajuda`, `/cliente/feedback`, `/privacidade`, `/cliente/perfil/avaliacoes` — **nenhuma dessas rotas existe no projeto.**

---

### ETAPA 2 — DADOS MOCK / HARDCODED QUE QUEBRAM EM PRODUÇÃO

> [!WARNING]
> O app aparentemente funciona mas usa dados falsos — vai falhar em produção real.

#### 2.1 — Agendamento com serviços FAKE (IDs inválidos)
**Arquivo:** `app/cliente/agendamento/page.tsx` — Linhas 36–44
O próprio comentário no código admite o problema:
```tsx
// ❌ COMENTÁRIO DO DESENVOLVEDOR:
// "Actually, I should use the standard mock CUIDs or fetch from API. 
// Since we don't have GET /api/services, we will just pass a hardcoded ID 
// or bypass service check. Actually, I should use the standard ones for now, 
// but backend will fail if it's not in DB."
const mockServices = [
  { id: "cm85jxxxb00021xyzv1", name: "Banho"... }, // ID FAKE — vai dar 404 na API
  { id: "cm85jxxxc00031xyzv2", name: "Tosa Higiênica"... }, // ID FAKE
];
```
**Como corrigir:**
```tsx
// Criar endpoint: GET /api/petshops/:id/services
// Buscar serviços reais antes de renderizar o form
useEffect(() => {
  fetch("/api/services").then(r => r.json()).then(j => setServices(j.data));
}, []);
```

#### 2.2 — Calendário da Agenda com data HARDCODED
**Arquivo:** `app/dono/agenda/page.tsx` — Linha 56
```tsx
// ❌ HARDCODED: "Outubro 2023" e dias fixos — nunca muda
const weekDays = [
  { label: "Dom", value: 22 },
  ...
];
<h2>Outubro 2023</h2> // ← HARDCODED, está errado hoje (Março 2026)
```
**Como corrigir:** Usar `new Date()` e calcular os dias da semana dinamicamente, como foi feito corretamente em `/cliente/agendamento`.

#### 2.3 — Dashboard do Dono com trend "+2 vs ontem" falso
**Arquivo:** `app/dono/inicio/page.tsx` — Linha 139
```tsx
// ❌ HARDCODED: trend nunca muda
<StatCard trend="+2 vs ontem" trendDirection="up" />
```
**Como corrigir:** Calcular o trend comparando com dados reais da API ou omitir o campo se não disponível.

#### 2.4 — Automação de retorno com número de telefone fixo
**Arquivo:** `app/dono/inicio/page.tsx` — Linha 236
```tsx
// ❌ HARDCODED: número de telefone fixo
href="https://wa.me/5511999999999"
```
**Como corrigir:** Usar o telefone real do dono do pet, buscado da API.

---

### ETAPA 3 — LOADING STATES INADEQUADOS

> [!WARNING]
> Telas de loading sem skeleton geram "flash" visual e parecem bugs para o usuário.

#### 3.1 — Loading do Dashboard do Dono — Texto simples sem estrutura
**Arquivo:** `app/dono/inicio/page.tsx` — Linha 89
```tsx
// ❌ PROBLEMA: Loading sem skeleton
if (loading) {
  return <div className="page-container flex items-center justify-center min-h-screen text-gray-500">
    Carregando painel...
  </div>;
}
```
**Como corrigir:** Criar componente de skeleton que espelhe o layout real. Exemplo:
```tsx
if (loading) return <DashboardSkeleton />;
// DashboardSkeleton usa divs com animate-pulse que imitam o layout
```

#### 3.2 — Loading do Admin Painel — Mesma questão
**Arquivo:** `app/admin/painel/page.tsx` — Linha 54

#### 3.3 — Botão "Confirmar Agendamento" sem spinner real
**Arquivo:** `app/cliente/agendamento/page.tsx` — Linha 350
```tsx
// ⚠️ PARCIALMENTE OK: texto muda mas sem spinner visual
{isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
```
**Como melhorar:**
```tsx
{isSubmitting ? (
  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Agendando...</>
) : "Confirmar Agendamento"}
```

---

### ETAPA 4 — ERROS DE TRATAMENTO (Error States)

#### 4.1 — Erro de fetch sem mensagem para o usuário (Dono Dashboard)
**Arquivo:** `app/dono/inicio/page.tsx` — Linha 76
```tsx
// ❌ PROBLEMA: Erro jogado no console, usuário não vê nada
} catch (error) {
  console.error("Erro ao carregar Dashboard:", error);
}
// A página renderiza com dados em branco (0, R$0,00) sem avisar o usuário
```
**Como corrigir:** Adicionar estado `error` e renderizar banner de erro:
```tsx
const [error, setError] = useState<string | null>(null);
// No catch:
setError("Não foi possível carregar o painel. Tente novamente.");
// No JSX:
{error && <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>}
```

#### 4.2 — Pets não encontrados em /meus-pets sem CTA de ação
**Arquivo:** `app/cliente/meus-pets/page.tsx` — Linha 82–84
```tsx
// ⚠️ INCOMPLETO: Mensagem existe mas sem botão para adicionar pet
{!loading && pets.length === 0 && (
  <p className="text-sm text-gray-500 text-center py-4">
    Você ainda não possui pets cadastrados.
  </p>
)}
// O botão de "Adicionar novo pet" fica FORA deste bloco condicional,
// mas aparece sempre — confuso quando há pets E quando não há.
```

---

### ETAPA 5 — PROBLEMAS DE ACESSIBILIDADE E UX

#### 5.1 — "Sair da Conta" sem confirmação (Dono e Cliente)
**Arquivo:** `app/dono/perfil/page.tsx` e `app/cliente/perfil/page.tsx`
```tsx
// ❌ PROBLEMA: Clicar em "Sair" não faz nada (div/button sem onClick)
// E quando funcionar, não vai ter confirmação "Tem certeza?"
<MenuItem icon="logout" label="Sair da conta" danger />
```
**Como corrigir:**
```tsx
<button onClick={() => {
  if (confirm("Tem certeza que deseja sair?")) {
    signOut(); // next-auth ou redirect para /login
  }
}}>
  Sair
</button>
```

#### 5.2 — Scroll horizontal sem indicador visual
**Arquivo:** `app/cliente/agendamento/page.tsx` — Datas e Pets
A lista de datas e pets usa `overflow-x-auto no-scrollbar` — o usuário não sabe que pode rolar.
**Como melhorar:** Adicionar gradiente nas bordas para indicar scroll.

#### 5.3 — QuickAction com cores dinâmicas via Tailwind (JIT problem)
**Arquivo:** `app/cliente/inicio/page.tsx` — Linha 38
```tsx
// ❌ PROBLEMA: Classes dinâmicas são purgadas pelo Tailwind em produção
<div className={`bg-${color}/10`}>  // bg-primary/10 pode não existir no bundle final
  <MaterialIcon className={`text-${color}`} />
```
**Como corrigir:** Usar `safelist` no `tailwind.config.ts` ou usar classes estáticas com mapa de objetos:
```tsx
const colorMap = { primary: "bg-primary/10 text-primary", ... }
```

#### 5.4 — Falta de confirmação antes de deletar/ações destrutivas
Nenhuma ação destrutiva (bloqueio de Pet Shop, cancelamento de agendamento) possui modal de confirmação.

---

## ✅ CHECKLIST DE TESTES — PLANO POR ETAPA

---

### 🔴 CRÍTICO PARA O LANÇAMENTO (Resolver ANTES de ir ao ar)

#### 📋 Etapa 1 — Navegação e Dead Links

- [ ] **[C-01]** FAB de "+" na Agenda do Dono navega para criar novo agendamento
- [ ] **[C-02]** FAB de "+" nos Clientes do Dono tem ação definida (modal ou rota)
- [ ] **[C-03]** Botão "Ver todos" da Automação de Retorno navega corretamente
- [ ] **[C-04]** Botão "Relatório" no Financeiro do Dono tem ação (download ou feedback "em breve")
- [ ] **[C-05]** Ícone de notificações na Agenda do Dono tem href definido
- [ ] **[C-06]** Todos os `MenuItem` do Perfil do Dono são clicáveis (Link ou button)
- [ ] **[C-07]** "Sair da conta" executa logout real com confirmação
- [ ] **[C-08]** Rotas do BottomNav Admin (`/admin/usuarios`, `/admin/financeiro`) existem ou estão desabilitadas
- [ ] **[C-09]** Links do Perfil do Cliente (`/perfil/editar`, `/perfil/seguranca`, etc.) levam a páginas reais ou exibem "Em breve"

#### 📋 Etapa 2 — Dados e APIs

- [ ] **[C-10]** Serviços do agendamento são buscados da API real (GET /api/services), não de IDs hardcoded
- [ ] **[C-11]** Calendário da Agenda do Dono mostra a semana/mês corrente dinamicamente
- [ ] **[C-12]** Link WhatsApp na Automação de Retorno usa telefone real do cliente, não `5511999999999`
- [ ] **[C-13]** Agendamento via POST /api/appointments retorna sucesso com IDs reais de serviço
- [ ] **[C-14]** Erro de API no Dashboard do Dono exibe banner de erro ao usuário (não apenas console.error)

#### 📋 Etapa 3 — Feedback Visual

- [ ] **[C-15]** Botão "Confirmar Agendamento" exibe spinner animado enquanto `isSubmitting=true`
- [ ] **[C-16]** Dashboard do Dono exibe skeleton loading (não texto simples) durante carregamento
- [ ] **[C-17]** Painel Admin exibe skeleton loading durante carregamento
- [ ] **[C-18]** Estado vazio de "Nenhum agendamento" em `/dono/agenda` é visível e possui CTA
- [ ] **[C-19]** Estado vazio de "Nenhum pet" em `/cliente/meus-pets` possui CTA de "Adicionar pet"

#### 📋 Etapa 4 — Segurança de Ações

- [ ] **[C-20]** Bloquear Pet Shop no Admin exige modal de confirmação
- [ ] **[C-21]** "Novo Tenant (Manual)" no Admin tem formulário ou fluxo funcional
- [ ] **[C-22]** Busca de Pet Shops no Admin realmente filtra a tabela (input sem `onChange` atualmente)
- [ ] **[C-23]** Botões de editar (ícone lápis) e bloquear na tabela de Pet Shops têm ação real

---

### 🟡 MELHORIAS FUTURAS (Pós-lançamento — Polimento)

#### 📋 UX e Design

- [ ] **[F-01]** Adicionar indicador visual de scroll horizontal nas seções de pets e datas
- [ ] **[F-02]** Corrigir classes dinâmicas de cor (`bg-${color}`) com safelist ou mapa estático
- [ ] **[F-03]** `trend` do StatCard ("+2 vs ontem") ser calculado dinamicamente
- [ ] **[F-04]** Tela de "Agendamento confirmado" oferecer botão "Adicionar ao Calendário"
- [ ] **[F-05]** BottomNav do Admin ter indicador visual de página ativa consistente com mobile
- [ ] **[F-06]** Páginas de `/cliente/indicacoes` e `/cliente/notificacoes` ser criadas
- [ ] **[F-07]** Push notifications reais (badge vermelho no sino é apenas decorativo agora)

#### 📋 Mobile e Responsividade

- [ ] **[F-08]** Tabela de Pet Shops no Admin (`/admin/petshops`) não tem layout mobile (colunas somem)
- [ ] **[F-09]** `page-container` do Admin usa padding desktop, mas Super Admin provavelmente usa desktop — verificar se há sidebar para telas grandes
- [ ] **[F-10]** Calendário da Agenda do Dono em tela pequena (< 360px) pode cortar números dos dias

#### 📋 Acessibilidade

- [ ] **[F-11]** Adicionar `aria-label` nos botões de ação da tabela Admin (editar/bloquear)
- [ ] **[F-12]** Inputs de busca sem `id` e sem `<label>` associada (apenas placeholder)
- [ ] **[F-13]** Verificar contraste de cor: `text-white/70` sobre gradiente pode falhar WCAG AA
- [ ] **[F-14]** Adicionar `role="status"` nos loaders de texto ("Carregando painel...")
- [ ] **[F-15]** DateCard no agendamento: dia desabilitado (domingo) apenas com `opacity-50` — adicionar `aria-disabled`

#### 📋 Performance

- [ ] **[F-16]** Fontes do Google carregadas via `@import` no CSS (bloqueia render) — migrar para `next/font`
- [ ] **[F-17]** Material Icons carregados via CDN — avaliar subset ou solução self-hosted
- [ ] **[F-18]** Dados mock em arquivos como `lib/mocks/appointments.ts` devem ser removidos em produção

---

## 📊 Resumo Executivo

| Categoria | Qtd. Crítico | Qtd. Melhoria |
|---|---|---|
| Becos sem saída (dead links) | **9** | — |
| Dados mock/hardcoded | **4** | 3 |
| Loading states inadequados | **3** | — |
| Error states ausentes | **2** | — |
| Acessibilidade | — | 5 |
| Mobile/Responsividade | — | 3 |
| Performance | — | 3 |
| **Total** | **18** | **14** |

> [!IMPORTANT]
> Os 9 becos sem saída (**ETAPA 1**) são a prioridade máxima. Usuários clicando em botões que não fazem nada destroem a percepção de qualidade do produto antes mesmo de ele ser avaliado por funcionalidade.

---

## 🏆 O que está MUITO BOM (não mexer)

- ✅ Design System coerente (`globals.css` bem organizado com componentes reutilizáveis)
- ✅ Fluxo de Agendamento do Cliente bem estruturado (stepper visual, estados de seleção)
- ✅ `PageHeader` com suporte a back/logo/actions/avatar — componente maduro  
- ✅ `BottomNav` com detecção de rota ativa e preenchimento de ícone — correto
- ✅ Tela de sucesso do agendamento com animação (`animate-scale-in`) — excelente UX
- ✅ Tratamento de erro de agendamento com `errorMsg` visível no footer
- ✅ Feedback de pets da API com loading state adequado em `/agendamento`

