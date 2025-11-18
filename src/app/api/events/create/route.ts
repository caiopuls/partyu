import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  venue: z.string().optional(),
  address: z.string().optional(),
  event_date: z.string(), // ISO
  category: z.string().min(2),
  image_links: z.array(z.string().url()).max(3).optional(),
  featured_index: z.number().int().min(0).max(2).optional(),
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
    // Extrair e normalizar dados
    const payload = {
      title: (form.get("title") as string) ?? "",
      description: (form.get("description") as string) ?? undefined,
      city: (form.get("city") as string) ?? "",
      state: ((form.get("state") as string) ?? "").toUpperCase(),
      venue: (form.get("venue") as string) ?? undefined,
      address: (form.get("address") as string) ?? undefined,
      event_date: (form.get("event_date") as string) ?? "",
      category: (form.get("category") as string) ?? "",
      image_links: (() => {
        const raw = form.getAll("image_links[]");
        const single = form.get("image_links");
        let links: string[] = [];
        if (raw && raw.length > 0) {
          links = raw.filter((v): v is string => typeof v === "string");
        } else if (single && typeof single === "string" && single.trim()) {
          links = single.split(",").map((s) => s.trim());
        }
        return links.slice(0, 3);
      })(),
      featured_index: (() => {
        const idx = form.get("featured_index");
        if (typeof idx === "string" && idx !== "") {
          const n = Number(idx);
          if (!Number.isNaN(n)) return n;
        }
        return undefined;
      })(),
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { title, description, city, state, venue, address, event_date, category, image_links, featured_index } =
      parsed.data;

    // Cria o evento (sem imagens inicialmente)
    const service = createSupabaseServiceRoleClient();

    const { data: evt, error: insertError } = await service
      .from("events")
      .insert({
        title,
        description: description ?? null,
        city,
        state,
        venue: venue ?? null,
        address: address ?? null,
        event_date,
        banner_url: null,
        category,
        organizer_id: user.id,
        status: "active",
      })
      .select("id")
      .single();
    if (insertError || !evt) {
      return NextResponse.json(
        { error: "Erro ao criar evento" },
        { status: 500 },
      );
    }

    const eventId: string = evt.id;
    const files = (form.getAll("images") as File[]).slice(0, 3);
    const uploadedUrls: string[] = [];

    // Upload dos arquivos (se fornecidos)
    for (const file of files) {
      if (!file) continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
        ? ext
        : "jpg";
      const key = crypto.randomBytes(8).toString("hex");
      const path = `${eventId}/${key}.${safeExt}`;
      const { error: uploadError } = await service.storage
        .from("events")
        .upload(path, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });
      if (!uploadError) {
        const { data: urlData } = service.storage
          .from("events")
          .getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    // Combina links e uploads
    const allUrls = [
      ...(image_links ?? []),
      ...uploadedUrls,
    ].slice(0, 3);

    // Define destaque: se featured_index válido, usa este; senão a primeira imagem
    const fi =
      typeof featured_index === "number" &&
      featured_index >= 0 &&
      featured_index < allUrls.length
        ? featured_index
        : 0;
    const featured = allUrls[fi] ?? null;
    const banner = featured;

    // Atualiza evento com imagens
    const { error: updateError } = await service
      .from("events")
      .update({
        image_urls: allUrls,
        featured_image_url: featured,
        banner_url: banner,
      })
      .eq("id", eventId);
    if (updateError) {
      console.error("Update event images error:", updateError);
    }

    return NextResponse.json({
      id: eventId,
      image_urls: allUrls,
      featured_image_url: featured,
      banner_url: banner,
    });
  } catch (error) {
    console.error("Error creating event with images:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}


