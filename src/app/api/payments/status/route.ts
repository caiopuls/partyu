import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/payments/pagarme";
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

    // Buscar status no Pagar.me
    const status = await getTransactionStatus(transactionId);

    // Atualizar no banco se necessário
    const serviceRoleClient = createSupabaseServiceRoleClient();

    const { data: transaction } = await serviceRoleClient
      .from("payment_transactions")
      .select("*, orders(*)")
      .eq("external_id", transactionId)
      .single();

    if (transaction && status.status === "paid" && transaction.status !== "paid") {
      // Atualizar transação e pedido
      await serviceRoleClient
        .from("payment_transactions")
        .update({
          status: "paid",
          paid_at: status.paid_at || new Date().toISOString(),
        })
        .eq("id", transaction.id);

      await serviceRoleClient
        .from("orders")
        .update({ status: "paid" })
        .eq("id", transaction.order_id);

      // Processar pedido (criar tickets, transferir, etc.)
      // Isso será feito no webhook também, mas aqui garantimos
    }

    return NextResponse.json({ status: status.status });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 },
    );
  }
}


