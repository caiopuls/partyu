"use client";

import { useEffect, useState } from "react";
import { getAdminEvents, updateAdminEvent, deleteAdminEvent, AdminEvent } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<AdminEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modals
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

    // Edit Form
    const [formData, setFormData] = useState<Partial<AdminEvent>>({});

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [searchTerm, events]);

    async function fetchEvents() {
        try {
            const data = await getAdminEvents();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Erro ao carregar eventos");
        }
        setLoading(false);
    }

    function filterEvents() {
        let filtered = events;

        if (searchTerm) {
            filtered = filtered.filter(
                (event) =>
                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.organizer_email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEvents(filtered);
    }

    function openEditModal(event: AdminEvent) {
        setSelectedEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            location: event.location,
            status: event.status,
            image_url: event.image_url,
        });
        setEditModalOpen(true);
    }

    async function handleUpdateEvent() {
        if (!selectedEvent) return;

        try {
            await updateAdminEvent(selectedEvent.id, formData);
            toast.success("Evento atualizado com sucesso!");
            setEditModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Error updating event:", error);
            toast.error("Erro ao atualizar evento");
        }
    }

    async function handleDeleteEvent() {
        if (!selectedEvent) return;

        try {
            await deleteAdminEvent(selectedEvent.id);
            toast.success("Evento deletado com sucesso!");
            setDeleteModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error("Erro ao deletar evento");
        }
    }

    if (loading) {
        return <div className="text-center">Carregando eventos...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
                <p className="text-muted-foreground">
                    Gerencie todos os eventos da plataforma
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por evento, organizador ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Events Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Evento</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Organizador</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ingressos</TableHead>
                            <TableHead>Receita</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.title}</TableCell>
                                <TableCell>
                                    {format(new Date(event.event_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{event.organizer_name}</span>
                                        <span className="text-xs text-muted-foreground">{event.organizer_email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            event.status === "active"
                                                ? "default"
                                                : event.status === "cancelled"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {event.status === "active" ? "Ativo" :
                                            event.status === "cancelled" ? "Cancelado" :
                                                event.status === "draft" ? "Rascunho" :
                                                    event.status === "completed" ? "Concluído" : event.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{event.tickets_sold}</TableCell>
                                <TableCell>
                                    R$ {(event.total_revenue / 100).toFixed(2).replace(".", ",")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setDetailsModalOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEditModal(event)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setDeleteModalOpen(true);
                                            }}
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

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Evento</DialogTitle>
                        <DialogDescription>
                            Atualize as informações do evento
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="event_date">Data e Hora</Label>
                                <Input
                                    id="event_date"
                                    type="datetime-local"
                                    value={formData.event_date ? new Date(formData.event_date).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => setFormData({ ...formData, event_date: new Date(e.target.value).toISOString() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
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
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Local</Label>
                            <Input
                                id="location"
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url">URL da Imagem</Label>
                            <Input
                                id="image_url"
                                value={formData.image_url || ""}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateEvent}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar o evento <strong>{selectedEvent?.title}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteEvent}>
                            Deletar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Evento</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Título:</span>
                                    <p className="font-medium">{selectedEvent.title}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Organizador:</span>
                                    <p className="font-medium">{selectedEvent.organizer_name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedEvent.organizer_email}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Data:</span>
                                    <p className="font-medium">
                                        {format(new Date(selectedEvent.event_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <p className="font-medium">{selectedEvent.status}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Local:</span>
                                    <p className="font-medium">{selectedEvent.location}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Ingressos Vendidos:</span>
                                    <p className="font-medium">{selectedEvent.tickets_sold}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Receita Total:</span>
                                    <p className="font-medium">
                                        R$ {(selectedEvent.total_revenue / 100).toFixed(2).replace(".", ",")}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-sm">Descrição:</span>
                                <p className="text-sm mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                                    {selectedEvent.description}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
