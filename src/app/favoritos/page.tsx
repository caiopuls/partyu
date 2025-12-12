"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HeartOff } from "lucide-react";

// Minimal Event type for the card
interface Event {
    id: string;
    title: string;
    event_date: string;
    city?: string;
    state?: string;
    category?: string;
    featured_image_url?: string;
    banner_url?: string;
}

export default function FavoritosPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function loadFavorites() {
            try {
                const storedFavorites = localStorage.getItem("partyu_favorites");
                if (!storedFavorites) {
                    setLoading(false);
                    return;
                }

                const favoriteIds: string[] = JSON.parse(storedFavorites);

                if (favoriteIds.length === 0) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("events")
                    .select("id, title, event_date, city, state, category, featured_image_url, banner_url")
                    .in("id", favoriteIds)
                    .eq("status", "active"); // Optional: show only active events

                if (error) throw error;

                if (data) {
                    setEvents(data);
                }
            } catch (error) {
                console.error("Error loading favorites:", error);
            } finally {
                setLoading(false);
            }
        }

        loadFavorites();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F8F3] py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Favoritos</h1>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[16/9] bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-6">
                            <HeartOff className="h-10 w-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhum favorito ainda
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-md">
                            Você ainda não marcou nenhum evento como favorito. Explore os eventos e clique no coração para salvá-los aqui.
                        </p>
                        <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                            <Link href="/explorar">Explorar Eventos</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
