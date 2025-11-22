"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAdminUsers } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, Search, Circle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface User {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: "user" | "admin" | "organizer";
    status?: string;
    last_ip?: string;
    last_seen_at?: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        full_name: "",
        phone: "",
        role: "user" as "user" | "admin" | "organizer",
        password: "",
    });

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, roleFilter, users]);

    async function fetchUsers() {
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Erro ao carregar usuários");
        }
        setLoading(false);
    }

    function filterUsers() {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    }

    async function createUser() {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: formData.email,
                password: formData.password,
                email_confirm: true,
            });

            if (authError) throw authError;

            // Update profile
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                })
                .eq("id", authData.user.id);

            if (profileError) throw profileError;

            toast.success("Usuário criado com sucesso!");
            setCreateModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            toast.error(`Erro ao criar usuário: ${error.message}`);
        }
    }

    async function updateUser() {
        if (!selectedUser) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                })
                .eq("id", selectedUser.id);

            if (error) throw error;

            toast.success("Usuário atualizado com sucesso!");
            setEditModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            toast.error(`Erro ao atualizar usuário: ${error.message}`);
        }
    }

    async function deleteUser() {
        if (!selectedUser) return;

        try {
            // Delete from auth
            const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id);
            if (authError) throw authError;

            toast.success("Usuário deletado com sucesso!");
            setDeleteModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(`Erro ao deletar usuário: ${error.message}`);
        }
    }

    function resetForm() {
        setFormData({
            email: "",
            full_name: "",
            phone: "",
            role: "user",
            password: "",
        });
        setSelectedUser(null);
    }

    function openEditModal(user: User) {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            full_name: user.full_name || "",
            phone: user.phone || "",
            role: user.role,
            password: "",
        });
        setEditModalOpen(true);
    }

    function isUserOnline(lastSeen?: string) {
        if (!lastSeen) return false;
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        return new Date(lastSeen) > fiveMinutesAgo;
    }

    if (loading) {
        return <div className="text-center">Carregando usuários...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
                    <p className="text-muted-foreground">
                        Gerencie todos os usuários da plataforma
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="organizer">Organizador</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Último IP</TableHead>
                            <TableHead>Última Atividade</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Circle
                                        className={`h-3 w-3 ${isUserOnline(user.last_seen_at)
                                            ? "fill-green-500 text-green-500"
                                            : "fill-gray-300 text-gray-300"
                                            }`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.role === "admin"
                                                ? "destructive"
                                                : user.role === "organizer"
                                                    ? "default"
                                                    : "secondary"
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    {user.last_ip || "—"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {user.last_seen_at
                                        ? formatDistanceToNow(new Date(user.last_seen_at), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })
                                        : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDetailsModalOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEditModal(user)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDeleteModalOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Create User Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo usuário
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Senha *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="full_name">Nome Completo</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuário</SelectItem>
                                    <SelectItem value="organizer">Organizador</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={createUser}>Criar Usuário</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Atualize os dados do usuário
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Email</Label>
                            <Input value={formData.email} disabled />
                        </div>
                        <div>
                            <Label htmlFor="edit_full_name">Nome Completo</Label>
                            <Input
                                id="edit_full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_phone">Telefone</Label>
                            <Input
                                id="edit_phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuário</SelectItem>
                                    <SelectItem value="organizer">Organizador</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={updateUser}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar o usuário <strong>{selectedUser?.full_name}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={deleteUser}>
                            Deletar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Usuário</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Nome:</span>
                                    <p className="font-medium">{selectedUser.full_name || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Telefone:</span>
                                    <p className="font-medium">{selectedUser.phone || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Role:</span>
                                    <p className="font-medium">{selectedUser.role}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <p className="font-medium">
                                        {isUserOnline(selectedUser.last_seen_at) ? (
                                            <Badge variant="default">Online</Badge>
                                        ) : (
                                            <Badge variant="secondary">Offline</Badge>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Último IP:</span>
                                    <p className="font-mono text-xs">{selectedUser.last_ip || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Última Atividade:</span>
                                    <p className="font-medium">
                                        {selectedUser.last_seen_at
                                            ? formatDistanceToNow(new Date(selectedUser.last_seen_at), {
                                                addSuffix: true,
                                                locale: ptBR,
                                            })
                                            : "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Cadastrado em:</span>
                                    <p className="font-medium">
                                        {new Date(selectedUser.created_at).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
