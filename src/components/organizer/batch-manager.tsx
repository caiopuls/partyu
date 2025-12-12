"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, DollarSign, Info } from "lucide-react";

export interface Batch {
    id: string; // Temp ID for frontend
    name: string;
    price: string;
    quantity: string;
    endDate: string;
}

interface BatchManagerProps {
    batches: Batch[];
    setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
}

export function BatchManager({ batches, setBatches }: BatchManagerProps) {
    const [feeRate] = useState(0.10); // 10% platform fee

    const addBatch = () => {
        setBatches([
            ...batches,
            {
                id: crypto.randomUUID(),
                name: `Lote ${batches.length + 1}`,
                price: "",
                quantity: "",
                endDate: "",
            },
        ]);
    };

    const removeBatch = (id: string) => {
        setBatches(batches.filter((b) => b.id !== id));
    };

    const updateBatch = (id: string, field: keyof Batch, value: string) => {
        setBatches(
            batches.map((b) => (b.id === id ? { ...b, [field]: value } : b))
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Lotes de Ingressos</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBatch}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar Lote
                </Button>
            </div>

            {batches.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-muted-foreground">
                        Nenhum lote criado. Adicione pelo menos um lote para vender ingressos.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {batches.map((batch, index) => {
                    const price = parseFloat(batch.price) || 0;
                    const fee = price * feeRate;
                    const total = price + fee;

                    return (
                        <Card key={batch.id} className="relative overflow-hidden">
                            <div className="absolute top-0 left-0 bg-primary/10 text-primary px-3 py-1 text-xs font-bold rounded-br-lg">
                                #{index + 1}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeBatch(batch.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <CardContent className="pt-10 pb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`name-${batch.id}`}>Nome do Lote</Label>
                                    <Input
                                        id={`name-${batch.id}`}
                                        value={batch.name}
                                        onChange={(e) => updateBatch(batch.id, "name", e.target.value)}
                                        placeholder="Ex: 1º Lote"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`qty-${batch.id}`}>Quantidade</Label>
                                    <Input
                                        id={`qty-${batch.id}`}
                                        type="number"
                                        min="1"
                                        value={batch.quantity}
                                        onChange={(e) => updateBatch(batch.id, "quantity", e.target.value)}
                                        placeholder="100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`date-${batch.id}`}>Venda até</Label>
                                    <Input
                                        id={`date-${batch.id}`}
                                        type="datetime-local"
                                        value={batch.endDate}
                                        onChange={(e) => updateBatch(batch.id, "endDate", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`price-${batch.id}`}>Preço (R$)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id={`price-${batch.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="pl-9"
                                            value={batch.price}
                                            onChange={(e) => updateBatch(batch.id, "price", e.target.value)}
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="col-span-full bg-gray-50/50 p-4 rounded-lg flex flex-wrap gap-6 text-sm border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-gray-600">Você recebe:</span>
                                        <span className="font-bold text-green-700">R$ {price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-gray-600">Taxa (10%):</span>
                                        <span className="font-bold text-blue-700">R$ {fee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-l pl-6 border-gray-200">
                                        <span className="text-gray-900 font-medium">Usuário paga:</span>
                                        <span className="font-bold text-lg text-primary">R$ {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
