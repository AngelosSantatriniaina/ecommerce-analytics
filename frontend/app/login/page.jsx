"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [setupRequired, setSetupRequired] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({ username: "", name: "", email: "", password: "" });

  useEffect(() => {
    apiRequest("/auth/me")
      .then(() => router.replace("/"))
      .catch(() => apiRequest("/auth/status")
        .then((status) => setSetupRequired(status.setupRequired))
        .catch((requestError) => setError(requestError.message)));
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (setupRequired) {
        await apiRequest("/auth/setup", {
          method: "POST",
          body: JSON.stringify({
            username: credentials.username,
            name: credentials.name,
            email: credentials.email,
            password: credentials.password,
          }),
        });
      }
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: credentials.username, password: credentials.password }),
      });
      router.replace("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f5f0] lg:grid-cols-[minmax(0,1fr)_460px]">
      <section className="hidden flex-col justify-between bg-[#244b3b] p-12 text-white lg:flex">
        <div className="flex items-center gap-3 text-lg font-semibold"><Store size={22} /> Shop Mada</div>
        <div className="max-w-xl">
          <p className="mb-4 text-sm text-white/70">Espace administration</p>
          <h1 className="text-4xl font-semibold leading-tight">Gérez votre activité, en toute sécurité.</h1>
        </div>
        <p className="text-xs text-white/60">Shop Mada Analytics</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center bg-[#244b3b] text-white"><Store size={20} /></span><span className="font-semibold">Shop Mada</span></div>
          <div className="mb-8 grid size-12 place-items-center bg-white text-[#244b3b] shadow-sm"><LockKeyhole size={20} /></div>
          <p className="text-sm font-medium text-[#64806a]">Administration</p>
          <h2 className="mt-1 text-2xl font-semibold">{setupRequired ? "Créer le compte admin" : "Connexion"}</h2>
          <p className="mt-2 text-sm text-[#687168]">
            {setupRequired === null ? "Vérification…" : setupRequired ? "Première utilisation : crée ton compte administrateur." : "Connecte-toi pour accéder au tableau de bord."}
          </p>

          {setupRequired !== null && (
            <form onSubmit={submit} className="mt-7 space-y-4">
              {setupRequired && <>
                <label className="block space-y-1.5 text-sm font-medium">Nom complet<Input required maxLength={140} value={credentials.name} onChange={(event) => setCredentials({ ...credentials, name: event.target.value })} autoComplete="name" /></label>
                <label className="block space-y-1.5 text-sm font-medium">Adresse e-mail<Input required type="email" maxLength={180} value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} autoComplete="email" /></label>
              </>}
              <label className="block space-y-1.5 text-sm font-medium">Identifiant<Input required minLength={3} maxLength={80} value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} autoComplete="username" /></label>
              <label className="block space-y-1.5 text-sm font-medium">Mot de passe<Input required minLength={setupRequired ? 12 : 1} type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} autoComplete={setupRequired ? "new-password" : "current-password"} />{setupRequired && <span className="block text-xs font-normal text-muted-foreground">12 caractères minimum</span>}</label>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full justify-center gap-2 bg-[#244b3b] text-white hover:bg-[#193b2e]">
                {submitting ? "Un instant…" : setupRequired ? "Créer le compte" : "Se connecter"}<ArrowRight size={16} />
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}