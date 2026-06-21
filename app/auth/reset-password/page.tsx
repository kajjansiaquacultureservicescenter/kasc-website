"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(resetPassword, undefined);

  if (state?.success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <MailCheck size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-[#071e2e] font-display mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">{state.success}</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[#0f5070] text-sm font-semibold hover:underline"
          >
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#071e2e] font-display mb-1">Reset password</h1>
          <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send a reset link</p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] focus:border-transparent transition-all"
            />
          </div>
          <SubmitButton />
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-[#0f5070] hover:underline">
            <ArrowLeft size={13} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#0f5070] to-[#226640] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      Send reset link
    </button>
  );
}
