import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petShopId = searchParams.get("petShopId");
    
    const services = await db.service.findMany({
      where: petShopId ? { petShopId, active: true } : { active: true }
    });
    
    return NextResponse.json({ data: services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
