import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petShopId = searchParams.get("petShopId");

    const db = createAdminClient();
    let query = db.from("Service").select("*").eq("active", true);
    if (petShopId) query = query.eq("petShopId", petShopId);

    const { data: services } = await query;

    return NextResponse.json({ data: services ?? [] });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
