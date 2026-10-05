"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, FileText, PieChart as PieChartIcon } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { formatAr } from "@/lib/formatters";

const palette = ["#467458", "#f28c28", "#4285a3", "#a45f49", "#8b9657", "#6d7281"];

function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ReportsPage() {
  const today = localDate(new Date());
  const [from, setFrom] = useState(`${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(today);
  const [data, setData] = useState({ summary: null, revenue: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport(startDate, endDate) {
    if (startDate > endDate) {
      setError("La date de début doit précéder la date de fin.");
      return;
    }
    setLoading(true);
    setError("");
    const range = `from=${startDate}&to=${endDate}`;
    try {
      const [summary, revenue, categories] = await Promise.all([
        apiRequest(`/dashboard/summary?${range}`),
        apiRequest(`/dashboard/revenue?${range}`),
        apiRequest(`/dashboard/sales-by-category?${range}`),
      ]);
      setData({ summary, revenue, categories: categories.map((item, index) => ({ ...item, value: Number(item.revenue), color: palette[index % palette.length] })) });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReport(from, to); }, []);

  function exportRevenue() {
    downloadCsv(`shop-mada-revenus-${from}-${to}.csv`, ["Date", "Chiffre d'affaires (MGA)", "Commandes"],
      data.revenue.map((point) => [point.label, point.revenue, point.orders]));
  }

  function exportCategories() {
    downloadCsv(`shop-mada-categories-${from}-${to}.csv`, ["Catégorie", "Chiffre d'affaires (MGA)", "Articles vendus"],
      data.categories.map((category) => [category.category, category.revenue, category.unitsSold]));
  }

  const averageOrder = data.summary?.orderCount ? Number(data.summary.revenue) / data.summary.orderCount : 0;
  const totalCategoryRevenue = data.categories.reduce((sum, category) => sum + category.value, 0);
  const categoryChart = data.categories.map((category) => ({ ...category, percentage: totalCategoryRevenue ? (category.value / totalCategoryRevenue) * 100 : 0 }));

  return (
    <>
      <PageHeader title="Rapports" description="Analysez les ventes sur une période et exportez les résultats.">
        <Button type="submit" form="report-filters" disabled={loading} className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
          <FileText size={16} />{loading ? "Chargement…" : "Générer le rapport"}
        </Button>
      </PageHeader>

      <form id="report-filters" onSubmit={(event) => { event.preventDefault(); loadReport(from, to); }} className="mb-6 flex flex-wrap items-end gap-3 border-b border-border pb-5">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Du<Input required type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Au<Input required type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} /></label>
        <p className="pb-2 text-xs text-muted-foreground">Période analysée : {from} au {to}</p>
      </form>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">Impossible de charger le rapport : {error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Chiffre d'affaires", value: data.summary ? formatAr(data.summary.revenue) : "—" },
          { label: "Commandes", value: data.summary ? data.summary.orderCount.toLocaleString("fr-FR") : "—" },
          { label: "Panier moyen", value: data.summary ? formatAr(averageOrder) : "—" },
          { label: "Taux de remboursement", value: data.summary ? `${Number(data.summary.refundRatePercent).toLocaleString("fr-FR")} %` : "—" },
        ].map((metric) => (
          <Card key={metric.label} className="border-border bg-card"><CardContent className="p-4"><p className="mb-1 text-sm text-muted-foreground">{metric.label}</p><p className="text-xl font-semibold">{metric.value}</p></CardContent></Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base font-medium"><BarChart3 size={17} />Revenus par jour</CardTitle><CardDescription>Données de commandes enregistrées pour la période choisie.</CardDescription></CardHeader>
          <CardContent>
            {data.revenue.length ? <div className="h-[270px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="label" interval="preserveStartEnd" tick={{ fontSize: 11 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 11 }} stroke="#737373" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value) => [formatAr(value), "Chiffre d'affaires"]} />
              <Area type="monotone" dataKey="revenue" stroke="#467458" fill="#467458" fillOpacity={0.18} strokeWidth={2} />
            </AreaChart></ResponsiveContainer></div> : <p className="py-12 text-center text-sm text-muted-foreground">Aucune vente sur cette période.</p>}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base font-medium"><PieChartIcon size={17} />Ventes par catégorie</CardTitle><CardDescription>Répartition selon le chiffre d’affaires réel.</CardDescription></CardHeader>
          <CardContent>
            {categoryChart.length ? <>
              <div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryChart} cx="50%" cy="50%" innerRadius={48} outerRadius={74} dataKey="value">{categoryChart.map((category) => <Cell key={category.category} fill={category.color} />)}</Pie><Tooltip formatter={(value) => [formatAr(value), "Revenus"]} /></PieChart></ResponsiveContainer></div>
              <div className="space-y-2">{categoryChart.map((category) => <div key={category.category} className="flex items-center gap-2 text-xs"><span className="size-2.5 shrink-0" style={{ backgroundColor: category.color }} /><span className="min-w-0 flex-1 truncate">{category.category}</span><span className="font-medium">{category.percentage.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %</span></div>)}</div>
            </> : <p className="py-12 text-center text-sm text-muted-foreground">Aucune catégorie à afficher.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
          <div><CardTitle className="text-base font-medium">Exporter les données</CardTitle><CardDescription>Les fichiers contiennent uniquement la période sélectionnée.</CardDescription></div>
          <Button type="button" variant="outline" onClick={exportRevenue} disabled={!data.revenue.length} className="flex items-center gap-2"><Download size={16} />Exporter les revenus CSV</Button>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">{data.categories.length} catégories · {data.revenue.length} jours</p>
          <Button type="button" variant="outline" onClick={exportCategories} disabled={!data.categories.length} className="flex items-center gap-2"><Download size={16} />Exporter les catégories CSV</Button>
        </CardContent>
      </Card>
    </>
  );
}
