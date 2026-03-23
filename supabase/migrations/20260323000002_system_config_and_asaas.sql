-- SystemConfig: armazena configurações globais do sistema (Evolution, Asaas, Cron etc.)
CREATE TABLE IF NOT EXISTS "SystemConfig" (
  "key"       TEXT        PRIMARY KEY,
  "value"     TEXT        NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campos Asaas na Subscription (substitui Stripe)
ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "asaasCustomerId"     TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "asaasSubscriptionId" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "asaasPaymentLink"    TEXT;
