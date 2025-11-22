'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminNav() {
    return (
        <div className="flex flex-col w-64 border-r min-h-screen p-4 space-y-4">
            <div className="font-bold text-xl mb-6">Admin Panel</div>
            <nav className="flex flex-col space-y-2">
                <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start">
                        Dashboard
                    </Button>
                </Link>
                <Link href="/admin/users">
                    <Button variant="ghost" className="w-full justify-start">
                        Usuários
                    </Button>
                </Link>
                <Link href="/admin/withdrawals">
                    <Button variant="ghost" className="w-full justify-start">
                        Saques
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="ghost" className="w-full justify-start">
                        Voltar ao Site
                    </Button>
                </Link>
            </nav>
        </div>
    )
}
