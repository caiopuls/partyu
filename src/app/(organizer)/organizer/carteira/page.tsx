'use client'

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function WalletPage() {
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [amount, setAmount] = useState("")
    const [pixKey, setPixKey] = useState("")
    const [pixKeyType, setPixKeyType] = useState("cpf")

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        fetchBalance()
    }, [])

    const fetchBalance = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const res = await fetch('/api/wallet/balance', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()

            if (res.ok) {
                setBalance(data.balance)
            }
        } catch (error) {
            console.error('Error fetching balance:', error)
        }
        setLoading(false)
    }

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        const withdrawAmount = parseFloat(amount)

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            toast.error("Valor inválido")
            return
        }

        if (withdrawAmount > balance) {
            toast.error("Saldo insuficiente")
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    pix_key: pixKey,
                    pix_key_type: pixKeyType
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Solicitação enviada com sucesso!")
                setAmount("")
                setPixKey("")
                fetchBalance()
            } else {
                toast.error(data.error || "Erro ao solicitar saque")
            }
        } catch (error) {
            toast.error("Erro ao conectar com o servidor")
        }
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Minha Carteira</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Saldo Disponível</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">
                            R$ {balance.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Solicitar Saque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Valor (R$)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pixType">Tipo de Chave Pix</Label>
                                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Telefone</SelectItem>
                                        <SelectItem value="random">Chave Aleatória</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pixKey">Chave Pix</Label>
                                <Input
                                    id="pixKey"
                                    value={pixKey}
                                    onChange={(e) => setPixKey(e.target.value)}
                                    placeholder="Digite sua chave pix"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Solicitar Saque
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
