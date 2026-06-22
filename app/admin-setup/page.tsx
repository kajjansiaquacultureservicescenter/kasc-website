"use client";

import { useState } from "react";
import Link from "next/link";
import { Fish, Shield, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/first-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071e2e] via-[#0f5070] to-[#226640] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#eef8fd] flex items-center justify-center">
              <Fish size={24} className="text-[#0f5070]" />
            </div>
            <div>
              <div className="font-bold text-[#071e2e] font-display">KASC Admin Setup</div>
              <div className="text-xs text-gray-500">First-time administrator setup</div>
            </div>
          </div>

          {status === "success" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[#071e2e] mb-2">Admin account activated!</h2>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <Link
                href="/auth/login?returnTo=/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0f5070] to-[#226640] text-white font-semibold text-sm hover:opacity-90 transition-all"
              >
                Sign in to Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800 text-xs leading-relaxed">
                  This page only works <strong>once</strong> — when no admin account exists yet.
                  After setup it locks automatically. Register your account first at{" "}
                  <Link href="/auth/register" className="underline">/auth/register</Link>, then enter that email below.
                </p>
              </div>

              {status === "error" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-5">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your registered email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#0f5070] to-[#226640] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === "loading" && <Loader2 size={15} className="animate-spin" />}
                  Activate Admin Account
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
