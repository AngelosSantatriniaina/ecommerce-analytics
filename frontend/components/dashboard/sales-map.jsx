"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatAr } from "@/lib/formatters";
import { apiRequest, last30DaysQuery } from "@/lib/api";

const regionColors = ["#48775b", "#f97316", "#4580a8", "#9f6652", "#89966c"];
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (<div className="bg-card px-3 py-2 rounded-lg shadow-lg text-xs font-medium border border-border">
    <p className="font-semibold">{data.region}</p>
    <p style={{ color: data.color }}>{formatAr(data.revenue)}</p>
      </div>);
    }
    return null;
};
export function SalesMap({ days = 30 }) {
    const [regions, setRegions] = useState([]);

    useEffect(() => {
        apiRequest(`/dashboard/sales-by-region?${last30DaysQuery(days)}`)
            .then((result) => setRegions(result.map((item, index) => ({ ...item, revenue: Number(item.revenue), color: regionColors[index % regionColors.length] }))))
            .catch(() => setRegions([]));
    }, [days]);

    const total = regions.reduce((sum, item) => sum + item.revenue, 0);
    const topRegion = [...regions].sort((first, second) => second.revenue - first.revenue)[0];

    return (<Card className="bg-card border-border h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Ventes par région</CardTitle>
          <p className="text-xs text-muted-foreground">Répartition du chiffre d'affaires, {days} derniers jours</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Stats panel */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Région principale</p>
              <p className="text-2xl font-semibold">{topRegion ? formatAr(topRegion.revenue) : "—"}</p>
              <p className="text-xs text-muted-foreground">{topRegion?.region || "Aucune vente"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commandes par région</p>
              <p className="text-2xl font-semibold">{regions.reduce((sum, item) => sum + Number(item.orders), 0).toLocaleString("fr-FR")}</p>
              <p className="text-xs text-muted-foreground">{days} derniers jours</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Chiffre d'affaires total</p>
              <p className="text-2xl font-semibold">{formatAr(total)}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex flex-col">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regions} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="revenue">
                    {regions.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
                {regions.map((item) => (<div key={item.region} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}/>
                  <span className="text-xs text-muted-foreground truncate">{item.region}</span>
                </div>))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);
}
