"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/page-header";
import { apiRequest } from "@/lib/api";
import { Building, Camera, KeyRound, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const blankProfile = { username: "", name: "", email: "", phone: "", city: "", avatarUrl: "", passwordUpdatedAt: null };

export default function ProfilePage() {
  const [profile, setProfile] = useState(blankProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const imageInput = useRef(null);

  useEffect(() => {
    apiRequest("/auth/me")
      .then(setProfile)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setProfileLoading(false));
  }, []);

  async function uploadAvatar(file) {
    if (!file) return;
    setUploadingImage(true);
    setProfileMessage("");
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("scope", "admin");
      const response = await fetch("/api/product-images", { method: "POST", body, credentials: "same-origin" });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "La photo n’a pas pu être importée.");
      setProfile((current) => ({ ...current, avatarUrl: result.imageUrl }));
      setProfileMessage("Photo importée. Enregistre le profil pour la conserver.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingImage(false);
      if (imageInput.current) imageInput.current.value = "";
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setProfileMessage("");
    try {
      const saved = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || null,
          city: profile.city || null,
          avatarUrl: profile.avatarUrl || null,
        }),
      });
      setProfile(saved);
      setProfileMessage("Profil enregistré.");
      window.dispatchEvent(new Event("admin-profile-updated"));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    setPasswordMessage("");
    if (password.newPassword !== password.confirmPassword) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setChangingPassword(true);
    try {
      await apiRequest("/auth/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: password.currentPassword, newPassword: password.newPassword }),
      });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Mot de passe modifié.");
      setProfile((current) => ({ ...current, passwordUpdatedAt: new Date().toISOString() }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setChangingPassword(false);
    }
  }

  const initials = profile.name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2) || "AD";

  return (
    <>
      <PageHeader title="Profil" description="Gérez les coordonnées et la sécurité du compte administrateur.">
        <Button type="submit" form="admin-profile-form" disabled={savingProfile || profileLoading} className="bg-foreground text-background hover:bg-foreground/90">
          {savingProfile ? "Enregistrement…" : "Enregistrer le profil"}
        </Button>
      </PageHeader>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
      {profileMessage && <p role="status" className="mb-4 text-sm text-green-700">{profileMessage}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="size-24">
                  <AvatarImage src={profile.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" aria-label="Importer la photo du profil" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
                <button type="button" title="Importer une photo" aria-label="Importer une photo" disabled={uploadingImage} onClick={() => imageInput.current?.click()} className="absolute bottom-0 right-0 grid size-9 place-items-center bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-semibold">{profileLoading ? "Chargement…" : profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge className="mt-2 bg-[var(--color-accent)] text-foreground">Administrateur</Badge>
              <div className="mt-6 w-full space-y-4 border-t border-border pt-5 text-left">
                <p className="flex items-center gap-3 text-sm"><KeyRound size={16} className="text-muted-foreground" />{profile.username}</p>
                <p className="flex items-center gap-3 text-sm"><Phone size={16} className="text-muted-foreground" />{profile.phone || "Téléphone non renseigné"}</p>
                <p className="flex items-center gap-3 text-sm"><MapPin size={16} className="text-muted-foreground" />{profile.city || "Ville non renseignée"}</p>
                <p className="flex items-center gap-3 text-sm"><Building size={16} className="text-muted-foreground" />Shop Mada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-base font-medium">Informations personnelles</CardTitle></CardHeader>
            <CardContent>
              <form id="admin-profile-form" onSubmit={saveProfile} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="admin-name">Nom complet</Label><Input id="admin-name" required maxLength={140} value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="admin-email">Adresse e-mail</Label><Input id="admin-email" required type="email" maxLength={180} value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="admin-phone">Téléphone</Label><Input id="admin-phone" type="tel" maxLength={40} value={profile.phone || ""} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="admin-city">Ville</Label><Input id="admin-city" maxLength={100} value={profile.city || ""} onChange={(event) => setProfile({ ...profile, city: event.target.value })} /></div>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={14} />L’adresse e-mail est enregistrée sur le compte administrateur.</p>
              </form>
            </CardContent>
          </Card>

          <Card id="security" className="border-border bg-card">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base font-medium"><ShieldCheck size={17} />Sécurité du compte</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={changePassword} className="space-y-3">
                <p className="text-sm font-medium">Changer le mot de passe</p>
                <Input required type="password" autoComplete="current-password" placeholder="Mot de passe actuel" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input required minLength={12} type="password" autoComplete="new-password" placeholder="Nouveau (12 caractères minimum)" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} />
                  <Input required minLength={12} type="password" autoComplete="new-password" placeholder="Confirmer le nouveau mot de passe" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">{profile.passwordUpdatedAt ? `Dernière modification : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(profile.passwordUpdatedAt))}` : "Mot de passe haché et vérifié côté serveur"}</p>
                  <Button type="submit" variant="outline" disabled={changingPassword}>{changingPassword ? "Modification…" : "Modifier le mot de passe"}</Button>
                </div>
                {passwordMessage && <p role="status" className="text-sm text-green-700">{passwordMessage}</p>}
              </form>
              <div className="flex items-center gap-3 border-t border-border pt-4 text-sm text-muted-foreground"><ShieldCheck size={17} />Session protégée par cookie HttpOnly.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
