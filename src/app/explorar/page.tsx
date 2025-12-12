import {
  CalendarDays,
  MapPin,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEventsByFilters } from "@/lib/supabase/queries";
import { CategoryCarousel } from "@/components/events/category-carousel";

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "d 'de' MMM", { locale: ptBR });
  } catch {
    return "";
  }
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    cidade?: string;
    estado?: string;
    de?: string;
    ate?: string;
  }>;
}) {
  const params = await searchParams;
  const events = await getEventsByFilters({
    q: params.q,
    category: params.categoria || undefined,
    city: params.cidade || undefined,
    state: params.estado || undefined,
    dateFrom: params.de || undefined,
    dateTo: params.ate || undefined,
    limit: 60,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F3]">
      {/* HERO SECTION - Inspired by reference */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-black overflow-hidden">
        {/* Placeholder for the crowd background image */}
        <div className="absolute inset-0 bg-neutral-900 opacity-50 z-0">
          {/* If there was a real image, it would go here. Using a pattern/gradient for now */}
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center gap-2">
          <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight">
            Eventos
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-medium">
            Encontre eventos por localização e data
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Category Carousel */}
        <CategoryCarousel />

        {/* Filter / Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Todos os Eventos</h2>

          <div className="flex items-center gap-2">
            {/* Search */}
            <form className="relative hidden md:block" action="/explorar" method="get">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Buscar..."
                className="h-10 pl-9 pr-4 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, index) => (
              <Link
                key={event.id}
                href={`/eventos/${event.id}`}
                className="group block opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-3">
                  {/* Card Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm border border-black/5">
                    {(event.featured_image_url || event.banner_url) ? (
                      <Image
                        src={event.featured_image_url || event.banner_url || ""}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                        <span className="text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="space-y-1">
                    <div className="text-rose-500 font-bold text-xs uppercase tracking-wide">
                      {formatEventDate(event.event_date)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="text-gray-500 text-xs font-medium truncate">
                      {event.city ? `${event.city}/${event.state}` : "Local não informado"} • {event.category || "Geral"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center bg-white/50">
            <p className="text-base text-gray-500">
              Nenhum evento encontrado no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

