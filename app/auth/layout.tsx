import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Account", template: "%s | Kajjansi Aquaculture" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white shrink-0">
            <img src="/logo.png" alt="KASC Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm font-display">Kajjansi Aquaculture</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
      <div className="p-6 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} Kajjansi Aquaculture Service Centre
      </div>
    </div>
  );
}
