import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaymentPixComponent } from "@/components/payment/pix-payment";

async function getOrder(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      payment_transactions(*)
    `,
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function PagamentoPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/entrar?next=/pagamento/${orderId}`);
  }

  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  // Se já foi pago, redirecionar
  if (order.status === "paid") {
    redirect(`/pedido/${orderId}/sucesso`);
  }

  const paymentTransaction = order.payment_transactions?.[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pagamento via PIX</h1>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR Code ou copie o código PIX para pagar
        </p>
      </div>

      <PaymentPixComponent
        orderId={orderId}
        amount={order.total_amount}
        paymentTransaction={paymentTransaction}
      />
    </div>
  );
}


