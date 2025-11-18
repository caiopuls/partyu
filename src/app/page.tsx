import {
  CalendarDays,
  MapPin,
  Sparkles,
  TicketPercent,
  Music,
  Mic,
  PartyPopper,
  Radio,
  Guitar,
  Headphones,
  GraduationCap,
  Theater,
  Grid3x3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollRow } from "@/components/categories/scroll-row";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEventsByRegion } from "@/lib/supabase/queries";

const categories = [
  { name: "Todos", icon: Grid3x3 },
  { name: "Festas", icon: PartyPopper },
  { name: "Shows", icon: Mic },
  { name: "Festivais", icon: Music },
  { name: "Eletrônica", icon: Radio },
  { name: "Sertanejo", icon: Guitar },
  { name: "Trap & Rap", icon: Headphones },
  { name: "Universitárias", icon: GraduationCap },
  { name: "Teatro", icon: Theater },
];

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "EEE, d MMM · HH'h'", { locale: ptBR });
  } catch {
    return "";
  }
}

export default async function Home() {
  // Por enquanto, buscar eventos sem filtro de região
  // Em produção, usar IP geolocation ou seleção manual do usuário
  const events = await getEventsByRegion(undefined, undefined, 12);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative flex flex-col items-center justify-center gap-10 text-center pt-16 pb-16 sm:pt-24 sm:pb-24 overflow-hidden">
        {/* Gradiente diagonal animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 animate-gradient-diagonal pointer-events-none" />
        <div className="relative space-y-6 max-w-3xl opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
          <Badge className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-4 w-4" />
            Revenda oficial e segura de ingressos
          </Badge>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl bg-linear-to-r from-primary via-fuchsia-500 to-primary bg-clip-text text-transparent animate-gradient-slow">
              Compre e revenda ingressos com o PartyU.
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Uma plataforma única para todos os seus eventos, pensado
              para revenda segura: o evento, o revendedor e o comprador
              conectados no mesmo lugar, com pagamentos no PIX.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              asChild
            >
              <Link href="/anunciar">
                <TicketPercent className="mr-2 h-4 w-4" />
                Anunciar ingresso
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-full border-border/70 text-sm font-semibold text-foreground hover:bg-muted"
              asChild
            >
              <Link href="/explorar">
                Explorar Festas & Eventos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Categorias disponíveis
          </h2>
        </div>
        <ScrollRow>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                className="group inline-flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:shadow-lg"
                type="button"
              >
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="whitespace-nowrap">{category.name}</span>
              </button>
            );
          })}
        </ScrollRow>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Eventos perto de você
            </h2>
          </div>
          <Button
            variant="ghost"
            className="h-9 rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-muted"
            asChild
          >
            <Link href="/explorar">Ajustar cidade</Link>
          </Button>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Link 
                key={event.id} 
                href={`/eventos/${event.id}`}
                className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="group cursor-pointer border-border/70 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  <CardContent className="space-y-3 p-0 overflow-hidden">
                    {(event.featured_image_url || event.banner_url) && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={event.featured_image_url || event.banner_url || ""}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-full border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {event.category}
                        </Badge>
                        <span className="text-sm text-emerald-600">
                          Revenda disponível
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                        {event.title}
                      </h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatEventDate(event.event_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {event.city}, {event.state}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-sm">
                        <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                          Ver detalhes
                        </span>
                        <Button
                          size="sm"
                          className="h-9 rounded-full bg-primary/90 text-sm font-semibold cursor-pointer text-primary-foreground transition-all group-hover:bg-primary group-hover:scale-105"
                        >
                          Ver ingressos
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card/60 p-12 text-center">
            <p className="text-base text-muted-foreground">
              Nenhum evento encontrado no momento. Em breve teremos eventos
              incríveis para você!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
