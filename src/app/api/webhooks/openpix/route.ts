import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // TODO: Verify OpenPix signature if available in headers
        const body = await request.json();
        const { charge } = body;

        if (!charge) {
            return NextResponse.json({ ok: true }); // Ignore unknown events
        }

        console.log("OpenPix Webhook received:", charge.status, charge.correlationID);

        if (charge.status === "COMPLETED") {
            const supabase = createSupabaseServiceRoleClient();
            const orderId = charge.correlationID;

            if (!orderId) {
                console.error("Order ID (correlationID) not found in webhook");
                return NextResponse.json({ ok: true });
            }

            // 1. Buscar transação para obter metadados
            const { data: transaction, error: transactionError } = await supabase
                .from("payment_transactions")
                .select("*")
                .eq("order_id", orderId)
                .single();

            if (transactionError || !transaction) {
                console.error("Transaction not found for order:", orderId);
                return NextResponse.json({ ok: true });
            }

            const metadata = transaction.metadata || {};

            // 2. Atualizar status do pedido
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .update({ status: "paid" })
                .eq("id", orderId)
                .select()
                .single();

            if (orderError || !order) {
                console.error("Error updating order:", orderError);
                return NextResponse.json({ ok: true });
            }

            // 3. Atualizar transação
            await supabase
                .from("payment_transactions")
                .update({
                    status: "paid",
                    paid_at: new Date().toISOString(),
                    metadata: {
                        ...metadata,
                        openpix_end_to_end_id: charge.transactionID, // Save Pix EndToEndId if available
                    }
                })
                .eq("id", transaction.id);

            // 4. Executar Split Virtual (Crédito em Carteira)
            const amountInCents = charge.value; // Valor total pago em centavos
            const processingFeeCents = Number(metadata.processing_fee_cents || 1200);
            const organizerId = metadata.organizer_id;
            const resellerId = metadata.reseller_id;
            const origin = metadata.origin;

            // Função auxiliar para creditar carteira
            const creditWallet = async (userId: string, amountCents: number, description: string, refId: string) => {
                const amount = amountCents / 100;

                // Buscar carteira
                let { data: wallet } = await supabase
                    .from("wallets")
                    .select("id, balance")
                    .eq("user_id", userId)
                    .single();

                // Se não existir, criar
                if (!wallet) {
                    const { data: newWallet } = await supabase
                        .from("wallets")
                        .insert({ user_id: userId, balance: 0 })
                        .select()
                        .single();
                    wallet = newWallet;
                }

                if (!wallet) return;

                // Atualizar saldo
                await supabase
                    .from("wallets")
                    .update({ balance: wallet.balance + amount })
                    .eq("id", wallet.id);

                // Criar ledger
                await supabase.from("wallet_ledger").insert({
                    wallet_id: wallet.id,
                    user_id: userId,
                    amount: amount,
                    type: "ticket_sale",
                    description,
                    reference_id: refId,
                });
            };

            if (origin === "primary" && organizerId) {
                // Primária: Organizador recebe (Total - Taxa)
                const organizerAmount = amountInCents - processingFeeCents;
                if (organizerAmount > 0) {
                    await creditWallet(organizerId, organizerAmount, `Venda de ingresso #${orderId.slice(0, 8)}`, orderId);
                }
            } else if (origin === "resale" && resellerId) {
                // Revenda:
                // Revendedor recebe (Asking Price)
                // Organizador recebe (60% da Taxa)
                // PartyU recebe (40% da Taxa) - Já está na conta PartyU

                const askingPrice = amountInCents - processingFeeCents;
                const feeToOrganizer = Math.round(processingFeeCents * 0.6);

                if (askingPrice > 0) {
                    await creditWallet(resellerId, askingPrice, `Revenda de ingresso #${orderId.slice(0, 8)}`, orderId);
                }

                if (organizerId && feeToOrganizer > 0) {
                    await creditWallet(organizerId, feeToOrganizer, `Comissão de revenda #${orderId.slice(0, 8)}`, orderId);
                }

                // 5. Transferir propriedade do ingresso (apenas revenda)
                const resaleListingId = metadata.resale_listing_id;
                if (resaleListingId) {
                    const { data: listing } = await supabase
                        .from("resale_listings")
                        .select("ticket_id")
                        .eq("id", resaleListingId)
                        .single();

                    if (listing) {
                        // Atualizar status da listagem
                        await supabase
                            .from("resale_listings")
                            .update({ status: "sold" })
                            .eq("id", resaleListingId);

                        // Transferir ticket
                        await supabase
                            .from("user_tickets")
                            .update({
                                user_id: order.user_id, // Novo dono (comprador)
                                status: "active", // Reativar ticket
                                order_id: orderId, // Atualizar referência de compra
                            })
                            .eq("id", listing.ticket_id);
                    }
                }
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("OpenPix Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
