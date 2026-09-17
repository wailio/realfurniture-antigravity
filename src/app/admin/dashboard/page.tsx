"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  LogOut,
  X,
  Save,
  ImageIcon,
  DollarSign,
  Tag,
  FileText,
} from "lucide-react";
import type { Product } from "@/lib/products";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    image: "",
    category: "sofas",
    brand: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setMessage({ type: "error", text: "Erreur lors du chargement des produits." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const url = "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { id: editingProduct.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: editingProduct
            ? "Produit mis à jour avec succès!"
            : "Produit ajouté avec succès!",
        });
        resetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Erreur." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Produit supprimé." });
        fetchProducts();
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la suppression." });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      discount: product.discount ? String(product.discount) : "",
      image: product.image,
      category: product.category,
      brand: product.brand,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      discount: "",
      image: "",
      category: "sofas",
      brand: "",
    });
  };

  const handleLogout = async () => {
    document.cookie = "admin_session=; path=/; max-age=0";
    window.location.href = "/admin";
  };

  const categories = [
    { value: "sofas", label: "Canapés" },
    { value: "chambres", label: "Chambres" },
    { value: "salle-a-manger", label: "Salle à manger" },
    { value: "armoire", label: "Armoire" },
    { value: "accessories", label: "Accessoires" },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-DZ").format(price) + " DZD";

  return (
    <main className="min-h-screen bg-[#0E0F10]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[rgba(199,203,209,0.1)] bg-[#0E0F10]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-[#C7CBD1]" />
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-light text-[#F2F1EF]">
              Administration
            </h1>
            <span className="hidden text-xs text-[#B7BBC0]/60 sm:inline">
              Château d&apos;art
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowForm(true); setEditingProduct(null); }}
              className="inline-flex items-center gap-2 bg-[#C7CBD1] px-4 py-2 text-xs font-medium tracking-wider text-[#0E0F10] transition-colors hover:bg-[#DFE1E4]"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border border-[rgba(199,203,209,0.18)] px-3 py-2 text-xs text-[#B7BBC0] transition-colors hover:border-[rgba(199,203,209,0.4)] hover:text-[#F2F1EF]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="border border-[rgba(199,203,209,0.1)] bg-[#18191B] p-4">
            <p className="text-xs text-[#B7BBC0]">Total Produits</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-light text-[#F2F1EF]">
              {products.length}
            </p>
          </div>
          {categories.slice(0, 3).map((cat) => (
            <div
              key={cat.value}
              className="border border-[rgba(199,203,209,0.1)] bg-[#18191B] p-4"
            >
              <p className="text-xs text-[#B7BBC0]">{cat.label}</p>
              <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-light text-[#F2F1EF]">
                {products.filter((p) => p.category === cat.value).length}
              </p>
            </div>
          ))}
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[rgba(199,203,209,0.18)] bg-[#18191B] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-light text-[#F2F1EF]">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <button onClick={resetForm} className="text-[#B7BBC0] hover:text-[#F2F1EF]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                    <FileText className="h-3 w-3" /> Nom du produit
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                    <FileText className="h-3 w-3" /> Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1] resize-none"
                  />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                      <DollarSign className="h-3 w-3" /> Prix
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                      Prix original
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                      <Tag className="h-3 w-3" /> Remise %
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                    <ImageIcon className="h-3 w-3" /> URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                    required
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#B7BBC0]">
                      Marque
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full border border-[rgba(199,203,209,0.18)] bg-[#0E0F10] px-3 py-2.5 text-sm text-[#F2F1EF] outline-none focus:border-[#C7CBD1]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#C7CBD1] py-2.5 text-sm font-medium text-[#0E0F10] transition-colors hover:bg-[#DFE1E4] disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {submitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-[rgba(199,203,209,0.18)] px-6 py-2.5 text-sm text-[#B7BBC0] transition-colors hover:border-[rgba(199,203,209,0.4)]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="border border-[rgba(199,203,209,0.1)] bg-[#18191B]">
          <div className="border-b border-[rgba(199,203,209,0.1)] px-4 py-3">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-light text-[#F2F1EF]">
              Produits ({products.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin border-2 border-[#C7CBD1]/30 border-t-[#C7CBD1]" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#B7BBC0]">
              Aucun produit. Cliquez sur &quot;Ajouter&quot; pour commencer.
            </div>
          ) : (
            <div className="divide-y divide-[rgba(199,203,209,0.06)]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[rgba(199,203,209,0.03)]"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden border border-[rgba(199,203,209,0.1)] bg-[#0E0F10]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover product-image"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#F2F1EF]">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#B7BBC0]">
                      {product.category} · {formatPrice(product.price)}
                      {product.discount && (
                        <span className="ml-2 text-[#C7CBD1]">-{product.discount}%</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-[#B7BBC0] transition-colors hover:text-[#C7CBD1]"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-[#B7BBC0] transition-colors hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
