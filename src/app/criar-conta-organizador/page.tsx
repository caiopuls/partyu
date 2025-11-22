import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizerRegistrationForm } from "@/components/organizer-registration-form-client";

export default async function BecomeOrganizerPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/entrar?next=/criar-conta-organizador");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile?.role === "organizer" && profile?.status === "approved") {
        redirect("/organizer/dashboard");
    }

    if (profile?.status === "pending") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Solicitação Enviada</CardTitle>
                        <CardDescription>
                            Sua solicitação para se tornar um organizador já foi enviada e está em análise.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <a href="/">Voltar para Home</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Torne-se um Organizador</CardTitle>
                    <CardDescription>
                        Preencha seus dados para começar a criar eventos na PartyU.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OrganizerRegistrationForm profile={profile} userId={user.id} />
                </CardContent>
            </Card>
        </div>
    );
}
