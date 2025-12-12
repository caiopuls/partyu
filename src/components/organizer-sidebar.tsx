"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    Ticket,
    Wallet,
    Settings,
    LogOut,
    BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
    { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
    { name: "Meus Eventos", href: "/organizer/eventos", icon: Calendar },
    { name: "Ingressos", href: "/organizer/ingressos", icon: Ticket },
    { name: "Relatórios", href: "/organizer/relatorios", icon: BarChart3 },
    { name: "Carteira", href: "/organizer/carteira", icon: Wallet },
    { name: "Configurações", href: "/organizer/configuracoes", icon: Settings },
];

interface OrganizerSidebarProps {
    user?: {
        full_name?: string;
        email?: string;
    };
}

export function OrganizerSidebar({ user }: OrganizerSidebarProps) {
    const pathname = usePathname();

    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "OR";

    return (
        <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-card">
            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="border-t p-4 space-y-2">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.full_name || "Organizador"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <LogOut className="h-5 w-5" />
                        Sair
                    </button>
                </form>
            </div>
        </aside>
    );
}
