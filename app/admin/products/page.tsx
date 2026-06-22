"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Plus, Trash2, Pencil, Loader2, X, PackageCheck, PackageX, Search, ChevronDown,
} from "lucide-react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  unit: string;
  description: string | null;
  specs: string[];
  badge: string | null;
  in_stock: boolean;
  image_url: string | null;
  sort_order: number;
};

const CATEGORIES = ["fingerlings", "feed", "liners", "nets", "equipment"];
const BADGES = ["", "Best Seller", "Premium", "New", "Most Popular", "Heavy Duty", "Essential"];

const EMPTY: Omit<Product, "id"> = {
  name: "", slug: "", category: "fingerlings", price: 0,
  unit: "per unit", description: "", specs: [], badge: null,
  in_stock: true, image_url: "", sort_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [specsInput, setSpecsInput] = useState("");
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("sort_order").order("name");
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setForm(EMPTY);
    setSpecsInput("");
    setEditId("new");
  }

  function openEdit(p: Product) {
    const { id, ...rest } = p;
    setForm({ ...rest });
    setSpecsInput(p.specs?.join("\n") ?? "");
    setEditId(id);
  }

  function closeForm() { setEditId(null); }

  function handleChange(field: keyof Omit<Product, "id">, value: unknown) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && editId === "new") next.slug = slugify(value as string);
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) { toast.error("Name and slug are required"); return; }
    if (form.price <= 0) { toast.error("Price must be greater than 0"); return; }

    setSaving(true);
    const payload = {
      ...form,
      specs: specsInput.split("\n").map((s) => s.trim()).filter(Boolean),
      badge: form.badge || null,
      image_url: form.image_url || null,
    };

    let error;
    if (editId === "new") {
      ({ error } = await supabase.from("products").insert(payload));
    } else {
      ({ error } = await supabase.from("products").update(payload).eq("id", editId));
    }

    if (error) {
      toast.error("Save failed: " + error.message);
    } else {
      toast.success(editId === "new" ? "Product added!" : "Product updated!");
      closeForm();
      await load();
    }
    setSaving(false);
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  async function toggleStock(p: Product) {
    const { error } = await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, in_stock: !x.in_stock } : x));
  }

  const displayed = products.filter((p) => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products across {CATEGORIES.length} categories</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f5070] text-white font-semibold text-sm hover:bg-[#0a3d57] transition-all"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                catFilter === cat
                  ? "bg-[#0f5070] text-white border-[#0f5070]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2d8ab8]"
              }`}
            >
              {cat === "all" ? "All" : cat} {cat !== "all" && catCounts[cat] ? `(${catCounts[cat]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Product table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 text-sm">
            {products.length === 0
              ? "No products yet — add one above, or sync from lib/data.ts"
              : "No products match your filters"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((p) => (
                <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#eef8fd] flex items-center justify-center shrink-0 text-[#0f5070] text-xs font-bold">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-[#071e2e] line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-full bg-[#eef8fd] text-[#0f5070] text-xs font-medium capitalize">{p.category}</span>
                    {p.badge && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">{p.badge}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#071e2e]">
                    UGX {p.price.toLocaleString()}
                    <div className="text-xs text-gray-400 font-normal">{p.unit}</div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <button onClick={() => toggleStock(p)} title="Toggle stock">
                      {p.in_stock
                        ? <PackageCheck size={18} className="text-green-500 mx-auto" />
                        : <PackageX size={18} className="text-red-400 mx-auto" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-[#eef8fd] text-gray-400 hover:text-[#0f5070] transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Slide-out form panel ── */}
      {editId !== null && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-[#071e2e] font-display text-lg">
                {editId === "new" ? "Add New Product" : "Edit Product"}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Image preview */}
              {form.image_url && (
                <div className="relative h-40 rounded-xl overflow-hidden bg-[#eef8fd]">
                  <Image src={form.image_url} alt="preview" fill className="object-cover" sizes="480px" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  placeholder="e.g. Nile Tilapia Fingerlings"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug (URL key) *</label>
                <input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  required
                  placeholder="nile-tilapia-fingerlings"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Badge</label>
                  <div className="relative">
                    <select
                      value={form.badge ?? ""}
                      onChange={(e) => handleChange("badge", e.target.value || null)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                    >
                      {BADGES.map((b) => <option key={b} value={b}>{b || "— none —"}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (UGX) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => handleChange("price", Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <input
                    value={form.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    placeholder="per fingerling"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <input
                  value={form.image_url ?? ""}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  placeholder="Brief product description..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Specs <span className="text-gray-400">(one per line)</span>
                </label>
                <textarea
                  value={specsInput}
                  onChange={(e) => setSpecsInput(e.target.value)}
                  rows={4}
                  placeholder={"45% crude protein\n3mm pellet size\n25kg packaging"}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => handleChange("sort_order", Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => handleChange("in_stock", !form.in_stock)}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${form.in_stock ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow ${form.in_stock ? "translate-x-5.5 ml-[22px]" : "ml-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave as unknown as React.MouseEventHandler}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0f5070] text-white text-sm font-semibold hover:bg-[#0a3d57] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId === "new" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
