import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
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

    // Buscar pedido
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    // Buscar informações do metadata do pedido
    const metadata = (order.metadata as { ticket_type_id?: string; resale_listing_id?: string }) || {};
    const ticketTypeId = metadata.ticket_type_id || null;
    const resaleListingId = metadata.resale_listing_id || null;

    return NextResponse.json({
      ticket_type_id: ticketTypeId,
      resale_listing_id: resaleListingId,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do pedido" },
      { status: 500 },
    );
  }
}

