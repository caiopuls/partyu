"use client";

import { useState } from "react";
import { z } from "zod";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("Informe um e-mail válido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((val) => val === true, {
      message: "É preciso aceitar os termos de uso",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false as boolean | undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({
      ...form,
      acceptedTerms: !!form.acceptedTerms,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError || !data.user) {
      setIsLoading(false);
      setError(signUpError?.message || "Não foi possível criar sua conta. Tente novamente.");
      return;
    }

    // Fazer login automático após criar a conta
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setIsLoading(false);

    if (signInError) {
      setError("Conta criada, mas não foi possível fazer login automaticamente. Tente fazer login manualmente.");
      router.push("/entrar");
      return;
    }

    router.push("/");
  }

  return (
    <Card className="w-full border-border/70 bg-card/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2 text-left">
          <h1 className="text-lg font-semibold tracking-tight">
            Criar conta PartyU
          </h1>
          <p className="text-xs text-muted-foreground">
            Centralize seus ingressos, revenda com segurança e receba em PIX.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground" htmlFor="name">
              Nome completo
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Como está no seu documento"
                autoComplete="name"
                className="h-9 pl-8 text-xs"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>

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
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="h-9 pl-8 text-xs"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-medium text-foreground"
                htmlFor="confirmPassword"
              >
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                className="h-9 text-xs"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5 h-3.5 w-3.5 rounded border-border/80 text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              checked={!!form.acceptedTerms}
              onChange={(e) =>
                setForm((f) => ({ ...f, acceptedTerms: e.target.checked }))
              }
            />
            <label
              htmlFor="terms"
              className="text-[11px] text-muted-foreground leading-relaxed"
            >
              Concordo com os{" "}
              <span className="font-medium text-primary underline-offset-2 hover:underline">
                Termos de uso
              </span>{" "}
              e a{" "}
              <span className="font-medium text-primary underline-offset-2 hover:underline">
                Política de privacidade
              </span>{" "}
              da PartyU.
            </label>
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
                Criando conta...
              </>
            ) : (
              <>
                Criar conta
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground">
          Já tem uma conta?{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => router.push("/entrar")}
          >
            Entrar
          </button>
        </p>
      </CardContent>
    </Card>
  );
}


