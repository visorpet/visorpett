# 🐾 Visorpet — Plano de Implementação Frontend

> **Baseado nos designs UX/UI** em `/desing ux ui obrigatorio no projeto telas/`
> **Stack**: Next.js 14+ (App Router) · TypeScript · Tailwind CSS v3 · Material Symbols · Inter font

---

## 🛠️ Skills Utilizadas no Projeto

As skills do Antigravity são ativadas em ordem conforme as fases. Cada skill traz padrões, decisões e código alinhados à sua especialidade.

### Por Fase

| Fase | Skills | Objetivo |
|---|---|---|
| **1 — Design System** | `react-nextjs-development`, `tailwind-design-system`, `tailwind-patterns`, `frontend-design` | Scaffold, tokens, componentes base |
| **2 — Telas Cliente** | `senior-frontend`, `react-patterns`, `react-state-management`, `react-ui-patterns`, `frontend-developer` | Componentes React/TS, flow multi-step, hooks |
| **3 — Dashboard Dono** | `senior-frontend`, `react-patterns`, `react-ui-patterns`, `frontend-developer` | Métricas, gráficos CSS, automação WhatsApp |
| **4 — Super Admin** | `nextjs-app-router-patterns`, `nextjs-best-practices`, `fixing-accessibility`, `fixing-metadata` | Rotas protegidas, sidebar desktop, SEO |
| **Contínuo** | `typescript-pro`, `antigravity-design-expert`, `i18n-localization` | Tipos, micro-animações premium, pt-BR |

### Detalhamento das Skills

#### Fase 1 — Fundação
| Skill | Por quê |
|---|---|
| `react-nextjs-development` | Scaffold Next.js 14+ App Router + TypeScript correto |
| `tailwind-design-system` | Configurar tokens, design system e componentes base |
| `tailwind-patterns` | Padrões modernos Tailwind v3, container queries |
| `frontend-design` | Garantir fidelidade visual e craft premium ao implementar |

#### Fase 2 & 3 — Telas (Cliente + Dono)
| Skill | Por quê |
|---|---|
| `senior-frontend` | Componentes React/TypeScript de qualidade, hooks, padrões |
| `react-patterns` | Composição de componentes, custom hooks (ex: `useAppointmentFlow`) |
| `react-state-management` | Estado do multi-step de agendamento (Zustand ou `useReducer`) |
| `react-ui-patterns` | Loading states, error states, skeletons nas telas |
| `frontend-developer` | Construção de componentes interativos (date picker, time slots) |

#### Fase 4 — Super Admin + Qualidade
| Skill | Por quê |
|---|---|
| `nextjs-app-router-patterns` | Rotas protegidas por role, middleware de auth, redirect flows |
| `nextjs-best-practices` | Server Components vs Client Components, otimização |
| `fixing-accessibility` | ARIA labels, keyboard nav, contraste nas telas |
| `fixing-metadata` | SEO, og:tags, títulos por rota |

#### Skills Contínuas (todas as fases)
| Skill | Por quê |
|---|---|
| `typescript-pro` | Tipos bem definidos: `Pet`, `Appointment`, `PetShop`, `User` |
| `antigravity-design-expert` | Micro-animações, glassmorphism, hover effects premium |
| `i18n-localization` | Detecção de strings hardcoded (tudo em pt-BR) |

---

## 📐 Design System Extraído dos Designs

### Cores (Tailwind Config)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#2b5bad` | Cor principal — botões, links, ícones ativos |
| `background-light` | `#f6f6f8` | Fundo claro das páginas |
| `background-dark` | `#13131f` | Fundo escuro (dark mode) |
| `WhatsApp green` | `#25D366` | Botão de envio de WhatsApp |

### Tipografia
- **Família**: `Inter` (Google Fonts) — pesos 400, 500, 600, 700, 800, 900
- **Ícones**: `Material Symbols Outlined` (Google Fonts)
  - Variações: `FILL 0..1`, `wght 100..700`

### Componentes de Layout Recorrentes
- **Card**: `bg-white rounded-xl border border-primary/5 shadow-sm p-4..6`
- **Bottom Nav (mobile)**: `fixed bottom-0 bg-white border-t border-primary/10 px-6 pb-6`
- **Sidebar (desktop admin)**: `w-64 bg-white border-r` com nav items `rounded-xl`
- **Header sticky**: `sticky top-0 bg-white/80 backdrop-blur-md border-b border-primary/10`
- **Botão primário**: `bg-primary text-white font-bold py-3..4 rounded-xl shadow-lg shadow-primary/30`
- **Badge/pill**: `px-2 py-1 text-[10px] font-bold uppercase bg-X/10 text-X rounded`

### Border Radius Customizado
```js
borderRadius: {
  DEFAULT: "0.5rem",
  lg: "1rem",
  xl: "1.5rem",
  full: "9999px"
}
```

---

## 🏗️ Arquitetura do Projeto

```
visorpett/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo: autenticação (sem layout principal)
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   │
│   ├── (cliente)/                # Grupo: Portal do Cliente
│   │   ├── layout.tsx            # Layout mobile-first com bottom nav
│   │   ├── inicio/page.tsx       # Home do cliente
│   │   ├── agendar/page.tsx      # Novo agendamento (multi-step)
│   │   ├── historico/page.tsx    # Histórico de serviços
│   │   ├── pets/page.tsx         # Meus pets + prontuários
│   │   └── perfil/page.tsx       # Perfil do cliente
│   │
│   ├── (dono)/                   # Grupo: Dashboard do Dono (Pet Shop)
│   │   ├── layout.tsx            # Layout mobile com bottom nav
│   │   ├── inicio/page.tsx       # Dashboard principal
│   │   ├── agenda/page.tsx       # Agenda inteligente
│   │   ├── clientes/page.tsx     # Gestão de clientes
│   │   ├── tosador/page.tsx      # Área do tosador
│   │   ├── financeiro/page.tsx   # Financeiro e planos
│   │   ├── configuracoes/page.tsx # Configurações do SaaS
│   │   └── suporte/page.tsx      # Suporte e tickets
│   │
│   ├── (super-admin)/            # Grupo: Super Admin
│   │   ├── layout.tsx            # Layout desktop com sidebar
│   │   ├── painel/page.tsx       # Dashboard super admin
│   │   ├── petshops/page.tsx     # Gestão de pet shops
│   │   ├── planos/page.tsx       # Financeiro e planos
│   │   └── suporte/page.tsx      # Suporte global
│   │
│   ├── globals.css               # Design tokens + Tailwind
│   └── layout.tsx                # Root layout (fonts, metadata)
│
├── components/
│   ├── ui/                       # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx          # Card de métrica com ícone + trend
│   │   ├── BarChart.tsx          # Gráfico de barras simples (CSS)
│   │   └── MaterialIcon.tsx      # Wrapper Material Symbols
│   │
│   ├── layout/
│   │   ├── MobileBottomNav.tsx   # Nav mobile (cliente + dono)
│   │   ├── OwnerBottomNav.tsx    # Nav específica do dono
│   │   ├── SuperAdminSidebar.tsx # Sidebar desktop admin
│   │   ├── MobileHeader.tsx      # Header sticky mobile
│   │   └── AdminHeader.tsx       # Header desktop admin
│   │
│   ├── cliente/                  # Componentes da área do cliente
│   │   ├── NextAppointmentCard.tsx
│   │   ├── PetAvatar.tsx
│   │   ├── ActivePackageCard.tsx
│   │   └── ReferralCard.tsx
│   │
│   ├── dono/                     # Componentes do dashboard do dono
│   │   ├── RevenueChart.tsx
│   │   ├── ReturnAutomationCard.tsx
│   │   ├── AppointmentItem.tsx
│   │   └── WhatsAppButton.tsx
│   │
│   ├── agendamento/              # Componentes de agendamento
│   │   ├── PetSelector.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── DatePicker.tsx
│   │   └── TimeSlotGrid.tsx
│   │
│   └── prontuario/               # Componentes de prontuário
│       ├── PetProfileHeader.tsx
│       ├── VaccineCard.tsx
│       ├── MedicalHistoryItem.tsx
│       └── GroomingHistoryItem.tsx
│
├── lib/
│   ├── utils.ts                  # cn(), formatters, helpers
│   ├── constants.ts              # Rotas, textos constantes
│   └── api.ts                    # Fetch wrapper para backend
│
├── types/
│   ├── pet.ts
│   ├── appointment.ts
│   ├── user.ts
│   └── petshop.ts
│
├── hooks/
│   ├── useAuth.ts
│   └── usePetShop.ts
│
├── tailwind.config.ts            # Config com tokens do design
└── next.config.ts
```

---

## 📱 Mapeamento de Telas → Rotas

| Pasta de Design | Rota no App | Grupo |
|---|---|---|
| `home_do_cliente_hub_pets_1` | `/cliente/inicio` | (cliente) |
| `home_do_cliente_hub_pets_2` | `/cliente/inicio` (variante) | (cliente) |
| `novo_agendamento` | `/cliente/agendar` | (cliente) |
| `prontu_rio_do_pet_1,2,3` | `/cliente/pets/[id]` | (cliente) |
| `dashboard_do_dono_hub_pets_1,2` | `/dono/inicio` | (dono) |
| `agenda_inteligente` | `/dono/agenda` | (dono) |
| `dashboard_do_dono_whatsapp_ajustado` | `/dono/inicio` (variante) | (dono) |
| `rea_o_tosador` | `/dono/tosador` | (dono) |
| `financeiro_e_planos` | `/dono/financeiro` | (dono) |
| `gest_o_de_pet_shops` | `/dono/clientes` | (dono) |
| `configura_es_do_saas_hub_pets_1,2` | `/dono/configuracoes` | (dono) |
| `suporte_e_tickets` | `/dono/suporte` | (dono) |
| `dashboard_super_admin` | `/admin/painel` | (super-admin) |
| `dashboard_super_admin_hub_pets_1,2` | `/admin/painel` (variante) | (super-admin) |
| `configura_es_do_saas` | `/admin/configuracoes` | (super-admin) |

---

## 🚀 Fases de Implementação

### Fase 1 — Fundação e Design System *(Prioridade Máxima)*

**Objetivo**: Criar base sólida antes de qualquer tela

#### 1.1 Setup do Projeto
```bash
# No diretório /home/matheus/visorpett
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

#### 1.2 `tailwind.config.ts` — Tokens do Design System
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2b5bad",
        "background-light": "#f6f6f8",
        "background-dark": "#13131f",
        whatsapp: "#25D366",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        "primary-sm": "0 4px 14px rgba(43, 91, 173, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
```

#### 1.3 `app/globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { font-family: 'Inter', sans-serif; }
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .icon-fill { font-variation-settings: 'FILL' 1; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
}
```

#### 1.4 Componentes UI Base

**`components/ui/StatCard.tsx`**
- Props: `icon`, `label`, `value`, `trend`, `trendColor`, `iconBg`
- Baseado nos cards de métricas de ambos os dashboards

**`components/ui/Badge.tsx`**
- Variants: `primary`, `success`, `warning`, `danger`, `neutral`

**`components/ui/Avatar.tsx`**
- Com suporte a `ring`, `status dot`, `fallback icon`

**`components/ui/BarChart.tsx`**
- Gráfico CSS puro (barras com Tailwind) com tooltips ao hover
- Props: `data: { label, value, isHighlight }[]`

**`components/ui/ProgressBar.tsx`**
- Props: `value` (0–100), `label`, `sublabel`

**`components/ui/MaterialIcon.tsx`**
- Wrapper com suporte a `fill`, `size`, `weight`

---

### Fase 2 — Layouts e Navegação

#### 2.1 `components/layout/MobileBottomNav.tsx`
```tsx
// Nav mobile fixa — usada no portal do cliente
// Items: Início, Agendar, Histórico, Perfil
// Estado ativo: text-primary + icon filled
// Fixed bottom-0, bg-white, border-t
```

#### 2.2 `components/layout/OwnerBottomNav.tsx`
```tsx
// Nav mobile do dono — items: Início, Agenda, Clientes, Mais
```

#### 2.3 `components/layout/SuperAdminSidebar.tsx`
```tsx
// Sidebar desktop w-64
// Logo "Pet Flow / Super Admin"
// Nav: Painel, Pet Shops, Planos, Financeiro, Suporte
// Footer: Configurações + avatar do usuário
// Link ativo: bg-primary text-white rounded-xl shadow-primary
```

#### 2.4 `components/layout/MobileHeader.tsx`
```tsx
// Header sticky com blur: backdrop-blur-md bg-white/80
// Logo, nome da loja, botão de notificações, avatar
```

---

### Fase 3 — Portal do Cliente

**Rota**: `/app/(cliente)/`

#### 3.1 Home do Cliente (`/cliente/inicio`)
Baseado em: `home_do_cliente_hub_pets_1/code.html`

**Seções:**
1. **Header**: Avatar + saudação + botão notificações
2. **Próximo Agendamento**: Card com data, serviço, pet, foto — botões Confirmar/Detalhes
3. **Meus Pets**: Scroll horizontal de avatares circulares com ring ativo
4. **Pacotes Ativos**: Card com progress bar do plano de fidelidade
5. **Indique e Ganhe**: Card gradiente `from-primary to-indigo-800` com código referral

#### 3.2 Novo Agendamento (`/cliente/agendar`)
Baseado em: `novo_agendamento/code.html`

**Flow multi-step (sem paginação — scroll vertical):**
1. **Selecione o Pet**: Scroll horizontal de avatares, selecionado tem `border-primary + checkmark`
2. **Selecione o Serviço**: Cards verticais com ícone, nome, descrição, preço, radio button
3. **Selecione a Data**: Scroll horizontal de cards de dia (dom desabilitado = `opacity-50`)
4. **Selecione o Horário**: Grid 3 colunas — disponível / selecionado / ocupado (riscado)
5. **Footer sticky**: Resumo (pet + serviço) + preço + botão "Confirmar Agendamento"

#### 3.3 Prontuário do Pet (`/cliente/pets/[id]`)
Baseado em: `prontu_rio_do_pet_1`, `_2`, `_3`

---

### Fase 4 — Dashboard do Dono

**Rota**: `/app/(dono)/`

#### 4.1 Início do Dono (`/dono/inicio`)
Baseado em: `dashboard_do_dono_hub_pets_1/code.html`

**Seções:**
1. **Header**: Logo Hub Pets + nome da loja + notificações + avatar
2. **Cards de Métricas** (grid 2x2):
   - Agendamentos hoje (`calendar_today`, azul)
   - Receita Mensal (`payments`, verde)
   - Em atendimento (`content_cut`, laranja)
   - Para reativar (`group_remove`, vermelho)
3. **Faturamento Semanal**: Gráfico de barras CSS (7 barras, Seg–Dom), select semana
4. **Automação de Retorno**: Lista de pets com dias sem banho + botão WhatsApp verde

#### 4.2 Agenda Inteligente (`/dono/agenda`)
Baseado em: `agenda_inteligente/`

#### 4.3 Área do Tosador (`/dono/tosador`)
Baseado em: `rea_o_tosador/`

---

### Fase 5 — Super Admin

**Rota**: `/app/(super-admin)/`

#### 5.1 Painel Super Admin (`/admin/painel`)
Baseado em: `dashboard_super_admin/code.html`

**Layout**: Sidebar desktop `w-64` + `main ml-64`

**Seções:**
1. **Header**: Título "Visão Geral do Negócio" + busca + notificações
2. **Métricas** (grid 4 colunas):
   - Total Pet Shops, Inquilinos Ativos, MRR, Taxa de Churn
3. **Gráfico de Crescimento** (col-span-2): Barras mensais Jan–Jul
4. **Distribuição de Planos**: Pseudo-pie chart com legenda Free/Pro/Premium
5. **Novos Cadastros**: Lista com logo, nome, cidade, badge de plano
6. **Pagamentos Recentes**: Lista com status (Confirmado/Pendente)

---

### Fase 6 — Fluxos Secundários

- Gestão de Pet Shops (`gestao_de_pet_shops/`)
- Financeiro e Planos (`financeiro_e_planos/`)
- Configurações do SaaS (`configuracoes_do_saas_hub_pets_1,2/`)
- Suporte e Tickets (`suporte_e_tickets/`)

---

## 🔑 Decisões de Arquitetura

### Roteamento por Papel (Role-based)
```
/login → detecta papel → redireciona para:
  CLIENTE → /cliente/inicio
  DONO    → /dono/inicio
  ADMIN   → /admin/painel
```

### Middleware de Autenticação
```ts
// middleware.ts
// Protege rotas por papel usando cookies/JWT
// Redireciona para /login se não autenticado
```

### Client vs Server Components
| Componente | Tipo | Motivo |
|---|---|---|
| Páginas de dashboard | Server | Dados iniciais via fetch server-side |
| Gráficos, charts | Client | State + interatividade |
| BottomNav / Sidebar | Client | Estado de rota ativa |
| Cards estáticos | Server | Sem interatividade |
| Formulário de agendamento | Client | Estado multi-step complexo |

### Sem biblioteca de gráficos externa
Os gráficos do design são **puramente CSS com Tailwind** (barras `bg-primary/X rounded-t h-[N%]`). Manter assim para fidelidade ao design e zero dependências extras.

---

## 📋 Checklist de Implementação

### Fase 1 — Design System ✅ Concluído quando:
- [ ] `tailwind.config.ts` com todos os tokens
- [ ] `globals.css` com fontes + variações de ícones
- [ ] `StatCard`, `Badge`, `Avatar`, `ProgressBar`, `BarChart`, `MaterialIcon`
- [ ] `MobileBottomNav`, `OwnerBottomNav`, `SuperAdminSidebar`, `MobileHeader`
- [ ] Tipos TypeScript base (`Pet`, `Appointment`, `PetShop`, `User`)
- [ ] Utilitário `cn()` em `lib/utils.ts`

### Fase 2 — Portal do Cliente ✅ Concluído quando:
- [ ] `/cliente/inicio` — todas as 5 seções implementadas
- [ ] `/cliente/agendar` — flow multi-step completo com footer sticky
- [ ] `/cliente/pets/[id]` — prontuário do pet

### Fase 3 — Dashboard do Dono ✅ Concluído quando:
- [ ] `/dono/inicio` — métricas + gráfico + automação de retorno
- [ ] `/dono/agenda` — agenda inteligente
- [ ] `/dono/tosador` — área do tosador
- [ ] `/dono/financeiro` — financeiro e planos
- [ ] `/dono/configuracoes` — configurações SaaS
- [ ] `/dono/suporte` — suporte e tickets

### Fase 4 — Super Admin ✅ Concluído quando:
- [ ] `/admin/painel` — visão geral + métricas + gráficos + listas
- [ ] `/admin/petshops` — gestão de pet shops
- [ ] `/admin/planos` — planos e financeiro

---

## ⚠️ Pontos de Atenção

> [!IMPORTANT]
> O design usa **Tailwind via CDN** nos HTMLs de referência. Na implementação Next.js, instalar Tailwind via npm normalmente — o config já extrai os tokens necessários.

> [!NOTE]
> O **dark mode** está implementado nos designs via `class` strategy. Implementar um toggle de tema usando `next-themes` para persistência entre sessões.

> [!TIP]
> Os **ícones Material Symbols** têm variações importantes: `FILL 0` (outline) para estado inativo e `FILL 1` para estado ativo na navegação. Usar a classe `.icon-fill` do globals.css.

> [!WARNING]
> Imagens nos HTMLs de design usam URLs externas do Google/Lh3. Na implementação real, usar `next/image` com domínios configurados no `next.config.ts`, ou placeholder local durante desenvolvimento.

---

## 📁 Arquivos de Design de Referência

| Módulo | Arquivo | Screenshot |
|---|---|---|
| Dashboard Dono | [code.html](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/dashboard_do_dono_hub_pets_1/code.html) | [screen.png](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/dashboard_do_dono_hub_pets_1/screen.png) |
| Home Cliente | [code.html](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/home_do_cliente_hub_pets_1/code.html) | [screen.png](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/home_do_cliente_hub_pets_1/screen.png) |
| Super Admin | [code.html](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/dashboard_super_admin/code.html) | [screen.png](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/dashboard_super_admin/screen.png) |
| Novo Agendamento | [code.html](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/novo_agendamento/code.html) | [screen.png](file:///home/matheus/visorpett/desing ux ui obrigatorio no projeto telas/stitch_remix_of_dashboard_do_dono/novo_agendamento/screen.png) |
