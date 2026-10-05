"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import Image from "next/image";
import { formatAr } from "@/lib/formatters";
import { apiRequest } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";

export default function SalesPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
      let active = true;
      const from = `${year}-01-01`;
      const to = `${year}-12-31`;
      const range = `from=${from}&to=${to}`;
      Promise.all([
        apiRequest(`/reports/revenue?year=${year}`),
        apiRequest(`/dashboard/top-products?${range}&limit=4`),
        apiRequest(`/dashboard/sales-by-category?${range}`),
        apiRequest(`/dashboard/summary?${range}`),
      ]).then(([revenue, products, categorySales, dashboardSummary]) => {
        if (!active) return;
        setRevenueData(revenue);
        setTopProducts(products);
        setCategories(categorySales);
        setSummary(dashboardSummary);
      }).catch((requestError) => { if (active) setError(requestError.message); });
      return () => { active = false; };
    }, [year]);

    const totalRevenue = revenueData.reduce((sum, point) => sum + Number(point.revenue), 0);

    function exportSales() {
      downloadCsv(`shop-mada-ventes-${year}.csv`, ["Mois", "Chiffre d'affaires (MGA)"],
        revenueData.map((point) => [point.label, point.revenue]));
    }

    return (<>
      <PageHeader title="Analyse des ventes" description="Suivez vos performances commerciales et les indicateurs de vos produits.">
        <label className="sr-only" htmlFor="sales-year">Année des ventes</label>
        <select id="sales-year" value={year} onChange={(event) => setYear(Number(event.target.value))} className="h-9 border border-input bg-background px-3 text-sm">
          {[0, 1, 2, 3, 4, 5].map((offset) => <option key={offset} value={new Date().getFullYear() - offset}>{new Date().getFullYear() - offset}</option>)}
        </select>
        <Button variant="outline" onClick={exportSales} disabled={!revenueData.length} className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4"/>
          Exporter
        </Button>
      </PageHeader>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">Impossible de charger les ventes : {error}</p>}

      {/* Sales Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ventes totales</span>
              <div className="p-2 bg-muted rounded-lg">
                <ShoppingBag className="w-4 h-4 text-muted-foreground"/>
              </div>
            </div>
            <p className="text-3xl font-semibold">{formatAr(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Chiffre d’affaires de {year}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Valeur moyenne d'une commande</span>
              <div className="p-2 bg-muted rounded-lg">
                <DollarSign className="w-4 h-4 text-muted-foreground"/>
              </div>
            </div>
            <p className="text-3xl font-semibold">{formatAr(summary?.orderCount ? Number(summary.revenue) / summary.orderCount : 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Basée sur les commandes enregistrées</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taux de conversion</span>
              <div className="p-2 bg-muted rounded-lg">
                <TrendingUp className="w-4 h-4 text-muted-foreground"/>
              </div>
            </div>
            <p className="text-3xl font-semibold">{summary?.orderCount?.toLocaleString("fr-FR") || "0"}</p>
            <p className="text-xs text-muted-foreground mt-1">Commandes enregistrées</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Chiffre d’affaires mensuel · {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5"/>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={12}/>
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `${(value / 1000).toLocaleString("fr-FR")} k Ar`}/>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }} formatter={(value) => [formatAr(value), ""]}/>
                  <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} name="Chiffre d'affaires"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ventes par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((item) => (<div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.category}</span>
                    <span className="text-sm font-medium">{Number(item.unitsSold).toLocaleString("fr-FR")} article(s)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: `${totalRevenue ? Math.min(100, Number(item.revenue) / totalRevenue * 100) : 0}%` }}/>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatAr(item.revenue)}</p>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Meilleures ventes par produit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Article</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Prix</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ventes</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Chiffre d'affaires</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (<tr key={product.productId} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                          {product.imageUrl && <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="object-cover"/>}
                        </div>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{product.category}</td>
                    <td className="py-3 px-2 text-sm text-right">{formatAr(Number(product.revenue) / Math.max(1, Number(product.unitsSold)))}</td>
                    <td className="py-3 px-2 text-sm text-right">{Number(product.unitsSold).toLocaleString("fr-FR")}</td>
                    <td className="py-3 px-2 text-sm text-right font-medium">{formatAr(product.revenue)}</td>
                  </tr>))}
                {!topProducts.length && <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Aucune vente enregistrée en {year}.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>);
}
