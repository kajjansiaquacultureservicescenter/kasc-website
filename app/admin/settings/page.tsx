"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Settings, Loader2, Save } from "lucide-react";

type Setting = { key: string; value: string; label: string; category: string };

const CATEGORY_LABELS: Record<string, string> = {
  contact:  "Contact Information",
  social:   "Social Media Links",
  shop:     "Shop Settings",
  payments: "Payment Details",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
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
    else toast.success(`${CATEGORY_LABELS[category]} saved`);
    setSaving(null);
  }

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071e2e] font-display">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Update contact details, social links, and payment info</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#071e2e] font-display">{CATEGORY_LABELS[category] || category}</h2>
                <button
                  onClick={() => saveCategory(category)}
                  disabled={saving === category}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071e2e] text-white text-xs font-semibold hover:bg-[#0f3a52] disabled:opacity-60 transition-all"
                >
                  {saving === category ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((s) => (
                  <div key={s.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{s.label}</label>
                    <input
                      value={values[s.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                      placeholder={s.label}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
