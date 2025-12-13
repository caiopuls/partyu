"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, TicketPercent, User2, LogOut, Wallet, Ticket, Search, ArrowLeftRight, HelpCircle, Settings, ChevronDown, BadgeCheck, FileText, CreditCard, DollarSign, Heart, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/explorar", label: "Explorar eventos", icon: Search },
  { href: "/revenda", label: "Revenda", icon: ArrowLeftRight },
  { href: "/como-funciona", label: "Como funciona", icon: HelpCircle },
];

export function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function getUserRole() {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(data?.role || null);
      }
    }
    getUserRole();
  }, [user, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        const { data, error } = await supabase
          .from("events")
          .select("id, title, event_date, banner_url, city, state")
          .ilike("title", `%${searchQuery}%`)
          .eq("status", "active")
          .limit(5);

        if (!error && data) {
          setSearchResults(data);
          setShowResults(true);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/explorar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/10 bg-[#F8F8F3]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/assets/logoheader.svg" alt="Partyu Logo" width={120} height={32} className="h-8 w-auto" priority />
        </Link>

        {/* Search Bar Section (Center) */}
        <div className="hidden flex-1 max-w-xl md:flex text-sm px-8">
          <form onSubmit={handleSearch} className="relative w-full group">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Busque festas, eventos, shows..."
                className="w-full h-11 rounded-md border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none ring-offset-background placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true);
                }}
                onBlur={() => {
                  // Delay hiding to allow click on result
                  setTimeout(() => setShowResults(false), 200);
                }}
              />
            </div>

            {/* Real-time Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 divide-y divide-gray-50 overflow-hidden z-50">
                {searchResults.map((event) => (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                      {event.banner_url ? (
                        <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{event.title}</h4>
                      <p className="text-xs text-gray-500 truncate">
                        {format(new Date(event.event_date), "d 'de' MMM", { locale: ptBR })} • {event.city}/{event.state}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  type="submit"
                  className="w-full text-center px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors border-t border-gray-50"
                >
                  Ver todos os resultados
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Actions Section */}
        <nav className="flex items-center gap-6 text-sm font-medium text-black/80">
          <Link href="/explorar" className="hidden md:block transition-colors hover:text-primary">
            Eventos
          </Link>

          {/* Gerenciar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hidden md:flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group">
                <span>Gerenciar</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {/* Logic: If NOT logged in OR NOT producer (mocked as true for 'not producer' for now) */}
              {/* Replace 'true' with actual producer check later */}
              {role === "organizer" || role === "admin" ? (
                <Link href="/organizer/dashboard" className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">Acessar Painel</span>
                    <span className="block text-xs text-gray-500">Gerenciar Eventos</span>
                  </div>
                </Link>
              ) : (
                <Link href="/vender" className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                    <DollarSign className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">Venda na Partyu</span>
                  </div>
                </Link>
              )}
              <>
                <DropdownMenuItem asChild>
                  <Link href="/produtor/eventos" className="cursor-pointer">Meus Eventos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/produtor/criar" className="cursor-pointer">Criar Evento</Link>
                </DropdownMenuItem>
              </>

            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Account / Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group">
                  <span>Sua Conta</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white p-2">
                <DropdownMenuItem asChild>
                  <Link href="/meus-ingressos" className="flex items-center gap-3 cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-50">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span className="font-medium text-gray-700">Ingressos</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/minha-conta" className="flex items-center gap-3 cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-50">
                    <User2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-gray-700">Conta</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/favoritos" className="flex items-center gap-3 cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-50">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-medium text-gray-700">Favoritos</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-3 cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-50 bg-gray-50/50"
                >
                  <LogOut className="h-5 w-5 text-black" />
                  <span className="font-medium text-black">Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/entrar" className="flex items-center gap-1 hover:text-primary transition-colors">
                <span>Sua Conta</span>
                <ChevronDown className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white">
              {/* Mobile Menu Content - simplified for now */}
              <SheetHeader className="text-left">
                <SheetTitle className="text-primary font-bold text-xl">Partyu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link href="/explorar" className="text-lg font-medium">Eventos</Link>
                <Link href="/gerenciar" className="text-lg font-medium">Gerenciar</Link>
                <Link href="/entrar" className="text-lg font-medium">Sua Conta</Link>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
