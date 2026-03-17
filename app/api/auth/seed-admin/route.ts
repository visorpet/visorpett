import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("admin", 10);
    
    const admin = await db.user.upsert({
      where: { email: "admin@admin.com" },
      update: {},
      create: {
        name: "Admin Visorpet",
        email: "admin@admin.com",
        role: "SUPER_ADMIN",
        passwordHash,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin admin@admin.com criado/verificado com sucesso!", 
      admin: { email: admin.email, role: admin.role }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
