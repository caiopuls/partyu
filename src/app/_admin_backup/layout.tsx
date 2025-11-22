import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Wallet, LogOut } from "lucide-react";

export default async function AdminLayout({
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
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-primary">PartyU Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <Users className="h-5 w-5" />
                        Usuários
                    </Link>
                    <Link
                        href="/admin/withdrawals"
                        className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <Wallet className="h-5 w-5" />
                        Saques
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut className="h-5 w-5" />
                            Sair
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
