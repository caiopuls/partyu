"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

export interface TicketType {
    id: string; // Temp ID for frontend
    name: string; // Ex: "Masculino", "Feminino", "VIP"
    description?: string;
    batches: TicketBatch[];
}

export interface TicketBatch {
    id: string; // Temp ID for frontend
    lotNumber: number; // 1, 2, 3...
    quantity: string;
    price: string;
}

interface TicketTypeManagerProps {
    ticketTypes: TicketType[];
    setTicketTypes: React.Dispatch<React.SetStateAction<TicketType[]>>;
}

export function TicketTypeManager({ ticketTypes, setTicketTypes }: TicketTypeManagerProps) {
    const [feeRate] = useState(0.10); // 10% platform fee
    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

    const addTicketType = () => {
        const newType: TicketType = {
            id: crypto.randomUUID(),
            name: "",
            description: "",
            batches: [
                {
                    id: crypto.randomUUID(),
                    lotNumber: 1,
                    quantity: "",
                    price: "",
                },
            ],
        };
        setTicketTypes([...ticketTypes, newType]);
        setExpandedTypes(new Set([...expandedTypes, newType.id]));
    };

    const removeTicketType = (id: string) => {
        setTicketTypes(ticketTypes.filter((t) => t.id !== id));
        const newExpanded = new Set(expandedTypes);
        newExpanded.delete(id);
        setExpandedTypes(newExpanded);
    };

    const updateTicketType = (id: string, field: keyof TicketType, value: string) => {
        setTicketTypes(
            ticketTypes.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
    };

    const addBatch = (ticketTypeId: string) => {
        setTicketTypes(
            ticketTypes.map((t) => {
                if (t.id !== ticketTypeId) return t;
                const nextLotNumber = t.batches.length > 0 
                    ? Math.max(...t.batches.map(b => b.lotNumber)) + 1 
                    : 1;
                return {
                    ...t,
                    batches: [
                        ...t.batches,
                        {
                            id: crypto.randomUUID(),
                            lotNumber: nextLotNumber,
                            quantity: "",
                            price: "",
                        },
                    ],
                };
            })
        );
    };

    const removeBatch = (ticketTypeId: string, batchId: string) => {
        setTicketTypes(
            ticketTypes.map((t) => {
                if (t.id !== ticketTypeId) return t;
                const filtered = t.batches.filter((b) => b.id !== batchId);
                // Reordenar lotes após remoção
                const reordered = filtered.map((b, index) => ({
                    ...b,
                    lotNumber: index + 1,
                }));
                return { ...t, batches: reordered };
            })
        );
    };

    const updateBatch = (
        ticketTypeId: string,
        batchId: string,
        field: keyof TicketBatch,
        value: string | number
    ) => {
        setTicketTypes(
            ticketTypes.map((t) => {
                if (t.id !== ticketTypeId) return t;
                return {
                    ...t,
                    batches: t.batches.map((b) =>
                        b.id === batchId ? { ...b, [field]: value } : b
                    ),
                };
            })
        );
    };

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedTypes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedTypes(newExpanded);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-base font-semibold">Categorias de Ingresso</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                        Crie categorias (ex: Masculino, Feminino, VIP) e configure os lotes com preços e quantidades para cada uma
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTicketType}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar Categoria
                </Button>
            </div>

            {ticketTypes.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-muted-foreground">
                        Nenhuma categoria criada. Adicione pelo menos uma categoria com seus lotes.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {ticketTypes.map((ticketType, typeIndex) => {
                    const isExpanded = expandedTypes.has(ticketType.id);
                    
                    return (
                        <Card key={ticketType.id} className="relative overflow-hidden border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Input
                                                placeholder="Nome da categoria (ex: Masculino, Feminino, VIP)"
                                                value={ticketType.name}
                                                onChange={(e) =>
                                                    updateTicketType(ticketType.id, "name", e.target.value)
                                                }
                                                className="font-semibold text-base max-w-xs"
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {ticketType.batches.length} lote(s)
                                            </span>
                                        </div>
                                        <Input
                                            placeholder="Descrição (opcional)"
                                            value={ticketType.description || ""}
                                            onChange={(e) =>
                                                updateTicketType(ticketType.id, "description", e.target.value)
                                            }
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleExpanded(ticketType.id)}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => removeTicketType(ticketType.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <div>
                                    <CardContent className="pt-0 space-y-4">
                                        {ticketType.batches.length === 0 && (
                                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Nenhum lote criado para este tipo
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addBatch(ticketType.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar Primeiro Lote
                                                </Button>
                                            </div>
                                        )}

                                        {ticketType.batches.map((batch, batchIndex) => {
                                            const price = parseFloat(batch.price) || 0;
                                            const fee = price * feeRate;
                                            const total = price + fee;

                                            return (
                                                <Card
                                                    key={batch.id}
                                                    className="relative bg-gray-50/50 border border-gray-200"
                                                >
                                                    <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 text-xs font-bold rounded">
                                                        Lote {batch.lotNumber}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => removeBatch(ticketType.id, batch.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>

                                                    <CardContent className="pt-10 pb-4 grid gap-4 md:grid-cols-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`qty-${batch.id}`}>
                                                                Quantidade de Ingressos
                                                            </Label>
                                                            <Input
                                                                id={`qty-${batch.id}`}
                                                                type="number"
                                                                min="1"
                                                                value={batch.quantity}
                                                                onChange={(e) =>
                                                                    updateBatch(
                                                                        ticketType.id,
                                                                        batch.id,
                                                                        "quantity",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="100"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Quando esgotar, automaticamente vai para o próximo lote
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`price-${batch.id}`}>
                                                                Preço por Ingresso (R$)
                                                            </Label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input
                                                                    id={`price-${batch.id}`}
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="pl-9"
                                                                    value={batch.price}
                                                                    onChange={(e) =>
                                                                        updateBatch(
                                                                            ticketType.id,
                                                                            batch.id,
                                                                            "price",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="0,00"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Resumo Financeiro</Label>
                                                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Você recebe:</span>
                                                                    <span className="font-bold text-green-700">
                                                                        R$ {price.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Taxa (10%):</span>
                                                                    <span className="font-bold text-blue-700">
                                                                        R$ {fee.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between pt-1 border-t border-gray-200">
                                                                    <span className="font-medium text-gray-900">
                                                                        Cliente paga:
                                                                    </span>
                                                                    <span className="font-bold text-lg text-primary">
                                                                        R$ {total.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>

                                                    {batchIndex === ticketType.batches.length - 1 && (
                                                        <div className="px-6 pb-4">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => addBatch(ticketType.id)}
                                                                className="w-full"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Adicionar Próximo Lote (Lote {batch.lotNumber + 1})
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </CardContent>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
