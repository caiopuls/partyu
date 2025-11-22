"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CriarEventoPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Você precisa estar logado");
            setIsSubmitting(false);
            return;
        }

        // Combine date and time
        const eventDate = formData.get("event_date") as string;
        const eventTime = formData.get("event_time") as string;
        const eventDateTime = `${eventDate}T${eventTime}:00`;

        const eventData = {
            organizer_id: user.id,
            title: formData.get("title"),
            description: formData.get("description"),
            event_date: eventDateTime,
            location: formData.get("location"),
            status: formData.get("status") || "draft",
            image_url: formData.get("image_url") || null,
        };

        const { data, error } = await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();

        if (error) {
            console.error("Error creating event:", error);
            toast.error(`Erro ao criar evento: ${error.message}`);
            setIsSubmitting(false);
            return;
        }

        toast.success("Evento criado com sucesso!");
        router.push(`/organizer/eventos/${data.id}/editar`);
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/organizer/eventos">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Criar Novo Evento</h1>
                <p className="text-muted-foreground">
                    Preencha as informações básicas do seu evento
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Evento</CardTitle>
                        <CardDescription>
                            Você poderá adicionar tipos de ingressos depois de criar o evento
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Evento *</Label>
                            <Input
                                id="title"
                                name="title"
                                required
                                placeholder="Ex: Festival de Música 2024"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                placeholder="Descreva seu evento, atrações, programação, etc."
                            />
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="event_date">Data do Evento *</Label>
                                <Input
                                    id="event_date"
                                    name="event_date"
                                    type="date"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event_time">Horário *</Label>
                                <Input
                                    id="event_time"
                                    name="event_time"
                                    type="time"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Local *</Label>
                            <Input
                                id="location"
                                name="location"
                                required
                                placeholder="Ex: Arena Parque, São Paulo - SP"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
                            <Input
                                id="image_url"
                                name="image_url"
                                type="url"
                                placeholder="https://exemplo.com/imagem.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Cole o link de uma imagem de capa para o evento
                            </p>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status Inicial</Label>
                            <Select name="status" defaultValue="draft">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Rascunho</SelectItem>
                                    <SelectItem value="active">Ativo (publicado)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Você pode publicar o evento depois de adicionar os ingressos
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Criando..." : "Criar Evento"}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/organizer/eventos">Cancelar</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
