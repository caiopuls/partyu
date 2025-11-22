"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="mb-2 text-3xl font-semibold">Ops! Algo deu errado</h1>
          <p className="mb-2 text-lg font-medium text-foreground">
            Ocorreu um erro inesperado
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            Tente novamente ou volte para a página inicial.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="rounded-full" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar para home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





