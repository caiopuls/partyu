'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const fetchWithdrawals = async () => {
        const { data, error } = await supabase
            .from('withdrawals')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false })

        if (data) {
            setWithdrawals(data)
        }
        setLoading(false)
    }

    const approveWithdrawal = async (id: string) => {
        const { error } = await supabase
            .from('withdrawals')
            .update({ status: 'paid', processed_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            fetchWithdrawals()
        }
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciar Saques</h1>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organizador</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Chave Pix</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawals.map((w) => (
                            <TableRow key={w.id}>
                                <TableCell>{w.profiles?.full_name || 'N/A'}</TableCell>
                                <TableCell>R$ {w.amount.toFixed(2)}</TableCell>
                                <TableCell>{w.pix_key} ({w.pix_key_type})</TableCell>
                                <TableCell>
                                    <Badge variant={w.status === 'paid' ? 'default' : 'secondary'}>
                                        {w.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {w.status === 'pending' && (
                                        <Button size="sm" onClick={() => approveWithdrawal(w.id)}>
                                            Aprovar e Pagar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
