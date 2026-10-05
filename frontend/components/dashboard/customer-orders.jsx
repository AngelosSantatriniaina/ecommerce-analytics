"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest, last30DaysQuery } from "@/lib/api";

export function CustomerOrders({ days = 30 }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        apiRequest(`/dashboard/revenue?${last30DaysQuery(days)}`).then(setData).catch(() => setData([]));
      }, [days]);

    const orderCount = data.reduce((sum, entry) => sum + Number(entry.orders), 0);

    return (<Card className="bg-card border-border h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Commandes clients</CardTitle>
          <p className="text-xs text-muted-foreground">{days} derniers jours</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-3xl font-semibold">{data.length ? orderCount.toLocaleString("fr-FR") : "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Commandes enregistrées</p>
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs><linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#48775b" stopOpacity={0.3}/><stop offset="95%" stopColor="#48775b" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="label" interval={7} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#737373" }}/>
              <YAxis hide/>
              <Tooltip contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
        }} formatter={(value) => [value.toLocaleString("fr-FR"), "Commandes"]}/>
              <Area type="monotone" dataKey="orders" stroke="#48775b" strokeWidth={2} fill="url(#orderGradient)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);
}
