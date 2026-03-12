# 🐾 Visorpet — Plano de Backend

> **Stackback:** Next.js 14 App Router (API Routes) · Prisma ORM · PostgreSQL (Supabase) · NextAuth.js · Stripe · Resend · Zod

---

## 🎯 Visão Geral

O backend do Visorpet é um **SaaS multi-tenant** onde:
- O **Super Admin** (dono da startup) gerencia todos os pet shops cadastrados.
- Cada **Pet Shop (Tenant)** tem seu próprio painel de gestão com clientes, pets e financeiro.
- Os **Clientes** acessam seu portal pessoal para agendar serviços e consultar o histórico dos seus pets.

A arquitetura usa **Next.js API Routes** já dentro do projeto existente (sem servidor separado), com o banco de dados hospedado no **Supabase (PostgreSQL)**. O código fica organizado em `/app/api/` seguindo o padrão do App Router.

---

## 🏗️ Arquitetura Técnica

```
visorpett/
├── app/
│   └── api/                     ← Toda a API REST fica aqui
│       ├── auth/[...nextauth]/   ← Autenticação (NextAuth)
│       ├── pets/                 ← CRUD de pets
│       ├── appointments/         ← CRUD de agendamentos
│       ├── petshops/             ← CRUD de pet shops (tenants)
│       ├── clients/              ← CRUD de clientes (por tenant)
│       ├── subscriptions/        ← Planos e assinaturas (Stripe)
│       ├── webhooks/stripe/      ← Webhook do Stripe
│       └── admin/                ← Endpoints exclusivos do Super Admin
├── prisma/
│   ├── schema.prisma             ← Modelo do banco de dados
│   └── seed.ts                   ← Dados iniciais (dev)
├── lib/
│   ├── db.ts                     ← Instância do Prisma Client
│   ├── auth.ts                   ← Configuração do NextAuth
│   ├── stripe.ts                 ← Instância e helpers do Stripe
│   ├── resend.ts                 ← Email transacional
│   └── validations/              ← Schemas Zod para cada entidade
└── middleware.ts                 ← Proteção de rotas por papel (role-guard)
```

---

## 📋 Plano por Fases

---

## Fase 1 — Fundações: Banco de Dados e Autenticação

> **Objetivo:** Criar o esquema do banco de dados e o fluxo de login real, substituindo os mocks pela autenticação real com redirecionamento por papel (role).

### 1.1 — Dependências a instalar

```bash
npm install @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install @supabase/supabase-js
npm install zod
npm install bcryptjs
npm install @types/bcryptjs -D
```

### 1.2 — Schema do Banco de Dados (`prisma/schema.prisma`)

O diagrama de entidades da plataforma:

```
User (auth)
  ├── role: CLIENTE | DONO | SUPER_ADMIN
  ├── PetShop (1 dono → 1 pet shop)
  │     ├── Plan (Free | Pro | Premium)
  │     ├── Subscription (Stripe)
  │     ├── Groomer[] (tosadores)
  │     ├── Client[] (clientes da loja)
  │     │     └── Pet[]
  │     │           └── Appointment[]
  │     └── Appointment[]
  └── Pet[] (caso seja CLIENTE)
```

#### Modelo completo:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  CLIENTE
  DONO
  SUPER_ADMIN
}

enum SubscriptionPlan {
  FREE
  PRO
  PREMIUM
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELLED
}

enum AppointmentStatus {
  agendado
  confirmado
  em_atendimento
  concluido
  cancelado
  faltou
}

enum ServiceType {
  banho
  tosa
  banho_e_tosa
  consulta
  vacina
  outro
}

// ── Autenticação (NextAuth) ──────────────────────────────────
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ── Usuário Central ──────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  phone         String?
  role          UserRole  @default(CLIENTE)
  passwordHash  String?   // para login email/senha
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts  Account[]
  sessions  Session[]
  petShop   PetShop?       // se for DONO
  pets      Pet[]          // se for CLIENTE
  groomer   Groomer?       // se for tosador
}

// ── Pet Shop (Tenant) ───────────────────────────────────────
model PetShop {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique  // ex: petlove-moema
  logoUrl     String?
  phone       String?
  address     String?
  city        String?
  state       String?
  ownerId     String   @unique
  owner       User     @relation(fields: [ownerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subscription  Subscription?
  groomers      Groomer[]
  clients       Client[]
  appointments  Appointment[]
  services      Service[]
}

// ── Assinatura / Plano ───────────────────────────────────────
model Subscription {
  id                   String             @id @default(cuid())
  petShopId            String             @unique
  petShop              PetShop            @relation(fields: [petShopId], references: [id])
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(TRIALING)
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  stripePriceId        String?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}

// ── Tosadores (funcionários) ─────────────────────────────────
model Groomer {
  id         String   @id @default(cuid())
  name       String
  phone      String?
  photoUrl   String?
  petShopId  String
  petShop    PetShop  @relation(fields: [petShopId], references: [id])
  userId     String?  @unique
  user       User?    @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())

  appointments Appointment[]
}

// ── Clientes da Loja ─────────────────────────────────────────
model Client {
  id         String   @id @default(cuid())
  name       String
  email      String?
  phone      String
  petShopId  String
  petShop    PetShop  @relation(fields: [petShopId], references: [id])
  userId     String?  // vinculado ao User se tiver conta
  createdAt  DateTime @default(now())

  pets  Pet[]
}

// ── Pets ─────────────────────────────────────────────────────
model Pet {
  id         String   @id @default(cuid())
  name       String
  species    String   // cachorro | gato | etc
  breed      String?
  birthDate  DateTime?
  weight     Float?
  photoUrl   String?
  notes      String?  // observações gerais
  clientId   String
  client     Client   @relation(fields: [clientId], references: [id])
  ownerId    String?  // User.id se for o próprio tutor
  owner      User?    @relation(fields: [ownerId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  appointments Appointment[]
  vaccines     Vaccine[]
  medicalNotes MedicalNote[]
}

// ── Vacinas ──────────────────────────────────────────────────
model Vaccine {
  id          String   @id @default(cuid())
  petId       String
  pet         Pet      @relation(fields: [petId], references: [id])
  name        String
  appliedAt   DateTime
  nextDueAt   DateTime?
  vetName     String?
  createdAt   DateTime @default(now())
}

// ── Observações Médicas ─────────────────────────────────────
model MedicalNote {
  id        String   @id @default(cuid())
  petId     String
  pet       Pet      @relation(fields: [petId], references: [id])
  note      String
  author    String
  createdAt DateTime @default(now())
}

// ── Serviços Oferecidos ──────────────────────────────────────
model Service {
  id          String      @id @default(cuid())
  petShopId   String
  petShop     PetShop     @relation(fields: [petShopId], references: [id])
  type        ServiceType
  label       String
  price       Float
  durationMin Int
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())

  appointments Appointment[]
}

// ── Agendamentos ─────────────────────────────────────────────
model Appointment {
  id          String            @id @default(cuid())
  petId       String
  pet         Pet               @relation(fields: [petId], references: [id])
  petShopId   String
  petShop     PetShop           @relation(fields: [petShopId], references: [id])
  serviceId   String
  service     Service           @relation(fields: [serviceId], references: [id])
  groomerId   String?
  groomer     Groomer?          @relation(fields: [groomerId], references: [id])
  date        DateTime
  status      AppointmentStatus @default(agendado)
  notes       String?
  totalPrice  Float
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}
```

### 1.3 — Autenticação (`lib/auth.ts`)

- **Providers:** Google OAuth + Credenciais (email/senha com bcrypt)
- **Adapter:** PrismaAdapter para salvar sessões no banco
- **Callbacks:** 
  - `session`: injeta `role`, `petShopId` no token JWT
  - `jwt`: persiste dados para o middleware

### 1.4 — Middleware de Proteção de Rotas (`middleware.ts`)

```
/cliente/* → exige role === CLIENTE
/dono/*    → exige role === DONO
/admin/*   → exige role === SUPER_ADMIN
/api/*     → valida token e injeta session na request
```

---

## Fase 2 — API Core: Pets, Clientes e Agendamentos

> **Objetivo:** Substituir todos os mocks do front-end por dados reais do banco.

### Endpoints a implementar

| Método | Rota | Descrição | Papel |
|--------|------|-----------|-------|
| GET | `/api/pets` | Lista pets do cliente logado | CLIENTE |
| POST | `/api/pets` | Cadastra novo pet | CLIENTE |
| GET | `/api/pets/[id]` | Retorna detalhes + histórico do pet | CLIENTE |
| PUT | `/api/pets/[id]` | Atualiza dados do pet | CLIENTE |
| DELETE | `/api/pets/[id]` | Remove pet | CLIENTE |
| GET | `/api/appointments` | Lista agendamentos (filtrado por role) | Todos |
| POST | `/api/appointments` | Cria novo agendamento | CLIENTE |
| PATCH | `/api/appointments/[id]` | Atualiza status | DONO |
| GET | `/api/clients` | Lista clientes do pet shop | DONO |
| POST | `/api/clients` | Cadastra cliente na loja | DONO |
| GET | `/api/petshops/[slug]` | Info pública do pet shop | Público |
| GET | `/api/petshops/me` | Info do pet shop do dono logado | DONO |
| PUT | `/api/petshops/me` | Atualiza dados da loja | DONO |

### Padrão de Resposta

```typescript
// Sucesso
{ data: T, meta?: { total: number, page: number } }

// Erro
{ error: string, code: string, details?: ZodIssue[] }
```

### Validação com Zod (exemplo)

```typescript
// lib/validations/appointment.ts
export const createAppointmentSchema = z.object({
  petId:     z.string().cuid(),
  serviceId: z.string().cuid(),
  date:      z.string().datetime(),
  notes:     z.string().max(500).optional(),
});
```

---

## Fase 3 — Pagamentos e Multi-Tenancy (Stripe)

> **Objetivo:** Implementar o sistema de assinatura SaaS com planos, upgrade/downgrade e webhooks.

### 3.1 — Planos e Preços

| Plano | Preço/mês | Límites |
|-------|-----------|---------|
| **Free** | R$ 0 | Até 50 pets, sem relatórios |
| **Pro** | R$ 99,90 | Até 500 pets, relatórios, suporte prioritário |
| **Premium** | R$ 249,90 | Pets ilimitados, White Label, API REST |
| **Enterprise** | Sob consulta | Customizado |

### 3.2 — Endpoints de Assinatura

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/subscriptions/me` | Retorna plano atual do pet shop |
| POST | `/api/subscriptions/checkout` | Cria sessão de checkout no Stripe |
| POST | `/api/subscriptions/portal` | Abre portal Stripe Customer Portal |
| POST | `/api/webhooks/stripe` | Recebe eventos do Stripe (pago, cancelado, etc) |

### 3.3 — Webhook do Stripe (`/api/webhooks/stripe`)

Eventos tratados:
- `customer.subscription.created` → Ativa o plano no banco
- `customer.subscription.updated` → Atualiza plano e datas
- `customer.subscription.deleted` → Cancela, faz downgrade para Free
- `invoice.payment_failed` → Muda status para `PAST_DUE`, notifica por email

### 3.4 — Limites por Plano (middleware de quota)

```typescript
// lib/quota.ts
export async function checkPetQuota(petShopId: string) {
  const subscription = await db.subscription.findUnique({ where: { petShopId } });
  const petCount = await db.pet.count({ where: { client: { petShopId } } });

  const limits = { FREE: 50, PRO: 500, PREMIUM: Infinity };
  const limit = limits[subscription?.plan ?? "FREE"];

  if (petCount >= limit) {
    throw new Error("quota_exceeded");
  }
}
```

---

## Fase 4 — Automação e Notificações

> **Objetivo:** Implementar as automações que fazem o Visorpet se destacar.

### 4.1 — Lembretes Automáticos de Retorno (WhatsApp/Email)

O cron job analisa pets cuja data de último banho foi há **28+ dias** e dispara mensagens via **Evolution API (WhatsApp)** ou **Resend (Email)**.

```typescript
// app/api/cron/retorno/route.ts (GET protegido por CRON_SECRET)
// Chamado via Vercel Cron Jobs diariamente às 09:00

export async function GET(request: Request) {
  const pets = await db.pet.findMany({
    where: {
      appointments: {
        none: { date: { gte: subDays(new Date(), 28) } },
      },
    },
    include: { client: true, appointments: { orderBy: { date: "desc" }, take: 1 } },
  });

  for (const pet of pets) {
    await sendRetornoWhatsApp(pet.client.phone, pet);
  }
}
```

### 4.2 — Confirmação de Agendamento

- **Quando:** Agendamento criado (status: `agendado`)
- **Canal:** WhatsApp + Email
- **Conteúdo:** Data, hora, serviço, nome do pet e localização da loja

### 4.3 — Lembrete D-1

- **Quando:** 24h antes do agendamento
- **Automatização:** Cron job diário às 18:00 que busca agendamentos do dia seguinte

### 4.4 — Emails Transacionais (Resend + React Email)

Templates prontos:
- 📧 Boas-vindas ao cadastro
- 📧 Confirmação de agendamento
- 📧 Lembrete de retorno (D+28)
- 📧 Fatura do plano SaaS paga / falhou

---

## Fase 5 — Super Admin e Relatórios

> **Objetivo:** Conectar as telas do Super Admin a dados reais da plataforma.

### 5.1 — Endpoints Admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/metrics` | Métricas globais da plataforma (MRR, churn, etc) |
| GET | `/api/admin/petshops` | Lista todos os tenants com paginação e filtros |
| PATCH | `/api/admin/petshops/[id]/block` | Bloqueia um tenant |
| GET | `/api/admin/transactions` | Histórico de pagamentos Stripe |
| GET | `/api/admin/support/tickets` | Lista tickets de suporte |

### 5.2 — Cálculo de Métricas em Tempo Real

```typescript
// MRR calculado a partir das assinaturas ativas no Stripe
const mrr = await stripe.subscriptions.list({ status: "active" });
const totalMrr = mrr.data.reduce((acc, sub) => acc + sub.items.data[0].price.unit_amount! / 100, 0);

// Churn: cancelamentos no mês / total de assinantes no início do mês
const churnRate = (cancelledThisMonth / totalAtStartOfMonth) * 100;
```

---

## 🗂️ Estrutura de Diretórios Final

```
visorpett/
├── app/api/
│   ├── auth/[...nextauth]/route.ts
│   ├── pets/route.ts               ← GET, POST
│   ├── pets/[id]/route.ts          ← GET, PUT, DELETE
│   ├── appointments/route.ts       ← GET, POST
│   ├── appointments/[id]/route.ts  ← PATCH (status)
│   ├── clients/route.ts            ← GET, POST (dono)
│   ├── petshops/me/route.ts        ← GET, PUT
│   ├── subscriptions/
│   │   ├── me/route.ts
│   │   ├── checkout/route.ts
│   │   └── portal/route.ts
│   ├── webhooks/stripe/route.ts
│   ├── admin/
│   │   ├── metrics/route.ts
│   │   ├── petshops/route.ts
│   │   └── transactions/route.ts
│   └── cron/
│       ├── retorno/route.ts        ← Lembretes de retorno
│       └── lembretes/route.ts      ← D-1 confirmações
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── lib/
    ├── db.ts
    ├── auth.ts
    ├── stripe.ts
    ├── resend.ts
    ├── quota.ts
    └── validations/
        ├── pet.ts
        ├── appointment.ts
        └── client.ts
```

---

## 🔐 Variáveis de Ambiente Necessárias

```env
# Banco de Dados (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Autenticação
NEXTAUTH_URL="https://visorpet.app"
NEXTAUTH_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_PREMIUM="price_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@visorpet.app"

# WhatsApp (Evolution API — opcional)
EVOLUTION_API_URL="..."
EVOLUTION_API_KEY="..."

# Cron (Vercel)
CRON_SECRET="..."
```

---

## ✅ Critérios de Conclusão por Fase

| Fase | Critério |
|------|----------|
| **1 — Banco + Auth** | Login Google funciona, sessão com `role`, rotas protegidas por papel, sem mocks na home |
| **2 — API Core** | CRUD real de pets e agendamentos; front-end sem `lib/mocks/*.ts` |
| **3 — Stripe** | Checkout de planos funcionando, webhook recebido e status atualizado no banco |
| **4 — Automações** | Cron de retorno dispara no Vercel, email de confirmação entregue |
| **5 — Admin** | Dashboard com métricas reais do Stripe + lista real de tenants do banco |

---

## 🚀 Ordem Recomendada de Implementação

```
1. Instalar dependências (Prisma, NextAuth, Stripe, Zod, Resend)
2. Configurar Supabase + rodar prisma db push
3. Implementar NextAuth + middleware de proteção
4. API de Pets → substituir mocks do /cliente/meus-pets
5. API de Agendamentos → substituir mocks do /cliente/agendamento
6. API do Pet Shop → popular dados reais no /dono/inicio
7. Integração Stripe → checkout e webhook
8. Cron jobs de automação
9. Endpoints do Super Admin com dados reais
```

---

*Documento gerado em 12/03/2026 — visorpet v1.0 Backend Plan*
