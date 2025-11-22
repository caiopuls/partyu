import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrganizerSidebar } from "@/components/organizer-sidebar";

export default async function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/entrar");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, status, full_name")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "organizer" && profile?.role !== "admin") {
        redirect("/criar-conta-organizador");
    }

    if (profile?.status !== "approved" && profile?.role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Conta em Análise</h1>
                    <p className="mt-2 text-gray-600">
                        Sua solicitação para se tornar um organizador está sendo analisada pela nossa equipe.
                        Você receberá um email assim que for aprovado.
                    </p>
                    <form action="/auth/signout" method="post" className="mt-6">
                        <button className="text-primary hover:underline">Sair e voltar para home</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <OrganizerSidebar
                user={{
                    full_name: profile?.full_name || undefined,
                    email: user.email || undefined,
                }}
            />
            <main className="flex-1 overflow-y-auto bg-background p-8">
                {children}
            </main>
        </div>
    );
}
