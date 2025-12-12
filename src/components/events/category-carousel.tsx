"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Music, Mic, PartyPopper, Theater, GraduationCap, Guitar, Radio, Headphones, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
    { name: "Todos", value: "", icon: PartyPopper },
    { name: "Shows", value: "Shows", icon: Mic },
    { name: "Festas", value: "Festas", icon: PartyPopper },
    { name: "Festivais", value: "Festivais", icon: Music },
    { name: "Teatro", value: "Teatro", icon: Theater },
    { name: "Universitário", value: "Universitário", icon: GraduationCap },
    { name: "Sertanejo", value: "Sertanejo", icon: Guitar },
    { name: "Eletrônica", value: "Eletrônica", icon: Radio },
    { name: "Trap & Rap", value: "Trap & Rap", icon: Headphones },
];

export function CategoryCarousel() {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("categoria") || "";
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="relative mb-8">
            {/* Left Arrow */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-50 shadow-md"
                onClick={() => scroll("left")}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide px-12"
            >
                <div className="flex gap-3 pb-2">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = currentCategory === category.value;

                        // Build query string preserving other params
                        const params = new URLSearchParams(searchParams.toString());
                        if (category.value) {
                            params.set("categoria", category.value);
                        } else {
                            params.delete("categoria");
                        }
                        const href = params.toString() ? `/explorar?${params.toString()}` : "/explorar";

                        return (
                            <Link
                                key={category.name}
                                href={href}
                                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap
                  transition-all duration-300 border-2 font-semibold text-sm
                  ${isActive
                                        ? "bg-primary text-white border-primary scale-105"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                                    }
                `}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />
                                <span>{category.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right Arrow */}
            <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-50 shadow-md"
                onClick={() => scroll("right")}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
