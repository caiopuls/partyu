"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketPercent } from "lucide-react";

interface AnunciarFormProps {
  ticketId: string;
  originalPrice: number;
}

export function AnunciarForm({ ticketId, originalPrice }: AnunciarFormProps) {
  const router = useRouter();
  const [askingPrice, setAskingPrice] = useState(originalPrice.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = parseFloat(askingPrice) || 0;
  const platformFeePercentage = 10; // Taxa de 10%
  const processingFee = (price * platformFeePercentage) / 100; // Taxa de processamento (10%)
  const buyerTotal = price + processingFee; // Valor que o comprador vai pagar
  const sellerReceives = price; // Valor que o vendedor recebe

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!price || price <= 0) {
      setError("Digite um preço válido maior que zero");
      return;
    }

    if (price > originalPrice) {
      setError(
        `O preço não pode ser maior que o valor original do ingresso (R$ ${originalPrice.toFixed(2).replace(".", ",")})`,
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/resale/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          askingPrice: price,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar anúncio");
      }

      router.push("/meus-ingressos");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar anúncio";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TicketPercent className="h-5 w-5 text-primary" />
            Definir preço de revenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Preço de venda
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                max={originalPrice}
                placeholder={originalPrice.toFixed(2).replace(".", ",")}
                value={askingPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  // Não permite valores maiores que o original
                  if (value === "" || (!isNaN(numValue) && numValue <= originalPrice)) {
                    setAskingPrice(value);
                  }
                }}
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Preço sugerido: R$ {originalPrice.toFixed(2).replace(".", ",")} (valor original do ingresso)
            </p>
            <p className="text-xs text-muted-foreground">
              Preço máximo permitido: R$ {originalPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {price > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <p className="text-xs font-medium text-emerald-800 mb-2">Você receberá</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor a receber</span>
                  <span className="text-xl font-bold text-emerald-600">
                    R$ {sellerReceives.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este valor será transferido integralmente para sua carteira PartyU quando o ingresso for vendido.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-medium text-foreground mb-2">O comprador pagará</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preço do ingresso</span>
                  <span className="font-medium">R$ {price.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Taxa de processamento PartyU ({platformFeePercentage}%)
                  </span>
                  <span className="font-medium">+ R$ {processingFee.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total a pagar</span>
                    <span className="text-lg font-semibold text-primary">
                      R$ {buyerTotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-800">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-full bg-primary"
            disabled={loading}
          >
            {loading ? "Criando anúncio..." : "Anunciar ingresso"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}


