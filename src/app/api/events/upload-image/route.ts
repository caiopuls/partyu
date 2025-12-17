import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  event_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const form = await request.formData();
    const event_id = form.get("event_id") as string | null;
    const file = form.get("image") as File | null;

    const parsed = schema.safeParse({ event_id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 },
      );
    }
    if (!file) {
      return NextResponse.json(
        { error: "Arquivo de imagem é obrigatório (campo: image)" },
        { status: 400 },
      );
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 10MB" },
        { status: 400 },
      );
    }

    // Validar tipo de arquivo (apenas JPG)
    const allowedTypes = ["image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use apenas JPG" },
        { status: 400 },
      );
    }

    // Verificar permissão: admin pode tudo; organizador do evento também
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    const { data: eventRow, error: eventError } = await supabase
      .from("events")
      .select("id, organizer_id")
      .eq("id", event_id)
      .single();

    if (eventError || !eventRow) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    const isOrganizer = eventRow.organizer_id === user.id;
    if (!isAdmin && !isOrganizer) {
      return NextResponse.json(
        { error: "Sem permissão para alterar este evento" },
        { status: 403 },
      );
    }

    // Subir arquivo no Storage (bucket: events)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const key = crypto.randomBytes(8).toString("hex");
    const path = `${event_id}/${key}.${safeExt}`;

    const service = createSupabaseServiceRoleClient();

    const { error: uploadError } = await service.storage
      .from("events")
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Falha ao enviar imagem" },
        { status: 500 },
      );
    }

    const { data: urlData } = service.storage.from("events").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Atualiza banner_url do evento
    const { error: updateError } = await service
      .from("events")
      .update({ banner_url: publicUrl })
      .eq("id", event_id);
    if (updateError) {
      console.error("Update event banner error:", updateError);
      return NextResponse.json(
        { error: "Imagem enviada, mas falhou ao atualizar o evento" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      path,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error in upload event image:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}


