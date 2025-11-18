import {
  Shield,
  Zap,
  Wallet,
  TicketPercent,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEventsByRegion } from "@/lib/supabase/queries";

function formatEventDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "EEE, d MMM · HH'h'", { locale: ptBR });
  } catch {
    return "";
  }
}

export default async function RevendaPage() {
  const events = await getEventsByRegion(undefined, undefined, 6);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Revenda Segura de Ingressos
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Não pode mais ir ao evento? Revenda seu ingresso de forma segura e
          receba o pagamento direto na sua carteira PartyU.
        </p>
      </div>

      <section className="grid gap-6 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'0ms'}}>
          <CardContent className="p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Totalmente Seguro
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todos os ingressos são verificados e a transação é protegida pela
              PartyU. Sem risco de fraude.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'120ms'}}>
          <CardContent className="p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Zap className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Pagamento Instantâneo
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Receba o pagamento via PIX assim que o ingresso for vendido.
              Dinheiro cai direto na sua carteira PartyU.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'240ms'}}>
          <CardContent className="p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10">
              <Wallet className="h-6 w-6 text-sky-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Sem Complicação
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Anuncie em poucos cliques. Nós cuidamos de toda a burocracia e
              transferência do ingresso para o comprador.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Como Funciona
          </h2>
          <p className="text-base text-muted-foreground">
            Revender seu ingresso é simples e rápido
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'0ms'}}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              1
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Escolha o ingresso
            </h3>
            <p className="text-sm text-muted-foreground">
              Acesse &quot;Meus ingressos&quot; e selecione qual você quer revender
            </p>
          </div>

          <div className="space-y-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'120ms'}}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              2
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Defina o preço
            </h3>
            <p className="text-sm text-muted-foreground">
              Escolha quanto quer receber (até o valor original do ingresso)
            </p>
          </div>

          <div className="space-y-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'240ms'}}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              3
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Anuncie
            </h3>
            <p className="text-sm text-muted-foreground">
              Seu ingresso aparece na plataforma e compradores podem encontrá-lo
            </p>
          </div>

          <div className="space-y-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{animationDelay:'360ms'}}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              4
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Receba o pagamento
            </h3>
            <p className="text-sm text-muted-foreground">
              Quando vendido, o dinheiro cai na sua carteira PartyU via PIX
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-primary/0 to-primary/5 p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Benefícios da Revenda na PartyU
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Proteção total
              </h3>
              <p className="text-sm text-muted-foreground">
                Ingressos verificados e transações seguras
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Sem taxas ocultas
              </h3>
              <p className="text-sm text-muted-foreground">
                Apenas 10% de comissão, já incluída no preço
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Transferência automática
              </h3>
              <p className="text-sm text-muted-foreground">
                O ingresso é transferido automaticamente para o comprador
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Suporte 24/7
              </h3>
              <p className="text-sm text-muted-foreground">
                Nossa equipe está sempre pronta para ajudar
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            size="lg"
            className="h-11 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            asChild
          >
            <Link href="/anunciar">
              <TicketPercent className="mr-2 h-5 w-5" />
              Anunciar ingresso
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Eventos com Revenda Disponível
            </h2>
            <p className="text-base text-muted-foreground">
              Encontre ingressos disponíveis para revenda
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
                  <CardContent className="space-y-3 p-4">
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
                        className="h-9 rounded-full bg-primary/90 text-sm cursor-pointer font-semibold text-primary-foreground transition-all group-hover:bg-primary group-hover:scale-105"
                      >
                        Ver ingressos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card/60 p-12 text-center">
            <p className="text-base text-muted-foreground">
              Nenhum evento com revenda disponível no momento.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

