"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/footer";

export function FooterWrapper() {
    const pathname = usePathname();
    const isOrganizerOrAdmin = pathname?.startsWith("/organizer") || pathname?.startsWith("/admin");

    if (isOrganizerOrAdmin) {
        return null;
    }

    return <SiteFooter />;
}
