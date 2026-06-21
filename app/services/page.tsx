import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone, Microscope, Building2, Grid3x3, Layers, GraduationCap, Waves } from "lucide-react";
import { SERVICES } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Services",
  description: "From aquaculture consultancy and fish pond construction to dam liner installation, fish cage systems, and training — KASC offers the full spectrum of aquaculture services.",
};

const ICONS: Record<string, React.ElementType> = { Microscope, Building2, Grid3x3, Layers, GraduationCap };

const PROCESS = [
  { step: "01", title: "Initial Consultation", desc: "We listen to your goals, assess your current situation, and give you an honest recommendation at no cost." },
  { step: "02", title: "Site Feasibility Study", desc: "Our team visits your site to evaluate soil, water quality, topography, and market access." },
  { step: "03", title: "Custom Proposal", desc: "We present a detailed proposal with scope, timeline, and transparent pricing." },
  { step: "04", title: "Implementation", desc: "Our certified team executes with precision — from pond construction to cage installation to liner fitting." },
  { step: "05", title: "Training & Handover", desc: "We train you and your team on farm management before formally handing over." },
  { step: "06", title: "After-Sales Support", desc: "We remain available for technical support, follow-up visits, and supply of inputs throughout your operation." },
];

export default function ServicesPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1a6b94]/20 blur-3xl" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <Waves size={14} className="text-[#5aafd4]" /> What We Offer
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Complete Aquaculture Services,{" "}
              <span className="text-gradient">One Trusted Partner</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Every service we offer is built around one goal: giving you the best possible foundation for a profitable, sustainable fish farming business.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 lg:h-16 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SERVICES.map((service, i) => {
              const Icon = ICONS[service.icon];
              return (
                <div key={service.id} className={cn("rounded-3xl overflow-hidden border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1 group",
                  i === 0 ? "lg:col-span-2 border-[#a0d4ea]" : "border-gray-100")}>
                  <div className={cn("p-8 lg:p-10 flex flex-col lg:flex-row gap-8",
                    service.color === "brand" ? "bg-gradient-to-br from-[#eef8fd] to-white" :
                    service.color === "green" ? "bg-gradient-to-br from-[#f0fcf4] to-white" :
                    "bg-gradient-to-br from-[#fffbf0] to-white")}>
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                      service.color === "brand" ? "bg-[#0f5070]" : service.color === "green" ? "bg-[#226640]" : "bg-[#a05200]")}>
                      <Icon size={28} className="text-white" />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#071e2e] mb-2 font-display group-hover:text-[#0f5070] transition-colors">{service.title}</h2>
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-4">{service.subtitle}</p>
                      <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                        {service.features.map((f) => (
                          <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 size={15} className={cn("shrink-0 mt-0.5", service.color === "brand" ? "text-[#2d8ab8]" : service.color === "green" ? "text-[#3aaf6c]" : "text-[#f4a020]")} />
                            {f}
                          </div>
                        ))}
                      </div>
                      <Link href={`/services/${service.slug}`} className={cn("inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
                        service.color === "brand" ? "bg-[#0f5070] text-white hover:bg-[#0a2d43]" :
                        service.color === "green" ? "bg-[#226640] text-white hover:bg-[#184a2e]" :
                        "bg-[#a05200] text-white hover:bg-[#6b3700]")}>
                        Learn More <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="section-padding gradient-section">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef8fd] text-[#0f5070] text-sm font-medium mb-4 border border-[#a0d4ea]">
              How We Work
            </div>
            <h2 className="text-3xl font-bold text-[#071e2e] mb-3">Our 6-Step Service Process</h2>
            <p className="text-gray-500">From first contact to a fully running farm — here is exactly what to expect when you work with KASC.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROCESS.map((p) => (
              <div key={p.step} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] relative overflow-hidden group hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="absolute top-0 right-0 text-7xl font-bold text-gray-50 select-none leading-none -mt-2 -mr-2 font-display group-hover:text-[#eef8fd] transition-colors">
                  {p.step}
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f5070] to-[#226640] flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-sm">{p.step}</span>
                  </div>
                  <h3 className="font-bold text-[#071e2e] mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0a2d43] to-[#226640]">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 max-w-lg mx-auto mb-8">Speak to one of our aquaculture specialists today. Consultations are free and come with no obligation.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary">Request Free Consultation <ArrowRight size={16} /></Link>
            <a href="tel:+256700000000" className="btn-secondary">
              <Phone size={16} /> Call Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
