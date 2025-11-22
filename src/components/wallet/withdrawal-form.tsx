"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowUpRight, Loader2 } from "lucide-react";

export function WithdrawalForm({ balance }: { balance: number }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const amount = parseFloat(formData.get("amount") as string);
        const pixKey = formData.get("pixKey") as string;
        const pixKeyType = formData.get("pixKeyType") as string;

        if (amount > balance) {
            toast.error("Saldo insuficiente");
            setIsLoading(false);
            return;
        }

        if (amount < 10) {
            toast.error("Valor mínimo para saque é R$ 10,00");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/wallet/withdraw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    pixKey,
                    pixKeyType,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao solicitar saque");
            }

            toast.success("Solicitação de saque realizada com sucesso!");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao solicitar saque");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2" disabled={balance < 10}>
                    <ArrowUpRight className="h-4 w-4" />
                    Solicitar Saque
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Solicitar Saque</DialogTitle>
                    <DialogDescription>
                        O valor será transferido para sua chave PIX em até 1 dia útil.
                        <br />
                        Taxa de saque: R$ 0,00
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="10"
                            max={balance}
                            placeholder="0,00"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Saldo disponível: R$ {balance.toFixed(2).replace(".", ",")}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pixKeyType">Tipo de Chave</Label>
                        <Select name="pixKeyType" required defaultValue="cpf">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cpf">CPF</SelectItem>
                                <SelectItem value="email">E-mail</SelectItem>
                                <SelectItem value="phone">Telefone</SelectItem>
                                <SelectItem value="random">Chave Aleatória</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pixKey">Chave PIX</Label>
                        <Input
                            id="pixKey"
                            name="pixKey"
                            placeholder="Digite sua chave PIX"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Saque
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
