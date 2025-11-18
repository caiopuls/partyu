import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar webhook do Pagar.me
    // Em produção, validar assinatura/segurança do webhook

    const { id, status, paid_at } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da transação não fornecido" },
        { status: 400 },
      );
    }

    const serviceRoleClient = createSupabaseServiceRoleClient();

    // Buscar transação
    const { data: transaction, error: transactionError } =
      await serviceRoleClient
        .from("payment_transactions")
        .select("*, orders(*)")
        .eq("external_id", id.toString())
        .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", transactionError);
      return NextResponse.json({ received: true });
    }

    // Idempotência: não processar se já foi pago
    if (transaction.status === "paid" && status === "paid") {
      return NextResponse.json({ received: true });
    }

    // Atualizar transação
    await serviceRoleClient
      .from("payment_transactions")
      .update({
        status: status === "paid" ? "paid" : status,
        paid_at: paid_at || (status === "paid" ? new Date().toISOString() : null),
      })
      .eq("id", transaction.id);

    if (status === "paid") {
      const order = transaction.orders;

      // Atualizar pedido
      await serviceRoleClient
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id);

      // Processar pedido baseado na origem
      if (order.origin === "primary") {
        // Buscar ticket_type_id do metadata da transação
        const ticketTypeId = transaction.metadata?.ticket_type_id;
        
        if (!ticketTypeId) {
          console.error("ticket_type_id não encontrado no metadata");
          return NextResponse.json({ received: true });
        }

        const { data: ticketType, error: ticketTypeError } = await serviceRoleClient
          .from("event_ticket_types")
          .select("*, events(*)")
          .eq("id", ticketTypeId)
          .single();

        if (ticketTypeError || !ticketType) {
          console.error("Ticket type não encontrado:", ticketTypeError);
          return NextResponse.json({ received: true });
        }

        if (ticketType) {
          // Criar ticket para o comprador
          const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          
          await serviceRoleClient.from("user_tickets").insert({
            user_id: order.user_id,
            order_id: order.id,
            event_id: ticketType.event_id,
            ticket_type_id: ticketType.id,
            status: "active",
            ticket_number: ticketNumber,
          });

          // Atualizar quantidade vendida
          await serviceRoleClient
            .from("event_ticket_types")
            .update({
              sold_quantity: ticketType.sold_quantity + 1,
              status: ticketType.sold_quantity + 1 >= ticketType.total_quantity ? "sold_out" : "active",
            })
            .eq("id", ticketType.id);
        }
      } else if (order.origin === "resale") {
        // Buscar resale_listing_id do metadata da transação
        const resaleListingId = transaction.metadata?.resale_listing_id;
        
        if (!resaleListingId) {
          console.error("resale_listing_id não encontrado no metadata");
          return NextResponse.json({ received: true });
        }

        const { data: resaleListing, error: resaleError } = await serviceRoleClient
          .from("resale_listings")
          .select("*, user_tickets(*)")
          .eq("id", resaleListingId)
          .single();

        if (resaleError || !resaleListing) {
          console.error("Resale listing não encontrado:", resaleError);
          return NextResponse.json({ received: true });
        }

        if (resaleListing) {
          // Transferir ticket para o comprador
          await serviceRoleClient
            .from("user_tickets")
            .update({
              user_id: order.user_id,
              status: "active",
            })
            .eq("id", resaleListing.ticket_id);

          // Atualizar listing
          await serviceRoleClient
            .from("resale_listings")
            .update({ status: "sold" })
            .eq("id", resaleListing.id);

          // Calcular valores
          const platformFee =
            (resaleListing.asking_price *
              resaleListing.platform_fee_percentage) /
            100;
          const sellerAmount = resaleListing.asking_price - platformFee;

          // Buscar wallet do vendedor
          const { data: sellerWallet } = await serviceRoleClient
            .from("wallets")
            .select("*")
            .eq("user_id", resaleListing.seller_id)
            .single();

          if (sellerWallet) {
            // Atualizar saldo do vendedor
            await serviceRoleClient
              .from("wallets")
              .update({
                balance: sellerWallet.balance + sellerAmount,
              })
              .eq("id", sellerWallet.id);

            // Criar entrada no ledger
            await serviceRoleClient.from("wallet_ledger").insert({
              wallet_id: sellerWallet.id,
              user_id: resaleListing.seller_id,
              amount: sellerAmount,
              type: "ticket_sale",
              description: `Venda de ingresso - Pedido ${order.id}`,
              reference_id: order.id,
            });

            // Criar entrada de comissão da plataforma
            await serviceRoleClient.from("wallet_ledger").insert({
              wallet_id: sellerWallet.id,
              user_id: resaleListing.seller_id,
              amount: -platformFee,
              type: "sale_commission",
              description: `Comissão PartyU - Pedido ${order.id}`,
              reference_id: order.id,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 },
    );
  }
}

