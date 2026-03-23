-- ============================================================
-- Visorpet — Migration SQL Completo
-- Execute este arquivo inteiro no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dwaypkseipzzekvkpnff/sql
-- ============================================================

-- ─── 1. Extensões ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. Enums ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'DONO', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'PREMIUM', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'faltou');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceType" AS ENUM ('banho', 'tosa', 'banho_e_tosa', 'consulta', 'vacina', 'outro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 3. Tabelas de Auth (NextAuth) ───────────────────────────

CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"          TEXT,
  "email"         TEXT UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "image"         TEXT,
  "phone"         TEXT,
  "role"          "UserRole" NOT NULL DEFAULT 'CLIENTE',
  "passwordHash"  TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Account" (
  "id"                TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId"       TEXT NOT NULL,
  "expires"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL UNIQUE,
  "expires"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

-- ─── 4. Pet Shop (Tenant) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PetShop" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "slug"      TEXT NOT NULL UNIQUE,
  "logoUrl"   TEXT,
  "phone"     TEXT,
  "address"   TEXT,
  "city"      TEXT,
  "state"     TEXT,
  "ownerId"   TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PetShop_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PetShop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id")
);
CREATE INDEX IF NOT EXISTS "PetShop_slug_idx" ON "PetShop"("slug");

-- ─── 5. Assinatura / Plano ───────────────────────────────────

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id"                   TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "petShopId"            TEXT NOT NULL UNIQUE,
  "plan"                 "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
  "status"               "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
  "stripeCustomerId"     TEXT UNIQUE,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId"        TEXT,
  "currentPeriodStart"   TIMESTAMP(3),
  "currentPeriodEnd"     TIMESTAMP(3),
  "cancelAtPeriodEnd"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id")
);

-- ─── 6. Tosadores ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Groomer" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "phone"     TEXT,
  "photoUrl"  TEXT,
  "petShopId" TEXT NOT NULL,
  "userId"    TEXT UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Groomer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Groomer_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id"),
  CONSTRAINT "Groomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
);
CREATE INDEX IF NOT EXISTS "Groomer_petShopId_idx" ON "Groomer"("petShopId");

-- ─── 7. Clientes da Loja ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Client" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "email"     TEXT,
  "phone"     TEXT NOT NULL,
  "petShopId" TEXT NOT NULL,
  "userId"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Client_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id")
);
CREATE INDEX IF NOT EXISTS "Client_petShopId_idx" ON "Client"("petShopId");
CREATE INDEX IF NOT EXISTS "Client_phone_idx" ON "Client"("phone");

-- ─── 8. Pets ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Pet" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "species"   TEXT NOT NULL,
  "breed"     TEXT,
  "birthDate" TIMESTAMP(3),
  "weight"    DOUBLE PRECISION,
  "photoUrl"  TEXT,
  "notes"     TEXT,
  "clientId"  TEXT NOT NULL,
  "ownerId"   TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Pet_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Pet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id"),
  CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id")
);
CREATE INDEX IF NOT EXISTS "Pet_clientId_idx" ON "Pet"("clientId");
CREATE INDEX IF NOT EXISTS "Pet_ownerId_idx" ON "Pet"("ownerId");

-- ─── 9. Vacinas ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Vaccine" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "petId"     TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "appliedAt" TIMESTAMP(3) NOT NULL,
  "nextDueAt" TIMESTAMP(3),
  "vetName"   TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Vaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Vaccine_petId_idx" ON "Vaccine"("petId");

-- ─── 10. Observações Médicas ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "MedicalNote" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "petId"     TEXT NOT NULL,
  "note"      TEXT NOT NULL,
  "author"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MedicalNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MedicalNote_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MedicalNote_petId_idx" ON "MedicalNote"("petId");

-- ─── 11. Serviços ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Service" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "petShopId"   TEXT NOT NULL,
  "type"        "ServiceType" NOT NULL,
  "label"       TEXT NOT NULL,
  "price"       DOUBLE PRECISION NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Service_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id")
);
CREATE INDEX IF NOT EXISTS "Service_petShopId_idx" ON "Service"("petShopId");

-- ─── 12. Agendamentos ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "petId"      TEXT NOT NULL,
  "petShopId"  TEXT NOT NULL,
  "serviceId"  TEXT NOT NULL,
  "groomerId"  TEXT,
  "date"       TIMESTAMP(3) NOT NULL,
  "status"     "AppointmentStatus" NOT NULL DEFAULT 'agendado',
  "notes"      TEXT,
  "totalPrice" DOUBLE PRECISION NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id"),
  CONSTRAINT "Appointment_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id"),
  CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id"),
  CONSTRAINT "Appointment_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "Groomer"("id")
);
CREATE INDEX IF NOT EXISTS "Appointment_petShopId_idx" ON "Appointment"("petShopId");
CREATE INDEX IF NOT EXISTS "Appointment_petId_idx" ON "Appointment"("petId");
CREATE INDEX IF NOT EXISTS "Appointment_date_idx" ON "Appointment"("date");
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");

-- ─── 13. Trigger: updatedAt automático ─────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['User', 'PetShop', 'Subscription', 'Pet', 'Appointment']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON "%s";
       CREATE TRIGGER set_updated_at BEFORE UPDATE ON "%s"
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t
    );
  END LOOP;
END $$;

-- ─── 14. Row Level Security (RLS) ────────────────────────────
-- Habilita RLS nas tabelas sensíveis para segurança extra

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PetShop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

-- Política: service_role tem acesso total (para o backend Next.js)
CREATE POLICY IF NOT EXISTS "service_role_all" ON "User" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "service_role_all" ON "PetShop" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "service_role_all" ON "Subscription" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "service_role_all" ON "Pet" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "service_role_all" ON "Appointment" FOR ALL USING (auth.role() = 'service_role');

-- ─── 15. Super Admin seed (opcional) ────────────────────────
-- Insere o primeiro usuário Super Admin para testes
-- Troque o email e atualize a senha depois do primeiro login

INSERT INTO "User" ("id", "name", "email", "role", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Admin Visorpet',
  'admin@visorpet.app',
  'SUPER_ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO NOTHING;

-- ─── Validação ───────────────────────────────────────────────
SELECT 
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as colunas
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- ─── Migração: adiciona colunas Asaas na Subscription ────────
ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "asaasCustomerId"     TEXT,
  ADD COLUMN IF NOT EXISTS "asaasSubscriptionId" TEXT;
