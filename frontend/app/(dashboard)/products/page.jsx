"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ImagePlus, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { formatAr } from "@/lib/formatters";

const emptyForm = () => ({ name: "", category: "", unitPrice: "", stockQuantity: "0", imageUrl: "" });

function formatUpdatedAt(value) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [productToDelete, setProductToDelete] = useState(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const result = await apiRequest("/products?page=0&size=100");
      setProducts(result.content || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);

  function openCreateForm() {
    setEditingProduct(null);
    setForm(emptyForm());
    setError("");
    setFormOpen(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      unitPrice: String(product.unitPrice),
      stockQuantity: String(product.stockQuantity),
      imageUrl: product.imageUrl || "",
    });
    setError("");
    setFormOpen(true);
  }

  async function uploadImage(file) {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scope", "product");
      const response = await fetch("/api/product-images", { method: "POST", body: formData });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "L’image n’a pas pu être importée.");
      setForm((current) => ({ ...current, imageUrl: result.imageUrl }));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      unitPrice: Number(form.unitPrice),
      stockQuantity: Number(form.stockQuantity),
      imageUrl: form.imageUrl.trim() || null,
    };

    try {
      await apiRequest(editingProduct ? `/products/${editingProduct.id}` : "/products", {
        method: editingProduct ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setFormOpen(false);
      setEditingProduct(null);
      setForm(emptyForm());
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!productToDelete) return;
    setError("");
    try {
      await apiRequest(`/products/${productToDelete.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((product) => product.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (requestError) {
      setError(requestError.message);
      setProductToDelete(null);
    }
  }

  return (
    <>
      <PageHeader title="Articles" description="Gérez le catalogue présenté dans la boutique.">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          Voir la boutique <ArrowRight size={16} />
        </Link>
        <Button onClick={openCreateForm} className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Plus size={16} /> Ajouter un article
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{products.length.toLocaleString("fr-FR")} article{products.length > 1 ? "s" : ""} dans le catalogue</p>
        <label className="flex w-full items-center gap-2 sm:max-w-xs">
          <Search size={17} className="shrink-0 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un article" aria-label="Rechercher un article" />
        </label>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}

      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Article</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Catégorie</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Prix</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mis à jour</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden bg-muted">
                          <Package className="absolute text-muted-foreground" size={19} />
                          {product.imageUrl && <img src={product.imageUrl} alt="" className="relative h-full w-full object-cover" onError={(event) => event.currentTarget.remove()} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">#{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{formatAr(product.unitPrice)}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Badge variant="secondary" className={product.stockQuantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {product.stockQuantity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatUpdatedAt(product.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" title={`Modifier ${product.name}`} aria-label={`Modifier ${product.name}`} onClick={() => openEditForm(product)}>
                          <Pencil size={16} />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title={`Supprimer ${product.name}`} aria-label={`Supprimer ${product.name}`} onClick={() => setProductToDelete(product)} className="text-destructive hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Chargement des articles…</td></tr>}
                {!loading && !error && !filteredProducts.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Aucun article trouvé.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Modifier l’article" : "Ajouter un article"}</DialogTitle>
            <DialogDescription>Les articles enregistrés sont affichés dans la boutique.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveProduct} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Nom de l’article
                <Input required maxLength={180} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex. Sac de voyage" />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Catégorie
                <Input required maxLength={100} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Ex. Accessoires" />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Prix (MGA)
                <Input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: event.target.value })} placeholder="0" />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Quantité en stock
                <Input required type="number" min="0" step="1" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium">
              Chemin ou URL de l’image
              <Input maxLength={500} value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="/travel-bag.jpg ou https://…" list="product-image-presets" />
              <datalist id="product-image-presets">
                <option value="/sony-wh1000xm5-headphones.jpg" />
                <option value="/adidas-ultraboost-running-shoe.jpg" />
                <option value="/samsung-galaxy-watch-smartwatch.jpg" />
                <option value="/apple-airpods-pro-earbuds.jpg" />
                <option value="/travel-bag.jpg" />
                <option value="/cotton-tshirt.jpg" />
              </datalist>
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              Importer une image depuis cet appareil
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                disabled={uploadingImage || saving}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  uploadImage(file);
                }}
              />
              <span className="block text-xs font-normal text-muted-foreground">JPG, PNG ou WebP, 5 Mo maximum</span>
            </label>
            <div className="flex items-center gap-3 border border-border bg-muted/30 p-3">
              {form.imageUrl ? <img key={form.imageUrl} src={form.imageUrl} alt="Aperçu de l’image de l’article" className="size-16 object-cover" onError={(event) => event.currentTarget.remove()} /> : <ImagePlus className="text-muted-foreground" size={28} />}
              <p className="text-xs text-muted-foreground">Aperçu de l’image du catalogue</p>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saving || uploadingImage} className="bg-foreground text-background hover:bg-foreground/90">
                {uploadingImage ? "Import de l’image…" : saving ? "Enregistrement…" : editingProduct ? "Enregistrer les modifications" : "Créer l’article"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(productToDelete)} onOpenChange={(open) => { if (!open) setProductToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete?.name} sera retiré du catalogue de la boutique. Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}