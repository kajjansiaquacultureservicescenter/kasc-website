"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { Plus, Trash2, Pencil, Loader2, X, Star, Upload, UserCircle2 } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string | null;
  storage_path: string | null;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: Omit<Testimonial, "id"> = {
  name: "", role: "", content: "", rating: 5,
  avatar_url: null, storage_path: null, is_active: true, sort_order: 0,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(EMPTY);
  const avatarRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("sort_order").order("created_at");
    setTestimonials((data as Testimonial[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openNew() { setForm(EMPTY); setEditId("new"); }

  function openEdit(t: Testimonial) {
    const { id, ...rest } = t;
    setForm(rest);
    setEditId(id);
  }

  function closeForm() { setEditId(null); }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (avatarRef.current) avatarRef.current.value = "";
    if (!file) return;
    setImgUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `testimonials/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
    if (error) { toast.error("Upload failed: " + error.message); setImgUploading(false); return; }
    const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    setForm((f) => ({ ...f, avatar_url: url, storage_path: path }));
    setImgUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) { toast.error("Name and content are required"); return; }
    setSaving(true);
    const payload = { ...form };
    let error;
    if (editId === "new") {
      ({ error } = await supabase.from("testimonials").insert(payload));
    } else {
      ({ error } = await supabase.from("testimonials").update(payload).eq("id", editId));
    }
    if (error) { toast.error("Save failed: " + error.message); }
    else { toast.success(editId === "new" ? "Testimonial added!" : "Updated!"); closeForm(); await load(); }
    setSaving(false);
  }

  async function handleDelete(t: Testimonial) {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
    if (t.storage_path) await supabase.storage.from("avatars").remove([t.storage_path]);
    await supabase.from("testimonials").delete().eq("id", t.id);
    toast.success("Deleted");
    setTestimonials((prev) => prev.filter((x) => x.id !== t.id));
  }

  async function toggleActive(t: Testimonial) {
    await supabase.from("testimonials").update({ is_active: !t.is_active }).eq("id", t.id);
    setTestimonials((prev) => prev.map((x) => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Customer Stories</h1>
          <p className="text-gray-500 text-sm mt-1">{testimonials.length} testimonials — shown on the homepage</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f5070] text-white font-semibold text-sm hover:bg-[#0a3d57] transition-all"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 text-sm">No testimonials yet — add your first one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-3 ${t.is_active ? "border-gray-100" : "border-dashed border-gray-300 opacity-60"}`}>
              <div className="flex items-start gap-3">
                {t.avatar_url ? (
                  <Image src={t.avatar_url} alt={t.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0f5070] to-[#226640] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#071e2e] text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={11} className={s <= t.rating ? "text-[#f4a020]" : "text-gray-200"} fill={s <= t.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic line-clamp-3">"{t.content}"</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                <button
                  onClick={() => toggleActive(t)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {t.is_active ? "Visible" : "Hidden"}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-[#eef8fd] text-gray-400 hover:text-[#0f5070] transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out form */}
      {editId !== null && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-[#071e2e] font-display text-lg">
                {editId === "new" ? "Add Testimonial" : "Edit Testimonial"}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Customer Photo (optional)</label>
                <div className="flex items-center gap-4">
                  {form.avatar_url ? (
                    <div className="relative">
                      <Image src={form.avatar_url} alt="avatar" width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
                      <button type="button" onClick={() => setForm((f) => ({ ...f, avatar_url: null, storage_path: null }))}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserCircle2 size={28} className="text-gray-300" />
                    </div>
                  )}
                  <label className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-xl cursor-pointer text-sm transition-all ${imgUploading ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-[#2d8ab8]/40 hover:border-[#2d8ab8] text-[#0f5070]"}`}>
                    {imgUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Upload photo</>}
                    <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={imgUploading} onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. John Mugisha"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role / Location</label>
                <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Fish Farmer, Masaka"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Their Words *</label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required rows={4}
                  placeholder="What did they say about KASC?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: s }))}
                      className="p-1 transition-transform hover:scale-110">
                      <Star size={24} className={s <= form.rating ? "text-[#f4a020]" : "text-gray-200"} fill={s <= form.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-1">{form.rating}/5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow ${form.is_active ? "ml-[22px]" : "ml-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Visible</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
              <button onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleSave as unknown as React.MouseEventHandler} disabled={saving || imgUploading}
                className="flex-1 py-2.5 rounded-xl bg-[#0f5070] text-white text-sm font-semibold hover:bg-[#0a3d57] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId === "new" ? "Add" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
