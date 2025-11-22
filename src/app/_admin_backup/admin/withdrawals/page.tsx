import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { approveWithdrawal, rejectWithdrawal } from "@/app/actions/withdrawals";

export default async function AdminWithdrawalsPage() {
    const supabase = await createSupabaseServerClient();

    const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select(`
      *,
      profiles:user_id (full_name, email, cpf_cnpj)
    `)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Solicitações de Saque</h1>
            </div>

            <div className="grid gap-4">
                {withdrawals?.map((withdrawal) => (
                    <Card key={withdrawal.id}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-lg">
                                        {withdrawal.profiles?.full_name || "Usuário Desconhecido"}
                                    </p>
                                    <Badge variant={
                                        withdrawal.status === "pending" ? "secondary" :
                                            withdrawal.status === "completed" ? "default" : "destructive"
                                    }>
                                        {withdrawal.status === "pending" ? "Pendente" :
                                            withdrawal.status === "completed" ? "Pago" : "Rejeitado"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {withdrawal.profiles?.email} • CPF/CNPJ: {withdrawal.profiles?.cpf_cnpj || "N/A"}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Chave PIX</span>
                                        <span className="font-mono">{withdrawal.pix_key} ({withdrawal.pix_key_type})</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Valor</span>
                                        <span className="font-bold text-green-600">
                                            R$ {Number(withdrawal.amount).toFixed(2).replace(".", ",")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {withdrawal.status === "pending" && (
                                <div className="flex items-center gap-2">
                                    <form action={rejectWithdrawal.bind(null, withdrawal.id)}>
                                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Rejeitar
                                        </Button>
                                    </form>
                                    <form action={approveWithdrawal.bind(null, withdrawal.id)}>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Aprovar e Pagar
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {(!withdrawals || withdrawals.length === 0) && (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            Nenhuma solicitação de saque encontrada.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
