"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getDashboardMetrics, getDashboardCharts } from "./actions";
import { MetricCard } from "@/components/admin/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    UserCheck,
    Activity,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardMetrics {
    totalUsers: number;
    newUsers30d: number;
    totalOrganizers: number;
    pendingOrganizers: number;
    activeEvents: number;
    totalRevenue: number;
    mrr: number;
    nmrr: number;
    usersOnline: number;
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalUsers: 0,
        newUsers30d: 0,
        totalOrganizers: 0,
        pendingOrganizers: 0,
        activeEvents: 0,
        totalRevenue: 0,
        mrr: 0,
        nmrr: 0,
        usersOnline: 0,
    });
    const [salesData, setSalesData] = useState<any[]>([]);
    const [newUsersData, setNewUsersData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        fetchMetrics();
        fetchChartData();
    }, []);

    async function fetchMetrics() {
        try {
            const data = await getDashboardMetrics();
            setMetrics(data);
        } catch (error) {
            console.error("Error fetching metrics:", error);
        }
        setLoading(false);
    }

    async function fetchChartData() {
        try {
            const { salesData, newUsersData } = await getDashboardCharts();
            setSalesData(salesData);
            setNewUsersData(newUsersData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    }

    if (loading) {
        return <div className="text-center">Carregando métricas...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral das métricas da plataforma
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Usuários Online"
                    value={metrics.usersOnline}
                    description="Ativos nos últimos 5 minutos"
                    icon={Activity}
                />
                <MetricCard
                    title="Total de Usuários"
                    value={metrics.totalUsers}
                    description={`+${metrics.newUsers30d} nos últimos 30 dias`}
                    icon={Users}
                />
                <MetricCard
                    title="Organizadores"
                    value={metrics.totalOrganizers}
                    description={`${metrics.pendingOrganizers} pendentes`}
                    icon={UserCheck}
                />
                <MetricCard
                    title="Eventos Ativos"
                    value={metrics.activeEvents}
                    description="Eventos publicados"
                    icon={Calendar}
                />
            </div>

            {/* Financial Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title="Receita Total"
                    value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    description="Desde o início"
                    icon={DollarSign}
                />
                <MetricCard
                    title="MRR"
                    value={`R$ ${metrics.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    description="Receita recorrente mensal"
                    icon={TrendingUp}
                />
                <MetricCard
                    title="NMRR"
                    value={`R$ ${metrics.nmrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    description="Receita de novos usuários"
                    icon={TrendingUp}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Sales Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vendas (Últimos 30 dias)</CardTitle>
                        <CardDescription>Receita diária em R$</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* New Users Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Novos Usuários (Últimos 30 dias)</CardTitle>
                        <CardDescription>Cadastros por dia</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={newUsersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="users" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
