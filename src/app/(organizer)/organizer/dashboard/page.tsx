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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-md rounded-2xl bg-white/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Saldo Disponível</CardTitle>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            R$ {(Number(wallet?.balance || 0) / 100).toFixed(2).replace(".", ",")}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Disponível para saque
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-2xl bg-white/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Total Vendido</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            R$ {(totalSales / 100).toFixed(2).replace(".", ",")}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Receita total (bruto)
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-2xl bg-white/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Ingressos</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Ticket className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{ticketsSold || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Vendidos até agora
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-2xl bg-white/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Eventos</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{eventsCount || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {activeEventsCount || 0} ativos no momento
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Goals & Progress */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-md rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Meta de Vendas</CardTitle>
                        <CardDescription>
                            Progresso até R$ {(salesGoal / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={salesProgress} className="h-3 bg-gray-100" indicatorClassName="bg-primary" />
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">
                                R$ {(totalSales / 100).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="font-bold text-primary">{salesProgress.toFixed(0)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-2xl bg-gradient-to-br from-white to-gray-50">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Próximos Passos</CardTitle>
                        <CardDescription>O que fazer agora ?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm">
                            {eventsCount === 0 && (
                                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium text-gray-700">Crie seu primeiro evento</span>
                                </li>
                            )}
                            {(wallet?.balance || 0) > 5000 && (
                                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                    <div className="p-1.5 bg-green-100 rounded-md">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Realizar saque disponível</span>
                                </li>
                            )}
                            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-700">Ver relatórios detalhados</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-none shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-gray-900">Atividade Recente</CardTitle>
                    <CardDescription>Acompanhe suas últimas vendas em tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <BarChart3 className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-500">
                            Nenhuma atividade recente para exibir.
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs mt-1">
                            Suas vendas aparecerão aqui assim que começarem a acontecer.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
