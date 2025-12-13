"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeroEventsCarouselProps {
    events: Event[];
}

function formatEventDate(dateString: string) {
    try {
        const date = new Date(dateString);
        return format(date, "EEEE, d 'de' MMM 'às' HH:mm", { locale: ptBR });
    } catch {
        return "";
    }
}

export function HeroEventsCarousel({ events }: HeroEventsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play: muda de slide a cada 5 segundos
    useEffect(() => {
        if (!isAutoPlaying || events.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % events.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, events.length]);

    const next = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const prev = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    if (events.length === 0) {
        return (
            <div className="aspect-[4/3] w-full rounded-3xl relative overflow-hidden bg-gray-200 flex items-center justify-center">
                <p className="text-gray-400">Nenhum evento disponível</p>
            </div>
        );
    }

    const currentEvent = events[currentIndex];

    return (
        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden group">
            {/* Event Image */}
            <Link href={`/eventos/${currentEvent.id}`} className="block h-full">
                <div className="relative w-full h-full">
                    {currentEvent.featured_image_url || currentEvent.banner_url ? (
                        <Image
                            src={currentEvent.featured_image_url || currentEvent.banner_url || ""}
                            alt={currentEvent.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority={currentIndex === 0}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h3 className="text-2xl font-bold mb-2">{currentEvent.title}</h3>
                                <p className="text-gray-300">{currentEvent.city}, {currentEvent.state}</p>
                            </div>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Event Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className="text-rose-400">
                                {formatEventDate(currentEvent.event_date)}
                            </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
                                {currentEvent.title}
                            </h2>
                            <p className="text-gray-200 text-sm md:text-base">
                                {currentEvent.city}, {currentEvent.state}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Navigation Arrows */}
            {events.length > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg z-10 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.preventDefault();
                            prev();
                        }}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg z-10 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.preventDefault();
                            next();
                        }}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </>
            )}

            {/* Dots Indicator */}
            {events.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                goToSlide(index);
                            }}
                            className={`transition-all rounded-full ${
                                index === currentIndex
                                    ? "bg-white w-8 h-2"
                                    : "bg-white/50 w-2 h-2 hover:bg-white/75"
                            }`}
                            aria-label={`Ir para slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

