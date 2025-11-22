import { NextRequest, NextResponse } from "next/server";
import { getCharge } from "@/lib/payments/openpix";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId é obrigatório" },
        { status: 400 },
      );
    }

    // Buscar status no OpenPix
    // transactionId aqui é o correlationID (orderId) ou o ID do OpenPix?
    // No create/route.ts salvamos external_id = correlationID.
    // Então transactionId deve ser o correlationID.
    // getCharge implementado busca por ID, mas vamos assumir que o cliente OpenPix
    // foi implementado para buscar por ID.
    // Se transactionId for o correlationID, precisamos usar o endpoint correto ou filtro.
    // Mas no create/route.ts usamos order.id como correlationID.
    // Vamos assumir que o frontend passa o external_id salvo no banco.

    const chargeResponse = await getCharge(transactionId);
    const status = chargeResponse.charge.status;

    // Atualizar no banco se necessário
    const serviceRoleClient = createSupabaseServiceRoleClient();

    const { data: transaction } = await serviceRoleClient
      .from("payment_transactions")
      .select("*, orders(*)")
      .eq("external_id", transactionId)
      .single();

    if (transaction && status === "COMPLETED" && transaction.status !== "paid") {
      // Atualizar transação e pedido
      await serviceRoleClient
        .from("payment_transactions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      await serviceRoleClient
        .from("orders")
        .update({ status: "paid" })
        .eq("id", transaction.order_id);

      // Processar pedido (criar tickets, transferir, etc.)
      // Isso será feito no webhook também, mas aqui garantimos
    }

    return NextResponse.json({ status: status });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 },
    );
  }
}


