import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketPercent } from "lucide-react";
import Link from "next/link";

export default async function AnunciarPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/anunciar");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">Anuncie seu ingresso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revenda seus ingressos de forma segura na PartyU
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <TicketPercent className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">
            Você precisa ter ingressos para anunciar
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Acesse seus ingressos e escolha qual deseja anunciar para revenda.
          </p>
          <Button className="rounded-full bg-primary" asChild>
            <Link href="/meus-ingressos">Ver meus ingressos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}





