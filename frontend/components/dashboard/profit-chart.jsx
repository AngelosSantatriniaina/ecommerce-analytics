"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatAr } from "@/lib/formatters";
import { apiRequest, last30DaysQuery } from "@/lib/api";

export function ProfitChart({ days = 30 }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest(`/dashboard/revenue?${last30DaysQuery(days)}`)
            .then(setData)
            .catch((requestError) => setError(requestError.message));
    }, [days]);

    const totalRevenue = data.reduce((sum, entry) => sum + Number(entry.revenue), 0);

    return (<Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Chiffre d'affaires quotidien</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-semibold">{data.length ? formatAr(totalRevenue) : "—"}</span>
            <span className="text-xs text-muted-foreground">30 derniers jours</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 bg-[var(--color-chart-orange)]"/>
          <span className="text-xs text-muted-foreground">Chiffre d'affaires (MGA)</span>
        </div>
        {error && <p role="alert" className="mb-2 text-xs text-destructive">{error}</p>}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5"/>
              <XAxis dataKey="label" interval={4} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#737373" }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#737373" }} tickFormatter={(value) => `${value / 1000}k`}/>
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "none", color: "#fff", fontSize: "12px" }} formatter={(value) => [formatAr(value), "Chiffre d'affaires"]}/>
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={20}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);
}
