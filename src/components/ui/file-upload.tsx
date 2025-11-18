"use client";

import { useState } from "react";
import { Button } from "./button";

type Props = {
  eventId: string;
  onUploaded?: (url: string) => void;
};

export function FileUpload({ eventId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("event_id", eventId);
      form.append("image", file);
      const res = await fetch("/api/events/upload-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Falha no upload");
      } else {
        onUploaded?.(data.url);
        alert("Imagem enviada com sucesso!");
      }
    } catch (e) {
      alert("Erro ao enviar imagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button size="sm" onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Enviando..." : "Enviar"}
      </Button>
    </div>
  );
}


