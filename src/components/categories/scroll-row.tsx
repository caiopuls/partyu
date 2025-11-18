"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (dx: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollBy(-240)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-border/70 bg-background/90 p-2 shadow-sm backdrop-blur-md transition-colors hover:bg-background"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={ref} className="no-scrollbar flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-1 px-10">
        {children}
      </div>
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scrollBy(240)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-border/70 bg-background/90 p-2 shadow-sm backdrop-blur-md transition-colors hover:bg-background"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
