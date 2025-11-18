import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  CalendarDays,
  MapPin,
  TicketPercent,
  QrCode,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UserTicket, Event } from "@/types/database";

async function getUserTickets(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_tickets")
    .select(
      `
      *,
      events(*)
    `,
    )
    .eq("user_id", userId)
    .in("status", ["active", "listed"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user tickets:", error);
    return [];
  }

  return data || [];
}

export default async function MeusIngressosPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/meus-ingressos");
  }

  const tickets = await getUserTickets(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Meus ingressos</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus ingressos e anuncie para revenda
        </p>
      </div>

      {tickets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {tickets.map((ticket: UserTicket & { events: Event }) => {
            const event = ticket.events;
            const isListed = ticket.status === "listed";

            return (
              <Card
                key={ticket.id}
                className={`border-border/70 transition-all hover:border-primary/40 ${
                  isListed ? "border-primary/40 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold">
                          {event?.title || "Evento"}
                        </h3>
                        {isListed && (
                          <Badge className="mt-1 rounded-full bg-primary/10 text-[10px] text-primary">
                            Anunciado para revenda
                          </Badge>
                        )}
                      </div>
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>

                    {event && (
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>
                            {format(
                              new Date(event.event_date),
                              "EEE, d 'de' MMM 'às' HH'h'",
                              { locale: ptBR },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>
                            {event.city}, {event.state}
                          </span>
                        </div>
                      </div>
                    )}

                    {ticket.ticket_number && (
                      <div className="rounded-lg border border-border/60 bg-muted/50 p-2">
                        <p className="text-[10px] text-muted-foreground">
                          Número do ingresso
                        </p>
                        <p className="text-xs font-mono font-semibold">
                          {ticket.ticket_number}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="w-full justify-center rounded-full text-xs font-semibold"
                        asChild
                      >
                        <a
                          href={`/api/tickets/${ticket.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <QrCode className="mr-1.5 h-3.5 w-3.5" />
                          Ver ingresso
                        </a>
                      </Button>

                      <div className="flex gap-2">
                        {!isListed && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full text-xs"
                            asChild
                          >
                            <Link href={`/anunciar/${ticket.id}`}>
                              <TicketPercent className="mr-1.5 h-3.5 w-3.5" />
                              Anunciar para revenda
                            </Link>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 rounded-full text-xs"
                          asChild
                        >
                          <Link href={`/eventos/${event?.id}`}>
                            Ver evento
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">
              Você ainda não tem ingressos
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Compre ingressos para eventos incríveis e gerencie tudo aqui
            </p>
            <Button className="mt-6 rounded-full" asChild>
              <Link href="/">Explorar eventos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


