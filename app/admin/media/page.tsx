"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Video, Trash2, Plus, Loader2, Music2, X, Play } from "lucide-react";
import Image from "next/image";

type MediaEmbed = {
  id: string;
  title: string;
  description: string | null;
  platform: "youtube" | "tiktok";
  original_url: string;
  video_id: string;
  embed_url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTikTokId(url: string): string | null {
  const m = url.match(/\/video\/([0-9]+)/);
  return m ? m[1] : null;
}

function detectPlatform(url: string): "youtube" | "tiktok" | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/tiktok\.com/.test(url)) return "tiktok";
  return null;
}

export default function AdminMediaPage() {
  const [embeds, setEmbeds] = useState<MediaEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<MediaEmbed | null>(null);
  const [form, setForm] = useState({ url: "", title: "", description: "" });
  const [platformDetected, setPlatformDetected] = useState<"youtube" | "tiktok" | null>(null);
  const supabase = createClient();

  async function fetchEmbeds() {
    setLoading(true);
    const { data } = await supabase.from("media_embeds").select("*").order("sort_order");
    setEmbeds(data as MediaEmbed[] || []);
    setLoading(false);
  }

  useEffect(() => { fetchEmbeds(); }, []);

  function onUrlChange(url: string) {
    setForm({ ...form, url });
    setPlatformDetected(detectPlatform(url));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) { toast.error("Title and URL are required"); return; }

    const platform = detectPlatform(form.url);
    if (!platform) { toast.error("Only YouTube and TikTok URLs are supported"); return; }

    let videoId: string | null = null;
    let embedUrl = "";
    let thumbnailUrl: string | null = null;

    if (platform === "youtube") {
      videoId = extractYouTubeId(form.url);
      if (!videoId) { toast.error("Could not extract YouTube video ID from URL"); return; }
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else {
      videoId = extractTikTokId(form.url);
      if (!videoId) { toast.error("Could not extract TikTok video ID. Use the full video URL."); return; }
      embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    }

    setSaving(true);
    const { error } = await supabase.from("media_embeds").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      platform,
      original_url: form.url.trim(),
      video_id: videoId,
      embed_url: embedUrl,
      thumbnail_url: thumbnailUrl,
    });

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Video added!");
      setForm({ url: "", title: "", description: "" });
      setPlatformDetected(null);
      await fetchEmbeds();
    }
    setSaving(false);
  }

  async function deleteEmbed(embed: MediaEmbed) {
    if (!confirm(`Delete "${embed.title}"?`)) return;
    await supabase.from("media_embeds").delete().eq("id", embed.id);
    toast.success("Deleted");
    setEmbeds((prev) => prev.filter((e) => e.id !== embed.id));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071e2e] font-display">Videos</h1>
        <p className="text-gray-500 text-sm mt-1">Add YouTube and TikTok videos to the gallery</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-bold text-[#071e2e] mb-4 font-display">Add New Video</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Video URL *</label>
            <div className="relative">
              <input
                value={form.url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="Paste a YouTube or TikTok video link"
                className="w-full px-3 py-2.5 pr-28 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
              />
              {platformDetected && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  platformDetected === "youtube" ? "bg-red-100 text-red-700" : "bg-black text-white"
                }`}>
                  {platformDetected === "youtube" ? <Play size={12} /> : <Music2 size={12} />}
                  {platformDetected === "youtube" ? "YouTube" : "TikTok"}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. How to build a fish pond"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071e2e] text-white text-sm font-semibold hover:bg-[#0f3a52] transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Add Video
        </button>
      </form>

      {/* Video grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : embeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Video size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No videos yet — add one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {embeds.map((embed) => (
            <div key={embed.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm group">
              {/* Thumbnail */}
              <div className="aspect-video relative bg-gray-100">
                {embed.thumbnail_url ? (
                  <Image src={embed.thumbnail_url} alt={embed.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <Music2 size={32} className="text-white/60" />
                  </div>
                )}
                <button
                  onClick={() => setPreview(embed)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                    <Play size={20} className="text-[#071e2e] ml-1" />
                  </div>
                </button>
                <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                  embed.platform === "youtube" ? "bg-red-600 text-white" : "bg-black text-white"
                }`}>
                  {embed.platform === "youtube" ? <Play size={10} /> : <Music2 size={10} />}
                  {embed.platform === "youtube" ? "YouTube" : "TikTok"}
                </div>
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#071e2e] truncate">{embed.title}</div>
                  {embed.description && <div className="text-xs text-gray-400 mt-0.5 truncate">{embed.description}</div>}
                </div>
                <button
                  onClick={() => deleteEmbed(embed)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20">
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              <iframe
                src={preview.embed_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
