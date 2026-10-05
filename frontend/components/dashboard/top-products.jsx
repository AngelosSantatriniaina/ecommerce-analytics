"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { formatAr } from "@/lib/formatters";
import { apiRequest, last30DaysQuery } from "@/lib/api";

export function TopProducts({ days = 30 }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        apiRequest(`/dashboard/top-products?${last30DaysQuery(days)}&limit=4`)
            .then(setProducts)
            .catch(() => setProducts([]));
    }, [days]);

    return (<Card className="bg-card border-border h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Meilleurs produits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!products.length && <p className="py-6 text-sm text-muted-foreground">Aucune vente sur les {days} derniers jours.</p>}
        {products.map((product) => (<div key={product.productId} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden bg-muted">
                <Package className="absolute text-muted-foreground" size={18}/>
                {product.imageUrl && <img src={product.imageUrl} alt="" className="relative h-full w-full object-cover" onError={(event) => event.currentTarget.remove()}/ >}
              </div>
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.unitsSold.toLocaleString("fr-FR")} vendu(s)</p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-medium">{formatAr(product.revenue)}</span>
          </div>))}
      </CardContent>
    </Card>);
}
