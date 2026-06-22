"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Newspaper, Plus, Trash2, Loader2, Eye, EyeOff, Edit3, X, Upload } from "lucide-react";
import Image from "next/image";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "", cover_storage_path: "", is_published: false });
  const supabase = useMemo(() => createClient(), []);

  const loadNews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setArticles(data as Article[] || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadNews(); }, [loadNews]);

  function openNew() {
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "", cover_storage_path: "", is_published: false });
    setEditing(null);
    setIsNew(true);
  }

  function openEdit(a: Article) {
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt || "", content: a.content || "", cover_image_url: a.cover_image_url || "", cover_storage_path: "", is_published: a.is_published });
    setEditing(a);
    setIsNew(false);
  }

  function closeEditor() { setIsNew(false); setEditing(null); }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("news-covers").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data } = supabase.storage.from("news-covers").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image_url: data.publicUrl, cover_storage_path: path }));
    setUploading(false);
  }

  async function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const slug = form.slug || toSlug(form.title);
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_image_url: form.cover_image_url || null,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("news").insert(payload));
    } else if (editing) {
      ({ error } = await supabase.from("news").update(payload).eq("id", editing.id));
    }

    if (error) {
      toast.error(error.message.includes("unique") ? "A news article with this slug already exists" : error.message);
    } else {
      toast.success(isNew ? "Article created!" : "Article updated!");
      closeEditor();
      loadNews();
    }
    setSaving(false);
  }

  async function deleteArticle(a: Article) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    await supabase.from("news").delete().eq("id", a.id);
    toast.success("Article deleted");
    setArticles((prev) => prev.filter((x) => x.id !== a.id));
  }

  async function togglePublish(a: Article) {
    const val = !a.is_published;
    await supabase.from("news").update({ is_published: val, published_at: val ? new Date().toISOString() : null }).eq("id", a.id);
    setArticles((prev) => prev.map((x) => x.id === a.id ? { ...x, is_published: val } : x));
    toast.success(val ? "Article published" : "Article unpublished");
  }

  const showEditor = isNew || !!editing;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">News</h1>
          <p className="text-gray-500 text-sm mt-1">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071e2e] text-white text-sm font-semibold hover:bg-[#0f3a52] transition-all">
          <Plus size={15} /> New Article
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Newspaper size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm mb-4">No articles yet</p>
          <button onClick={openNew} className="px-4 py-2 rounded-xl bg-[#071e2e] text-white text-sm">Write first article</button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
              {a.cover_image_url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                  <Image src={a.cover_image_url} alt={a.title} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#071e2e] text-sm">{a.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {a.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                {a.excerpt && <p className="text-xs text-gray-500 truncate">{a.excerpt}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublish(a)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all" title={a.is_published ? "Unpublish" : "Publish"}>
                  {a.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => deleteArticle(a)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor drawer */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeEditor} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-[#071e2e] font-display">{isNew ? "New Article" : "Edit Article"}</h2>
              <button onClick={closeEditor} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: toSlug(e.target.value) })}
                  placeholder="Article title" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Slug (auto-generated)</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="article-url-slug" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Excerpt</label>
                <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary shown in article lists" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Cover image</label>
                {form.cover_image_url && (
                  <div className="mb-2 relative h-32 rounded-xl overflow-hidden">
                    <Image src={form.cover_image_url} alt="Cover" fill className="object-cover" sizes="400px" />
                  </div>
                )}
                <label className={`flex items-center gap-2 px-4 py-2.5 border border-dashed rounded-xl cursor-pointer text-sm transition-all ${uploading ? "border-gray-200 bg-gray-50" : "border-[#2d8ab8]/40 hover:border-[#2d8ab8] hover:bg-[#eef8fd]/50 text-[#0f5070]"}`}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Uploading..." : "Upload cover image"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={uploadCover} />
                </label>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={10} placeholder="Write your article content here..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="publish" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="publish" className="text-sm font-medium text-gray-700">Publish immediately</label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={closeEditor} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#071e2e] text-white text-sm font-semibold hover:bg-[#0f3a52] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Save Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
