"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { apiRequest } from "@/lib/api";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest("/auth/me")
      .then(() => { if (active) setAuthorized(true); })
      .catch(() => { if (active) router.replace("/login"); });
    return () => { active = false; };
  }, [router]);

  if (!authorized) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Vérification de la session…</main>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <Header />
        {children}
      </div>
    </div>
  );
}
