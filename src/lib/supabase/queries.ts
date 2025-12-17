import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "./server";
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

export async function getOrganizerById(id: string) {
  // Use service role client to bypass RLS policies on profiles table
  // This allows public viewing of organizer profiles
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, bio, avatar_url")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching organizer:", error);
    return null;
  }

  return data;
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

  // Buscar todos os tipos de ingresso ativos
  const { data: allTicketTypes, error } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "active")
    .order("name", { ascending: true })
    .order("lot_number", { ascending: true });

  if (error) {
    console.error("Error fetching ticket types:", error);
    return [];
  }

  if (!allTicketTypes || allTicketTypes.length === 0) {
    return [];
  }

  // Agrupar por nome (categoria) e selecionar apenas o lote ativo
  // O lote ativo é o primeiro lote que ainda tem ingressos disponíveis
  const activeTicketTypes: EventTicketType[] = [];
  const categories = new Map<string, EventTicketType[]>();

  // Agrupar por categoria (name)
  for (const ticketType of allTicketTypes) {
    const category = ticketType.name;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(ticketType as EventTicketType);
  }

  // Para cada categoria, encontrar o lote ativo (primeiro que não está esgotado)
  for (const [category, lots] of categories) {
    // Ordenar lotes por lot_number (garantir que lot_number existe, default = 1)
    const sortedLots = lots.sort((a, b) => {
      const lotA = a.lot_number ?? 1; // Compatibilidade: eventos antigos podem ter null
      const lotB = b.lot_number ?? 1;
      return lotA - lotB;
    });
    
    // Se há apenas um lote (eventos antigos), retornar diretamente
    if (sortedLots.length === 1) {
      activeTicketTypes.push(sortedLots[0]);
      continue;
    }
    
    // Para múltiplos lotes: encontrar o primeiro lote que ainda tem ingressos disponíveis
    const activeLot = sortedLots.find(
      (lot) => (lot.sold_quantity ?? 0) < (lot.total_quantity ?? 0)
    );

    // Se encontrou um lote ativo, adicionar; senão, adicionar o último lote (esgotado)
    if (activeLot) {
      activeTicketTypes.push(activeLot);
    } else if (sortedLots.length > 0) {
      // Se todos estão esgotados, mostrar o último lote (para indicar que está esgotado)
      activeTicketTypes.push(sortedLots[sortedLots.length - 1]);
    }
  }

  // Ordenar por preço para exibição
  return activeTicketTypes.sort((a, b) => a.price - b.price);
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

export async function getEventsByOrganizer(organizerId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", organizerId)
    .eq("status", "active")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching organizer events:", error);
    return [];
  }

  return data as Event[];
}

