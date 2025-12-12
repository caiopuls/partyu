"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventsCarouselProps {
    events: Event[];
}

function formatEventDate(dateString: string) {
    try {
        const date = new Date(dateString);
        return format(date, "d 'de' MMM", { locale: ptBR });
    } catch {
        return "";
    }
}

export function EventsCarousel({ events }: EventsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(events.length / itemsPerPage);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const visibleEvents = events.slice(
        currentIndex * itemsPerPage,
        (currentIndex + 1) * itemsPerPage
    );

    return (
        <div className="relative">
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
                {visibleEvents.map((event, index) => (
                    <Link
                        key={event.id}
                        href={`/eventos/${event.id}`}
                        className="group block animate-[fadeInUp_0.6s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex flex-col space-y-4">
                            {/* Image */}
                            <div className="aspect-[4/3] bg-gray-200 rounded-lg w-full relative overflow-hidden">
                                {event.featured_image_url || event.banner_url ? (
                                    <Image
                                        src={event.featured_image_url || event.banner_url || ""}
                                        alt={event.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-black flex items-center justify-center text-white/50 text-sm font-mono">
                                        Event Image
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-500 font-bold text-sm uppercase">
                                        {formatEventDate(event.event_date)}
                                    </span>
                                    <span className="text-green-500 font-bold text-xs uppercase tracking-wider">
                                        Revenda Disponível!
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-gray-900 leading-tight uppercase group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                    {event.title}
                                </h3>

                                <div className="text-gray-500 text-sm font-medium">
                                    {event.city}, {event.state}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Badge variant="secondary" className="bg-cyan-100/50 text-cyan-700 hover:bg-cyan-100 rounded-md font-bold border-0">
                                        {event.category || "Evento"}
                                    </Badge>
                                </div>

                                <div className="pt-2">
                                    <Button className="w-full bg-black cursor-pointer text-white hover:bg-gray-800 font-bold rounded-lg h-11 transition-all hover:scale-105">
                                        Comprar ingressos
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Navigation Arrows */}
            {totalPages > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white hover:bg-gray-50 shadow-lg z-10 transition-all hover:scale-110"
                        onClick={prev}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-white hover:bg-gray-50 shadow-lg z-10 transition-all hover:scale-110"
                        onClick={next}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </>
            )}

            {/* Dots Indicator */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-primary w-8" : "bg-gray-300"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
