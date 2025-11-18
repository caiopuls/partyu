"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NovoEventoPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [imageLinks, setImageLinks] = useState(["", "", ""]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formEl = e.currentTarget;
      const form = new FormData(formEl);
      // anexar links de imagem válidos
      imageLinks
        .map((s) => s.trim())
        .filter((s) => s)
        .forEach((l) => form.append("image_links[]", l));
      form.append("featured_index", String(featuredIndex));

      const res = await fetch("/api/events/create", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Falha ao criar evento");
        setSubmitting(false);
        return;
      }
      router.push(`/eventos/${data.id}`);
    } catch {
      alert("Erro ao criar evento");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Novo evento</h1>
      <Card>
        <CardContent className="space-y-4 p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3">
              <label className="text-sm text-muted-foreground">Título</label>
              <Input name="title" placeholder="Nome do evento" required />
            </div>
            <div className="grid gap-3">
              <label className="text-sm text-muted-foreground">Descrição</label>
              <textarea
                name="description"
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Detalhes do evento"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Cidade</label>
                <Input name="city" placeholder="São Paulo" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">UF</label>
                <Input name="state" placeholder="SP" maxLength={2} required />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Local</label>
                <Input name="venue" placeholder="Parque da Cidade" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Endereço</label>
                <Input name="address" placeholder="Av. Exemplo, 123" />
              </div>
            </div>
            <div className="grid gap-3">
              <label className="text-sm text-muted-foreground">Data do evento</label>
              <Input name="event_date" type="datetime-local" required />
            </div>
            <div className="grid gap-3">
              <label className="text-sm text-muted-foreground">Categoria</label>
              <Input name="category" placeholder="music" required />
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium">Imagens (até 3)</label>
              <input name="images" type="file" accept="image/*" multiple />
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">
                  Ou links das imagens (até 3)
                </label>
                {imageLinks.map((v, i) => (
                  <Input
                    key={i}
                    placeholder={`https://... (${i + 1})`}
                    value={v}
                    onChange={(e) => {
                      const arr = [...imageLinks];
                      arr[i] = e.target.value;
                      setImageLinks(arr);
                    }}
                  />
                ))}
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Imagem de destaque</label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={featuredIndex}
                  onChange={(e) => setFeaturedIndex(Number(e.target.value))}
                >
                  <option value={0}>Primeira</option>
                  <option value={1}>Segunda</option>
                  <option value={2}>Terceira</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Criando..." : "Criar evento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


