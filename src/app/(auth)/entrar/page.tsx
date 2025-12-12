"use client";

import { useState, Suspense } from "react";
import { z } from "zod";
import { Loader2, Mail, Lock, ArrowRight, PartyPopper } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-sm text-gray-600">
              Entre para acessar seus ingressos e carteira
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  className="h-12 pl-10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-gray-900"
                htmlFor="password"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 pl-10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/recuperar-senha"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="flex w-full items-center cursor-pointer justify-center gap-2 h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem conta?{" "}
              <Link
                href="/criar-conta"
                className="font-bold text-primary hover:text-primary/80"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8F3] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
