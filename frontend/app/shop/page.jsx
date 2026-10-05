"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Info, Minus, Package, Plus, Search, ShoppingBag, Store, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatAr } from "@/lib/formatters";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const productImages = {
  "Montre connectée": "/samsung-galaxy-watch-smartwatch.jpg",
  "Sac de voyage": "/travel-bag.jpg",
  "T-shirt coton bio": "/cotton-tshirt.jpg",
};

function getProductImage(product) {
  return product.imageUrl || productImages[product.name] || null;
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tout");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", city: "", region: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest("/products?size=100")
      .then((result) => {
        if (active) setProducts(result.content || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = ["Tout", ...new Set(products.map((product) => product.category))];
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === "Tout" || product.category === category;
    const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const cartLines = useMemo(() => products
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, quantity: cart[product.id] })), [products, cart]);
  const itemCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartLines.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  function changeQuantity(product, amount) {
    setReceipt("");
    setCart((current) => {
      const nextQuantity = (current[product.id] || 0) + amount;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[product.id];
        return next;
      }
      if (nextQuantity > product.stockQuantity) return current;
      return { ...current, [product.id]: nextQuantity };
    });
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!cartLines.length) return;
    setSubmitting(true);
    setError("");
    setReceipt("");
    try {
      const order = await apiRequest("/checkout", {
        method: "POST",
        body: JSON.stringify({
          customer: {
            ...customer,
            phone: customer.phone || null,
            city: customer.city || null,
            region: customer.region || null,
          },
          paymentMethod: "Paiement à la livraison",
          items: cartLines.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      setCart({});
      setReceipt(order.orderNumber);
    } catch (requestError) {
      setError(requestError.message || "La commande n’a pas pu être enregistrée.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] text-[#20231f]">
      <header className="border-b border-[#dedfd8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/shop" className="flex items-center gap-3" aria-label="Shop Mada, boutique">
            <span className="grid size-10 place-items-center rounded-full bg-[#244b3b] text-white"><Store size={19} /></span>
            <span className="text-lg font-semibold">Shop Mada <span className="font-normal text-[#718075]">/ Boutique</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#46544b] hover:text-[#244b3b]">
            Espace admin <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#d8dcd4] pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-[#687d6d]">La sélection Shop Mada</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Des essentiels, près de chez vous.</h1>
            <p className="mt-2 text-sm text-[#646b63]">Choisissez vos articles et passez commande en quelques instants.</p>
          </div>
          <label className="flex w-full items-center gap-2 border-b border-[#aeb8ad] px-1 py-2 md:max-w-xs">
            <Search size={17} className="shrink-0 text-[#758074]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un article" className="w-full bg-transparent text-sm outline-none placeholder:text-[#8b918b]" />
          </label>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-label="Catalogue">
            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
              {categories.map((entry) => (
                <button key={entry} onClick={() => setCategory(entry)} className={`border px-4 py-2 text-sm transition-colors ${category === entry ? "border-[#244b3b] bg-[#244b3b] text-white" : "border-[#d3d8d0] bg-white text-[#48564b] hover:border-[#79917e]"}`}>
                  {entry}
                </button>
              ))}
            </div>

            {loading && <p className="py-16 text-center text-sm text-[#687168]">Chargement du catalogue…</p>}
            {!loading && error && !products.length && <p role="alert" className="border-l-2 border-[#b34832] bg-white px-4 py-3 text-sm text-[#873a2b]">{error} Vérifie que le backend est démarré.</p>}
            {!loading && !error && !visibleProducts.length && <p className="py-16 text-center text-sm text-[#687168]">Aucun produit ne correspond à cette recherche.</p>}

            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <article key={product.id} className="group min-w-0">
                  <button type="button" onClick={() => setSelectedProduct(product)} aria-label={`Afficher les détails de ${product.name}`} className="relative mb-3 block aspect-[4/3] w-full overflow-hidden bg-[#e7e9e3] text-left">
                    <Package className="absolute inset-0 m-auto text-[#8c998b]" size={32} />
                    {getProductImage(product) && <img src={getProductImage(product)} alt={product.name} className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" onError={(event) => event.currentTarget.remove()} />}
                    {product.stockQuantity <= 0 && <span className="absolute bottom-3 left-3 bg-white px-2 py-1 text-xs font-medium">Épuisé</span>}
                  </button>
                  <p className="text-xs text-[#718075]">{product.category}</p>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-medium leading-snug">{product.name}</h2>
                      <p className="mt-1 text-sm font-semibold">{formatAr(product.unitPrice)}</p>
                    </div>
                    <button type="button" aria-label={`Ajouter ${product.name} au panier`} title="Ajouter au panier" disabled={product.stockQuantity <= 0} onClick={() => changeQuantity(product, 1)} className="grid size-10 shrink-0 place-items-center border border-[#c9d1c7] text-[#244b3b] transition-colors hover:bg-[#244b3b] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-[#858c84]">{product.stockQuantity} en stock</p>
                    <button type="button" onClick={() => setSelectedProduct(product)} className="flex items-center gap-1 text-xs font-medium text-[#42644e] hover:text-[#244b3b]">
                      <Info size={14} /> Plus d’informations
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="border-t border-[#d8dcd4] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div className="sticky top-6">
              <div className="mb-5 flex items-center justify-between border-b border-[#d8dcd4] pb-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag size={19} /> Votre panier</h2>
                <span className="text-sm text-[#687168]">{itemCount} article{itemCount > 1 ? "s" : ""}</span>
              </div>

              {!cartLines.length ? (
                <p className="py-6 text-sm text-[#737a72]">Votre panier est vide. Ajoutez un article pour commencer.</p>
              ) : (
                <>
                  <ul className="divide-y divide-[#e0e3dd]">
                    {cartLines.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="mt-1 text-xs text-[#687168]">{formatAr(item.unitPrice)} / unité</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button type="button" aria-label={`Retirer une unité de ${item.name}`} onClick={() => changeQuantity(item, -1)} className="grid size-7 place-items-center border border-[#d4d9d2]"><Minus size={13} /></button>
                            <span className="min-w-4 text-center text-sm">{item.quantity}</span>
                            <button type="button" aria-label={`Ajouter une unité de ${item.name}`} disabled={item.quantity >= item.stockQuantity} onClick={() => changeQuantity(item, 1)} className="grid size-7 place-items-center border border-[#d4d9d2] disabled:opacity-40"><Plus size={13} /></button>
                          </div>
                        </div>
                        <button type="button" aria-label={`Supprimer ${item.name} du panier`} onClick={() => changeQuantity(item, -item.quantity)} className="mt-1 text-[#818980] hover:text-[#9f3e2c]"><Trash2 size={16} /></button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-[#d8dcd4] py-4 font-semibold">
                    <span>Total</span><span>{formatAr(total)}</span>
                  </div>

                  <form onSubmit={placeOrder} className="space-y-3">
                    <p className="text-sm font-semibold">Vos coordonnées</p>
                    <input required maxLength={140} value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Nom complet" autoComplete="name" className="w-full border border-[#d3d8d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#64816b]" />
                    <input required type="email" maxLength={180} value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="Adresse e-mail" autoComplete="email" className="w-full border border-[#d3d8d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#64816b]" />
                    <input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Téléphone (facultatif)" autoComplete="tel" className="w-full border border-[#d3d8d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#64816b]" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="Ville" autoComplete="address-level2" className="min-w-0 border border-[#d3d8d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#64816b]" />
                      <input value={customer.region} onChange={(event) => setCustomer({ ...customer, region: event.target.value })} placeholder="Région" autoComplete="address-level1" className="min-w-0 border border-[#d3d8d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#64816b]" />
                    </div>
                    <p className="text-xs leading-relaxed text-[#717970]">Paiement à la livraison. Aucun paiement en ligne n’est effectué.</p>
                    {error && <p role="alert" className="text-sm text-[#9f3e2c]">{error}</p>}
                    {receipt && <p role="status" className="flex items-start gap-2 bg-[#e8efe7] p-3 text-sm text-[#244b3b]"><CheckCircle2 size={18} className="shrink-0" /> Commande {receipt} enregistrée. Merci !</p>}
                    <button type="submit" disabled={submitting || !cartLines.length} className="flex w-full items-center justify-center gap-2 bg-[#244b3b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#193b2e] disabled:cursor-wait disabled:opacity-60">
                      {submitting ? "Enregistrement…" : "Confirmer la commande"}<ArrowRight size={16} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-[#d8dcd4] bg-white p-0">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[4/3] bg-[#e7e9e3] md:aspect-auto md:min-h-[380px]">
                <Package className="absolute inset-0 m-auto text-[#8c998b]" size={40} />
                {getProductImage(selectedProduct) && <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} className="relative h-full w-full object-cover" onError={(event) => event.currentTarget.remove()} />}
              </div>
              <div className="flex flex-col p-6 md:p-8">
                <DialogHeader className="text-left">
                  <p className="text-xs font-semibold uppercase text-[#687d6d]">{selectedProduct.category}</p>
                  <DialogTitle className="pr-8 text-2xl">{selectedProduct.name}</DialogTitle>
                  <DialogDescription>Référence produit #{selectedProduct.id}</DialogDescription>
                </DialogHeader>
                <p className="mt-7 text-2xl font-semibold">{formatAr(selectedProduct.unitPrice)}</p>
                <div className="mt-5 border-y border-[#e0e3dd] py-4">
                  <p className="text-sm font-medium">Disponibilité</p>
                  <p className="mt-1 text-sm text-[#687168]">
                    {selectedProduct.stockQuantity > 0
                      ? `${selectedProduct.stockQuantity} article${selectedProduct.stockQuantity > 1 ? "s" : ""} en stock`
                      : "Actuellement épuisé"}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#646b63]">
                  Article de la catégorie {selectedProduct.category.toLowerCase()}. Le stock est vérifié à la confirmation de la commande.
                </p>
                <button type="button" disabled={selectedProduct.stockQuantity <= 0} onClick={() => { changeQuantity(selectedProduct, 1); setSelectedProduct(null); }} className="mt-auto flex items-center justify-center gap-2 bg-[#244b3b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#193b2e] disabled:cursor-not-allowed disabled:opacity-50 md:mt-8">
                  <Plus size={17} /> Ajouter au panier
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}