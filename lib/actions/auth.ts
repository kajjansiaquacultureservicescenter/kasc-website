"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type AuthState =
  | { error?: string; success?: string }
  | undefined;

const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const RegisterSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }).trim(),
  email: z.string().email({ message: "Enter a valid email address" }),
  phone: z.string().min(7, { message: "Phone number is required" }).trim(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Incorrect email or password" };
  }

  // Check role to send admins straight to the admin panel
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  revalidatePath("/", "layout");

  const returnTo = formData.get("returnTo") as string;
  if (profile?.role === "admin") {
    redirect(returnTo?.startsWith("/admin") ? returnTo : "/admin");
  }
  redirect(returnTo || "/");
}

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || "",
    password: formData.get("password") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists. Try logging in." };
    }
    return { error: error.message };
  }

  // Save phone to the profile row created by the DB trigger
  if (signUpData.user && parsed.data.phone) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.from("profiles").update({ phone: parsed.data.phone }).eq("id", signUpData.user.id);
  }

  return { success: "Account created! You can now log in." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Email address is required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password/confirm`,
  });

  if (error) return { error: error.message };
  return { success: "Password reset link sent — check your email." };
}
