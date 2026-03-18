import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_KEYS = [
  "EVOLUTION_API_URL",
  "EVOLUTION_API_KEY",
  "EVOLUTION_INSTANCE",
  "CRON_SECRET",
  "ASAAS_API_KEY",
  "ASAAS_SANDBOX",
] as const;

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("SystemConfig")
    .select("key, value")
    .in("key", ALLOWED_KEYS as unknown as string[]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const config = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  // Mask sensitive keys
  if (config["EVOLUTION_API_KEY"]) {
    config["EVOLUTION_API_KEY_MASKED"] = "••••••••" + config["EVOLUTION_API_KEY"].slice(-4);
  }
  if (config["ASAAS_API_KEY"]) {
    config["ASAAS_API_KEY_MASKED"] = "••••••••" + config["ASAAS_API_KEY"].slice(-4);
  }
  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const db = createAdminClient();

  const upserts = ALLOWED_KEYS.filter((k) => k in body).map((k) => ({
    key: k,
    value: String(body[k] ?? ""),
    updatedAt: new Date().toISOString(),
  }));

  if (upserts.length === 0) {
    return NextResponse.json({ error: "No valid keys" }, { status: 400 });
  }

  const { error } = await db.from("SystemConfig").upsert(upserts, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
