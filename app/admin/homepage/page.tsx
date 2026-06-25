"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Save, Upload, X, Youtube, Home } from "lucide-react";

type Setting = { key: string; value: string; label: string };

const HERO_VIDEO_KEY = "hero_video_url";
const FARM_KEYS = ["farm_heading", "farm_desc_1", "farm_desc_2", "farm_image_1", "farm_image_2", "farm_image_3", "farm_image_4"];
const IMAGE_KEYS = new Set(["farm_image_1", "farm_image_2", "farm_image_3", "farm_image_4"]);
const TEXTAREA_KEYS = new Set(["farm_desc_1", "farm_desc_2"]);

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value, label").eq("category", "homepage");
    const s: Record<string, string> = {};
    const l: Record<string, string> = {};
    for (const row of data ?? []) { s[row.key] = row.value; l[row.key] = row.label; }
    setSettings(s);
    setLabels(l);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function saveKey(key: string) {
    setSaving(key);
    const { error } = await supabase.from("site_settings").update({ value: settings[key] ?? "" }).eq("key", key);
    if (error) toast.error("Failed to save: " + error.message);
    else toast.success("Saved!");
    setSaving(null);
  }

  async function saveKeys(keys: string[], label: string) {
    setSaving(label);
    await Promise.all(keys.map((k) => supabase.from("site_settings").update({ value: settings[k] ?? "" }).eq("key", k)));
    toast.success(`${label} saved`);
    setSaving(null);
  }

  async function handleImageUpload(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRefs.current[key]) fileRefs.current[key]!.value = "";
    if (!file) return;
    setImgUploading(key);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `homepage/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gallery").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed: " + error.message); setImgUploading(null); return; }
    const url = supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
    setSettings((s) => ({ ...s, [key]: url }));
    const { error: dbErr } = await supabase.from("site_settings").update({ value: url }).eq("key", key);
    if (dbErr) toast.error("Saved to storage but DB failed");
    else toast.success("Image updated!");
    setImgUploading(null);
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Home size={22} className="text-[#0f5070]" />
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Homepage Content</h1>
        </div>
        <p className="text-gray-500 text-sm">Edit the text and media shown on the homepage. Changes are live immediately after saving.</p>
      </div>

      <div className="space-y-8">
        {/* ── Hero Video ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Youtube size={18} className="text-red-500" />
              <h2 className="font-bold text-[#071e2e] font-display">Homepage Video</h2>
            </div>
            <button
              onClick={() => saveKey(HERO_VIDEO_KEY)}
              disabled={saving === HERO_VIDEO_KEY}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071e2e] text-white text-xs font-semibold hover:bg-[#0f3a52] disabled:opacity-60 transition-all"
            >
              {saving === HERO_VIDEO_KEY ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">Paste a YouTube URL here to show a video in the "Why Choose Us" section. Leave blank to show the default farm photo instead.</p>
          <input
            value={settings[HERO_VIDEO_KEY] ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, [HERO_VIDEO_KEY]: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
          />
          {settings[HERO_VIDEO_KEY] && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-700 font-medium">Video URL set — will show embedded player on homepage</span>
              <button onClick={() => setSettings((s) => ({ ...s, [HERO_VIDEO_KEY]: "" }))} className="ml-auto text-xs text-red-500 hover:underline flex items-center gap-1">
                <X size={11} /> Remove
              </button>
            </div>
          )}
        </div>

        {/* ── Farm Section ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#071e2e] font-display">Our Demonstration Farm Section</h2>
            <button
              onClick={() => saveKeys(FARM_KEYS.filter((k) => !IMAGE_KEYS.has(k)), "Farm Section text")}
              disabled={!!saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071e2e] text-white text-xs font-semibold hover:bg-[#0f3a52] disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Text
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{labels["farm_heading"] ?? "Section Heading"}</label>
              <input
                value={settings["farm_heading"] ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, farm_heading: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
              />
            </div>
            {["farm_desc_1", "farm_desc_2"].map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{labels[key] ?? key}</label>
                <textarea
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none"
                />
              </div>
            ))}
          </div>

          {/* Farm Images */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Farm Photos</h3>
            <p className="text-xs text-gray-400 mb-4">The first photo appears large (full width). Photos 2–4 appear as smaller tiles beside it.</p>
            <div className="grid grid-cols-2 gap-4">
              {["farm_image_1", "farm_image_2", "farm_image_3", "farm_image_4"].map((key, i) => (
                <div key={key} className={i === 0 ? "col-span-2" : ""}>
                  <div className="text-xs text-gray-500 mb-1.5">{i === 0 ? "Large photo (top)" : `Photo ${i + 1}`}</div>
                  <div className={`relative rounded-xl overflow-hidden bg-gray-100 mb-2 ${i === 0 ? "h-48" : "h-28"}`}>
                    {settings[key] && (
                      <Image src={settings[key]} alt="" fill className="object-cover" sizes={i === 0 ? "600px" : "300px"} />
                    )}
                    {imgUploading === key && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-[#0f5070]" />
                      </div>
                    )}
                  </div>
                  <label className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer text-xs transition-all ${imgUploading === key ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-[#2d8ab8]/40 hover:border-[#2d8ab8] text-[#0f5070]"}`}>
                    <Upload size={13} /> {settings[key] ? "Replace photo" : "Upload photo"}
                    <input
                      ref={(el) => { fileRefs.current[key] = el; }}
                      type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      disabled={!!imgUploading} onChange={(e) => handleImageUpload(key, e)}
                    />
                  </label>
                  <input
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder="Or paste image URL..."
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d8ab8]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
