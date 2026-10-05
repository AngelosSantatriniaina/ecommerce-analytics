"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, UserPlus, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/api";

function formatCustomerDate(value) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ name: "", email: "", phone: "", city: "", region: "", segment: "Nouveau" });

    async function loadCustomers() {
      setLoading(true);
      try {
        const result = await apiRequest("/customers?page=0&size=100");
        setCustomers(result.content || []);
        setTotalCustomers(result.totalElements || 0);
        setError("");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      loadCustomers();
    }, []);

    async function createCustomer(event) {
      event.preventDefault();
      setCreating(true);
      setError("");
      try {
        await apiRequest("/customers", {
          method: "POST",
          body: JSON.stringify({
            ...draft,
            phone: draft.phone || null,
            city: draft.city || null,
            region: draft.region || null,
          }),
        });
        setCreateOpen(false);
        setDraft({ name: "", email: "", phone: "", city: "", region: "", segment: "Nouveau" });
        await loadCustomers();
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setCreating(false);
      }
    }

    const filteredCustomers = customers.filter((customer) => customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const segmentCounts = customers.reduce((counts, customer) => {
      const segment = customer.segment || "Non renseigné";
      counts[segment] = (counts[segment] || 0) + 1;
      return counts;
    }, {});
    const regionCount = new Set(customers.map((customer) => customer.region).filter(Boolean)).size;
    const getStatusColor = (status) => {
        switch (status) {
            case "VIP":
                return "bg-amber-100 text-amber-800";
          case "Fidèle":
                return "bg-green-100 text-green-800";
            case "Nouveau":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (<>
        <PageHeader title="Clients" description="Gérez et consultez votre clientèle.">
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="w-4 h-4"/>
            Ajouter un client
          </Button>
        </PageHeader>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Nombre total de clients</span>
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground"/>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un client</DialogTitle>
                      <DialogDescription>La fiche sera enregistrée dans le système.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createCustomer} className="space-y-3">
                      <Input required maxLength={140} aria-label="Nom complet" placeholder="Nom complet" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
                      <Input required type="email" maxLength={180} aria-label="Adresse e-mail" placeholder="Adresse e-mail" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input maxLength={40} aria-label="Téléphone" placeholder="Téléphone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
                        <Input maxLength={100} aria-label="Ville" placeholder="Ville" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input maxLength={100} aria-label="Région" placeholder="Région" value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })} />
                        <select aria-label="Segment client" value={draft.segment} onChange={(event) => setDraft({ ...draft, segment: event.target.value })} className="h-9 border border-input bg-background px-3 text-sm">
                          <option>Nouveau</option><option>Fidèle</option><option>VIP</option>
                        </select>
                      </div>
                      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                      <DialogFooter className="pt-3">
                        <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                        <Button type="submit" disabled={creating}>{creating ? "Création…" : "Créer le client"}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-3xl font-semibold">{totalCustomers.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground mt-1">Clients enregistrés</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Nouveaux clients</span>
                <div className="p-2 bg-muted rounded-lg">
                  <UserPlus className="w-4 h-4 text-muted-foreground"/>
                </div>
              </div>
              <p className="text-3xl font-semibold">{(segmentCounts.Nouveau || 0).toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground mt-1">Segment Nouveau</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Régions représentées</span>
                <div className="p-2 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground"/>
                </div>
              </div>
              <p className="text-3xl font-semibold">{regionCount.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground mt-1">Avec clients enregistrés</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Segments clients</span>
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground"/>
                </div>
              </div>
              <p className="text-3xl font-semibold">{Object.keys(segmentCounts).length.toLocaleString("fr-FR")}</p>
              <p className="text-xs text-muted-foreground mt-1">Catégories présentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Segments & List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Segments */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Segments de clientèle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(segmentCounts).map(([name, count], index) => (<div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{name}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${["bg-amber-500", "bg-[var(--color-accent)]", "bg-blue-500", "bg-gray-400"][index % 4]}`} style={{ width: `${customers.length ? (count / customers.length) * 100 : 0}%` }}/>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{customers.length ? ((count / customers.length) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : 0} %</p>
                  </div>))}
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card className="lg:col-span-3 bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Tous les clients</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input placeholder="Rechercher un client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9"/>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Segment</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Téléphone</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Localisation</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (<tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{customer.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <Badge variant="secondary" className={getStatusColor(customer.segment)}>{customer.segment}</Badge>
                        </td>
                        <td className="py-3 px-2 text-sm">{customer.phone || "—"}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{[customer.city, customer.region].filter(Boolean).join(", ") || "—"}</td>
                        <td className="py-3 px-2 text-sm text-right text-muted-foreground">{formatCustomerDate(customer.createdAt)}</td>
                      </tr>))}
                    {loading && <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Chargement des clients…</td></tr>}
                    {error && <tr><td colSpan={5} role="alert" className="py-10 text-center text-sm text-destructive">Impossible de charger les clients : {error}</td></tr>}
                    {!loading && !error && !filteredCustomers.length && <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Aucun client trouvé.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
    </>);
}
