"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { PaymentTransaction } from "@/types/database";

interface PaymentPixComponentProps {
  orderId: string;
  amount: number;
  paymentTransaction?: PaymentTransaction;
}

export function PaymentPixComponent({
  orderId,
  amount,
  paymentTransaction: initialTransaction,
}: PaymentPixComponentProps) {
  const [paymentTransaction, setPaymentTransaction] = useState(
    initialTransaction,
  );
  const [loading, setLoading] = useState(!initialTransaction);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!paymentTransaction) {
      createPayment();
    } else {
      checkPaymentStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPayment = async () => {
    setLoading(true);
    try {
      // Buscar informações do pedido para passar ticket_type_id ou resale_listing_id
      const orderResponse = await fetch(`/api/orders/${orderId}/details`);
      const orderData = await orderResponse.json().catch(() => null);
      
      const response = await fetch(`/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          orderId,
          ticket_type_id: orderData?.ticket_type_id,
          resale_listing_id: orderData?.resale_listing_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar pagamento");
      }

      const data = await response.json();
      setPaymentTransaction(data);
    } catch (error) {
      console.error("Error creating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentTransaction) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payments/status?transactionId=${paymentTransaction.external_id}`,
        );
        const data = await response.json();

        if (data.status === "paid") {
          clearInterval(interval);
          router.push(`/pedido/${orderId}/sucesso`);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000); // Verificar a cada 3 segundos

    return () => clearInterval(interval);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!paymentTransaction) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Erro ao gerar pagamento. Tente novamente.
          </p>
          <Button
            onClick={createPayment}
            className="mt-4 rounded-full"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Valor a pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-primary">
            R$ {amount.toFixed(2).replace(".", ",")}
          </p>
        </CardContent>
      </Card>

      {paymentTransaction.pix_qr_code && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QR Code PIX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <Image
                  src={paymentTransaction.pix_qr_code}
                  alt="QR Code PIX"
                  width={256}
                  height={256}
                  className="rounded-lg"
                />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Escaneie o QR Code com o app do seu banco
            </p>
          </CardContent>
        </Card>
      )}

      {paymentTransaction.pix_copy_paste && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Código PIX (Copiar e Colar)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/50 p-4">
              <p className="break-all text-xs font-mono text-foreground">
                {paymentTransaction.pix_copy_paste}
              </p>
            </div>
            <Button
              onClick={() => {
                if (paymentTransaction.pix_copy_paste) {
                  copyToClipboard(paymentTransaction.pix_copy_paste);
                }
              }}
              className="w-full rounded-full"
              variant={copied ? "default" : "outline"}
              disabled={!paymentTransaction.pix_copy_paste}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código PIX
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Aguardando confirmação do pagamento
              </p>
              <p className="text-xs text-muted-foreground">
                Você será redirecionado automaticamente quando o pagamento for
                confirmado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

