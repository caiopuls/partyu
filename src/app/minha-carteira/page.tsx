import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

async function getWallet(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getWalletLedger(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("wallet_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching wallet ledger:", error);
    return [];
  }

  return data || [];
}

export default async function MinhaCarteiraPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/minha-carteira");
  }

  const wallet = await getWallet(user.id);
  const ledger = await getWalletLedger(user.id);

  if (!wallet) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Carteira não encontrada. Entre em contato com o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Minha carteira</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seu saldo e acompanhe suas transações
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              Saldo disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-primary">
              R$ {wallet.balance.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Você pode usar este saldo para comprar ingressos ou solicitar
              saque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Em breve você poderá solicitar saque do seu saldo diretamente
              para sua conta bancária.
            </p>
            <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
              <p className="text-xs font-medium">Como funciona</p>
              <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <li>• Você recebe dinheiro ao vender ingressos</li>
                <li>• Use o saldo para comprar novos ingressos</li>
                <li>• Solicite saque quando quiser (em breve)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de transações</CardTitle>
        </CardHeader>
        <CardContent>
          {ledger.length > 0 ? (
            <div className="space-y-3">
              {ledger.map((entry) => {
                const isCredit = entry.amount > 0;
                const typeLabels: Record<string, string> = {
                  sale_commission: "Comissão PartyU",
                  ticket_sale: "Venda de ingresso",
                  withdraw: "Saque",
                  refund: "Reembolso",
                  adjustment: "Ajuste",
                };

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {typeLabels[entry.type] || entry.type}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground">
                            {entry.description}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {format(
                            new Date(entry.created_at),
                            "d 'de' MMM 'às' HH'h'mm",
                            { locale: ptBR },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          isCredit ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}R${" "}
                        {Math.abs(entry.amount).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma transação ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


