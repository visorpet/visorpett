import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BUCKET = "photos";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "misc";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não suportado. Use JPG, PNG ou WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const timestamp = Date.now();
    const path = `${folder}/${session.user.id}/${timestamp}.${ext}`;

    const db = createAdminClient();

    // Garante que o bucket existe (cria se não existir)
    const { data: buckets } = await db.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET);
    if (!bucketExists) {
      const { error: bucketError } = await db.storage.createBucket(BUCKET, { public: true });
      if (bucketError && bucketError.message !== "The resource already exists") {
        console.error("[BUCKET_CREATE_ERROR]", bucketError);
        return NextResponse.json({ error: "Erro ao configurar storage" }, { status: 500 });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[UPLOAD_ERROR]", uploadError);
      return NextResponse.json({ error: "Erro ao fazer upload da imagem" }, { status: 500 });
    }

    const { data: publicUrlData } = db.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error("[API_UPLOAD]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
