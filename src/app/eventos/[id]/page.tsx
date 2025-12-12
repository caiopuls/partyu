import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, MapPin, Clock, Users, Share2, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventById, getEventTicketTypes, getOrganizerById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventActions } from "@/components/events/event-actions";
import type { ResaleListing } from "@/types/database";

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  } catch {
    return "";
  }
}

function formatEventTime(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "HH'h'mm", { locale: ptBR });
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
  const organizer = event.organizer_id ? await getOrganizerById(event.organizer_id) : null;

  const cheapestTicket = ticketTypes.length > 0 ? ticketTypes[0] : null;

  return (
    <div className="min-h-screen bg-[#F8F8F3]">
      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-black">
        {(event.featured_image_url || event.banner_url) && (
          <Image
            src={event.featured_image_url || event.banner_url || ""}
            alt={event.title}
            fill
            className="object-cover opacity-90"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-sm font-semibold transition-all"
          >
            ← Voltar
          </Link>
        </div>

        {/* Action Buttons */}
        <EventActions eventTitle={event.title} eventId={event.id} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">

          {/* Main Content */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <Badge className="mb-4 bg-primary/10 text-primary border-0 font-bold">
                {event.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Data</p>
                    <p className="text-sm font-bold text-gray-900">{formatEventDate(event.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Horário</p>
                    <p className="text-sm font-bold text-gray-900">{formatEventTime(event.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Local</p>
                    <p className="text-sm font-bold text-gray-900">
                      {event.venue && `${event.venue} - `}
                      {event.city}, {event.state}
                    </p>
                  </div>
                </div>

                {cheapestTicket && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">A partir de</p>
                      <p className="text-sm font-bold text-primary">
                        R$ {cheapestTicket.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre o evento</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Gallery */}
            {event.image_urls && event.image_urls.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Galeria</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Organizer Section */}
            {organizer && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Organizador</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {organizer.avatar_url ? (
                      <Image src={organizer.avatar_url} alt={organizer.full_name || "Organizador"} fill className="object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {organizer.full_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{organizer.full_name}</h3>
                    {organizer.bio && (
                      <p className="text-sm text-gray-600 mb-3">{organizer.bio}</p>
                    )}
                    <Link
                      href={`/organizador/${organizer.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Ver outros eventos →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Tickets */}
          <div className="space-y-6">
            {/* Official Tickets */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingressos</h2>

              <div className="space-y-3">
                {ticketTypes.length > 0 ? (
                  ticketTypes.map((ticketType) => {
                    const available = ticketType.total_quantity - ticketType.sold_quantity;
                    const isSoldOut = available <= 0;

                    return (
                      <div
                        key={ticketType.id}
                        className="border-2 border-gray-100 rounded-xl p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{ticketType.name}</h3>
                            {ticketType.description && (
                              <p className="text-xs text-gray-500 mt-1">{ticketType.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              R$ {ticketType.price.toFixed(2).replace(".", ",")}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              + taxa R$ {((ticketType.price * ticketType.platform_fee_percentage) / 100).toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                          {isSoldOut ? "Esgotado" : `${available} disponíveis`}
                        </p>

                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg h-11"
                          disabled={isSoldOut}
                          asChild
                        >
                          <Link href={`/eventos/${id}/comprar?ticket=${ticketType.id}`}>
                            {isSoldOut ? "Esgotado" : "Comprar ingresso"}
                          </Link>
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum ingresso disponível no momento.
                  </p>
                )}
              </div>

              {/* Resale Section */}
              {resaleListings.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Revenda disponível</h3>
                  <div className="space-y-2">
                    {resaleListings.slice(0, 3).map((listing) => {
                      const platformFee = (listing.asking_price * listing.platform_fee_percentage) / 100;
                      const finalPrice = listing.asking_price + platformFee;

                      return (
                        <div
                          key={listing.id}
                          className="bg-primary/5 border border-primary/20 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-600">Revenda</p>
                              <p className="text-sm font-bold text-gray-900">
                                R$ {finalPrice.toFixed(2).replace(".", ",")}
                              </p>
                            </div>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full" asChild>
                              <Link href={`/eventos/${id}/comprar?resale=${listing.id}`}>
                                Comprar
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
