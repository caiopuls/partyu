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
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { TicketTypeManager, TicketType } from "@/components/organizer/ticket-type-manager";

export default function CriarEventoPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resaleEnabled, setResaleEnabled] = useState(true);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
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

        if (ticketTypes.length === 0) {
            toast.error("Adicione pelo menos uma categoria de ingresso");
            setIsSubmitting(false);
            return;
        }

        // Validate ticket types and batches
        for (const ticketType of ticketTypes) {
            if (!ticketType.name || ticketType.name.trim() === "") {
                toast.error("Preencha o nome de todas as categorias de ingresso");
                setIsSubmitting(false);
                return;
            }
            if (ticketType.batches.length === 0) {
                toast.error(`A categoria "${ticketType.name}" precisa ter pelo menos um lote`);
                setIsSubmitting(false);
                return;
            }
            for (const batch of ticketType.batches) {
                if (!batch.quantity || !batch.price) {
                    toast.error(`Preencha quantidade e preço de todos os lotes da categoria "${ticketType.name}"`);
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        const location = formData.get("location") as string;
        
        // Parse location: "Arena Parque, São Paulo - SP" -> venue="Arena Parque", city="São Paulo", state="SP"
        let venue = location;
        let city = "";
        let state = "";
        
        if (location) {
            const parts = location.split(",");
            if (parts.length >= 2) {
                venue = parts[0].trim();
                const cityState = parts[1].trim();
                const cityStateMatch = cityState.match(/^(.+?)\s*-\s*([A-Z]{2})$/);
                if (cityStateMatch) {
                    city = cityStateMatch[1].trim();
                    state = cityStateMatch[2].trim().toUpperCase();
                } else {
                    city = cityState;
                    state = "";
                }
            } else {
                city = location;
            }
        }
        
        const eventData = {
            organizer_id: user.id,
            title: formData.get("title"),
            description: formData.get("description"),
            event_date: eventDateTime,
            city: city || "Não informado",
            state: state || "SP",
            venue: venue || null,
            address: null,
            category: formData.get("category") || "Festas",
            status: formData.get("status") || "draft",
            banner_url: imageUrl || null,
            featured_image_url: imageUrl || null,
            resale_enabled: resaleEnabled,
        };

        const { data: event, error: eventError } = await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();

        if (eventError) {
            console.error("Error creating event:", eventError);
            toast.error(`Erro ao criar evento: ${eventError.message}`);
            setIsSubmitting(false);
            return;
        }

        // Insert Ticket Types with Batches
        // Cada lote vira um event_ticket_type com lot_number sequencial
        const ticketTypesData: any[] = [];
        
        for (const ticketType of ticketTypes) {
            for (const batch of ticketType.batches) {
                ticketTypesData.push({
                    event_id: event.id,
                    name: ticketType.name,
                    description: ticketType.description || null,
                    price: parseFloat(batch.price) * 100, // Convert to cents
                    total_quantity: parseInt(batch.quantity),
                    lot_number: batch.lotNumber,
                    status: "active",
                });
            }
        }

        const { error: ticketTypesError } = await supabase
            .from("event_ticket_types")
            .insert(ticketTypesData);

        if (ticketTypesError) {
            console.error("Error creating ticket types:", ticketTypesError);
            toast.error("Evento criado, mas houve erro ao salvar os tipos de ingresso.");
            setIsSubmitting(false);
            return;
        }

        // Se houver arquivo para upload, fazer upload agora que temos o event_id
        if (imageFile) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append("event_id", event.id);
                uploadFormData.append("image", imageFile);

                const uploadResponse = await fetch("/api/events/upload-image", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    console.error("Error uploading image:", errorData);
                    toast.error(`Evento criado, mas houve erro ao fazer upload da imagem: ${errorData.error || "Erro desconhecido"}`);
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Evento criado, mas houve erro ao fazer upload da imagem.");
            }
        }

        toast.success("Evento e categorias de ingresso criados com sucesso!");
        router.push(`/organizer/eventos`);
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

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria *</Label>
                            <Select name="category" required defaultValue="Festas">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Festas">Festas</SelectItem>
                                    <SelectItem value="Shows">Shows</SelectItem>
                                    <SelectItem value="Festivais">Festivais</SelectItem>
                                    <SelectItem value="Eletrônica">Eletrônica</SelectItem>
                                    <SelectItem value="Sertanejo">Sertanejo</SelectItem>
                                    <SelectItem value="Trap & Rap">Trap & Rap</SelectItem>
                                    <SelectItem value="Universitárias">Universitárias</SelectItem>
                                    <SelectItem value="Teatro">Teatro</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Selecione a categoria que melhor descreve seu evento
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Imagem do Evento (opcional)</Label>
                            
                            {!imagePreview ? (
                                <label
                                    htmlFor="image_file"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Clique para fazer upload</span> ou arraste a imagem
                                        </p>
                                        <p className="text-xs text-gray-400">JPG até 10MB</p>
                                    </div>
                                    <input
                                        id="image_file"
                                        type="file"
                                        accept="image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Validar tamanho (10MB)
                                                const MAX_SIZE = 10 * 1024 * 1024; // 10MB
                                                if (file.size > MAX_SIZE) {
                                                    toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
                                                    e.target.value = "";
                                                    return;
                                                }
                                                
                                                // Validar tipo (apenas JPG)
                                                const allowedTypes = ["image/jpeg", "image/jpg"];
                                                if (!allowedTypes.includes(file.type)) {
                                                    toast.error("Tipo de arquivo não permitido. Use apenas JPG");
                                                    e.target.value = "";
                                                    return;
                                                }
                                                
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="absolute top-2 right-2 bg-white/90 hover:bg-white border-red-200 text-red-600 hover:text-red-700"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                            const fileInput = document.getElementById("image_file") as HTMLInputElement;
                                            if (fileInput) fileInput.value = "";
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Resale Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-gray-50/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold text-gray-900">Revenda de Ingressos</Label>
                                <p className="text-sm text-gray-500">
                                    Permitir que usuários revendam seus ingressos na plataforma?
                                </p>
                            </div>
                            <Switch
                                checked={resaleEnabled}
                                onCheckedChange={setResaleEnabled}
                            />
                        </div>

                        {/* Ticket Type Manager */}
                        <div className="border-t pt-6">
                            <TicketTypeManager ticketTypes={ticketTypes} setTicketTypes={setTicketTypes} />
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
                                O evento começará a vender ingressos assim que a data de início do primeiro lote chegar.
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
