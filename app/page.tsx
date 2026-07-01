"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Fish, Waves, Star,
  Users, Award, Globe, Leaf, ShoppingBag,
  Microscope, Building2, Grid3x3, Layers,
  GraduationCap, CheckCircle2, Phone, MapPin, Play
} from "lucide-react";
import { SERVICES } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  unit: string;
  badge: string | null;
  image_url: string | null;
  in_stock: boolean;
};


function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, direction = "left", className = "" }: {
  children: React.ReactNode; delay?: number; direction?: "left" | "right"; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: direction === "left" ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const SERVICE_ICONS: Record<string, React.ElementType> = { Microscope, Building2, Grid3x3, Layers, GraduationCap };
const STAT_ICONS: Record<string, React.ElementType> = { Users, Award, Globe, Fish };

function youtubeId(url: string): string | null {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null;
}

type DbTestimonial = { id: string; name: string; role: string; content: string; rating: number; avatar_url: string | null };

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>("");
  const [testimonials, setTestimonials] = useState<DbTestimonial[]>([]);
  const [farmSettings, setFarmSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const sb = createClient();

    sb.from("site_settings").select("key, value").eq("category", "homepage")
      .then(({ data }) => {
        const m: Record<string, string> = {};
        for (const row of data ?? []) m[row.key] = row.value;
        if (m.hero_video_url) setHeroVideoUrl(m.hero_video_url);
        setFarmSettings(m);
      });

    sb.from("testimonials").select("id, name, role, content, rating, avatar_url")
      .eq("is_active", true).order("sort_order").order("created_at")
      .then(({ data }) => { if (data?.length) setTestimonials(data as DbTestimonial[]); });

    sb.from("products")
      .select("id, name, slug, category, description, price, unit, badge, image_url, in_stock")
      .eq("in_stock", true)
      .order("sort_order")
      .order("name")
      .then(({ data }) => {
        if (!data) return;
        const sorted = [...data].sort((a, b) => {
          if (a.badge === "Best Seller" && b.badge !== "Best Seller") return -1;
          if (b.badge === "Best Seller" && a.badge !== "Best Seller") return 1;
          return 0;
        });
        setFeaturedProducts(sorted.slice(0, 8));
      });
  }, []);

  const dbStats = [
    { value: farmSettings.stat_1_value || "500+", label: farmSettings.stat_1_label || "Fish Farmers Served", icon: "Users" },
    { value: farmSettings.stat_2_value || "10+",  label: farmSettings.stat_2_label || "Years of Experience", icon: "Award" },
    { value: farmSettings.stat_3_value || "5",    label: farmSettings.stat_3_label || "Countries Covered",   icon: "Globe" },
    { value: farmSettings.stat_4_value || "1M+",  label: farmSettings.stat_4_label || "Fingerlings Supplied", icon: "Fish"  },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[#0ea5e9]/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-[#226640]/15 blur-3xl animate-float [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#0284c7]/10 blur-3xl" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[{ top: "20%", left: "8%", size: 40, delay: "0s", dur: "12s" }, { top: "60%", left: "15%", size: 28, delay: "3s", dur: "16s" },
            { top: "35%", right: "12%", size: 35, delay: "1.5s", dur: "14s" }, { top: "75%", right: "20%", size: 22, delay: "4s", dur: "18s" }
          ].map((f, i) => (
            <div key={i} className="absolute opacity-10" style={{ top: f.top, left: (f as any).left, right: (f as any).right, animation: `float ${f.dur} ease-in-out ${f.delay} infinite` }}>
              <Fish size={f.size} className="text-[#7dd3fc]" />
            </div>
          ))}
        </div>

        <div className="container-wide relative z-10 py-24 lg:py-32">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm text-blue-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#3aaf6c] animate-pulse" />
              Kajjansi Aquaculture Services Centre — Entebbe Road, Uganda
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
              Your Premier Partner for{" "}
              <span className="text-gradient block">Complete Aquaculture</span>
              Solutions
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg lg:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
              KASC is a premier aquaculture solutions provider serving commercial fish farmers with high-quality inputs, advanced farming technology, and expert technical consultancy — bridging gaps in the aquaculture value chain from pond construction to harvest.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4">
              <Link href="/services" className="btn-primary text-base px-7 py-3.5">
                Explore Our Services <ArrowRight size={18} />
              </Link>
              <Link href="/shop" className="btn-secondary text-base px-7 py-3.5">
                <ShoppingBag size={18} /> Shop Products
              </Link>
              <Link href="/contact" className="flex items-center gap-2 text-gray-300 hover:text-white text-base font-medium transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Phone size={16} />
                </div>
                Get Free Consultation
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap items-center gap-6 mt-14 pt-8 border-t border-white/10">
              {dbStats.map((stat) => {
                const Icon = STAT_ICONS[stat.icon];
                return (
                  <div key={stat.value} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Icon size={18} className="text-[#7dd3fc]" />
                    </div>
                    <div>
                      <div className="text-white text-xl font-bold leading-none">{stat.value}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 lg:h-20 fill-white">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9ff] text-[#0284c7] text-sm font-medium mb-4 border border-[#bae6fd]">
              <Waves size={14} className="text-[#38bdf8]" /> What We Do
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0c4a6e] mb-4">
              Complete Aquaculture Services,{" "}
              <span className="text-gradient">All Under One Roof</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Whether you&apos;re a beginner starting your first farm or an experienced operator scaling up, we have every service and product you need to succeed.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = SERVICE_ICONS[service.icon];
              return (
                <FadeIn key={service.id} delay={i * 0.08}>
                  <Link href={`/services/${service.slug}`} className="group block h-full">
                    <div className="h-full p-7 rounded-2xl border border-gray-100 bg-white hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 relative overflow-hidden hover:-translate-y-1">
                      <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-2xl",
                        service.color === "brand" ? "bg-gradient-to-r from-[#0284c7] to-[#38bdf8]" :
                        service.color === "green" ? "bg-gradient-to-r from-[#226640] to-[#3aaf6c]" :
                        "bg-gradient-to-r from-[#a05200] to-[#f4a020]")} />
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110",
                        service.color === "brand" ? "bg-[#f0f9ff]" : service.color === "green" ? "bg-[#f0fcf4]" : "bg-[#fffbf0]")}>
                        <Icon size={26} className={cn(service.color === "brand" ? "text-[#0284c7]" : service.color === "green" ? "text-[#226640]" : "text-[#a05200]")} />
                      </div>
                      <h3 className="text-[#0c4a6e] font-bold text-lg mb-2 font-display group-hover:text-[#0284c7] transition-colors">{service.title}</h3>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">{service.subtitle}</p>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-5">{service.description}</p>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0284c7] group-hover:gap-2.5 transition-all">
                        Learn More <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}

            <FadeIn delay={SERVICES.length * 0.08}>
              <Link href="/contact" className="group block h-full">
                <div className="h-full p-7 rounded-2xl gradient-brand text-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 min-h-[200px] flex flex-col justify-between">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                      <Phone size={26} className="text-white" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2 font-display">Not Sure Where to Start?</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">Our consultants give free assessments and tailor solutions for your specific farm.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mt-6 group-hover:gap-3 transition-all">
                    Get Free Consultation <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section-padding gradient-section">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <SlideIn direction="left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0fcf4] text-[#226640] text-sm font-medium mb-5 border border-[#beeecf]">
                <Leaf size={14} className="text-[#3aaf6c]" /> Why Choose KASC
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0c4a6e] mb-5 leading-tight">
                We Don&apos;t Just Sell Products.{" "}
                <span className="text-gradient">We Build Successful Farms.</span>
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                KASC is dedicated to bridging gaps in the aquaculture value chain by maintaining international operational standards — enabling clients to maximise profitability while achieving sustainable fish production.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Total Farming Solutions", desc: "End-to-end aquaculture support — from pond construction and setup to harvesting and production management — making KASC your one-stop solution." },
                  { title: "Quality Assurance", desc: "We supply durable HDPE geomembrane liners, reliable farming inputs, and precision monitoring equipment built for long-term performance." },
                  { title: "Technical Excellence", desc: "Professional advisory and consultancy services ensure you achieve the highest possible return on investment using scientifically-backed best practices." },
                  { title: "International Standards", desc: "We operate to ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 — quality, environment, and safety built into everything we do." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 size={18} className="text-[#38bdf8] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-[#0c4a6e] text-sm mb-0.5">{item.title}</div>
                      <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/about" className="btn-primary">Our Story <ArrowRight size={16} /></Link>
                <Link href="/farm" className="btn-outline">Visit Our Farm</Link>
              </div>
            </SlideIn>

            <SlideIn direction="right" delay={0.1}>
              <div className="relative">
                {youtubeId(heroVideoUrl) ? (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId(heroVideoUrl)}?rel=0&modestbranding=1`}
                      title="KASC Farm Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                    <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" alt="Fish farm" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/40 to-transparent" />
                    <Link href="/farm" className="absolute inset-0 flex items-center justify-center group">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={24} className="text-[#0284c7] ml-1" fill="currentColor" />
                      </div>
                    </Link>
                  </div>
                )}
                <div className="absolute -bottom-5 -left-5 card-glass rounded-2xl p-4 shadow-xl border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f0fcf4] flex items-center justify-center">
                      <Fish size={20} className="text-[#226640]" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-[#0c4a6e]">1M+</div>
                      <div className="text-xs text-gray-500">Fingerlings per year</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-5 -right-5 card-glass rounded-2xl p-4 shadow-xl border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] flex items-center justify-center">
                      <Globe size={20} className="text-[#0284c7]" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-[#0c4a6e]">5</div>
                      <div className="text-xs text-gray-500">Countries served</div>
                    </div>
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fffbf0] text-[#a05200] text-sm font-medium mb-3 border border-[#fde5b0]">
                <ShoppingBag size={14} className="text-[#f4a020]" /> Our Products
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0c4a6e]">Premium Aquaculture Inputs</h2>
              <p className="text-gray-500 mt-2 max-w-lg">Everything your farm needs — sourced, tested, and delivered across East Africa.</p>
            </div>
            <Link href="/shop" className="btn-outline shrink-0">View All Products <ArrowRight size={16} /></Link>
          </FadeIn>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => {
                return (
                  <FadeIn key={product.id} delay={i * 0.06}>
                    <Link href={`/shop/${product.slug}`} className="group block h-full">
                      <div className="h-full bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-48 bg-gradient-to-br from-[#f0f9ff] to-[#bae6fd] overflow-hidden">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Fish size={48} className="text-[#7dd3fc] opacity-60" />
                            </div>
                          )}
                          {product.badge && (
                            <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold",
                              product.badge === "Best Seller" ? "bg-[#f4a020] text-white" :
                              product.badge === "Premium" ? "bg-[#0284c7] text-white" :
                              product.badge === "New" ? "bg-[#226640] text-white" : "bg-gray-800 text-white")}>
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="text-xs font-medium text-[#38bdf8] uppercase tracking-wide mb-1 capitalize">{product.category}</div>
                          <h3 className="font-semibold text-[#0c4a6e] text-sm mb-2 line-clamp-2 group-hover:text-[#0284c7] transition-colors font-display">{product.name}</h3>
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[#0284c7] font-bold text-base">{formatPrice(product.price)}</div>
                              <div className="text-gray-400 text-xs">{product.unit}</div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-[#f0f9ff] flex items-center justify-center group-hover:bg-[#0284c7] transition-colors">
                              <ArrowRight size={14} className="text-[#0284c7] group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          )}

          <FadeIn className="text-center mt-10">
            <Link href="/shop" className="btn-primary px-8">Browse Full Shop <ArrowRight size={16} /></Link>
          </FadeIn>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-16 bg-gradient-to-r from-[#075985] via-[#0284c7] to-[#226640]">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {dbStats.map((stat, i) => {
              const Icon = STAT_ICONS[stat.icon];
              return (
                <FadeIn key={stat.value} delay={i * 0.1} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={26} className="text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding bg-[#f8fafc]">
        <div className="container-wide">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fffbf0] text-[#a05200] text-sm font-medium mb-4 border border-[#fde5b0]">
              <Star size={14} className="text-[#f4a020]" fill="currentColor" /> Customer Stories
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0c4a6e] mb-4">
              Farmers Who Trusted Us{" "}<span className="text-gradient">and Succeeded</span>
            </h2>
            <p className="text-gray-500">Real stories from fish farmers across East Africa who built profitable farms with our support.</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-[#f4a020]" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic flex-1">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {t.avatar_url ? (
                      <Image src={t.avatar_url} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0284c7] to-[#226640] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#0c4a6e] text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* OUR FARM PREVIEW */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <SlideIn direction="left">
              <div className="grid grid-cols-2 gap-4">
                {["farm_image_1","farm_image_2","farm_image_3","farm_image_4"].map((key, i) => {
                  const src = farmSettings[key] || ["https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80","https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&q=80","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80","https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80"][i];
                  return (
                    <div key={key} className={cn("relative rounded-2xl overflow-hidden shadow-lg", i === 0 && "col-span-2")}>
                      <div className={i === 0 ? "h-52" : "h-36"} style={{ position: "relative" }}>
                        <Image src={src} alt={`Farm ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SlideIn>

            <SlideIn direction="right" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9ff] text-[#0284c7] text-sm font-medium mb-5 border border-[#bae6fd]">
                <MapPin size={14} className="text-[#38bdf8]" /> Our Demonstration Farm
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0c4a6e] mb-5">
                {farmSettings.farm_heading ? (
                  <>{farmSettings.farm_heading.split("Kajjansi Farm").map((part, j, arr) => j < arr.length - 1 ? <>{part}<span className="text-gradient">Kajjansi Farm</span></> : part)}</>
                ) : (
                  <>See It Live at the{" "}<span className="text-gradient">Kajjansi Farm</span></>
                )}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {farmSettings.farm_desc_1 || "Our demonstration and training farm at Kajjansi, Wakiso is where we breed fingerlings, test feed formulas, train farmers, and demonstrate what modern aquaculture looks like in East Africa."}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                {farmSettings.farm_desc_2 || "Visit us, observe our operations, and see for yourself how we raise healthy Nile Tilapia, African Catfish, and Miracle Tilapia using best-practice methods."}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[{ label: "Fingerling Hatchery", icon: Fish }, { label: "Training Centre", icon: GraduationCap },
                  { label: "Water Testing Lab", icon: Microscope }, { label: "Demo Ponds", icon: Waves }
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-[#f0f9ff] flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[#0284c7]" />
                    </div>
                    <span className="text-sm font-medium text-[#0c4a6e]">{label}</span>
                  </div>
                ))}
              </div>
              <Link href="/farm" className="btn-primary">Explore Our Farm <ArrowRight size={16} /></Link>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#0ea5e9]/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#226640]/20 blur-3xl" />

        <div className="container-wide relative z-10 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-8">
              <Fish size={14} className="text-[#7dd3fc]" /> Start Your Aquaculture Journey Today
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
              Ready to Build a Profitable Fish Farm?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
              Get a free consultation from our aquaculture experts. We&apos;ll assess your site, recommend the right setup, and give you a clear path to your first harvest.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="btn-primary text-base px-8 py-4">
                Get Free Consultation <ArrowRight size={18} />
              </Link>
              <Link href="/shop" className="btn-secondary text-base px-8 py-4">
                <ShoppingBag size={18} /> Browse Products
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-gray-400 text-sm">
              {["No obligation", "Same-day response", "Serving all of East Africa", "10+ years expertise"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#3aaf6c]" /> {item}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
