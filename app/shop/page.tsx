"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, SlidersHorizontal, ChevronDown, X, Star,
  Fish, Layers, Wrench, Wheat, ShoppingBag, CheckCircle2,
  ArrowUpDown, Grid3X3, List, Phone, Tag, Eye
} from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import AddToCartButton from "@/components/shop/AddToCartButton";

const CATEGORIES = [
  { id: "all", label: "All Products", icon: ShoppingBag, count: PRODUCTS.length },
  { id: "fingerlings", label: "Fish Fingerlings", icon: Fish, count: PRODUCTS.filter(p => p.category === "fingerlings").length },
  { id: "feed", label: "Fish Feed", icon: Wheat, count: PRODUCTS.filter(p => p.category === "feed").length },
  { id: "liners", label: "Dam Liners", icon: Layers, count: PRODUCTS.filter(p => p.category === "liners").length },
  { id: "equipment", label: "Equipment", icon: Wrench, count: PRODUCTS.filter(p => p.category === "equipment").length },
];

const SORT_OPTIONS = [
  { id: "default", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name-asc", label: "Name: A–Z" },
];

const CATEGORY_IMAGES: Record<string, string> = {
  fingerlings: "1560275619-4662e36fa65c",
  feed: "1586201375761-83865001e31c",
  liners: "1504711434969-e33886168f5c",
  equipment: "1574943320219-553eb213f72d",
};

const BADGE_STYLE: Record<string, string> = {
  "Best Seller": "bg-[#f4a020] text-white",
  "Premium": "bg-[#0f5070] text-white",
  "New": "bg-[#226640] text-white",
  "Most Popular": "bg-[#2d8ab8] text-white",
  "Heavy Duty": "bg-gray-800 text-white",
};

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (category !== "all") list = list.filter(p => p.category === category);
    if (inStockOnly) list = list.filter(p => p.inStock);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, search, sort, inStockOnly]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Shop Header Banner */}
      <div className="bg-gradient-to-r from-[#0a2d43] via-[#0f5070] to-[#226640] py-12 lg:py-16">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs mb-3">
                <ShoppingBag size={12} /> Aquaculture Inputs Store
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white font-display mb-2">
                KASC Online Shop
              </h1>
              <p className="text-blue-100 max-w-lg text-sm leading-relaxed">
                {PRODUCTS.length} premium aquaculture products — fingerlings, feed, dam liners & equipment. Delivered across East Africa.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                { label: "Fast Delivery", icon: CheckCircle2 },
                { label: "Quality Certified", icon: CheckCircle2 },
                { label: "After-Sales Support", icon: CheckCircle2 },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-blue-100">
                  <Icon size={13} className="text-[#3aaf6c]" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── SIDEBAR ── */}
          <aside className={cn(
            "lg:w-64 shrink-0 space-y-5",
            showFilters ? "block" : "hidden lg:block"
          )}>
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-[#071e2e] text-sm font-display">Categories</h3>
              </div>
              <div className="p-3 space-y-1">
                {CATEGORIES.map(({ id, label, icon: Icon, count }) => (
                  <button
                    key={id}
                    onClick={() => setCategory(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      category === id
                        ? "bg-[#0f5070] text-white"
                        : "text-gray-600 hover:bg-[#f0f7ff] hover:text-[#0f5070]"
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full",
                      category === id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-[#071e2e] text-sm font-display">Filters</h3>
              </div>
              <div className="p-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                    inStockOnly ? "bg-[#0f5070] border-[#0f5070]" : "border-gray-300 group-hover:border-[#2d8ab8]"
                  )}>
                    {inStockOnly && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Help box */}
            <div className="bg-gradient-to-br from-[#0f5070] to-[#226640] rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-2 font-display text-sm">Need Help Ordering?</h3>
              <p className="text-blue-100 text-xs leading-relaxed mb-4">
                Call or WhatsApp us and we&apos;ll help you pick the right products for your farm.
              </p>
              <a href="tel:+256700000000" className="flex items-center gap-2 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg transition-colors">
                <Phone size={13} /> +256 700 000000
              </a>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Search + Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] p-4 mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products (e.g. tilapia, liner, grader…)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#2d8ab8] hover:text-[#0f5070] transition-all whitespace-nowrap"
                  >
                    <ArrowUpDown size={14} />
                    {SORT_OPTIONS.find(s => s.id === sort)?.label}
                    <ChevronDown size={13} className={cn("transition-transform", sortOpen && "rotate-180")} />
                  </button>
                  {sortOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => { setSort(opt.id); setSortOpen(false); }}
                          className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-[#f0f7ff] transition-colors",
                            sort === opt.id ? "text-[#0f5070] font-semibold bg-[#eef8fd]" : "text-gray-700")}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button onClick={() => setView("grid")} className={cn("p-2 rounded-lg transition-all", view === "grid" ? "bg-white shadow text-[#0f5070]" : "text-gray-400 hover:text-gray-600")}>
                    <Grid3X3 size={16} />
                  </button>
                  <button onClick={() => setView("list")} className={cn("p-2 rounded-lg transition-all", view === "list" ? "bg-white shadow text-[#0f5070]" : "text-gray-400 hover:text-gray-600")}>
                    <List size={16} />
                  </button>
                </div>

                {/* Mobile filter toggle */}
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>

              {/* Active filters */}
              {(category !== "all" || search || inStockOnly) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Active filters:</span>
                  {category !== "all" && (
                    <button onClick={() => setCategory("all")} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef8fd] text-[#0f5070] text-xs font-medium border border-[#a0d4ea] hover:bg-[#d6eef8] transition-colors">
                      <Tag size={11} /> {CATEGORIES.find(c => c.id === category)?.label}
                      <X size={10} />
                    </button>
                  )}
                  {inStockOnly && (
                    <button onClick={() => setInStockOnly(false)} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fcf4] text-[#226640] text-xs font-medium border border-[#beeecf] hover:bg-[#d6f5e3] transition-colors">
                      In Stock <X size={10} />
                    </button>
                  )}
                  {search && (
                    <button onClick={() => setSearch("")} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbf0] text-[#a05200] text-xs font-medium border border-[#fde5b0] hover:bg-[#fde5b0] transition-colors">
                      &ldquo;{search}&rdquo; <X size={10} />
                    </button>
                  )}
                  <button onClick={() => { setCategory("all"); setSearch(""); setInStockOnly(false); }}
                    className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors underline">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-[#071e2e]">{filtered.length}</span> of {PRODUCTS.length} products
                {search && <span> for &ldquo;<span className="text-[#0f5070]">{search}</span>&rdquo;</span>}
              </p>
            </div>

            {/* No results */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Search size={32} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-[#071e2e] mb-1">No products found</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters.</p>
                <button onClick={() => { setSearch(""); setCategory("all"); setInStockOnly(false); }} className="btn-outline text-sm">
                  Clear Filters
                </button>
              </div>
            )}

            {/* GRID VIEW */}
            {view === "grid" && filtered.length > 0 && (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                {filtered.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                    {/* Image */}
                    <div className="relative h-36 sm:h-52 bg-gradient-to-br from-[#eef8fd] to-[#f0fcf4] overflow-hidden">
                      <Link href={`/shop/${product.slug}`}>
                        <Image
                          src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[product.category]}?w=500&q=80`}
                          alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      {product.badge && (
                        <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm", BADGE_STYLE[product.badge] ?? "bg-gray-800 text-white")}>
                          {product.badge}
                        </span>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="px-3 py-1.5 bg-gray-700 text-white text-xs font-semibold rounded-full">Out of Stock</span>
                        </div>
                      )}
                      {/* Quick view */}
                      <Link href={`/shop/${product.slug}`}
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-xs font-semibold text-[#0f5070] shadow-sm hover:bg-white">
                        <Eye size={12} /> Quick View
                      </Link>
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] sm:text-xs font-semibold text-[#2d8ab8] uppercase tracking-wide capitalize">{product.category}</span>
                      </div>
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="font-bold text-[#071e2e] text-xs sm:text-sm mb-1.5 line-clamp-2 hover:text-[#0f5070] transition-colors font-display leading-snug">{product.name}</h3>
                      </Link>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2 flex-1 hidden sm:block">{product.description}</p>

                      {/* Specs — hide on mobile to save space */}
                      <div className="hidden sm:flex flex-wrap gap-1.5 mb-3">
                        {product.specs.slice(0, 2).map(spec => (
                          <span key={spec} className="text-xs px-2 py-0.5 rounded-full bg-[#f0f7ff] text-[#0f5070] border border-[#d6eef8]">{spec}</span>
                        ))}
                      </div>

                      {/* Stars — hide on mobile */}
                      <div className="hidden sm:flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map(s => <Star key={s} size={11} className="text-[#f4a020]" fill="currentColor" />)}
                        <span className="text-xs text-gray-400 ml-1">(verified)</span>
                      </div>

                      {/* Price + Add to Cart */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                        <div>
                          <div className="text-[#0f5070] font-bold text-sm sm:text-base leading-none">{formatPrice(product.price)}</div>
                          <div className="text-gray-400 text-[10px] sm:text-xs mt-0.5">{product.unit}</div>
                        </div>
                        <AddToCartButton productId={product.id} variant="icon" />
                      </div>
                      <AddToCartButton productId={product.id} className="mt-2 text-xs sm:text-sm py-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {view === "list" && filtered.length > 0 && (
              <div className="space-y-4">
                {filtered.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative w-full sm:w-48 h-44 sm:h-auto bg-gradient-to-br from-[#eef8fd] to-[#f0fcf4] shrink-0 overflow-hidden">
                        <Link href={`/shop/${product.slug}`}>
                          <Image
                            src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[product.category]}?w=400&q=80`}
                            alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        {product.badge && (
                          <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold", BADGE_STYLE[product.badge] ?? "bg-gray-800 text-white")}>
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[#2d8ab8] uppercase tracking-wide capitalize mb-1">{product.category}</div>
                          <Link href={`/shop/${product.slug}`}>
                            <h3 className="font-bold text-[#071e2e] text-base mb-2 hover:text-[#0f5070] transition-colors font-display">{product.name}</h3>
                          </Link>
                          <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {product.specs.slice(0, 3).map(spec => (
                              <span key={spec} className="text-xs px-2 py-0.5 rounded-full bg-[#f0f7ff] text-[#0f5070] border border-[#d6eef8]">{spec}</span>
                            ))}
                          </div>
                        </div>

                        <div className="sm:w-44 flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-[#0f5070] font-bold text-xl">{formatPrice(product.price)}</div>
                            <div className="text-gray-400 text-xs">{product.unit}</div>
                          </div>
                          <div className="w-full sm:w-40 space-y-2">
                            <AddToCartButton productId={product.id} />
                            <Link href={`/shop/${product.slug}`} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#2d8ab8] hover:text-[#0f5070] transition-all">
                              <Eye size={13} /> View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
