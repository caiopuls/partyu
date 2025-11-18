import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, MapPin, TicketPercent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventById, getEventTicketTypes } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ResaleListing } from "@/types/database";

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy 'às' HH'h'", {
      locale: ptBR,
    });
  } catch {
    return "";
  }
}

async function getResaleListings(eventId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("resale_listings")
    .select(
      `
      *,
      user_tickets!inner(
        id,
        event_id
      )
    `,
    )
    .eq("status", "active")
    .eq("user_tickets.event_id", eventId)
    .order("asking_price", { ascending: true });

  if (error) {
    console.error("Error fetching resale listings:", error);
    return [];
  }

  return data as ResaleListing[];
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const ticketTypes = await getEventTicketTypes(id);
  const resaleListings = await getResaleListings(id);

  const cheapestTicket = ticketTypes.length > 0 ? ticketTypes[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar para eventos
        </Link>
      </div>

      <div className="mb-8 space-y-4">
        {(event.featured_image_url || event.banner_url) && (
          <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-[420px]">
            <Image
              src={event.featured_image_url || event.banner_url || ""}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {event.category}
            </Badge>
            {cheapestTicket && (
              <span className="text-sm text-muted-foreground">
                A partir de{" "}
                <span className="font-semibold text-foreground">
                  R$ {cheapestTicket.price.toFixed(2).replace(".", ",")}
                </span>
              </span>
            )}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{formatEventDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {event.venue && `${event.venue} - `}
                {event.city}, {event.state}
              </span>
            </div>
          </div>

          {event.description && (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        {/* Galeria de imagens */}
        {event.image_urls && event.image_urls.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Galeria de imagens</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {event.image_urls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-video w-full overflow-hidden rounded-xl"
                >
                  <Image
                    src={imageUrl}
                    alt={`${event.title} - Imagem ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingressos oficiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTypes.length > 0 ? (
                ticketTypes.map((ticketType) => {
                  const available =
                    ticketType.total_quantity - ticketType.sold_quantity;
                  const isSoldOut = available <= 0;

                  return (
                    <div
                      key={ticketType.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 p-4"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold">
                          {ticketType.name}
                        </h3>
                        {ticketType.description && (
                          <p className="text-xs text-muted-foreground">
                            {ticketType.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {isSoldOut
                            ? "Esgotado"
                            : `${available} ingressos disponíveis`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            R$ {ticketType.price.toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            + taxa (10%) R${" "}
                            {(
                              (ticketType.price *
                                ticketType.platform_fee_percentage) /
                              100
                            ).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full"
                          disabled={isSoldOut}
                          asChild
                        >
                          <Link href={`/eventos/${id}/comprar?ticket=${ticketType.id}`}>
                            {isSoldOut ? "Esgotado" : "Comprar"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum ingresso disponível no momento.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TicketPercent className="h-5 w-5 text-primary" />
                Ingressos de revenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resaleListings.length > 0 ? (
                resaleListings.map((listing) => {
                  const platformFee =
                    (listing.asking_price * listing.platform_fee_percentage) /
                    100;
                  const finalPrice = listing.asking_price + platformFee;

                  return (
                    <div
                      key={listing.id}
                      className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Revenda
                          </p>
                          <p className="text-sm font-semibold">
                            R$ {listing.asking_price.toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            + taxa R$ {platformFee.toFixed(2).replace(".", ",")}
                            {" = "}
                            <span className="font-semibold">
                              R$ {finalPrice.toFixed(2).replace(".", ",")}
                            </span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full bg-primary"
                          asChild
                        >
                          <Link href={`/eventos/${id}/comprar?resale=${listing.id}`}>
                            Comprar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum ingresso de revenda disponível no momento.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Por que comprar pelo PartyU</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-sm">
                ✅ Compra protegida e ingresso nominal
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-3 text-sm">
                ⚡ Pagamento PIX e confirmação imediata
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                🎟️ Transferência automática do ingresso
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-sm">
                🧾 Nota e histórico na sua carteira
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


