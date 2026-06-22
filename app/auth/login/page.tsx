"use client";

import { Suspense } from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [state, action] = useActionState(login, undefined);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071e2e] font-display mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm">Sign in to your KASC account</p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
        <input type="hidden" name="returnTo" value={returnTo} />

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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
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
          <div className="mt-2 text-right">
            <Link href="/auth/reset-password" className="text-xs text-[#0f5070] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton label="Sign in" />
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href={`/auth/register?returnTo=${returnTo}`} className="text-[#0f5070] font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#0f5070] to-[#226640] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {label}
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense fallback={
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 flex items-center justify-center min-h-[400px]">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
