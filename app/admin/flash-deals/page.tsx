"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap, Plus, Trash2, Loader2, X, Upload, Clock } from "lucide-react";
import Image from "next/image";

type FlashDeal = {
  id: string;
  product_name: string;
  product_slug: string | null;
  original_price: number;
  deal_price: number;
  image_url: string | null;
  starts_at: string;
  ends_at: string;
  total_quantity: number | null;
  quantity_sold: number;
  is_active: boolean;
  created_at: string;
};

const blankForm = { product_name: "", product_slug: "", original_price: "", deal_price: "", starts_at: "", ends_at: "", total_quantity: "", is_active: true, image_url: "", storage_path: "" };

function timeLeft(end: string) {
  const diff = new Date(end).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export default function AdminFlashDealsPage() {
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ ...blankForm });
  const supabase = useMemo(() => createClient(), []);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("flash_deals").select("*").order("created_at", { ascending: false });
    setDeals(data as FlashDeal[] || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}.${file.name.split(".").pop()}`;
    await supabase.storage.from("offers").upload(path, file);
    const { data } = supabase.storage.from("offers").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl, storage_path: path }));
    setUploading(false);
  }

  async function save() {
    if (!form.product_name.trim() || !form.original_price || !form.deal_price || !form.starts_at || !form.ends_at) {
      toast.error("Please fill all required fields"); return;
    }
    if (parseFloat(form.deal_price) >= parseFloat(form.original_price)) {
      toast.error("Deal price must be lower than original price"); return;
    }
    setSaving(true);
    const payload = {
      product_name: form.product_name.trim(),
      product_slug: form.product_slug.trim() || null,
      original_price: parseFloat(form.original_price),
      deal_price: parseFloat(form.deal_price),
      image_url: form.image_url || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      total_quantity: form.total_quantity ? parseInt(form.total_quantity) : null,
      is_active: form.is_active,
    };
    const { error } = await supabase.from("flash_deals").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Flash deal created!"); setShowForm(false); loadDeals(); }
    setSaving(false);
  }

  async function toggleActive(d: FlashDeal) {
    await supabase.from("flash_deals").update({ is_active: !d.is_active }).eq("id", d.id);
    setDeals((prev) => prev.map((x) => x.id === d.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function deleteDeal(d: FlashDeal) {
    if (!confirm(`Delete "${d.product_name}" flash deal?`)) return;
    await supabase.from("flash_deals").delete().eq("id", d.id);
    setDeals((prev) => prev.filter((x) => x.id !== d.id));
    toast.success("Deleted");
  }

  const savings = (d: FlashDeal) => Math.round((1 - d.deal_price / d.original_price) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Flash Deals</h1>
          <p className="text-gray-500 text-sm mt-1">Time-limited discounts with countdown timers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071e2e] text-white text-sm font-semibold hover:bg-[#0f3a52] transition-all">
          <Plus size={15} /> New Deal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Zap size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm mb-4">No flash deals yet</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-[#071e2e] text-white text-sm">Create first deal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((d) => (
            <div key={d.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${d.is_active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
              {d.image_url && (
                <div className="aspect-video relative"><Image src={d.image_url} alt={d.product_name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">{savings(d)}% OFF</span>
                  <span className={`text-xs font-medium ${d.is_active ? "text-green-600" : "text-gray-400"}`}>{d.is_active ? "Active" : "Inactive"}</span>
                </div>
                <h3 className="font-semibold text-[#071e2e] text-sm mb-1">{d.product_name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[#0f5070]">UGX {Number(d.deal_price).toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">UGX {Number(d.original_price).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Clock size={11} /> {timeLeft(d.ends_at)}
                </div>
                {d.total_quantity && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Sold: {d.quantity_sold}</span><span>Left: {d.total_quantity - d.quantity_sold}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0f5070] rounded-full transition-all" style={{ width: `${Math.min(100, (d.quantity_sold / d.total_quantity) * 100)}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${d.is_active ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                    {d.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => deleteDeal(d)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
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
              <h2 className="font-bold text-[#071e2e] font-display">New Flash Deal</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Product name *</label>
                <input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Tilapia Fingerlings" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Original price (UGX) *</label>
                  <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="50000" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Deal price (UGX) *</label>
                  <input type="number" value={form.deal_price} onChange={(e) => setForm({ ...form, deal_price: e.target.value })} placeholder="35000" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Starts *</label>
                  <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ends *</label>
                  <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Stock limit (leave blank = unlimited)</label>
                <input type="number" value={form.total_quantity} onChange={(e) => setForm({ ...form, total_quantity: e.target.value })} placeholder="e.g. 50" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" /></div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Product image</label>
                {form.image_url && <div className="mb-2 relative h-24 rounded-xl overflow-hidden"><Image src={form.image_url} alt="Deal" fill className="object-cover" sizes="400px" /></div>}
                <label className={`flex items-center gap-2 px-3 py-2.5 border border-dashed rounded-xl cursor-pointer text-sm ${uploading ? "border-gray-200" : "border-[#2d8ab8]/40 hover:border-[#2d8ab8] text-[#0f5070]"}`}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? "Uploading..." : "Upload image"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={uploadImage} />
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#071e2e] text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Create Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
