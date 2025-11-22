import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { approveOrganizer, rejectOrganizer } from "@/app/actions/users";

export default async function AdminUsersPage() {
    const supabase = await createSupabaseServerClient();

    // Buscar usuários pendentes (prioridade)
    const { data: pendingUsers } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    // Buscar todos os usuários (limite 50 para MVP)
    const { data: allUsers } = await supabase
        .from("profiles")
        .select("*")
        .neq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <div className="space-y-8">
            {/* Pending Approvals */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-orange-600">Aprovações Pendentes</h2>
                <div className="grid gap-4">
                    {pendingUsers?.map((user) => (
                        <Card key={user.id} className="border-orange-200 bg-orange-50">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-lg">{user.full_name}</p>
                                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                                            Solicitação de Organizador
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {user.email} • {user.phone} • CPF/CNPJ: {user.cpf_cnpj}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={rejectOrganizer.bind(null, user.id)}>
                                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Rejeitar
                                        </Button>
                                    </form>
                                    <form action={approveOrganizer.bind(null, user.id)}>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Aprovar
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!pendingUsers || pendingUsers.length === 0) && (
                        <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
                    )}
                </div>
            </div>

            {/* All Users */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Todos os Usuários</h2>
                <div className="rounded-md border bg-white">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Função</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {allUsers?.map((user) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{user.full_name}</td>
                                        <td className="p-4 align-middle">{user.email}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="secondary">{user.role}</Badge>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant={user.status === "approved" ? "default" : "destructive"}>
                                                {user.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
