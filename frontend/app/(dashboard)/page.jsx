"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfitChart } from "@/components/dashboard/profit-chart";
import { CustomerOrders } from "@/components/dashboard/customer-orders";
import { TopProducts } from "@/components/dashboard/top-products";
import { SalesMap } from "@/components/dashboard/sales-map";
import { Button } from "@/components/ui/button";
import { Download, DollarSign, ShoppingCart, Users, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatAr } from "@/lib/formatters";
import { dateRangeForDays, dateRangeQuery } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
export default function DashboardPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    const range = dateRangeForDays(periodDays);
    apiRequest(`/dashboard/summary?${dateRangeQuery(range.from, range.to)}`)
      .then(setSummary)
      .catch((error) => setSummaryError(error.message));
  }, [periodDays]);

  async function exportReport() {
    setSummaryError("");
    const range = dateRangeForDays(periodDays);
    try {
      const [report, revenue] = await Promise.all([
        apiRequest(`/dashboard/summary?${dateRangeQuery(range.from, range.to)}`),
        apiRequest(`/dashboard/revenue?${dateRangeQuery(range.from, range.to)}`),
      ]);
      downloadCsv(`shop-mada-vue-ensemble-${range.from}-${range.to}.csv`,
        ["Type", "Indicateur ou date", "Valeur (MGA ou nombre)", "Commandes"], [
          ["Synthèse", "Chiffre d'affaires", report.revenue, ""],
          ["Synthèse", "Commandes", report.orderCount, ""],
          ["Synthèse", "Clients actifs", report.activeCustomers, ""],
          ["Synthèse", "Taux de remboursement (%)", report.refundRatePercent, ""],
          ...revenue.map((point) => ["Quotidien", point.label, point.revenue, point.orders]),
        ]);
    } catch (error) {
      setSummaryError(error.message);
    }
  }

    return (<>
      <PageHeader title="Bienvenue, Santatriniaina" description="Vue d'ensemble des clients, des ventes et des revenus.">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="sr-only">Période du tableau de bord</span>
          <select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))} className="h-9 border border-input bg-background px-3 text-sm text-foreground">
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
            <option value={365}>12 derniers mois</option>
          </select>
        </label>
        <Button onClick={exportReport} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4"/>
          Exporter le rapport
        </Button>
      </PageHeader>

      {summaryError && <p role="alert" className="mb-4 text-sm text-destructive">Impossible de charger les indicateurs : {summaryError}</p>}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Chiffre d'affaires" value={summary ? formatAr(summary.revenue) : "—"} change={summary ? `${Number(summary.revenueChangePercent).toLocaleString("fr-FR")} % vs période précédente` : "30 derniers jours"} isPositiveOutcome={Number(summary?.revenueChangePercent) >= 0} icon={DollarSign}/>
        <MetricCard title="Commandes totales" value={summary ? summary.orderCount.toLocaleString("fr-FR") : "—"} change="30 derniers jours" isPositiveOutcome={true} icon={ShoppingCart}/>
        <MetricCard title="Clients actifs" value={summary ? summary.activeCustomers.toLocaleString("fr-FR") : "—"} change="30 derniers jours" isPositiveOutcome={true} icon={Users}/>
        <MetricCard title="Taux de remboursement" value={summary ? `${Number(summary.refundRatePercent).toLocaleString("fr-FR")} %` : "—"} change="30 derniers jours" isPositiveOutcome={Number(summary?.refundRatePercent) === 0} icon={RotateCcw}/>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ProfitChart days={periodDays} />
        </div>
        <div>
          <TopProducts days={periodDays} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-full">
          <CustomerOrders days={periodDays} />
        </div>
        <div className="lg:col-span-2 h-full">
          <SalesMap days={periodDays} />
        </div>
      </div>
    </>);
}
