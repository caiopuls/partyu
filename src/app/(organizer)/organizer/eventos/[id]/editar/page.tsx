"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    status: string;
    image_url?: string;
}

interface TicketType {
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    sold_count: number;
}

export default function EditarEventoPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params?.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);

    const [ticketFormData, setTicketFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
    });

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        if (eventId) {
            fetchEvent();
            fetchTicketTypes();
        }
    }, [eventId]);

    async function fetchEvent() {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();

        if (data) {
            setEvent(data);
        }
        setLoading(false);
    }

    async function fetchTicketTypes() {
        const { data } = await supabase
            .from("event_ticket_types")
            .select("*, sold_count:user_tickets(count)")
            .eq("event_id", eventId);

        if (data) {
            const enriched = data.map((tt) => ({
                ...tt,
                sold_count: tt.sold_count?.[0]?.count || 0,
            }));
            setTicketTypes(enriched as any);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const eventDate = formData.get("event_date") as string;
        const eventTime = formData.get("event_time") as string;
        const eventDateTime = `${eventDate}T${eventTime}:00`;

        const updateData = {
            title: formData.get("title"),
            description: formData.get("description"),
            event_date: eventDateTime,
            location: formData.get("location"),
            status: formData.get("status"),
            image_url: formData.get("image_url") || null,
        };

        const { error } = await supabase
            .from("events")
            .update(updateData)
            .eq("id", eventId);

        if (error) {
            toast.error(`Erro ao atualizar evento: ${error.message}`);
            setIsSubmitting(false);
            return;
        }

        toast.success("Evento atualizado com sucesso!");
        fetchEvent();
        setIsSubmitting(false);
    }

    async function saveTicketType() {
        const ticketData = {
            event_id: eventId,
            name: ticketFormData.name,
            description: ticketFormData.description || null,
            price: parseFloat(ticketFormData.price) * 100, // Convert to cents
            quantity: parseInt(ticketFormData.quantity),
        };

        if (editingTicket) {
            const { error } = await supabase
                .from("event_ticket_types")
                .update(ticketData)
                .eq("id", editingTicket.id);

            if (error) {
                toast.error("Erro ao atualizar ingresso");
                return;
            }
            toast.success("Ingresso atualizado!");
        } else {
            const { error } = await supabase
                .from("event_ticket_types")
                .insert(ticketData);

            if (error) {
                toast.error("Erro ao criar ingresso");
                return;
            }
            toast.success("Ingresso criado!");
        }

        setTicketModalOpen(false);
        resetTicketForm();
        fetchTicketTypes();
    }

    async function deleteTicketType(id: string) {
        if (!confirm("Tem certeza que deseja deletar este tipo de ingresso?")) return;

        const { error } = await supabase
            .from("event_ticket_types")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Erro ao deletar ingresso");
            return;
        }

        toast.success("Ingresso deletado!");
        fetchTicketTypes();
    }

    function openTicketModal(ticket?: TicketType) {
        if (ticket) {
            setEditingTicket(ticket);
            setTicketFormData({
                name: ticket.name,
                description: ticket.description || "",
                price: (ticket.price / 100).toString(),
                quantity: ticket.quantity.toString(),
            });
        } else {
            resetTicketForm();
        }
        setTicketModalOpen(true);
    }

    function resetTicketForm() {
        setEditingTicket(null);
        setTicketFormData({
            name: "",
            description: "",
            price: "",
            quantity: "",
        });
    }

    if (loading) {
        return <div className="text-center">Carregando...</div>;
    }

    if (!event) {
        return <div className="text-center">Evento não encontrado</div>;
    }

    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toISOString().split("T")[0];
    const timeStr = eventDate.toTimeString().slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/organizer/eventos">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
                <p className="text-muted-foreground">
                    Atualize as informações e gerencie os ingressos
                </p>
            </div>

            {/* Event Info Form */}
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Evento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Evento *</Label>
                            <Input
                                id="title"
                                name="title"
                                required
                                defaultValue={event.title}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                defaultValue={event.description}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="event_date">Data do Evento *</Label>
                                <Input
                                    id="event_date"
                                    name="event_date"
                                    type="date"
                                    required
                                    defaultValue={dateStr}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event_time">Horário *</Label>
                                <Input
                                    id="event_time"
                                    name="event_time"
                                    type="time"
                                    required
                                    defaultValue={timeStr}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Local *</Label>
                            <Input
                                id="location"
                                name="location"
                                required
                                defaultValue={event.location}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image_url">URL da Imagem</Label>
                            <Input
                                id="image_url"
                                name="image_url"
                                type="url"
                                defaultValue={event.image_url || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={event.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Rascunho</SelectItem>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </CardContent>
                </Card>
            </form>

            {/* Ticket Types */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tipos de Ingressos</CardTitle>
                            <CardDescription>
                                Gerencie os diferentes tipos de ingressos para este evento
                            </CardDescription>
                        </div>
                        <Button onClick={() => openTicketModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Ingresso
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {ticketTypes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhum tipo de ingresso criado ainda
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead>Vendidos</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ticketTypes.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{ticket.name}</p>
                                                {ticket.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {ticket.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            R$ {(ticket.price / 100).toFixed(2).replace(".", ",")}
                                        </TableCell>
                                        <TableCell>{ticket.quantity}</TableCell>
                                        <TableCell>{ticket.sold_count}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openTicketModal(ticket)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteTicketType(ticket.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Ticket Type Modal */}
            <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTicket ? "Editar" : "Novo"} Tipo de Ingresso
                        </DialogTitle>
                        <DialogDescription>
                            Configure o nome, preço e quantidade disponível
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticket_name">Nome *</Label>
                            <Input
                                id="ticket_name"
                                value={ticketFormData.name}
                                onChange={(e) =>
                                    setTicketFormData({ ...ticketFormData, name: e.target.value })
                                }
                                placeholder="Ex: Pista, VIP, Camarote"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticket_description">Descrição</Label>
                            <Input
                                id="ticket_description"
                                value={ticketFormData.description}
                                onChange={(e) =>
                                    setTicketFormData({ ...ticketFormData, description: e.target.value })
                                }
                                placeholder="Opcional"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticket_price">Preço (R$) *</Label>
                                <Input
                                    id="ticket_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={ticketFormData.price}
                                    onChange={(e) =>
                                        setTicketFormData({ ...ticketFormData, price: e.target.value })
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ticket_quantity">Quantidade *</Label>
                                <Input
                                    id="ticket_quantity"
                                    type="number"
                                    min="1"
                                    value={ticketFormData.quantity}
                                    onChange={(e) =>
                                        setTicketFormData({ ...ticketFormData, quantity: e.target.value })
                                    }
                                    placeholder="100"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTicketModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={saveTicketType}>
                            {editingTicket ? "Salvar" : "Criar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
