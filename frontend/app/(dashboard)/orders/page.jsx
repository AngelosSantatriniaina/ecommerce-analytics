"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatAr } from "@/lib/formatters";
import { apiRequest } from "@/lib/api";

const statusFilters = [
  { value: null, label: "Toutes les commandes" },
  { value: "PENDING", label: "En attente" },
  { value: "PROCESSING", label: "En cours" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
  { value: "REFUNDED", label: "Remboursée" },
];
const statusLabels = Object.fromEntries(statusFilters.filter((item) => item.value).map((item) => [item.value, item.label]));

function formatOrderDate(value) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      apiRequest("/orders?page=0&size=100")
        .then((result) => setOrders(result.content || []))
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoading(false));
    }, []);

    const filteredOrders = orders.filter((order) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch = order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.items.some((item) => item.productName.toLowerCase().includes(normalizedQuery));
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const orderStats = [
      { label: "Commandes", value: orders.length, icon: ShoppingCart },
      { label: "En attente", value: orders.filter((order) => order.status === "PENDING").length, icon: Clock },
      { label: "Expédiées", value: orders.filter((order) => order.status === "SHIPPED").length, icon: Truck },
      { label: "Livrées", value: orders.filter((order) => order.status === "DELIVERED").length, icon: CheckCircle },
    ];
    const getStatusColor = (status) => {
        switch (status) {
        case "DELIVERED":
                return "bg-green-100 text-green-800";
        case "PROCESSING":
                return "bg-blue-100 text-blue-800";
        case "SHIPPED":
                return "bg-purple-100 text-purple-800";
        case "PENDING":
                return "bg-amber-100 text-amber-800";
        case "CANCELLED":
        case "REFUNDED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "DELIVERED":
                return <CheckCircle className="w-3 h-3"/>;
            case "PROCESSING":
                return <Clock className="w-3 h-3"/>;
            case "SHIPPED":
                return <Truck className="w-3 h-3"/>;
            case "PENDING":
                return <Package className="w-3 h-3"/>;
            case "CANCELLED":
            case "REFUNDED":
                return <XCircle className="w-3 h-3"/>;
            default:
                return null;
        }
    };
    return (<>
        <PageHeader title="Commandes" description="Suivez et gérez les commandes de vos clients.">
        </PageHeader>

        {error && <p role="alert" className="mb-4 text-sm text-destructive">Impossible de charger les commandes : {error}</p>}

        {/* Order Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {orderStats.map((stat) => (<Card key={stat.label} className="bg-card border border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className="p-2 bg-muted rounded-lg">
                    <stat.icon className="w-4 h-4 text-muted-foreground"/>
                  </div>
                </div>
                <p className="text-3xl font-semibold">{stat.value.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground mt-1">Données en direct</p>
              </CardContent>
            </Card>))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Button variant={statusFilter === null ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(null)} className={statusFilter === null ? "bg-foreground text-background" : "bg-transparent"}>
            Toutes les commandes
          </Button>
            {statusFilters.filter((item) => item.value).map((item) => (<Button key={item.value} variant={statusFilter === item.value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(item.value)} className={statusFilter === item.value ? "bg-foreground text-background" : "bg-transparent"}>
              {item.label}
            </Button>))}
        </div>

        {/* Orders Table */}
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Toutes les commandes</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input placeholder="Rechercher une commande..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9"/>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">N° de commande</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Articles</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Paiement</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filteredOrders.map((order) => (<tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <span className="text-sm font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</td>
                      <td className="py-3 px-2 text-sm text-center">{order.items.reduce((count, item) => count + item.quantity, 0)}</td>
                      <td className="py-3 px-2 text-sm">{order.paymentMethod}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(order.status)}
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-medium">{formatAr(order.totalAmount)}</td>
                    </tr>))}
                  {loading && <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Chargement des commandes…</td></tr>}
                  {!loading && !filteredOrders.length && <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Aucune commande trouvée.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </>);
}
