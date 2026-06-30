"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, Loader2, X } from "lucide-react";

type Photo = {
  id: string;
  title: string;
  description: string | null;
  public_url: string;
  storage_path: string;
  category: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

const CATEGORIES = ["general", "ponds", "hatchery", "liners", "feed", "training", "products", "events", "farm"];

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({ title: "", category: "general", description: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("gallery_photos").select("*").order("sort_order", { ascending: true });
    if (filterCat !== "all") q = q.eq("category", filterCat);
    const { data } = await q;
    setPhotos(data as Photo[] || []);
    setLoading(false);
  }, [filterCat, supabase]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.title.trim()) {
      toast.error("Please enter a title first");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File must be under ${maxMB}MB`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, { upsert: false });
    if (uploadError) { toast.error("Upload failed: " + uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);

    const { error: dbError } = await supabase.from("gallery_photos").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      storage_path: path,
      public_url: urlData.publicUrl,
      category: form.category,
    });

    if (dbError) {
      toast.error("Saved to storage but DB failed. Contact support.");
    } else {
      toast.success("Photo uploaded!");
      setForm({ title: "", category: "general", description: "" });
      if (fileRef.current) fileRef.current.value = "";
      await fetchPhotos();
    }
    setUploading(false);
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm(`Delete "${photo.title}"? This cannot be undone.`)) return;
    if (photo.storage_path) {
      await supabase.storage.from("gallery").remove([photo.storage_path]);
    }
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    toast.success("Photo deleted");
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  async function toggleFeatured(photo: Photo) {
    await supabase.from("gallery_photos").update({ is_featured: !photo.is_featured }).eq("id", photo.id);
    setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, is_featured: !p.is_featured } : p));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0c4a6e] font-display">Gallery</h1>
        <p className="text-gray-500 text-sm mt-1">{photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded</p>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-bold text-[#0c4a6e] mb-4 font-display">Upload New Photo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Tilapia fingerlings in hatchery"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the photo"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
            />
          </div>
        </div>

        <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          uploading ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-[#38bdf8]/40 hover:border-[#38bdf8] hover:bg-[#f0f9ff]/50"
        }`}>
          {uploading ? (
            <><Loader2 size={20} className="animate-spin text-[#0284c7]" /><span className="text-sm text-[#0284c7]">Uploading...</span></>
          ) : (
            <><Upload size={20} className="text-[#0284c7]" /><span className="text-sm text-[#0284c7] font-medium">Click to select image (JPG, PNG, WebP — max 10MB)</span></>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filterCat === c ? "bg-[#0c4a6e] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No photos yet — upload your first one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="aspect-square relative">
                <Image src={photo.public_url} alt={photo.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => toggleFeatured(photo)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${photo.is_featured ? "bg-yellow-400 text-black" : "bg-white text-gray-700"}`}
                    title={photo.is_featured ? "Remove from featured" : "Mark as featured"}
                  >
                    ★
                  </button>
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-[#0c4a6e] truncate">{photo.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400 capitalize">{photo.category}</span>
                  {photo.is_featured && <span className="text-xs text-yellow-600 font-medium">★ Featured</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
