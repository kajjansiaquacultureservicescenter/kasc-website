import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Phone, ArrowLeft, Microscope, Building2, Grid3x3, Layers, GraduationCap } from "lucide-react";
import { SERVICES } from "@/lib/data";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = { Microscope, Building2, Grid3x3, Layers, GraduationCap };

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
  };
}

const SERVICE_IMAGES: Record<string, string> = {
  consultancy: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
  "pond-construction": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=80",
  "fish-cages": "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=900&q=80",
  "dam-liners": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80",
  training: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900&q=80",
};

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = ICONS[service.icon];
  const otherServices = SERVICES.filter((s) => s.slug !== slug).slice(0, 3);
  const imgSrc = SERVICE_IMAGES[slug] || SERVICE_IMAGES.consultancy;

  const colorClasses = {
    brand: { bg: "bg-[#0284c7]", light: "bg-[#f0f9ff]", text: "text-[#0284c7]", check: "text-[#38bdf8]", badge: "bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]", btn: "bg-[#0284c7] hover:bg-[#075985]" },
    green: { bg: "bg-[#226640]", light: "bg-[#f0fcf4]", text: "text-[#226640]", check: "text-[#3aaf6c]", badge: "bg-[#f0fcf4] text-[#226640] border-[#beeecf]", btn: "bg-[#226640] hover:bg-[#184a2e]" },
    amber: { bg: "bg-[#a05200]", light: "bg-[#fffbf0]", text: "text-[#a05200]", check: "text-[#f4a020]", badge: "bg-[#fffbf0] text-[#a05200] border-[#fde5b0]", btn: "bg-[#a05200] hover:bg-[#6b3700]" },
  }[service.color] ?? {
    bg: "bg-[#0284c7]", light: "bg-[#f0f9ff]", text: "text-[#0284c7]", check: "text-[#38bdf8]", badge: "bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]", btn: "bg-[#0284c7] hover:bg-[#075985]"
  };

  return (
    <div className="overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-[#f8fafc] border-b border-gray-100 py-4">
        <div className="container-wide flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[#0284c7] transition-colors">Services</Link>
          <span>/</span>
          <span className="text-[#0284c7] font-medium">{service.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#0ea5e9]/20 blur-3xl" />
        <div className="container-wide relative z-10">
          <Link href="/services" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Services
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border", colorClasses.badge)}>
                <Icon size={14} /> {service.subtitle}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">{service.title}</h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">{service.description}</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">Request This Service <ArrowRight size={16} /></Link>
                <a href="tel:+256700000000" className="btn-secondary"><Phone size={16} /> Call Us</a>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
              <Image src={imgSrc} alt={service.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/30 to-transparent" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#0c4a6e] mb-6 font-display">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 p-4 rounded-xl bg-[#f8fafc] border border-gray-100">
                    <CheckCircle2 size={18} className={cn("shrink-0 mt-0.5", colorClasses.check)} />
                    <span className="text-gray-700 text-sm leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl gradient-brand text-white">
                <h3 className="font-bold text-xl mb-3 font-display">Get a Free Quote</h3>
                <p className="text-blue-100 text-sm mb-5">Tell us about your project and we&apos;ll send you a detailed proposal within 24 hours.</p>
                <Link href="/contact#quote" className="block text-center py-3 rounded-xl bg-white text-[#0284c7] font-semibold text-sm hover:bg-gray-100 transition-colors">
                  Request Quote
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-gray-100">
                <h3 className="font-bold text-[#0c4a6e] mb-3">Other Services</h3>
                <div className="space-y-2">
                  {otherServices.map((s) => {
                    const OtherIcon = ICONS[s.icon];
                    return (
                      <Link key={s.id} href={`/services/${s.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", s.color === "brand" ? "bg-[#f0f9ff]" : s.color === "green" ? "bg-[#f0fcf4]" : "bg-[#fffbf0]")}>
                          <OtherIcon size={14} className={s.color === "brand" ? "text-[#0284c7]" : s.color === "green" ? "text-[#226640]" : "text-[#a05200]"} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#0284c7] transition-colors">{s.title}</span>
                        <ArrowRight size={12} className="text-gray-400 ml-auto" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#f0fcf4] border border-[#beeecf]">
                <div className="text-sm text-gray-600 mb-2">Need help deciding?</div>
                <a href="tel:+256700000000" className="text-[#226640] font-bold text-lg hover:underline">+256 700 000000</a>
                <div className="text-xs text-gray-500 mt-1">Mon–Sat, 8am–6pm EAT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#075985] to-[#226640]">
        <div className="container-wide text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started with {service.title}?</h2>
          <p className="text-blue-100 mb-6">Contact our team for a free consultation — no commitment required.</p>
          <Link href="/contact" className="btn-primary">
            Get Free Consultation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
