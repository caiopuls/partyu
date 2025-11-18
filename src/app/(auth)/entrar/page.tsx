"use client";

import { useState, Suspense } from "react";
import { z } from "zod";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextUrl = searchParams.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parse = loginSchema.safeParse(form);
    if (!parse.success) {
      setError(parse.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setIsLoading(false);

    if (authError) {
      console.error("Auth error:", authError);
      setError(authError.message || "Não foi possível entrar. Verifique os dados e tente novamente.");
      return;
    }

    router.push(nextUrl);
  }

  return (
    <Card className="w-full border-border/70 bg-card/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2 text-left">
          <h1 className="text-lg font-semibold tracking-tight">
            Entrar na sua conta PartyU
          </h1>
          <p className="text-xs text-muted-foreground">
            Acompanhe seus ingressos, revendas e saldo da carteira em um só
            lugar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground" htmlFor="email">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                className="h-9 pl-8 text-xs"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-medium text-foreground"
              htmlFor="password"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-9 pl-8 text-xs"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Ainda não tem conta?{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => router.push("/criar-conta")}
            >
              Criar conta
            </button>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Esqueceu sua senha?{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => router.push("/recuperar-senha")}
            >
              Recuperar senha
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="w-full border-border/70 bg-card/80">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  );
}


