import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

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

export default async function SucessoPage({
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
    redirect(`/entrar?next=/pedido/${orderId}/sucesso`);
  }

  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  if (order.status !== "paid") {
    redirect(`/pagamento/${orderId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold">Pagamento confirmado!</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Seu ingresso foi adquirido com sucesso e já está disponível na sua
            conta.
          </p>
          <div className="space-y-3">
            <Button className="w-full rounded-full bg-primary" asChild>
              <Link href="/meus-ingressos">
                <Ticket className="mr-2 h-4 w-4" />
                Ver meus ingressos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link href="/">Explorar mais eventos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




