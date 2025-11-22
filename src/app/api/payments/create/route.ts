
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { createPixCharge } from "@/lib/payments/openpix";
import { sendEmail } from '@/lib/email';

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

    // Calcular split rules conforme origem (MODELO CARTEIRA: Sem split no Pagar.me/OpenPix direto)
    // O valor integral vai para a PartyU e o split é feito virtualmente no banco de dados
    // via webhook ou job.

    const amountInCents = Math.round(order.total_amount * 100);
    const processingFeeCents = Math.round((order.metadata as any)?.processing_fee ? Number((order.metadata as any).processing_fee) * 100 : 1200);

    // Definir metadados para o split virtual
    const virtualSplitMetadata = {
      order_id: order.id,
      user_id: user.id,
      origin: order.origin,
      ticket_type_id: ticketTypeId,
      resale_listing_id: resaleListingId,
      // Informações para o split virtual
      processing_fee_cents: processingFeeCents,
      organizer_id: null as string | null, // Será preenchido abaixo
      reseller_id: null as string | null, // Será preenchido abaixo
    };

    if (order.origin === "primary") {
      // Buscar organizador do evento
      const { data: eventData } = await supabase
        .from("events")
        .select("organizer_id")
        .eq("id", order.metadata.event_id)
        .single();

      if (eventData) {
        virtualSplitMetadata.organizer_id = eventData.organizer_id;
      }
    } else {
      // Buscar revendedor e organizador
      if (resaleListingId) {
        const { data: listing } = await supabase
          .from("resale_listings")
          .select("seller_id, ticket_id")
          .eq("id", resaleListingId)
          .single();

        if (listing) {
          virtualSplitMetadata.reseller_id = listing.seller_id;

          // Buscar organizador através do ticket
          const { data: ticket } = await supabase
            .from("user_tickets")
            .select("event_id")
            .eq("id", listing.ticket_id)
            .single();

          if (ticket) {
            const { data: eventData } = await supabase
              .from("events")
              .select("organizer_id")
              .eq("id", ticket.event_id)
              .single();

            if (eventData) {
              virtualSplitMetadata.organizer_id = eventData.organizer_id;
            }
          }
        }
      }
    }

    // Criar cobrança PIX via OpenPix
    const pixCharge = await createPixCharge({
      correlationID: order.id, // Usando ID do pedido como correlationID
      value: amountInCents,
      comment: `Pedido ${order.id} `,
      customer: {
        name: profile.full_name || user.email || "Cliente",
        email: user.email || "",
        taxID: profile.cpf_cnpj || undefined, // OpenPix valida CPF/CNPJ
        phone: profile.phone || undefined,
      },
      additionalInfo: [
        { key: "order_id", value: order.id },
        { key: "origin", value: order.origin },
      ],
    });

    // Salvar transação no banco
    const serviceRoleClient = createSupabaseServiceRoleClient();

    const { data: transaction, error: transactionError } =
      await serviceRoleClient.from("payment_transactions").insert({
        order_id: order.id,
        external_id: pixCharge.charge.correlationID,
        payment_type: "pix",
        amount: order.total_amount,
        status: pixCharge.charge.status === "COMPLETED" ? "paid" : "pending", // OpenPix usa COMPLETED
        pix_qr_code: pixCharge.charge.qrCodeImage || null,
        pix_copy_paste: pixCharge.charge.brCode || null,
        paid_at: pixCharge.charge.status === "COMPLETED" ? new Date().toISOString() : null,
        metadata: {
          openpix_correlation_id: pixCharge.charge.correlationID,
          openpix_payment_link: pixCharge.charge.paymentLinkUrl,
          ...virtualSplitMetadata,
        },
      }).select().single();

    if (transaction) {
      // Send email to buyer
      const buyerEmail = user.email;
      if (buyerEmail) {
        await sendEmail(
          buyerEmail,
          `Pagamento recebido - Pedido ${order.id}`,
          `<p>Olá ${profile.full_name || 'Cliente'},</p><p>Seu pagamento de R$ ${order.total_amount.toFixed(2)} foi recebido com sucesso.</p>`
        );
      }
      // Send email to organizer if organizer email available
      if (virtualSplitMetadata.organizer_id) {
        const { data: organizerProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', virtualSplitMetadata.organizer_id)
          .single();
        if (organizerProfile?.email) {
          await sendEmail(
            organizerProfile.email,
            `Novo pagamento - Evento ${order.id}`,
            `<p>Olá ${organizerProfile.full_name || ''},</p><p>Um pagamento de R$ ${order.total_amount.toFixed(2)} foi realizado para o seu evento.</p>`
          );
        }
      }
    }

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
