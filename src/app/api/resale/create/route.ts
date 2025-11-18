import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const createResaleSchema = z.object({
  ticketId: z.string().uuid(),
  askingPrice: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = createResaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { ticketId, askingPrice } = parsed.data;

    // Verificar se o ticket pertence ao usuário e está ativo
    const { data: ticket, error: ticketError } = await supabase
      .from("user_tickets")
      .select("*, ticket_type_id, event_id")
      .eq("id", ticketId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: "Ingresso não encontrado ou não disponível para revenda" },
        { status: 404 },
      );
    }

    // Verificar se já existe um anúncio ativo para este ticket
    const { data: existingListing } = await supabase
      .from("resale_listings")
      .select("*")
      .eq("ticket_id", ticketId)
      .eq("status", "active")
      .single();

    if (existingListing) {
      return NextResponse.json(
        { error: "Este ingresso já está anunciado para revenda" },
        { status: 400 },
      );
    }

    // Impor teto: preço de revenda não pode exceder o valor original do ticket
    if (!ticket.ticket_type_id) {
      return NextResponse.json(
        { error: "Ingresso sem tipo associado" },
        { status: 400 },
      );
    }
    const { data: ticketType, error: ttError } = await supabase
      .from("event_ticket_types")
      .select("price")
      .eq("id", ticket.ticket_type_id)
      .single();
    if (ttError || !ticketType) {
      return NextResponse.json(
        { error: "Tipo de ingresso original não encontrado" },
        { status: 404 },
      );
    }
    const originalPrice = parseFloat(ticketType.price as unknown as string);
    if (askingPrice > originalPrice) {
      return NextResponse.json(
        { error: "Preço de revenda acima do valor original não é permitido" },
        { status: 400 },
      );
    }

    // Criar anúncio de revenda
    const { data: listing, error: listingError } = await supabase
      .from("resale_listings")
      .insert({
        ticket_id: ticketId,
        seller_id: user.id,
        asking_price: askingPrice,
        platform_fee_percentage: 10, // mantido para compatibilidade; cálculo usa taxa fixa
        status: "active",
      })
      .select()
      .single();

    if (listingError) {
      console.error("Error creating resale listing:", listingError);
      return NextResponse.json(
        { error: "Erro ao criar anúncio" },
        { status: 500 },
      );
    }

    // Atualizar status do ticket para "listed"
    await supabase
      .from("user_tickets")
      .update({ status: "listed" })
      .eq("id", ticketId);

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error in create resale:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

