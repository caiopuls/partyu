import { redirect } from "next/navigation";
import { getEventById, getEventTicketTypes } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, MapPin, TicketPercent } from "lucide-react";

async function getResaleListing(listingId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("resale_listings")
    .select(
      `
      *,
      user_tickets!inner(
        id,
        event_id,
        ticket_type_id
      )
    `,
    )
    .eq("id", listingId)
    .eq("status", "active")
    .single();

  if (error) {
    console.error("Error fetching resale listing:", error);
    return null;
  }

  return data;
}

export default async function ComprarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ticket?: string; resale?: string }>;
}) {
  const { id } = await params;
  const { ticket, resale } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/entrar?next=/eventos/${id}/comprar${ticket ? `?ticket=${ticket}` : resale ? `?resale=${resale}` : ""}`);
  }

  const event = await getEventById(id);
  if (!event) {
    notFound();
  }

  let ticketType = null;
  let resaleListing = null;
  let totalAmount = 0;
  let origin: "primary" | "resale" = "primary";

  if (resale) {
    resaleListing = await getResaleListing(resale);
    if (!resaleListing) {
      notFound();
    }
    origin = "resale";
    const platformFee =
      (resaleListing.asking_price * resaleListing.platform_fee_percentage) /
      100;
    totalAmount = resaleListing.asking_price + platformFee;
  } else if (ticket) {
    const ticketTypes = await getEventTicketTypes(id);
    ticketType = ticketTypes.find((tt) => tt.id === ticket);
    if (!ticketType) {
      notFound();
    }
    origin = "primary";
    const platformFee =
      (ticketType.price * ticketType.platform_fee_percentage) / 100;
    totalAmount = ticketType.price + platformFee;
  } else {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Finalizar compra</h1>
        <p className="text-sm text-muted-foreground">
          Revise os detalhes antes de prosseguir
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                {format(new Date(event.event_date), "EEEE, d 'de' MMMM 'às' HH'h'", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {event.venue && `${event.venue} - `}
                {event.city}, {event.state}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo do pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {origin === "primary"
                    ? ticketType?.name
                    : "Ingresso de revenda"}
                </span>
                <span className="font-medium">
                  R${" "}
                  {origin === "primary"
                    ? ticketType?.price.toFixed(2).replace(".", ",")
                    : resaleListing?.asking_price.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Taxa de processamento PartyU (10%)
                </span>
                <span className="font-medium">
                  R${" "}
                  {origin === "primary"
                    ? (
                        (ticketType?.price || 0) *
                        ((ticketType?.platform_fee_percentage || 0) / 100)
                      ).toFixed(2).replace(".", ",")
                    : (
                        (resaleListing?.asking_price || 0) *
                        ((resaleListing?.platform_fee_percentage || 0) / 100)
                      ).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-semibold text-primary">
                    R$ {totalAmount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            <form action="/api/orders/create" method="POST">
              <input
                type="hidden"
                name="event_id"
                value={event.id}
              />
              <input
                type="hidden"
                name="ticket_type_id"
                value={ticketType?.id || ""}
              />
              <input
                type="hidden"
                name="resale_listing_id"
                value={resaleListing?.id || ""}
              />
              <input
                type="hidden"
                name="origin"
                value={origin}
              />
              <input
                type="hidden"
                name="total_amount"
                value={totalAmount}
              />
              <Button
                type="submit"
                className="w-full rounded-full bg-primary"
                size="lg"
              >
                <TicketPercent className="mr-2 h-5 w-5" />
                Pagar com PIX
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




