import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Phone, ArrowRight, Package, Star, Shield, Truck, RefreshCcw } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice, cn } from "@/lib/utils";
import ProductActions from "@/components/shop/ProductActions";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductImageGallery from "@/components/shop/ProductImageGallery";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const admin = createAdminClient();
  const { data } = await admin.from("products").select("slug");
  return (data ?? []).map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("products").select("name, description").eq("slug", slug).single();
  if (!data) return {};
  return { title: data.name, description: data.description };
}

const FALLBACK_IMAGES: Record<string, string> = {
  fingerlings: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&q=85",
  feed:        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=85",
  liners:      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=85",
  nets:        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=85",
  equipment:   "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=85",
};

const BADGE_STYLE: Record<string, string> = {
  "Best Seller":  "bg-[#f4a020] text-white",
  "Premium":      "bg-[#0284c7] text-white",
  "New":          "bg-[#226640] text-white",
  "Most Popular": "bg-[#38bdf8] text-white",
  "Heavy Duty":   "bg-gray-800 text-white",
  "Essential":    "bg-purple-700 text-white",
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const admin = createAdminClient();

  const [{ data: product }, { data: related }] = await Promise.all([
    admin.from("products").select("*").eq("slug", slug).single(),
    admin.from("products").select("id, name, slug, category, price, unit, badge, image_url, in_stock").neq("slug", slug).order("sort_order").limit(20),
  ]);

  if (!product) notFound();

  const relatedProducts = (related ?? []).filter(p => p.category === product.category).slice(0, 4);
  const heroImg = product.image_url || FALLBACK_IMAGES[product.category] || FALLBACK_IMAGES.equipment;
  const extraImages: string[] = Array.isArray(product.images) ? product.images : [];
  const allImages = [heroImg, ...extraImages];
  const specs: string[] = Array.isArray(product.specs) ? product.specs : [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container-wide flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/shop" className="hover:text-[#0284c7] transition-colors">Shop</Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#0284c7] font-medium capitalize">{product.category}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container-wide py-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0284c7] text-sm mb-6 transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Shop
        </Link>

        {/* Main product section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image panel */}
            <ProductImageGallery
              images={allImages}
              name={product.name}
              badge={product.badge}
              badgeStyle={BADGE_STYLE[product.badge ?? ""] ?? "bg-gray-800 text-white"}
              inStock={product.in_stock}
            />

            {/* Details panel */}
            <div className="p-7 lg:p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-widest capitalize">{product.category}</span>
                {product.in_stock && (
                  <span className="flex items-center gap-1 text-xs text-[#226640] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3aaf6c]" /> In Stock
                  </span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-[#0c4a6e] mb-3 font-display leading-tight">{product.name}</h1>

              {/* Stars */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={15} className="text-[#f4a020]" fill="currentColor" />)}
                </div>
                <span className="text-sm text-gray-500">5.0 · Verified quality</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-gray-100">
                <span className="text-3xl lg:text-4xl font-bold text-[#0284c7]">{formatPrice(product.price)}</span>
                <span className="text-gray-400 text-sm">{product.unit}</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-5">{product.description}</p>

              {/* Specs */}
              {specs.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#0c4a6e] text-sm mb-3">Product Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {specs.map((spec) => (
                      <div key={spec} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc] border border-gray-100 text-sm text-gray-700">
                        <CheckCircle2 size={14} className="text-[#38bdf8] shrink-0" />
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive: quantity + cart */}
              <ProductActions product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                category: product.category,
                price: product.price,
                unit: product.unit,
                in_stock: product.in_stock,
              }} />

              {/* Trust signals */}
              <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "Quality Certified", desc: "All products tested" },
                  { icon: Truck, label: "Nationwide Delivery", desc: "Uganda & East Africa" },
                  { icon: Phone, label: "Expert Support", desc: "+256 705 641626" },
                  { icon: RefreshCcw, label: "After-Sales Service", desc: "We follow up" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f0f9ff] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#0284c7]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#0c4a6e]">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How to order info */}
        <div className="bg-white rounded-2xl border border-[#bae6fd] p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] flex items-center justify-center shrink-0">
            <Package size={18} className="text-[#0284c7]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0c4a6e] mb-1">How Ordering Works</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Add products to your cart, then proceed to the order form where you fill in your delivery location and contact details. Our team will confirm availability, delivery cost, and timeline within 24 hours before any payment is processed.
            </p>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#0c4a6e] font-display">More {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</h2>
              <Link href="/shop" className="text-sm text-[#0284c7] hover:underline flex items-center gap-1">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => {
                const img = p.image_url || FALLBACK_IMAGES[p.category] || FALLBACK_IMAGES.equipment;
                return (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                    <div className="relative h-40 bg-gradient-to-br from-[#f0f9ff] to-[#f0fcf4] overflow-hidden">
                      <Link href={`/shop/${p.slug}`}>
                        <Image src={img} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      {p.badge && (
                        <span className={cn("absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold", BADGE_STYLE[p.badge] ?? "bg-gray-800 text-white")}>{p.badge}</span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <Link href={`/shop/${p.slug}`}>
                        <h3 className="font-semibold text-[#0c4a6e] text-sm mb-1 hover:text-[#0284c7] transition-colors line-clamp-2 font-display">{p.name}</h3>
                      </Link>
                      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[#0284c7] font-bold">{formatPrice(p.price)}</div>
                          <div className="text-gray-400 text-xs">{p.unit}</div>
                        </div>
                        <AddToCartButton product={p} variant="icon" />
                      </div>
                      <AddToCartButton product={p} className="mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
