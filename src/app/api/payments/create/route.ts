import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { createPixPayment } from "@/lib/payments/pagarme";

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

    // Ler o corpo UMA única vez
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const orderId = (body as { orderId?: string }).orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId é obrigatório" },
        { status: 400 },
      );
    }

    // Buscar pedido e informações relacionadas
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    // Buscar informações adicionais do pedido
    // Em produção, criar tabela order_items para armazenar esses dados
    let ticketTypeId: string | null = null;
    let resaleListingId: string | null = null;

    // Buscar do body da requisição se fornecido
    if ((body as { ticket_type_id?: string }).ticket_type_id) {
      ticketTypeId = (body as { ticket_type_id?: string }).ticket_type_id as string;
    }
    if ((body as { resale_listing_id?: string }).resale_listing_id) {
      resaleListingId = (body as { resale_listing_id?: string }).resale_listing_id as string;
    }

    // Se não fornecido, tentar buscar do último pedido relacionado
    // (solução temporária - em produção usar order_items)
    if (!ticketTypeId && !resaleListingId) {
      if (order.origin === "primary") {
        // Buscar eventos e ticket types relacionados
        // Por enquanto, vamos deixar null e processar no webhook de forma diferente
      } else if (order.origin === "resale") {
        // Buscar resale listings ativos
        const { data: listings } = await supabase
          .from("resale_listings")
          .select("id")
          .eq("status", "active")
          .limit(1);
        if (listings?.[0]) resaleListingId = listings[0].id;
      }
    }

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { error: "Pedido já foi pago" },
        { status: 400 },
      );
    }

    // Verificar se já existe transação de pagamento
    const { data: existingTransaction } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .single();

    if (existingTransaction) {
      return NextResponse.json(existingTransaction);
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 },
      );
    }

    // Calcular split rules conforme origem
    const amountInCents = Math.round(order.total_amount * 100);
    const processingFeeCents = Math.round((order.metadata as any)?.processing_fee ? Number((order.metadata as any).processing_fee) * 100 : 1200);
    const splitRules: { recipient_id: string; amount: number; liable?: boolean; charge_processing_fee?: boolean }[] = [];

    const partyuRecipient = process.env.PAGARME_PARTYU_RECIPIENT_ID;
    const organizerRecipientDefault = process.env.PAGARME_ORGANIZER_DEFAULT_RECIPIENT_ID;
    const resellerRecipientDefault = process.env.PAGARME_RESELLER_DEFAULT_RECIPIENT_ID;

    if (order.origin === "primary") {
      // Primária: preço do ticket vai para organizador; taxa fixa vai para PartyU
      const ticketPortion = amountInCents - processingFeeCents;
      if (!partyuRecipient) {
        console.warn("PAGARME_PARTYU_RECIPIENT_ID não configurado; split será omitido.");
      } else {
        splitRules.push({
          recipient_id: partyuRecipient,
          amount: processingFeeCents,
          liable: false,
          charge_processing_fee: false,
        });
      }
      if (organizerRecipientDefault) {
        splitRules.push({
          recipient_id: organizerRecipientDefault,
          amount: ticketPortion,
          liable: true,
          charge_processing_fee: false,
        });
      } else {
        console.warn("PAGARME_ORGANIZER_DEFAULT_RECIPIENT_ID não configurado; parte do organizador não será dividida.");
      }
    } else {
      // Revenda: comprador paga asking + taxa
      // asking -> revendedor; taxa -> 60% organizador, 40% PartyU
      const askingPrice = (order.metadata as any)?.asking_price ? Math.round(Number((order.metadata as any).asking_price) * 100) : amountInCents - processingFeeCents;
      const feeToOrganizer = Math.round(processingFeeCents * 0.6);
      const feeToPartyu = processingFeeCents - feeToOrganizer;

      if (resellerRecipientDefault) {
        splitRules.push({
          recipient_id: resellerRecipientDefault,
          amount: askingPrice,
          liable: true,
          charge_processing_fee: false,
        });
      } else {
        console.warn("PAGARME_RESELLER_DEFAULT_RECIPIENT_ID não configurado; parte do revendedor não será dividida.");
      }
      if (organizerRecipientDefault) {
        splitRules.push({
          recipient_id: organizerRecipientDefault,
          amount: feeToOrganizer,
          liable: false,
          charge_processing_fee: false,
        });
      } else {
        console.warn("PAGARME_ORGANIZER_DEFAULT_RECIPIENT_ID não configurado; parte do organizador na taxa não será dividida.");
      }
      if (partyuRecipient) {
        splitRules.push({
          recipient_id: partyuRecipient,
          amount: feeToPartyu,
          liable: false,
          charge_processing_fee: false,
        });
      } else {
        console.warn("PAGARME_PARTYU_RECIPIENT_ID não configurado; parte da PartyU na taxa não será dividida.");
      }
    }

    // Criar pagamento PIX via Pagar.me com split (se configurado)
    const pixPayment = await createPixPayment({
      amount: amountInCents,
      customer: {
        name: profile.full_name || user.email || "Cliente",
        email: user.email || "",
        document: profile.phone || "00000000000", // Em produção, pedir CPF
      },
      metadata: {
        order_id: order.id,
        user_id: user.id,
        origin: order.origin,
        ticket_type_id: ticketTypeId,
        resale_listing_id: resaleListingId,
      },
      splitRules,
    });

    // Salvar transação no banco
    const serviceRoleClient = createSupabaseServiceRoleClient();

    const { data: transaction, error: transactionError } =
      await serviceRoleClient.from("payment_transactions").insert({
        order_id: order.id,
        external_id: pixPayment.id,
        payment_type: "pix",
        amount: order.total_amount,
        status: pixPayment.status === "paid" ? "paid" : "pending",
        pix_qr_code: pixPayment.pix_qr_code || null,
        pix_copy_paste: pixPayment.pix_copy_paste || null,
        paid_at: pixPayment.status === "paid" ? new Date().toISOString() : null,
        metadata: {
          pagarme_id: pixPayment.id,
          origin: order.origin,
          ticket_type_id: ticketTypeId,
          resale_listing_id: resaleListingId,
        },
      }).select().single();

    if (transactionError) {
      console.error("Error saving transaction:", transactionError);
      return NextResponse.json(
        { error: "Erro ao salvar transação" },
        { status: 500 },
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar pagamento";
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
