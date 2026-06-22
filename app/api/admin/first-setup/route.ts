import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

// First-time admin setup — promotes a user to admin when NO admin exists yet.
// Once an admin exists, this endpoint is locked (requires ADMIN_SETUP_TOKEN).
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    const admin = createAdminClient();

    // Check if any admin already exists
    const { data: existing, error: checkError } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (checkError) return Response.json({ error: checkError.message }, { status: 500 });

    if (existing && existing.length > 0) {
      return Response.json(
        { error: "An admin already exists. Use /api/admin/setup with your ADMIN_SETUP_TOKEN instead." },
        { status: 403 }
      );
    }

    // Find the user by email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return Response.json({ error: listError.message }, { status: 500 });

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return Response.json({ error: `No account found for ${email}. Register first, then return here.` }, { status: 404 });
    }

    // Promote to admin
    const { error: updateError } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    return Response.json({
      success: true,
      message: `${email} is now an admin. Sign in at /auth/login to access the dashboard.`,
    });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
