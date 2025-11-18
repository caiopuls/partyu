import { createSupabaseServerClient } from "./server";
import type { Event, EventTicketType } from "@/types/database";

export async function getEventsByRegion(
  city?: string,
  state?: string,
  limit = 20,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);

  if (city && state) {
    query = query.eq("city", city).eq("state", state);
  }

  const { data, error } = await query;

  if (error) {
    const err = error as { message?: string; details?: string; hint?: string; code?: string };
    console.error("Error fetching events:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
    });
    return [];
  }

  return data as Event[];
}

export async function getEventById(id: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error) {
    const err = error as { message?: string; details?: string; hint?: string; code?: string };
    console.error("Error fetching event:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
    });
    return null;
  }

  return data as Event;
}

export async function getEventTicketTypes(eventId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "active")
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching ticket types:", error);
    return [];
  }

  return data as EventTicketType[];
}

export async function getFeaturedEvents(limit = 5) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .gte("event_date", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured events:", error);
    return [];
  }

  return data as Event[];
}

export type EventFilters = {
  q?: string;
  category?: string;
  city?: string;
  state?: string;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  limit?: number;
};

export async function getEventsByFilters(filters: EventFilters) {
  const supabase = await createSupabaseServerClient();
  const {
    q,
    category,
    city,
    state,
    dateFrom,
    dateTo,
    limit = 50,
  } = filters;

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .order("event_date", { ascending: true })
    .limit(limit);

  if (q && q.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (city) {
    query = query.ilike("city", `%${city}%`);
  }
  if (state) {
    query = query.eq("state", state);
  }
  if (dateFrom) {
    query = query.gte("event_date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("event_date", dateTo);
  }

  const { data, error } = await query;
  if (error) {
    const err = error as { message?: string; details?: string; hint?: string; code?: string };
    console.error("Error fetching events with filters:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
    });
    return [] as Event[];
  }
  return data as Event[];
}

