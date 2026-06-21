import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

// One-time endpoint to promote a user to admin.
// Protected by ADMIN_SETUP_TOKEN environment variable.
// Usage: POST /api/admin/setup  { "email": "you@example.com", "token": "your_token" }
export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!process.env.ADMIN_SETUP_TOKEN) {
      return Response.json({ error: "Setup not configured" }, { status: 500 });
    }

    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Find user by email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return Response.json({ error: listError.message }, { status: 500 });

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return Response.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    // Update profile role
    const { error: updateError } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `${email} is now an admin. They can access /admin after logging in.`,
    });

  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
