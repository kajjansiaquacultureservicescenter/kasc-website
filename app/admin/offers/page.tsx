"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Tag, Plus, Trash2, Loader2, ToggleLeft, ToggleRight, Edit3, X, Upload } from "lucide-react";
import Image from "next/image";

type Offer = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  badge_text: string | null;
  discount_type: string | null;
  discount_value: number | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (UGX)" },
  { value: "free_delivery", label: "Free Delivery" },
  { value: "bundle", label: "Bundle Deal" },
];

const blankForm = { title: "", description: "", badge_text: "", discount_type: "percentage", discount_value: "", is_active: true, starts_at: "", ends_at: "", image_url: "", storage_path: "" };

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ ...blankForm });
  const supabase = useMemo(() => createClient(), []);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
    setOffers(data as Offer[] || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  function openNew() { setForm({ ...blankForm }); setEditing(null); setShowForm(true); }
  function openEdit(o: Offer) {
    setForm({ title: o.title, description: o.description || "", badge_text: o.badge_text || "", discount_type: o.discount_type || "percentage", discount_value: o.discount_value?.toString() || "", is_active: o.is_active, starts_at: o.starts_at?.slice(0, 16) || "", ends_at: o.ends_at?.slice(0, 16) || "", image_url: o.image_url || "", storage_path: "" });
    setEditing(o);
    setShowForm(true);
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("offers").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data } = supabase.storage.from("offers").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl, storage_path: path }));
    setUploading(false);
  }

  async function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      badge_text: form.badge_text.trim() || null,
      discount_type: form.discount_type || null,
      discount_value: form.discount_value ? parseFloat(form.discount_value) : null,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      image_url: form.image_url || null,
    };
    const { error } = editing
      ? await supabase.from("offers").update(payload).eq("id", editing.id)
      : await supabase.from("offers").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Offer updated!" : "Offer created!"); setShowForm(false); loadOffers(); }
    setSaving(false);
  }

  async function deleteOffer(o: Offer) {
    if (!confirm(`Delete "${o.title}"?`)) return;
    await supabase.from("offers").delete().eq("id", o.id);
    toast.success("Deleted");
    setOffers((prev) => prev.filter((x) => x.id !== o.id));
  }

  async function toggleActive(o: Offer) {
    await supabase.from("offers").update({ is_active: !o.is_active }).eq("id", o.id);
    setOffers((prev) => prev.map((x) => x.id === o.id ? { ...x, is_active: !x.is_active } : x));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0c4a6e] font-display">Offers</h1>
          <p className="text-gray-500 text-sm mt-1">{offers.length} offer{offers.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c4a6e] text-white text-sm font-semibold hover:bg-[#075985] transition-all">
          <Plus size={15} /> New Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Tag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm mb-4">No offers yet</p>
          <button onClick={openNew} className="px-4 py-2 rounded-xl bg-[#0c4a6e] text-white text-sm">Create first offer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o) => (
            <div key={o.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${o.is_active ? "border-gray-100" : "border-gray-200 opacity-70"}`}>
              {o.image_url && (
                <div className="aspect-video relative"><Image src={o.image_url} alt={o.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div>
              )}
              <div className="p-4">
                {o.badge_text && <span className="inline-block px-2 py-0.5 rounded-full bg-[#f4a020] text-white text-xs font-bold mb-2">{o.badge_text}</span>}
                <h3 className="font-semibold text-[#0c4a6e] text-sm mb-1">{o.title}</h3>
                {o.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{o.description}</p>}
                {o.discount_value && (
                  <p className="text-xs text-gray-500">
                    {o.discount_type === "percentage" ? `${o.discount_value}% off` :
                     o.discount_type === "fixed" ? `UGX ${Number(o.discount_value).toLocaleString()} off` : o.discount_type}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => toggleActive(o)} className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${o.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {o.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />} {o.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-all"><Edit3 size={13} /></button>
                  <button onClick={() => deleteOffer(o)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-[#0c4a6e] font-display">{editing ? "Edit Offer" : "New Offer"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Offer title" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Badge text</label>
                <input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} placeholder="e.g. 30% OFF, FREE DELIVERY" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Discount type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]">
                    {DISCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Discount value</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="e.g. 20" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Starts</label>
                  <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ends</label>
                  <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Offer image</label>
                {form.image_url && <div className="mb-2 relative h-24 rounded-xl overflow-hidden"><Image src={form.image_url} alt="Offer" fill className="object-cover" sizes="400px" /></div>}
                <label className={`flex items-center gap-2 px-3 py-2.5 border border-dashed rounded-xl cursor-pointer text-sm ${uploading ? "border-gray-200 bg-gray-50" : "border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#0284c7]"}`}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? "Uploading..." : "Upload image"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={uploadImage} />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (visible to customers)</label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#0c4a6e] text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
