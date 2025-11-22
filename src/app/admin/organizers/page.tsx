"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAdminOrganizers, AdminOrganizerRequest } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";


export default function OrganizersPage() {
    const [organizers, setOrganizers] = useState<AdminOrganizerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrganizer, setSelectedOrganizer] = useState<AdminOrganizerRequest | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        fetchOrganizers();
    }, []);

    async function fetchOrganizers() {
        try {
            const data = await getAdminOrganizers();
            setOrganizers(data);
        } catch (error) {
            console.error("Error fetching organizers:", error);
            toast.error("Erro ao carregar organizadores");
        }
        setLoading(false);
    }

    const filteredOrganizers = organizers.filter(org => {
        if (statusFilter === "all") return true;
        return org.status === statusFilter;
    });

    async function approveOrganizer(id: string) {
        const { error } = await supabase
            .from("profiles")
            .update({ status: "approved" })
            .eq("id", id);

        if (error) {
            toast.error("Erro ao aprovar organizador");
            return;
        }

        toast.success("Organizador aprovado com sucesso!");
        fetchOrganizers();
    }

    async function rejectOrganizer(id: string) {
        const { error } = await supabase
            .from("profiles")
            .update({ status: "rejected", role: "user" })
            .eq("id", id);

        if (error) {
            toast.error("Erro ao rejeitar organizador");
            return;
        }

        toast.success("Organizador rejeitado");
        fetchOrganizers();
    }

    if (loading) {
        return <div className="text-center">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organizadores</h1>
                <p className="text-muted-foreground">
                    Gerencie as solicitações e contas de organizadores
                </p>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                >
                    Pendentes
                </Button>
                <Button
                    variant={statusFilter === "approved" ? "default" : "outline"}
                    onClick={() => setStatusFilter("approved")}
                >
                    Aprovados
                </Button>
                <Button
                    variant={statusFilter === "rejected" ? "default" : "outline"}
                    onClick={() => setStatusFilter("rejected")}
                >
                    Rejeitados
                </Button>
                <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                >
                    Todos
                </Button>
            </div>

            {filteredOrganizers.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Nenhum organizador encontrado com este filtro.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredOrganizers.map((org) => (
                        <Card key={org.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>{org.full_name}</CardTitle>
                                        <CardDescription>{org.email}</CardDescription>
                                    </div>
                                    <Badge variant={org.person_type === "pj" ? "default" : "secondary"}>
                                        {org.person_type === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">CPF/CNPJ:</span>
                                            <p className="font-medium">{org.cpf_cnpj}</p>
                                        </div>
                                        {org.person_type === "pj" && (
                                            <>
                                                <div>
                                                    <span className="text-muted-foreground">Empresa:</span>
                                                    <p className="font-medium">{org.company_name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Responsável:</span>
                                                    <p className="font-medium">{org.responsible_person}</p>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <span className="text-muted-foreground">Telefone:</span>
                                            <p className="font-medium">{org.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedOrganizer(org);
                                                setDetailsOpen(true);
                                            }}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver Detalhes
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => approveOrganizer(org.id)}
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Aprovar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => rejectOrganizer(org.id)}
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Rejeitar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Organizador</DialogTitle>
                        <DialogDescription>
                            Informações completas da solicitação
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrganizer && (
                        <div className="space-y-6">
                            {/* Personal/Company Info */}
                            <div>
                                <h3 className="font-semibold mb-3">Informações {selectedOrganizer.person_type === "pj" ? "da Empresa" : "Pessoais"}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Nome:</span>
                                        <p className="font-medium">{selectedOrganizer.full_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>
                                        <p className="font-medium">{selectedOrganizer.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tipo:</span>
                                        <p className="font-medium">{selectedOrganizer.person_type === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">{selectedOrganizer.person_type === "pj" ? "CNPJ" : "CPF"}:</span>
                                        <p className="font-medium">{selectedOrganizer.cpf_cnpj}</p>
                                    </div>
                                    {selectedOrganizer.person_type === "pj" && (
                                        <>
                                            <div>
                                                <span className="text-muted-foreground">Razão Social:</span>
                                                <p className="font-medium">{selectedOrganizer.company_name}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Responsável:</span>
                                                <p className="font-medium">{selectedOrganizer.responsible_person}</p>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <span className="text-muted-foreground">Telefone:</span>
                                        <p className="font-medium">{selectedOrganizer.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="font-semibold mb-3">Endereço</h3>
                                <div className="text-sm space-y-1">
                                    <p>{selectedOrganizer.address_street}, {selectedOrganizer.address_number}</p>
                                    {selectedOrganizer.address_complement && <p>{selectedOrganizer.address_complement}</p>}
                                    <p>{selectedOrganizer.address_neighborhood}</p>
                                    <p>{selectedOrganizer.address_city} - {selectedOrganizer.address_state}</p>
                                    <p>CEP: {selectedOrganizer.address_zip}</p>
                                </div>
                            </div>

                            {/* Event Plans */}
                            <div>
                                <h3 className="font-semibold mb-3">Planos de Eventos</h3>
                                <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                                    {selectedOrganizer.event_plans}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t">
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        approveOrganizer(selectedOrganizer.id);
                                        setDetailsOpen(false);
                                    }}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Aprovar
                                </Button>
                                <Button
                                    className="flex-1"
                                    variant="destructive"
                                    onClick={() => {
                                        rejectOrganizer(selectedOrganizer.id);
                                        setDetailsOpen(false);
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Rejeitar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
