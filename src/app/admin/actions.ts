"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: "user" | "admin" | "organizer";
    status?: string;
    last_ip?: string;
    last_seen_at?: string;
    created_at: string;
}

export interface AdminOrganizerRequest {
    id: string;
    full_name: string;
    email: string;
    person_type: "pf" | "pj";
    cpf_cnpj: string;
    company_name?: string;
    responsible_person?: string;
    phone: string;
    event_plans: string;
    address_street: string;
    address_number: string;
    address_complement?: string;
    address_neighborhood: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    created_at: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
    const supabase = createSupabaseServiceRoleClient();

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch all auth users (handling pagination if necessary, but starting with a large limit)
    // Supabase listUsers defaults to 50. We'll ask for more.
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 10000,
    });

    if (authError) throw authError;

    // Merge data
    const enrichedUsers = profiles.map((profile) => {
        const authUser = authUsers.find((u) => u.id === profile.id);
        return {
            ...profile,
            email: authUser?.email || "N/A",
            last_ip: authUser?.last_sign_in_ip, // Assuming we want this if available
        };
    });

    return enrichedUsers as AdminUser[];
}

export async function getAdminOrganizers(): Promise<AdminOrganizerRequest[]> {
    const supabase = createSupabaseServiceRoleClient();

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "organizer")
        .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 10000,
    });

    const enrichedData = profiles.map((org) => {
        const authUser = authUsers.find((u) => u.id === org.id);
        return {
            ...org,
            email: authUser?.email || "N/A",
        };
    });

    return enrichedData as AdminOrganizerRequest[];
}

export async function getDashboardMetrics() {
    const supabase = createSupabaseServiceRoleClient();

    // Parallelize independent fetches for performance
    const [
        { count: totalUsers },
        { count: newUsers30d },
        { count: totalOrganizers },
        { count: pendingOrganizers },
        { count: activeEvents },
        { count: usersOnline },
        { data: allPaidOrders },
    ] = await Promise.all([
        // Total users
        supabase.from("profiles").select("*", { count: "exact", head: true }),

        // New users 30d
        supabase.from("profiles").select("*", { count: "exact", head: true })
            .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

        // Total organizers
        supabase.from("profiles").select("*", { count: "exact", head: true })
            .eq("role", "organizer").eq("status", "approved"),

        // Pending organizers
        supabase.from("profiles").select("*", { count: "exact", head: true })
            .eq("role", "organizer").eq("status", "pending"),

        // Active events
        supabase.from("events").select("*", { count: "exact", head: true })
            .eq("status", "active"),

        // Users online (5 min)
        supabase.from("profiles").select("*", { count: "exact", head: true })
            .gte("last_seen_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()),

        // All paid orders for revenue calcs
        supabase.from("orders").select("total_amount, created_at, user_id, profiles!inner(created_at)")
            .eq("status", "paid"),
    ]);

    const orders = allPaidOrders || [];

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    // MRR (This month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const mrrOrders = orders.filter(o => new Date(o.created_at) >= firstDayOfMonth);
    const mrr = mrrOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    // NMRR (Revenue from new users this month)
    // Note: We need to check if the user was created this month. 
    // The query included profiles!inner(created_at), so we have access to it.
    // However, the type might be tricky. Let's assume the join worked.
    const nmrrOrders = orders.filter(o => {
        // @ts-ignore - Supabase join typing can be loose
        const userCreatedAt = new Date(o.profiles?.created_at);
        return userCreatedAt >= firstDayOfMonth;
    });
    const nmrr = nmrrOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    return {
        totalUsers: totalUsers || 0,
        newUsers30d: newUsers30d || 0,
        totalOrganizers: totalOrganizers || 0,
        pendingOrganizers: pendingOrganizers || 0,
        activeEvents: activeEvents || 0,
        totalRevenue: totalRevenue / 100,
        mrr: mrr / 100,
        nmrr: nmrr / 100,
        usersOnline: usersOnline || 0,
    };
}

export async function getDashboardCharts() {
    const supabase = createSupabaseServiceRoleClient();
    const days = 30;
    const salesByDay = [];
    const newUsersByDay = [];

    // We can optimize this by fetching all data once and aggregating in JS, 
    // instead of 60 queries.

    const startDate = subDays(new Date(), days);

    // Fetch all paid orders in range
    const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("status", "paid")
        .gte("created_at", startDate.toISOString());

    // Fetch all new users in range
    const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Aggregate Sales
        const dayOrders = orders?.filter(o => {
            const d = new Date(o.created_at);
            return d >= dayStart && d <= dayEnd;
        }) || [];
        const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

        salesByDay.push({
            date: format(date, "dd/MM", { locale: ptBR }),
            revenue: dayRevenue / 100,
        });

        // Aggregate Users
        const dayUsers = profiles?.filter(p => {
            const d = new Date(p.created_at);
            return d >= dayStart && d <= dayEnd;
        }) || [];

        newUsersByDay.push({
            date: format(date, "dd/MM", { locale: ptBR }),
            users: dayUsers.length,
        });
    }

    return {
        salesData: salesByDay,
    };
}

export interface AdminEvent {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    status: string;
    image_url?: string;
    organizer_id: string;
    organizer_name: string;
    organizer_email: string;
    tickets_sold: number;
    total_revenue: number;
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
    const supabase = createSupabaseServiceRoleClient();

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

    if (eventsError) throw eventsError;

    // Fetch profiles for organizer names
    const organizerIds = [...new Set(events.map(e => e.organizer_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", organizerIds);

    // Fetch auth users for emails
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 10000,
    });

    // Fetch sales stats (tickets sold and revenue)
    const { data: tickets } = await supabase
        .from("user_tickets")
        .select("id, status, ticket_type_id, event_ticket_types!inner(event_id, price)");

    // Aggregate stats
    const statsByEvent: Record<string, { sold: number, revenue: number }> = {};

    tickets?.forEach((t: any) => {
        if (t.status === 'active' || t.status === 'used') { // Assuming these are "sold" statuses
            const eventId = t.event_ticket_types.event_id;
            if (!statsByEvent[eventId]) {
                statsByEvent[eventId] = { sold: 0, revenue: 0 };
            }
            statsByEvent[eventId].sold += 1;
            statsByEvent[eventId].revenue += (t.event_ticket_types.price || 0);
        }
    });

    const enrichedEvents = events.map((event) => {
        const organizerProfile = profiles?.find(p => p.id === event.organizer_id);
        const organizerAuth = authUsers.find(u => u.id === event.organizer_id);
        const stats = statsByEvent[event.id] || { sold: 0, revenue: 0 };

        return {
            ...event,
            organizer_name: organizerProfile?.full_name || "Unknown",
            organizer_email: organizerAuth?.email || "N/A",
            tickets_sold: stats.sold,
            total_revenue: stats.revenue,
        };
    });

    return enrichedEvents;
}

export async function updateAdminEvent(id: string, data: Partial<AdminEvent>) {
    const supabase = createSupabaseServiceRoleClient();

    const { error } = await supabase
        .from("events")
        .update({
            title: data.title,
            description: data.description,
            event_date: data.event_date,
            location: data.location,
            status: data.status,
            image_url: data.image_url,
        })
        .eq("id", id);

    if (error) throw error;
}

export async function deleteAdminEvent(id: string) {
    const supabase = createSupabaseServiceRoleClient();

    const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

    if (error) throw error;
}
