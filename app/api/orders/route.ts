import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { z } from "zod";

const OrderSchema = z.object({
  items: z.array(z.object({
    product_slug: z.string(),
    product_name: z.string().min(1),
    product_price: z.number().positive(),
    quantity: z.number().int().positive(),
    subtotal: z.number().positive(),
  })).min(1, { message: "Cart is empty" }),
  customer: z.object({
    name: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    phone: z.string().min(9, { message: "Valid phone number is required" }),
    address: z.string().min(5, { message: "Delivery address is required" }),
    district: z.string().min(2, { message: "District is required" }),
    notes: z.string().optional(),
  }),
  payment_method: z.enum(["cash_on_delivery", "mtn_momo", "airtel_money", "bank_transfer"]),
  payment_reference: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid order data" },
        { status: 400 }
      );
    }

    const { items, customer, payment_method, payment_reference } = parsed.data;

    // Use SSR client only to check for a logged-in user
    const supabase = await createClient();
    const admin = createAdminClient();

    // Fetch delivery fee from settings (service role bypasses RLS)
    const { data: settings } = await admin
      .from("site_settings")
      .select("key, value")
      .in("key", ["delivery_fee_default", "delivery_fee_free_above"]);

    const settingsMap = Object.fromEntries(
      (settings ?? []).map((s: { key: string; value: string }) => [s.key, parseFloat(s.value) || 0])
    );
    const defaultFee = settingsMap["delivery_fee_default"] ?? 15000;
    const freeAbove = settingsMap["delivery_fee_free_above"] ?? 500000;

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const delivery_fee = subtotal >= freeAbove ? 0 : defaultFee;
    const total_amount = subtotal + delivery_fee;

    // Check if there's a logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    // Insert the order (admin client bypasses RLS — public INSERT policy removed)
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        guest_name: customer.name,
        guest_email: customer.email,
        guest_phone: customer.phone,
        subtotal,
        delivery_fee,
        total_amount,
        payment_method,
        payment_reference: payment_reference || null,
        delivery_address: customer.address,
        delivery_district: customer.district,
        delivery_notes: customer.notes || null,
        status: "pending",
        payment_status: payment_method === "cash_on_delivery" ? "unpaid" : "unpaid",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return Response.json({ error: "Failed to place order. Please try again." }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_slug: item.product_slug,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await admin.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Order was created, items failed — still return success but log it
    }

    return Response.json({
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
      total: total_amount,
      deliveryFee: delivery_fee,
    });

  } catch (err) {
    console.error("Order error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
