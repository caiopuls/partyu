"use server";

import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { createTransfer } from "@/lib/payments/openpix";

export async function approveWithdrawal(withdrawalId: string) {
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

    const serviceRole = createSupabaseServiceRoleClient();

    // Buscar dados do saque
    const { data: withdrawal } = await serviceRole
        .from("withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .single();

    if (!withdrawal) throw new Error("Withdrawal not found");

    if (withdrawal.status !== "pending") throw new Error("Withdrawal already processed");

    try {
        // Realizar transferência via OpenPix
        await createTransfer({
            value: Math.round(withdrawal.amount * 100), // Converter para centavos
            toPixKey: withdrawal.pix_key,
            correlationID: withdrawal.id,
        });

        // Atualizar status
        const { error } = await serviceRole
            .from("withdrawals")
            .update({ status: "completed" })
            .eq("id", withdrawalId);

        if (error) throw new Error("Failed to approve withdrawal");
    } catch (error) {
        console.error("Error processing withdrawal transfer:", error);
        throw new Error("Failed to process transfer. Check logs.");
    }

    revalidatePath("/admin/withdrawals");
}

export async function rejectWithdrawal(withdrawalId: string) {
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

    const serviceRole = createSupabaseServiceRoleClient();

    // Buscar saque para estornar valor
    const { data: withdrawal } = await serviceRole
        .from("withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .single();

    if (!withdrawal) throw new Error("Withdrawal not found");

    // Atualizar status
    const { error: updateError } = await serviceRole
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", withdrawalId);

    if (updateError) throw new Error("Failed to reject withdrawal");

    // Estornar saldo para a carteira
    const { data: wallet } = await serviceRole
        .from("wallets")
        .select("id, balance")
        .eq("user_id", withdrawal.user_id)
        .single();

    if (wallet) {
        await serviceRole
            .from("wallets")
            .update({ balance: wallet.balance + Number(withdrawal.amount) })
            .eq("id", wallet.id);

        await serviceRole.from("wallet_ledger").insert({
            wallet_id: wallet.id,
            user_id: withdrawal.user_id,
            amount: Number(withdrawal.amount),
            type: "refund",
            description: `Estorno de saque #${withdrawal.id.slice(0, 8)}`,
            reference_id: withdrawal.id,
        });
    }

    revalidatePath("/admin/withdrawals");
}
