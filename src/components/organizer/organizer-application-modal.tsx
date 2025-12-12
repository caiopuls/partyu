"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    fullName: z.string().min(3, "Nome da empresa/organizador é obrigatório"),
    cpfCnpj: z.string().min(11, "CPF ou CNPJ inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    bio: z.string().min(10, "Conte um pouco sobre seus eventos"),
});

export function OrganizerApplicationModal({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            cpfCnpj: "",
            phone: "",
            bio: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Você precisa estar logado para se aplicar.");
            router.push("/entrar?next=/vender");
            return;
        }

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: values.fullName,
                    cpf_cnpj: values.cpfCnpj,
                    phone: values.phone,
                    bio: values.bio,
                    role: "organizer", // Automatically upgrading for now as requested "ir pra analise" usually implies waiting, but user said "onde vai para um modal... para preencher... para ir pra analise". I'll set role to 'organizer' or keep 'user' and set status 'pending'.
                    // Schema has 'status' TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')).
                    // And 'role'.
                    // I will set status to 'pending' and maybe role to 'organizer' so they can see the dashboard but explicitly 'pending'?
                    // Actually schema says: role TEXT DEFAULT 'user'.
                    // I'll update status to 'pending' and keep role as is, or set role to 'organizer' and status 'pending'.
                    // To access /organizer routes, they likely need 'organizer' role.
                    // I'll set role='organizer' and status='pending'.
                    status: "pending",
                    role: "organizer",
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Aplicação enviada com sucesso! Aguarde a análise.");
            setOpen(false);
            router.push("/minha-conta"); // Or dashboard
        } catch (error) {
            console.error("Error submitting application:", error);
            toast.error("Erro ao enviar aplicação.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Torne-se um Organizador</DialogTitle>
                    <DialogDescription>
                        Preencha seus dados para começar a vender ingressos na PartyU.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Organizador / Empresa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Party Events Ltda" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cpfCnpj"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CPF / CNPJ</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="000.000.000-00"
                                                {...field}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    if (value.length <= 11) {
                                                        // CPF Mask
                                                        value = value.replace(/(\d{3})(\d)/, "$1.$2");
                                                        value = value.replace(/(\d{3})(\d)/, "$1.$2");
                                                        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                                    } else {
                                                        // CNPJ Mask
                                                        value = value.replace(/^(\d{2})(\d)/, "$1.$2");
                                                        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
                                                        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
                                                        value = value.replace(/(\d{4})(\d)/, "$1-$2");
                                                    }
                                                    field.onChange(value);
                                                }}
                                                maxLength={18}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone / WhatsApp</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="(11) 99999-9999"
                                                {...field}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    value = value.replace(/^(\d{2})(\d)/, "($1) $2");
                                                    value = value.replace(/(\d{5})(\d)/, "$1-$2");
                                                    field.onChange(value);
                                                }}
                                                maxLength={15}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sobre o Organizador</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Conte um pouco sobre sua experiência e tipos de eventos..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Essa descrição aparecerá no seu perfil público.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                            Enviar para Análise
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
