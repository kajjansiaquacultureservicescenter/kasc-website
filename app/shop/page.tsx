import { createAdminClient } from "@/lib/supabase/admin";
import ShopClient from "./ShopClient";

export const revalidate = 60;

export default async function ShopPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .order("sort_order")
    .order("name");

  return <ShopClient products={data ?? []} />;
}
