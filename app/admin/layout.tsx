import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin Dashboard", template: "%s | KASC Admin" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?returnTo=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/?error=unauthorized");

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar adminName={profile?.full_name || "Admin"} adminEmail={user.email || ""} />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}
