"use client";

import { useState } from "react";
import { z } from "zod";
import { Loader2, Mail, Lock, User, ArrowRight, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">

        {/* Signup Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              Criar conta grátis
            </h1>
            <p className="text-sm text-gray-600">
              Gerencie seus ingressos e revenda com segurança
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900" htmlFor="name">
                Nome completo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Como está no seu documento"
                  autoComplete="name"
                  className="h-12 pl-10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>

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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    className="h-12 pl-10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-gray-900"
                  htmlFor="confirmPassword"
                >
                  Confirmar senha
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className="h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={!!form.acceptedTerms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acceptedTerms: e.target.checked }))
                }
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 leading-relaxed"
              >
                Concordo com os{" "}
                <span className="font-semibold text-primary hover:underline cursor-pointer">
                  Termos de uso
                </span>{" "}
                e a{" "}
                <span className="font-semibold text-primary hover:underline cursor-pointer">
                  Política de privacidade
                </span>{" "}
                da Partyu.
              </label>
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
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                href="/entrar"
                className="font-bold text-primary hover:text-primary/80"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
