import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { User, ShoppingBag, LogOut, ChevronRight } from "lucide-react";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?returnTo=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.email?.split("@")[0] || "My Account";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#0284c7]">Home</Link>
            <ChevronRight size={13} />
            <span className="text-[#0284c7] font-medium">My Account</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0284c7] to-[#226640] flex items-center justify-center text-white font-bold">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0c4a6e] font-display">{name}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <nav className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm space-y-1">
              {[
                { href: "/account",        label: "Profile",     icon: User },
                { href: "/account/orders", label: "My Orders",   icon: ShoppingBag },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-[#0284c7] hover:bg-[#f0f9ff] transition-all"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <form action={logout} className="pt-2 border-t mt-2">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </form>
            </div>
          </nav>

          {/* Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
