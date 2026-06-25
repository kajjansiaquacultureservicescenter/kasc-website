"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Settings, Loader2, Save, Upload, X, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Setting = { key: string; value: string; label: string; category: string };

const CATEGORY_LABELS: Record<string, string> = {
  homepage: "Homepage Content",
  contact:  "Contact Information",
  social:   "Social Media Links",
  shop:     "Shop Settings",
  payments: "Payment Details",
};

const IMAGE_KEYS = new Set([
  "farm_image_1", "farm_image_2", "farm_image_3", "farm_image_4",
]);

function isImageKey(key: string) {
  return IMAGE_KEYS.has(key) || /image/i.test(key);
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").order("category").order("key");
      const s = data as Setting[] || [];
      setSettings(s);
      const v: Record<string, string> = {};
      s.forEach((x) => (v[x.key] = x.value));
      setValues(v);
      setLoading(false);
    })();
  }, [supabase]);

  async function saveCategory(category: string) {
    setSaving(category);
    const categorySettings = settings.filter((s) => s.category === category);
    const updates = categorySettings.map((s) =>
      supabase.from("site_settings").update({ value: values[s.key] ?? "" }).eq("key", s.key)
    );
    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) toast.error("Some settings failed to save");
    else toast.success(`${CATEGORY_LABELS[category] || category} saved`);
    setSaving(null);
  }

  async function handleImageUpload(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRefs.current[key]) fileRefs.current[key]!.value = "";
    if (!file) return;
    setUploading(key);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `settings/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gallery").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed: " + error.message); setUploading(null); return; }
    const url = supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
    setValues((v) => ({ ...v, [key]: url }));
    const { error: dbErr } = await supabase.from("site_settings").update({ value: url }).eq("key", key);
    if (dbErr) toast.error("Saved to storage but DB update failed");
    else toast.success("Image uploaded and saved!");
    setUploading(null);
  }

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={22} className="text-[#0f5070]" />
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Settings</h1>
        </div>
        <p className="text-gray-500 text-sm">Update contact details, social links, and site content</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#071e2e] font-display">{CATEGORY_LABELS[category] || category}</h2>
                <div className="flex items-center gap-2">
                  {category === "homepage" && (
                    <Link
                      href="/admin/homepage"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#0f5070] text-xs font-semibold transition-all"
                    >
                      <ExternalLink size={12} /> Homepage Editor
                    </Link>
                  )}
                  <button
                    onClick={() => saveCategory(category)}
                    disabled={saving === category}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071e2e] text-white text-xs font-semibold hover:bg-[#0f3a52] disabled:opacity-60 transition-all"
                  >
                    {saving === category ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save
                  </button>
                </div>
              </div>

              {category === "homepage" && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                  Tip: For a better experience uploading photos and previewing the homepage layout, use the{" "}
                  <Link href="/admin/homepage" className="font-semibold underline">Homepage Editor</Link>.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((s) =>
                  isImageKey(s.key) ? (
                    <div key={s.key} className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-2">{s.label}</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Preview */}
                        <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          {values[s.key] ? (
                            <>
                              <Image src={values[s.key]} alt={s.label} fill className="object-cover" sizes="160px" />
                              <button
                                onClick={() => setValues((v) => ({ ...v, [s.key]: "" }))}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                          )}
                          {uploading === s.key && (
                            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                              <Loader2 size={18} className="animate-spin text-[#0f5070]" />
                            </div>
                          )}
                        </div>
                        {/* Controls */}
                        <div className="flex-1 flex flex-col gap-2">
                          <label className={`flex items-center gap-2 px-3 py-2.5 border-2 border-dashed rounded-xl cursor-pointer text-xs font-medium transition-all ${uploading === s.key ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-[#2d8ab8]/40 hover:border-[#2d8ab8] text-[#0f5070] hover:bg-blue-50"}`}>
                            <Upload size={13} />
                            {values[s.key] ? "Replace with new photo" : "Upload photo"}
                            <input
                              ref={(el) => { fileRefs.current[s.key] = el; }}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              disabled={!!uploading}
                              onChange={(e) => handleImageUpload(s.key, e)}
                            />
                          </label>
                          <input
                            value={values[s.key] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                            placeholder="Or paste an image URL..."
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] transition-all"
                          />
                          <p className="text-[10px] text-gray-400">Upload a photo from your device, or paste a URL above.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={s.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{s.label}</label>
                      <input
                        value={values[s.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                        placeholder={s.label}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] transition-all"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
