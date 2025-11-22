import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Ticket, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function OrganizerDashboardPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Buscar métricas
    const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

    const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("organizer_id", user.id);

    const { count: activeEventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("organizer_id", user.id)
        .eq("status", "active");

    // Buscar total de vendas (aproximado via ledger)
    const { data: sales } = await supabase
        .from("wallet_ledger")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "ticket_sale");

    const totalSales = sales?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // Buscar ingressos vendidos
    const { count: ticketsSold } = await supabase
        .from("user_tickets")
        .select("*, events!inner(organizer_id)", { count: "exact", head: true })
        .eq("events.organizer_id", user.id);

    // Meta de vendas (exemplo: R$ 10.000)
    const salesGoal = 10000;
    const salesProgress = Math.min((totalSales / salesGoal) * 100, 100);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral do seu desempenho como organizador
                </p>
            </div>

            {/* Main Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            R$ {(Number(wallet?.balance || 0) / 100).toFixed(2).replace(".", ",")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Disponível para saque
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            R$ {(totalSales / 100).toFixed(2).replace(".", ",")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Receita total (bruto)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ticketsSold || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total de tickets
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eventos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{eventsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeEventsCount || 0} ativos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Goals & Progress */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Meta de Vendas</CardTitle>
                        <CardDescription>
                            Progresso até R$ {(salesGoal / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Progress value={salesProgress} className="h-2" />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                R$ {(totalSales / 100).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="font-medium">{salesProgress.toFixed(0)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Próximos Passos</CardTitle>
                        <CardDescription>Ações recomendadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {eventsCount === 0 && (
                                <li className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Crie seu primeiro evento</span>
                                </li>
                            )}
                            {(wallet?.balance || 0) > 5000 && (
                                <li className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span>Você tem saldo disponível para saque</span>
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-blue-600" />
                                <span>Confira seus relatórios de vendas</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                    <CardDescription>Últimas vendas e movimentações</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Nenhuma atividade recente para exibir.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
