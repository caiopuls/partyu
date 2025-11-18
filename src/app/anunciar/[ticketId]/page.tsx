import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnunciarForm } from "@/components/resale/anunciar-form";

async function getTicket(ticketId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_tickets")
    .select(
      `
      *,
      events(*),
      event_ticket_types(*)
    `,
    )
    .eq("id", ticketId)
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function AnunciarPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/entrar?next=/anunciar/${ticketId}`);
  }

  const ticket = await getTicket(ticketId, user.id);

  if (!ticket) {
    notFound();
  }

  const event = ticket.events;
  const ticketType = ticket.event_ticket_types;
  const originalPrice = ticketType?.price || 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Anunciar ingresso para revenda</h1>
        <p className="text-sm text-muted-foreground">
          Defina o preço e anuncie seu ingresso na plataforma
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do ingresso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold">{event?.title}</p>
              <p className="text-xs text-muted-foreground">
                {ticketType?.name || "Ingresso"}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground">
                Valor original do ingresso
              </p>
              <p className="text-sm font-semibold">
                R$ {originalPrice.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </CardContent>
        </Card>

        <AnunciarForm ticketId={ticketId} originalPrice={originalPrice} />
      </div>
    </div>
  );
}


