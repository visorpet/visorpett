/**
 * Asaas API Client
 * Suporte a sandbox e produção.
 * A chave é lida da tabela SystemConfig (via admin) ou de variáveis de ambiente.
 */

import { createAdminClient } from "@/lib/supabase/admin";

const SANDBOX_URL = "https://sandbox.asaas.com/api/v3";
const PROD_URL    = "https://api.asaas.com/api/v3";

// Cache em memória para evitar consultar o DB a cada request
let _cachedKey: string | null = null;
let _cachedSandbox: boolean   = true;
let _cacheTs = 0;
const CACHE_TTL = 60_000; // 1 minuto

async function getAsaasConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  const now = Date.now();
  if (_cachedKey && now - _cacheTs < CACHE_TTL) {
    return { apiKey: _cachedKey, baseUrl: _cachedSandbox ? SANDBOX_URL : PROD_URL };
  }

  // Tenta env var primeiro (Vercel)
  const envKey  = process.env.ASAAS_API_KEY;
  const envSbox = process.env.ASAAS_SANDBOX !== "false";

  if (envKey) {
    _cachedKey    = envKey;
    _cachedSandbox = envSbox;
    _cacheTs      = now;
    return { apiKey: envKey, baseUrl: envSbox ? SANDBOX_URL : PROD_URL };
  }

  // Fallback: lê do SystemConfig no banco
  const db = createAdminClient();
  const { data } = await db
    .from("SystemConfig")
    .select("key, value")
    .in("key", ["ASAAS_API_KEY", "ASAAS_SANDBOX"]);

  const cfg = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  const dbKey = cfg["ASAAS_API_KEY"];
  if (!dbKey) throw new Error("ASAAS_API_KEY não configurada");

  const sandbox = cfg["ASAAS_SANDBOX"] !== "false";
  _cachedKey    = dbKey;
  _cachedSandbox = sandbox;
  _cacheTs      = now;

  return { apiKey: dbKey, baseUrl: sandbox ? SANDBOX_URL : PROD_URL };
}

async function asaasFetch(path: string, options: RequestInit = {}) {
  const { apiKey, baseUrl } = await getAsaasConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "access_token": apiKey,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Asaas ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json();
}

// ─── Customers ────────────────────────────────────────────────────────────────

export type AsaasCustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  externalReference?: string; // petShopId
};

export async function createAsaasCustomer(input: AsaasCustomerInput) {
  return asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function findAsaasCustomer(externalReference: string) {
  const data = await asaasFetch(`/customers?externalReference=${externalReference}`);
  return data?.data?.[0] ?? null;
}

export async function getAsaasCustomer(customerId: string) {
  return asaasFetch(`/customers/${customerId}`);
}

export async function updateAsaasCustomer(customerId: string, input: Partial<AsaasCustomerInput>) {
  return asaasFetch(`/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export type AsaasBillingType = "BOLETO" | "CREDIT_CARD" | "PIX";
export type AsaasCycle = "MONTHLY" | "YEARLY" | "WEEKLY";

export type AsaasSubscriptionInput = {
  customer: string;           // Asaas customer ID
  billingType: AsaasBillingType;
  value: number;              // em reais
  nextDueDate: string;        // YYYY-MM-DD
  cycle: AsaasCycle;
  description?: string;
  externalReference?: string; // petShopId
};

export async function createAsaasSubscription(input: AsaasSubscriptionInput) {
  return asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getAsaasSubscription(subscriptionId: string) {
  return asaasFetch(`/subscriptions/${subscriptionId}`);
}

export async function cancelAsaasSubscription(subscriptionId: string) {
  return asaasFetch(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
}

export async function listAsaasSubscriptions(customerId?: string) {
  const query = customerId ? `?customer=${customerId}` : "";
  return asaasFetch(`/subscriptions${query}`);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function listAsaasPayments(subscriptionId: string) {
  return asaasFetch(`/payments?subscription=${subscriptionId}`);
}

// ─── Account ──────────────────────────────────────────────────────────────────

export async function getAsaasAccount() {
  return asaasFetch("/myAccount");
}

// ─── Valores por plano ────────────────────────────────────────────────────────

export const PLAN_PRICES: Record<string, number> = {
  PRO:      97,
  PREMIUM:  197,
  ENTERPRISE: 497,
};
