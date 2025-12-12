"use client";

import { useState, useEffect } from "react";
import { Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Assuming sonner is used, or I'll use a simple alert if not sure. I'll check imports later or just use window.alert/simple feedback. Actually, I'll use standard alert for now to be safe or console.
// Re-checking imports: I don't see toast component usage in previous files. I'll stick to simple behavior or check if ui/toaster exists.
// I'll use a simple state change for Heart.

interface EventActionsProps {
    eventTitle: string;
    eventId: string;
}

export function EventActions({ eventTitle, eventId }: EventActionsProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const favorites = JSON.parse(localStorage.getItem("partyu_favorites") || "[]");
        setIsFavorite(favorites.includes(eventId));
    }, [eventId]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem("partyu_favorites") || "[]");
        let newFavorites;

        if (favorites.includes(eventId)) {
            newFavorites = favorites.filter((id: string) => id !== eventId);
            setIsFavorite(false);
        } else {
            newFavorites = [...favorites, eventId];
            setIsFavorite(true);
        }

        localStorage.setItem("partyu_favorites", JSON.stringify(newFavorites));
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventTitle,
                    text: `Confira este evento: ${eventTitle}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copiado para a área de transferência!");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    return (
        <div className="absolute top-6 right-6 flex gap-2 z-20">
            <Button
                size="icon"
                variant="outline"
                className="rounded-full bg-white/90 hover:bg-white border-none shadow-sm transition-all hover:scale-105"
                onClick={handleShare}
            >
                <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
            <Button
                size="icon"
                variant="outline"
                className={`rounded-full bg-white/90 hover:bg-white border-none shadow-sm transition-all hover:scale-105 ${isFavorite ? "text-red-500" : "text-gray-700"}`}
                onClick={toggleFavorite}
            >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
        </div>
    );
}
