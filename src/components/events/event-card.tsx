import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
    id: string;
    title: string;
    event_date: string;
    city?: string; // Optional in DB?
    state?: string;
    category?: string;
    featured_image_url?: string;
    banner_url?: string;
    [key: string]: any; // safer
}

interface EventCardProps {
    event: Event;
    index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
    function formatEventDate(dateString: string) {
        try {
            const date = new Date(dateString);
            return format(date, "d 'de' MMM", { locale: ptBR });
        } catch {
            return "";
        }
    }

    return (
        <Link
            href={`/eventos/${event.id}`}
            className="group block opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex flex-col gap-3">
                {/* Card Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm border border-black/5">
                    {(event.featured_image_url || event.banner_url) ? (
                        <Image
                            src={event.featured_image_url || event.banner_url || ""}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                            <span className="text-xs">Sem imagem</span>
                        </div>
                    )}
                </div>

                {/* Card Content */}
                <div className="space-y-1">
                    <div className="text-rose-500 font-bold text-xs uppercase tracking-wide">
                        {formatEventDate(event.event_date)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                    </h3>
                    <div className="text-gray-500 text-xs font-medium truncate">
                        {event.city ? `${event.city}/${event.state}` : "Local não informado"} • {event.category || "Geral"}
                    </div>
                </div>
            </div>
        </Link>
    );
}
