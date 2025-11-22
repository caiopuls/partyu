"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function OrganizerRegistrationForm({ profile, userId }: { profile: any; userId: string }) {
    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        const updateData: any = {
            role: "organizer",
            status: "pending",
            person_type: formData.get("person_type"),
            cpf_cnpj: formData.get("cpf_cnpj"),
            phone: formData.get("phone"),
            event_plans: formData.get("event_plans"),
            address_street: formData.get("address_street"),
            address_number: formData.get("address_number"),
            address_complement: formData.get("address_complement") || null,
            address_neighborhood: formData.get("address_neighborhood"),
            address_city: formData.get("address_city"),
            address_state: formData.get("address_state"),
            address_zip: formData.get("address_zip"),
        };

        // Add PJ-specific fields if jurídica
        if (formData.get("person_type") === "pj") {
            updateData.company_name = formData.get("company_name");
            updateData.responsible_person = formData.get("responsible_person");
        }

        console.log("Attempting to update profile with data:", updateData);

        const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", userId);

        if (error) {
            console.error("Error submitting organizer request:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            console.error("Update data:", JSON.stringify(updateData, null, 2));
            alert(`Erro ao enviar solicitação: ${error.message || JSON.stringify(error)}\n\nProvavelmente as colunas ainda não existem no banco de dados. Por favor, execute as migrations ou adicione as colunas manualmente na tabela profiles do Supabase.`);
            setIsSubmitting(false);
            return;
        }

        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Person Type Selection */}
            <div className="space-y-3">
                <Label>Tipo de Pessoa</Label>
                <RadioGroup defaultValue="pf" name="person_type" onValueChange={(v) => setPersonType(v as "pf" | "pj")}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pf" id="pf" />
                        <Label htmlFor="pf" className="font-normal cursor-pointer">
                            Pessoa Física (CPF)
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pj" id="pj" />
                        <Label htmlFor="pj" className="font-normal cursor-pointer">
                            Pessoa Jurídica (CNPJ)
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* PJ-specific fields */}
            {personType === "pj" && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Razão Social</Label>
                        <Input id="company_name" name="company_name" required placeholder="Nome da empresa" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="responsible_person">Nome do Responsável</Label>
                        <Input id="responsible_person" name="responsible_person" required placeholder="Nome completo do responsável" />
                    </div>
                </>
            )}

            {/* CPF/CNPJ */}
            <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">{personType === "pf" ? "CPF" : "CNPJ"}</Label>
                <Input
                    id="cpf_cnpj"
                    name="cpf_cnpj"
                    required
                    placeholder={personType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                />
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="(00) 00000-0000"
                    defaultValue={profile?.phone || ""}
                />
            </div>

            {/* Event Plans */}
            <div className="space-y-2">
                <Label htmlFor="event_plans">Que tipo de eventos você pretende organizar?</Label>
                <textarea
                    id="event_plans"
                    name="event_plans"
                    required
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descreva os tipos de eventos que você planeja criar (festas, shows, workshops, etc.)"
                />
            </div>

            {/* Address Fields */}
            <div className="space-y-2">
                <Label htmlFor="address_zip">CEP</Label>
                <Input id="address_zip" name="address_zip" required placeholder="00000-000" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="address_street">Rua</Label>
                    <Input id="address_street" name="address_street" required placeholder="Nome da rua" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address_number">Número</Label>
                    <Input id="address_number" name="address_number" required placeholder="123" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento (opcional)</Label>
                <Input id="address_complement" name="address_complement" placeholder="Apto, sala, etc" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input id="address_neighborhood" name="address_neighborhood" required placeholder="Nome do bairro" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="address_city">Cidade</Label>
                    <Input id="address_city" name="address_city" required placeholder="Nome da cidade" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address_state">Estado</Label>
                    <Select name="address_state" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AC">AC</SelectItem>
                            <SelectItem value="AL">AL</SelectItem>
                            <SelectItem value="AP">AP</SelectItem>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="BA">BA</SelectItem>
                            <SelectItem value="CE">CE</SelectItem>
                            <SelectItem value="DF">DF</SelectItem>
                            <SelectItem value="ES">ES</SelectItem>
                            <SelectItem value="GO">GO</SelectItem>
                            <SelectItem value="MA">MA</SelectItem>
                            <SelectItem value="MT">MT</SelectItem>
                            <SelectItem value="MS">MS</SelectItem>
                            <SelectItem value="MG">MG</SelectItem>
                            <SelectItem value="PA">PA</SelectItem>
                            <SelectItem value="PB">PB</SelectItem>
                            <SelectItem value="PR">PR</SelectItem>
                            <SelectItem value="PE">PE</SelectItem>
                            <SelectItem value="PI">PI</SelectItem>
                            <SelectItem value="RJ">RJ</SelectItem>
                            <SelectItem value="RN">RN</SelectItem>
                            <SelectItem value="RS">RS</SelectItem>
                            <SelectItem value="RO">RO</SelectItem>
                            <SelectItem value="RR">RR</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="SP">SP</SelectItem>
                            <SelectItem value="SE">SE</SelectItem>
                            <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </Button>
        </form>
    );
}
