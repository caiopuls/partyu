"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, TicketPercent, User2, LogOut, Wallet, Ticket, Search, ArrowLeftRight, HelpCircle, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/explorar", label: "Explorar eventos", icon: Search },
  { href: "/revenda", label: "Revenda", icon: ArrowLeftRight },
  { href: "/como-funciona", label: "Como funciona", icon: HelpCircle },
];

export function SiteHeader() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 min-w-fit">
          <Image
            src="/logo-partyu.svg"
            alt="PartyU"
            width={120}
            height={36}
            className="h-9 w-[120px] object-contain flex-shrink-0"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-base text-muted-foreground md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 items-center gap-2 rounded-full border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary md:inline-flex"
            asChild
          >
            <Link href="/anunciar">
              <TicketPercent className="h-4 w-4" />
              Anunciar ingresso
            </Link>
          </Button>

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-9 w-9 rounded-full md:inline-flex"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/minha-conta" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Minha conta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/meus-ingressos" className="cursor-pointer">
                    <Ticket className="mr-2 h-4 w-4" />
                    Meus ingressos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/minha-carteira" className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    Minha carteira
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="hidden h-9 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 md:inline-flex"
              asChild
            >
              <Link href="/entrar">
                <User2 className="mr-1.5 h-4 w-4" />
                Entrar / criar conta
              </Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="inline-flex h-9 w-9 rounded-full border-border/70 md:hidden"
                aria-label="Abrir menu"
                suppressHydrationWarning
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader className="mb-4 mt-2 items-start text-left px-3.5 sm:px-5">
                  <SheetTitle className="flex items-center gap-2 -ml-1">
                    <Image
                      src="/logo-partyu.svg"
                      alt="PartyU"
                      width={100}
                      height={30}
                      className="h-7 w-auto object-contain"
                      priority
                    />
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Sua carteira digital de ingressos para festas, shows e
                    festivais.
                  </p>
                </SheetHeader>

                <div className="flex flex-col gap-4 px-3.5 sm:px-5">
                  <nav className="flex flex-col gap-2 text-base">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-2 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="h-9 justify-start gap-2 rounded-full border-primary/30 px-2.5 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary"
                      asChild
                    >
                      <Link href="/anunciar">
                        <TicketPercent className="h-4 w-4" />
                        Anunciar ingresso
                      </Link>
                    </Button>
                    {isAuthenticated && user ? (
                      <>
                        <Button
                          variant="ghost"
                          className="h-9 justify-start gap-2 rounded-full px-2.5 text-sm font-medium"
                          asChild
                        >
                          <Link href="/minha-conta">
                            <Settings className="h-4 w-4" />
                            Minha conta
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 justify-start gap-2 rounded-full px-2.5 text-sm font-medium"
                          asChild
                        >
                          <Link href="/meus-ingressos">
                            <Ticket className="h-4 w-4" />
                            Meus ingressos
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 justify-start gap-2 rounded-full px-2.5 text-sm font-medium"
                          asChild
                        >
                          <Link href="/minha-carteira">
                            <Wallet className="h-4 w-4" />
                            Minha carteira
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 justify-start gap-2 rounded-full px-2.5 text-sm font-medium text-destructive"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="h-9 justify-start gap-2 rounded-full bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        asChild
                      >
                        <Link href="/entrar">
                          <User2 className="h-4 w-4" />
                          Entrar / criar conta
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}


