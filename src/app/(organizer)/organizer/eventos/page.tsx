"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    status: "draft" | "active" | "completed" | "cancelled";
    created_at: string;
}

export default function EventosPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("organizer_id", user.id)
            .order("event_date", { ascending: false });

        if (data) {
            setEvents(data);
        }
        setLoading(false);
    }

    async function deleteEvent(id: string) {
        if (!confirm("Tem certeza que deseja deletar este evento?")) return;

        const { error } = await supabase.from("events").delete().eq("id", id);

        if (error) {
            toast.error("Erro ao deletar evento");
            return;
        }

        toast.success("Evento deletado com sucesso!");
        fetchEvents();
    }

    function getStatusBadge(status: string) {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            draft: "secondary",
            active: "default",
            completed: "outline",
            cancelled: "destructive",
        };

        const labels: Record<string, string> = {
            draft: "Rascunho",
            active: "Ativo",
            completed: "Concluído",
            cancelled: "Cancelado",
        };

        return (
            <Badge variant={variants[status] || "secondary"}>
                {labels[status] || status}
            </Badge>
        );
    }

    if (loading) {
        return <div className="text-center">Carregando eventos...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Eventos</h1>
                    <p className="text-muted-foreground">
                        Gerencie todos os seus eventos
                    </p>
                </div>
                <Button asChild>
                    <Link href="/organizer/eventos/criar">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Evento
                    </Link>
                </Button>
            </div>

            {events.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum evento criado</h3>
                        <p className="text-muted-foreground mb-4">
                            Comece criando seu primeiro evento
                        </p>
                        <Button asChild>
                            <Link href="/organizer/eventos/criar">
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Evento
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evento</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{event.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {event.description}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(event.event_date), "dd/MM/yyyy 'às' HH:mm", {
                                            locale: ptBR,
                                        })}
                                    </TableCell>
                                    <TableCell>{event.location}</TableCell>
                                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/evento/${event.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/organizer/eventos/${event.id}/editar`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteEvent(event.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
