import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, MapPin } from "lucide-react";

import { getOrganizerById, getEventsByOrganizer } from "@/lib/supabase/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";

function formatEventDate(dateString: string) {
    try {
        const date = new Date(dateString);
        return format(date, "d 'de' MMM", { locale: ptBR });
    } catch {
        return "";
    }
}

export default async function OrganizerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const organizer = await getOrganizerById(id);

    if (!organizer) {
        notFound();
    }

    const events = await getEventsByOrganizer(id);

    return (
        <div className="min-h-screen bg-[#F8F8F3]">
            {/* Organizer Hero/Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                            {organizer.avatar_url ? (
                                <Image src={organizer.avatar_url} alt={organizer.full_name || "Organizador"} fill className="object-cover" />
                            ) : (
                                <span className="text-4xl md:text-5xl font-bold text-primary">
                                    {organizer.full_name?.charAt(0).toUpperCase() || "?"}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                                {organizer.full_name}
                            </h1>
                            {organizer.bio && (
                                <p className="text-gray-600 max-w-2xl text-lg">
                                    {organizer.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Feed */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Próximos eventos
                </h2>

                {events.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.map((event: Event, index: number) => (
                            <Link
                                key={event.id}
                                href={`/eventos/${event.id}`}
                                className="group block opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group-hover:shadow-primary/10">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                            src={event.banner_url || "/assets/card1.png"} // Fallback image if no banner
                                            alt={event.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                                            {format(new Date(event.event_date), "dd/MM")}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <Badge className="mb-3 bg-primary/10 text-primary border-0 hover:bg-primary/20 transition-colors">
                                            {event.category}
                                        </Badge>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>

                                        <div className="flex items-center text-gray-500 text-sm mb-4">
                                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                            <span className="line-clamp-1">{event.city}, {event.state}</span>
                                        </div>

                                        <Button className="w-full bg-gray-900 text-white font-bold rounded-lg group-hover:bg-primary transition-colors">
                                            Ver detalhes
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                            Este organizador não tem eventos próximos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
