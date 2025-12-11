import {
  CalendarDays,
  MapPin,
  Search,
  Filter,
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
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEventsByFilters } from "@/lib/supabase/queries";
import { ScrollRow } from "@/components/categories/scroll-row";

const categories = [
  { name: "Todos", icon: Grid3x3, value: "" },
  { name: "Festas", icon: PartyPopper, value: "Festas" },
  { name: "Shows", icon: Mic, value: "Shows" },
  { name: "Festivais", icon: Music, value: "Festivais" },
  { name: "Eletrônica", icon: Radio, value: "Eletrônica" },
  { name: "Sertanejo", icon: Guitar, value: "Sertanejo" },
  { name: "Trap & Rap", icon: Headphones, value: "Trap & Rap" },
  { name: "Universitárias", icon: GraduationCap, value: "Universitárias" },
  { name: "Teatro", icon: Theater, value: "Teatro" },
];

const estadosBrasil = [
  { uf: "", nome: "Todos os estados" },
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "EEE, d MMM · HH'h'", { locale: ptBR });
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
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Explorar Eventos
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Descubra os melhores eventos, shows e festas perto de você
          </p>
        </div>

        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6" action="/explorar" method="get">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={params.q} type="search" placeholder="Buscar eventos..." className="h-11 rounded-full pl-10 text-base" />
          </div>
          <Input name="cidade" defaultValue={params.cidade} placeholder="Cidade" className="h-11 rounded-full text-base" />
          <select
            name="estado"
            defaultValue={params.estado || ""}
            className="flex h-11 w-full rounded-full border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {estadosBrasil.map((estado) => (
              <option key={estado.uf} value={estado.uf}>
                {estado.uf ? `${estado.uf} - ${estado.nome}` : estado.nome}
              </option>
            ))}
          </select>
          <Input name="de" defaultValue={params.de} type="date" className="h-11 rounded-full text-base" />
          <Input name="ate" defaultValue={params.ate} type="date" className="h-11 rounded-full text-base" />
          <Button type="submit" className="h-11 rounded-full bg-primary text-base font-semibold text-primary-foreground">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </form>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Categorias
          </h2>
        </div>
        <ScrollRow>
          {categories.map((category) => {
            const Icon = category.icon;
            const qs = new URLSearchParams();
            if (category.value) qs.set("categoria", category.value);
            if (params.q) qs.set("q", params.q);
            if (params.cidade) qs.set("cidade", params.cidade);
            if (params.estado) qs.set("estado", params.estado);
            if (params.de) qs.set("de", params.de);
            if (params.ate) qs.set("ate", params.ate);
            const href = qs.toString() ? `/explorar?${qs.toString()}` : "/explorar";
            const isActive = params.categoria === category.value || (!params.categoria && category.value === "");
            
            return (
              <Link
                key={category.name}
                href={href}
                className={`group inline-flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isActive
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/80 bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="whitespace-nowrap">{category.name}</span>
              </Link>
            );
          })}
        </ScrollRow>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Todos os Eventos
            </h2>
            <p className="text-sm text-muted-foreground">
              {events.length} {events.length === 1 ? "evento encontrado" : "eventos encontrados"}
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Link
                key={event.id}
                href={`/eventos/${event.id}`}
                className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
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
                          className="h-9 rounded-full bg-primary/90 cursor-pointer text-sm font-semibold text-primary-foreground transition-all group-hover:bg-primary group-hover:scale-105"
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
              Nenhum evento encontrado no momento. Tente ajustar os filtros ou volte mais tarde!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

