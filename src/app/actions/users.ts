"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveOrganizer(userId: string) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verificar se é admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") throw new Error("Unauthorized");

    // Atualizar status
    const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", role: "organizer" })
        .eq("id", userId);

    if (error) throw new Error("Failed to approve organizer");

    revalidatePath("/admin/users");
}

export async function rejectOrganizer(userId: string) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verificar se é admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") throw new Error("Unauthorized");

    // Atualizar status
    const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected", role: "user" }) // Reverte para user comum
        .eq("id", userId);

    if (error) throw new Error("Failed to reject organizer");

    revalidatePath("/admin/users");
}
