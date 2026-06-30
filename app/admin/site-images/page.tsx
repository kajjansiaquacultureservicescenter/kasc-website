"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Trash2, RefreshCw, Globe, Package, Newspaper, Zap, Tag, Image as ImageIcon } from "lucide-react";

type ImageEntry = {
  id: string;
  url: string;
  label: string;
  source: "gallery" | "products" | "news" | "flash-deals" | "offers";
  sourceLabel: string;
  storagePath?: string;
  bucket?: string;
};

const SOURCE_TABS = [
  { key: "all",         label: "All",          icon: Globe },
  { key: "products",    label: "Products",     icon: Package },
  { key: "gallery",     label: "Gallery",      icon: ImageIcon },
  { key: "news",        label: "News",         icon: Newspaper },
  { key: "flash-deals", label: "Flash Deals",  icon: Zap },
  { key: "offers",      label: "Offers",       icon: Tag },
] as const;

export default function SiteImagesPage() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const entries: ImageEntry[] = [];

    const [
      { data: products },
      { data: gallery },
      { data: news },
      { data: flashDeals },
      { data: offers },
    ] = await Promise.all([
      supabase.from("products").select("id, name, image_url, images"),
      supabase.from("gallery_photos").select("id, title, public_url, storage_path"),
      supabase.from("news").select("id, title, cover_image_url"),
      supabase.from("flash_deals").select("id, product_name, image_url"),
      supabase.from("offers").select("id, title, image_url"),
    ]);

    for (const p of products ?? []) {
      if (p.image_url) {
        entries.push({ id: `prod-${p.id}-main`, url: p.image_url, label: p.name, source: "products", sourceLabel: "Products – main" });
      }
      for (const [i, url] of ((p.images as string[]) ?? []).entries()) {
        entries.push({ id: `prod-${p.id}-extra-${i}`, url, label: `${p.name} (image ${i + 2})`, source: "products", sourceLabel: "Products – gallery" });
      }
    }
    for (const g of gallery ?? []) {
      if (g.public_url) {
        entries.push({ id: `gal-${g.id}`, url: g.public_url, label: g.title, source: "gallery", sourceLabel: "Gallery", storagePath: g.storage_path || undefined, bucket: "gallery" });
      }
    }
    for (const n of news ?? []) {
      if (n.cover_image_url) {
        entries.push({ id: `news-${n.id}`, url: n.cover_image_url, label: n.title, source: "news", sourceLabel: "News" });
      }
    }
    for (const f of flashDeals ?? []) {
      if (f.image_url) {
        entries.push({ id: `fd-${f.id}`, url: f.image_url, label: f.product_name, source: "flash-deals", sourceLabel: "Flash Deals" });
      }
    }
    for (const o of offers ?? []) {
      if (o.image_url) {
        entries.push({ id: `off-${o.id}`, url: o.image_url, label: o.title, source: "offers", sourceLabel: "Offers" });
      }
    }

    setImages(entries);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function deleteGalleryImage(entry: ImageEntry) {
    if (!confirm(`Delete "${entry.label}"? This cannot be undone.`)) return;
    setDeleting(entry.id);
    const photoId = entry.id.replace("gal-", "");
    if (entry.storagePath) {
      await supabase.storage.from("gallery").remove([entry.storagePath]);
    }
    const { error } = await supabase.from("gallery_photos").delete().eq("id", photoId);
    if (error) {
      toast.error("Delete failed: " + error.message);
    } else {
      toast.success("Photo deleted");
      setImages((prev) => prev.filter((i) => i.id !== entry.id));
    }
    setDeleting(null);
  }

  const filtered = tab === "all" ? images : images.filter((i) => i.source === tab);

  const counts = images.reduce<Record<string, number>>((acc, img) => {
    acc[img.source] = (acc[img.source] ?? 0) + 1;
    acc["all"] = (acc["all"] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0c4a6e] font-display">Site Images</h1>
        <p className="text-gray-500 text-sm mt-1">
          All images used across the website — {images.length} total. To replace a product or gallery image, edit it from its respective section.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SOURCE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              tab === key
                ? "bg-[#0c4a6e] text-white border-[#0c4a6e]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            <Icon size={12} />
            {label}
            {counts[key] !== undefined && (
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === key ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#0284c7] transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No images in this section yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((entry) => (
            <div key={entry.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative aspect-square">
                <Image
                  src={entry.url}
                  alt={entry.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {entry.source === "gallery" && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => deleteGalleryImage(entry)}
                      disabled={deleting === entry.id}
                      className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all"
                    >
                      {deleting === entry.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-[#0c4a6e] truncate">{entry.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{entry.sourceLabel}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-2xl bg-[#f8fafc] border border-gray-200 text-sm text-gray-500">
        <strong className="text-gray-700">To replace an image:</strong> go to the relevant section (Products / Gallery / News / etc.) and edit the item there. Gallery images can be deleted directly from this page using the trash icon that appears on hover.
      </div>
    </div>
  );
}
