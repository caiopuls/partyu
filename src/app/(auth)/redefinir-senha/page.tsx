"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";

function RedefinirSenhaForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há token de recuperação
    const code = searchParams.get("code");
    if (!code) {
      setMessage({
        type: "error",
        text: "Link inválido ou expirado.",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "As senhas não coincidem.",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "A senha deve ter pelo menos 6 caracteres.",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Senha redefinida com sucesso! Redirecionando...",
      });

      setTimeout(() => {
        router.push("/entrar");
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao redefinir senha.";
      setMessage({
        type: "error",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                  minLength={6}
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    }>
      <RedefinirSenhaForm />
    </Suspense>
  );
}

