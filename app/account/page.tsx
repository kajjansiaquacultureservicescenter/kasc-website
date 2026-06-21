import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile | KASC" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, created_at")
    .eq("id", user!.id)
    .single();

  const { count: orderCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-[#071e2e] font-display mb-5">Profile Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full name",    value: profile?.full_name || "—" },
            { label: "Email",        value: user?.email || "—" },
            { label: "Phone",        value: profile?.phone || "—" },
            { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-UG", { year: "numeric", month: "long" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
              <dd className="text-sm font-medium text-[#071e2e]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#0f5070] to-[#2d8ab8] rounded-2xl p-6 text-white">
          <div className="text-3xl font-bold mb-1">{orderCount ?? 0}</div>
          <div className="text-sm text-blue-100">Total orders placed</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="text-sm text-gray-500 mb-3">Need help with an order?</div>
          <a
            href="https://wa.me/256700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bc5a] transition-all"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}
