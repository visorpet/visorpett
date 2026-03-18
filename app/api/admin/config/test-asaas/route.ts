import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createAdminClient();
  const { data } = await db
    .from("SystemConfig")
    .select("key, value")
    .in("key", ["ASAAS_API_KEY", "ASAAS_SANDBOX"]);

  const cfg = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const apiKey = cfg["ASAAS_API_KEY"];

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 400 });
  }

  const sandbox = cfg["ASAAS_SANDBOX"] !== "false";
  const baseUrl = sandbox
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/api/v3";

  try {
    const res = await fetch(`${baseUrl}/myAccount`, {
      headers: { access_token: apiKey },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    }

    const account = await res.json();
    return NextResponse.json({ ok: true, name: account.name, email: account.email });
  } catch {
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}
