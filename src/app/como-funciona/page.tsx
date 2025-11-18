import {
  ShoppingCart,
  TicketPercent,
  Wallet,
  ArrowRight,
  QrCode,
  Shield,
  Zap,
  Users,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "Como compro um ingresso?",
    answer:
      "Navegue pelos eventos disponíveis, escolha o tipo de ingresso desejado e finalize a compra com PIX. O ingresso será adicionado automaticamente à sua carteira PartyU.",
  },
  {
    question: "Posso revender meu ingresso?",
    answer:
      "Sim! Acesse 'Meus ingressos', selecione o ingresso que deseja revender e defina o preço. O ingresso ficará disponível na plataforma para outros usuários comprarem.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Todos os pagamentos são processados via PIX através do Pagar.me. É rápido, seguro e você recebe a confirmação instantaneamente.",
  },
  {
    question: "O ingresso é seguro?",
    answer:
      "Sim! Todos os ingressos são verificados e protegidos pela PartyU. Cada ingresso tem um QR code único e é sempre nominal, garantindo segurança total.",
  },
  {
    question: "Posso cancelar uma compra?",
    answer:
      "O cancelamento depende das políticas do evento. Entre em contato conosco através da central de ajuda para verificar a possibilidade de cancelamento.",
  },
  {
    question: "Como uso meu ingresso no evento?",
    answer:
      "Acesse sua carteira PartyU no app ou site, encontre o ingresso e mostre o QR code na entrada do evento. É simples e rápido!",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Como Funciona
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tudo que você precisa saber para comprar, revender e usar seus
          ingressos na PartyU
        </p>
      </div>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Comprar Ingressos
          </h2>
          <p className="text-base text-muted-foreground">
            Processo simples e rápido em 3 passos
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                1. Escolha o Evento
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Explore eventos perto de você ou busque por categoria. Veja
                detalhes, datas e preços disponíveis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                2. Finalize a Compra
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Selecione o tipo de ingresso, pague com PIX e receba seu
                ingresso digital na carteira PartyU instantaneamente.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TicketPercent className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                3. Use no Evento
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                No dia do evento, acesse sua carteira, mostre o QR code na
                entrada e aproveite!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Revender Ingressos
          </h2>
          <p className="text-base text-muted-foreground">
            Não pode mais ir? Revenda de forma segura
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-4">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              1
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Acesse Meus Ingressos
            </h3>
            <p className="text-sm text-muted-foreground">
              Vá até sua conta e encontre o ingresso que deseja revender
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              2
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Defina o Preço
            </h3>
            <p className="text-sm text-muted-foreground">
              Escolha quanto quer receber (entre 50% e 200% do valor original)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              3
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Anuncie
            </h3>
            <p className="text-sm text-muted-foreground">
              Seu ingresso aparece na plataforma para compradores encontrarem
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              4
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Receba o Pagamento
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
            Por que escolher a PartyU?
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Totalmente Seguro
            </h3>
            <p className="text-sm text-muted-foreground">
              Ingressos verificados e transações protegidas
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
              <Zap className="h-5 w-5 text-sky-600" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              PIX Instantâneo
            </h3>
            <p className="text-sm text-muted-foreground">
              Pagamentos processados na hora
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Carteira Digital
            </h3>
            <p className="text-sm text-muted-foreground">
              Todos os seus ingressos em um só lugar
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Revenda Segura
            </h3>
            <p className="text-sm text-muted-foreground">
              Revenda seus ingressos sem complicação
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {faqItems.map((item, index) => (
            <Card
              key={index}
              className="border-border/60 bg-card/60 transition-all hover:border-primary/40"
            >
              <CardContent className="p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-8 text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Pronto para começar?
        </h2>
        <p className="text-base text-muted-foreground">
          Explore eventos incríveis ou comece a revender seus ingressos hoje
          mesmo
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            size="lg"
            className="h-11 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            asChild
          >
            <Link href="/explorar">
              Explorar eventos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 rounded-full border-border/70 text-base font-semibold text-foreground hover:bg-muted"
            asChild
          >
            <Link href="/revenda">
              <TicketPercent className="mr-2 h-5 w-5" />
              Revender ingressos
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

