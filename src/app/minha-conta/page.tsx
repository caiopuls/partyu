"use client";

import { useEffect, useMemo, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

type ProfileForm = {
  full_name: string;
  avatar_url: string;
  phone: string;
  bio: string;
};

export default function MinhaContaPage() {
  const supabase = createSupabaseBrowserClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    avatar_url: "",
    phone: "",
    bio: "",
  });

  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/entrar");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!user) return;
    setEmailValue(user.email || "");

    const loadProfile = async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, phone, bio")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setProfileForm({
          full_name: data.full_name ?? "",
          avatar_url: data.avatar_url ?? "",
          phone: data.phone ?? "",
          bio: (data as { bio?: string }).bio ?? "",
        });
      }
      setLoadingProfile(false);
    };
    void loadProfile();
  }, [user, supabase]);

  const avatarFallback = useMemo(() => {
    if (!emailValue) return "U";
    return emailValue.split("@")[0].slice(0, 2).toUpperCase();
  }, [emailValue]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name || null,
        avatar_url: profileForm.avatar_url || null,
        phone: profileForm.phone || null,
        bio: profileForm.bio || null,
      })
      .eq("id", user.id);
    setSavingProfile(false);
    if (!error) {
      router.refresh();
      alert("Perfil atualizado com sucesso!");
    } else {
      alert("Erro ao salvar perfil: " + (error.message || "Tente novamente"));
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: emailValue });
    setSavingEmail(false);
    if (!error) {
      alert("Email atualizado! Verifique sua caixa de entrada para confirmar a mudança.");
    } else {
      alert("Erro ao atualizar email: " + (error.message || "Tente novamente"));
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (passwordValue.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordValue });
    setSavingPassword(false);
    if (!error) {
      setPasswordValue("");
      alert("Senha atualizada com sucesso.");
    } else {
      alert("Erro ao atualizar senha: " + (error.message || "Tente novamente"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Minha conta</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados do perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {/* Nota: este AvatarFallback é básico; substitua por Preview de imagem se desejar */}
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {avatarFallback}
                  </div>
                </Avatar>
                <Input
                  placeholder="URL da foto de perfil"
                  value={profileForm.avatar_url}
                  onChange={(e) => setProfileForm((s) => ({ ...s, avatar_url: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Nome completo</label>
                <Input
                  placeholder="Seu nome"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm((s) => ({ ...s, full_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Telefone</label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Bio</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={5}
                  placeholder="Fale um pouco sobre você..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((s) => ({ ...s, bio: e.target.value }))}
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={savingProfile || loadingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar email</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleEmailSave}>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={savingEmail}>
                  {savingEmail ? "Atualizando..." : "Atualizar email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alterar senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePasswordSave}>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Nova senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? "Atualizando..." : "Atualizar senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


