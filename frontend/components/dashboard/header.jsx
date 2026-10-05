"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/api";
const navItems = [
  { label: "Vue d'ensemble", href: "/" },
  { label: "Ventes", href: "/sales" },
  { label: "Clients", href: "/customers" },
  { label: "Rapports", href: "/reports" },
  { label: "Commandes", href: "/orders" },
  { label: "Articles", href: "/products" },
  { label: "Boutique", href: "/shop" },
];
export function Header() {
    const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    apiRequest("/auth/me").then(setAdmin).catch(() => {});
  }, []);

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }
    const isActive = (href) => {
        if (href === "/")
            return pathname === "/";
        return pathname.startsWith(href);
    };
    return (<header className="flex items-center justify-between mb-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-0.5 bg-foreground"/>
          <div className="w-5 h-0.5 bg-foreground"/>
          <div className="w-3 h-0.5 bg-foreground"/>
        </div>
        <span className="text-xl font-semibold">Shop Mada</span>
      </Link>

      <nav className="hidden max-w-[55vw] items-center overflow-x-auto whitespace-nowrap bg-card rounded-full px-2 py-1.5 border border-border md:flex">
        {navItems.map((item) => (<Link key={item.href} href={item.href} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${isActive(item.href)
                ? "bg-[var(--color-accent)] text-foreground"
                : "text-muted-foreground hover:text-foreground"}`}>
            {item.label}
          </Link>))}
      </nav>

      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/orders" title="Voir les commandes" aria-label="Voir les commandes"><Bell className="w-5 h-5"/></Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-9 w-9">
                <AvatarImage src={admin?.avatarUrl || "/professional-man-avatar.png"}/>
                <AvatarFallback>{(admin?.name || "Admin").split(" ").map((part) => part[0]).join("").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{admin?.name || "Administrateur"}</p>
                <p className="text-xs text-muted-foreground">Administrateur</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block"/>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile">Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/profile#security">Sécurité</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={() => { logout(); }}>Se déconnecter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>);
}
