"use client";

import { Suspense } from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { register } from "@/lib/actions/auth";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [state, action] = useActionState(register, undefined);
  const [showPw, setShowPw] = useState(false);

  if (state?.success) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#071e2e] font-display mb-2">Account created!</h2>
        <p className="text-gray-500 text-sm mb-6">{state.success}</p>
        <Link
          href={`/auth/login?returnTo=${returnTo}`}
          className="inline-block py-3 px-8 rounded-xl bg-gradient-to-r from-[#0f5070] to-[#226640] text-white font-semibold text-sm hover:opacity-90 transition-all"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071e2e] font-display mb-1">Create an account</h1>
        <p className="text-gray-500 text-sm">Join KASC to track orders and more</p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
          <input
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="John Ssali"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] focus:border-transparent transition-all"
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="+256 700 000000"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href={`/auth/login?returnTo=${returnTo}`} className="text-[#0f5070] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#0f5070] to-[#226640] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      Create account
    </button>
  );
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense fallback={
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 flex items-center justify-center min-h-[400px]">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
