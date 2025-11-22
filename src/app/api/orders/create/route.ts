import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const createOrderSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid().nullable().optional(),
  resale_listing_id: z.string().uuid().nullable().optional(),
  origin: z.enum(["primary", "resale"]),
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

    const formData = await request.formData();

    const getOptionalString = (key: string) => {
      const value = formData.get(key);
      if (!value || value === "null" || value === "undefined" || (typeof value === "string" && value.trim() === "")) {
        return null;
      }
      return value as string;
    };

    const data = {
      event_id: formData.get("event_id") as string,
      ticket_type_id: getOptionalString("ticket_type_id"),
      resale_listing_id: getOptionalString("resale_listing_id"),
      origin: formData.get("origin") as "primary" | "resale",
    };

    console.log("Order Create Data:", data);

    const parsed = createOrderSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Order Validation Error:", parsed.error.issues);
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { event_id, ticket_type_id, resale_listing_id, origin } =
      parsed.data;

    // Calcular total e validar regras de preço/limite
    // Taxa de processamento fixa (R$ 12,00)
    const processingFee = 12.0;
    let total_amount = 0;
    let computedTicketPrice = 0;
    let computedAskingPrice = 0;

    if (origin === "primary") {
      if (!ticket_type_id) {
        return NextResponse.json(
          { error: "ticket_type_id é obrigatório para compra primária" },
          { status: 400 },
        );
      }
      const { data: ticketType, error: ttError } = await supabase
        .from("event_ticket_types")
        .select("price, event_id")
        .eq("id", ticket_type_id)
        .single();
      if (ttError || !ticketType) {
        return NextResponse.json(
          { error: "Tipo de ingresso não encontrado" },
          { status: 404 },
        );
      }
      // Garantir que o ticket_type pertence ao event_id enviado
      if (ticketType.event_id !== event_id) {
        return NextResponse.json(
          { error: "Tipo de ingresso não pertence ao evento informado" },
          { status: 400 },
        );
      }
      computedTicketPrice = parseFloat(ticketType.price as unknown as string);
      total_amount = computedTicketPrice + processingFee;
    } else {
      if (!resale_listing_id) {
        return NextResponse.json(
          { error: "resale_listing_id é obrigatório para revenda" },
          { status: 400 },
        );
      }
      // Buscar anúncio e ticket original
      const { data: listing, error: listingError } = await supabase
        .from("resale_listings")
        .select("asking_price, ticket_id, status")
        .eq("id", resale_listing_id)
        .single();
      if (listingError || !listing) {
        return NextResponse.json(
          { error: "Anúncio de revenda não encontrado" },
          { status: 404 },
        );
      }
      if (listing.status !== "active") {
        return NextResponse.json(
          { error: "Anúncio de revenda não está ativo" },
          { status: 400 },
        );
      }
      // Buscar ticket associado
      const { data: ticketRow, error: tErr } = await supabase
        .from("user_tickets")
        .select("event_id, ticket_type_id")
        .eq("id", listing.ticket_id)
        .single();
      if (tErr || !ticketRow) {
        return NextResponse.json(
          { error: "Ingresso associado à revenda não encontrado" },
          { status: 404 },
        );
      }
      // Conferir que o anúncio pertence ao evento informado
      if (ticketRow.event_id !== event_id) {
        return NextResponse.json(
          { error: "Anúncio não pertence ao evento informado" },
          { status: 400 },
        );
      }
      // Buscar preço original do ticket_type para impor teto
      const ticketTypeId = ticketRow.ticket_type_id;
      const { data: ticketType, error: ttError } = await supabase
        .from("event_ticket_types")
        .select("price")
        .eq("id", ticketTypeId)
        .single();
      if (ttError || !ticketType) {
        return NextResponse.json(
          { error: "Tipo de ingresso original não encontrado" },
          { status: 404 },
        );
      }
      const originalPrice = parseFloat(ticketType.price as unknown as string);
      computedAskingPrice = parseFloat(listing.asking_price as unknown as string);
      if (computedAskingPrice > originalPrice) {
        return NextResponse.json(
          { error: "Preço de revenda acima do valor original não é permitido" },
          { status: 400 },
        );
      }
      total_amount = computedAskingPrice + processingFee;
    }

    // Usar service role para criar pedido com informações completas
    const serviceRoleClient = createSupabaseServiceRoleClient();

    // Criar pedido com metadata para armazenar informações do pedido
    const { data: order, error: orderError } = await serviceRoleClient
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount,
        status: "pending",
        origin,
        metadata: {
          event_id,
          ticket_type_id: ticket_type_id || null,
          resale_listing_id: resale_listing_id || null,
          processing_fee: processingFee,
          ticket_price: origin === "primary" ? computedTicketPrice : null,
          asking_price: origin === "resale" ? computedAskingPrice : null,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Erro ao criar pedido" },
        { status: 500 },
      );
    }

    // Redirecionar para página de pagamento
    return NextResponse.redirect(
      new URL(`/pagamento/${order.id}`, request.url),
    );
  } catch (error) {
    console.error("Error in create order:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

