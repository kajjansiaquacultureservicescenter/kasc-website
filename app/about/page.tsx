import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, Award, Globe, Fish, Leaf, Target, Eye, Heart, ShieldCheck } from "lucide-react";
import { COMPANY, STATS } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Kajjansi Aquaculture Service Centre — our story, mission, team, and commitment to transforming fish farming across East Africa.",
};

const TEAM = [
  { name: "Mr. Kajjansi", role: "Founder & CEO", bio: "Pioneer aquaculturist with 15+ years of hands-on experience transforming fish farming in Uganda and East Africa.", initials: "KA" },
  { name: "Dr. Sarah Namukasa", role: "Head of Aquaculture Science", bio: "PhD in Fisheries Science. Leads all technical consultancy, water quality testing, and hatchery operations.", initials: "SN" },
  { name: "Eng. Joseph Ochieng", role: "Head of Infrastructure", bio: "Civil engineer specialising in fish pond design and dam liner fabrication. 10+ years in aquaculture construction.", initials: "JO" },
  { name: "Ms. Grace Tumusiime", role: "Training & Extension Manager", bio: "Manages all farmer training programs and field extension services across Uganda and Kenya.", initials: "GT" },
];

const VALUES = [
  { icon: Target, title: "Sustainability", desc: "Every solution we provide is designed to be environmentally responsible and economically sustainable for the long term." },
  { icon: Award, title: "Excellence", desc: "We hold ourselves to the highest standard — in the quality of our inputs, the precision of our installations, and the depth of our expertise." },
  { icon: Users, title: "Partnership", desc: "We treat every client as a long-term partner. Your success is our success, which is why we stay engaged long after the initial setup." },
  { icon: Heart, title: "Farmer First", desc: "All our decisions start with one question: what is best for the farmer? This philosophy drives product selection, pricing, and support." },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0ea5e9]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#226640]/15 blur-3xl" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <Fish size={14} className="text-[#7dd3fc]" /> About KASC
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Based in Kajjansi.{" "}
              <span className="text-gradient">Your Premier Aquaculture Partner.</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              {COMPANY.description}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 lg:h-16 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9ff] text-[#0284c7] text-sm font-medium mb-5 border border-[#bae6fd]">
                Our Story
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0c4a6e] mb-5 leading-tight">
                From a Small Farm to East Africa&apos;s{" "}
                <span className="text-gradient">Leading Aquaculture Hub</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kajjansi Aquaculture Services Centre (KASC) is a premier aquaculture solutions provider based in Kajjansi on Entebbe Road, Uganda. We serve as a comprehensive partner for commercial fish farmers — providing high-quality inputs, advanced farming technology, and expert technical consultancy services.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                KASC is dedicated to bridging gaps in the aquaculture value chain by maintaining international operational standards, enabling clients to maximise profitability while achieving sustainable fish production.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                We serve clients in Uganda, Kenya, Tanzania, Rwanda, and South Africa — because every fish farmer, regardless of location, deserves access to world-class aquaculture solutions.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.value} className="p-4 rounded-xl bg-[#f8fafc] border border-gray-100">
                    <div className="text-2xl font-bold text-[#0284c7] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80" alt="Kajjansi farm" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 card-glass rounded-2xl p-5 shadow-xl border border-white/60 max-w-[200px]">
                <div className="text-2xl font-bold text-[#0284c7] mb-1">2014</div>
                <div className="text-sm text-gray-500">Year Founded at Kajjansi, Wakiso</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="section-padding gradient-section">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Target, label: "Our Mission", color: "brand", text: "To deliver innovative, high-quality, and cost-effective aquaculture solutions that empower farmers to achieve their full production potential through scientifically backed practices and expert technical support." },
              { icon: Eye, label: "Our Vision", color: "green", text: "To become the most trusted and reliable partner for sustainable aquaculture development throughout the East African region." },
              { icon: Leaf, label: "Our Commitment", color: "amber", text: "We adhere to internationally recognised standards — ISO 9001:2015 (Quality), ISO 14001:2015 (Environment), and ISO 45001:2018 (Health & Safety) — ensuring consistent excellence across every service." },
            ].map(({ icon: Icon, label, color, text }) => (
              <div key={label} className={`p-8 rounded-2xl border ${color === "brand" ? "bg-[#f0f9ff] border-[#bae6fd]" : color === "green" ? "bg-[#f0fcf4] border-[#beeecf]" : "bg-[#fffbf0] border-[#fde5b0]"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color === "brand" ? "bg-[#0284c7]" : color === "green" ? "bg-[#226640]" : "bg-[#a05200]"}`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-[#0c4a6e] text-xl mb-3 font-display">{label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-3">Our Core Values</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything we do is guided by four non-negotiable principles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#226640] flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-[#0c4a6e] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ISO Standards */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9ff] text-[#0284c7] text-sm font-medium mb-4 border border-[#bae6fd]">
              <ShieldCheck size={14} className="text-[#38bdf8]" /> Quality & Safety Standards
            </div>
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-3">Committed to International Standards</h2>
            <p className="text-gray-500 leading-relaxed">
              KASC adheres to internationally recognised management standards — giving our clients confidence that every product, service, and interaction meets global benchmarks for quality, environmental responsibility, and worker safety.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {COMPANY.iso.map((std) => (
              <div key={std.code} className="flex flex-col items-center text-center p-8 rounded-2xl border-2 border-[#bae6fd] bg-[#f0f9ff]">
                <div className="w-14 h-14 rounded-2xl bg-[#0284c7] flex items-center justify-center mb-4">
                  <ShieldCheck size={26} className="text-white" />
                </div>
                <div className="text-[#0284c7] font-bold text-lg font-display mb-1">{std.code}</div>
                <div className="text-gray-600 text-sm leading-relaxed">{std.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9ff] text-[#0284c7] text-sm font-medium mb-4 border border-[#bae6fd]">
              <Users size={14} /> Meet Our Team
            </div>
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-3">The Experts Behind KASC</h2>
            <p className="text-gray-500">Dedicated aquaculture professionals committed to your farm&apos;s success.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow group">
                <div className="h-44 bg-gradient-to-br from-[#075985] to-[#226640] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {member.initials}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#0c4a6e] mb-0.5 font-display">{member.name}</h3>
                  <div className="text-[#38bdf8] text-xs font-semibold uppercase tracking-wide mb-3">{member.role}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="section-padding bg-gradient-to-r from-[#075985] via-[#0284c7] to-[#226640]">
        <div className="container-wide text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
            <Globe size={14} /> Our Reach
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Serving East Africa and Beyond</h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-10">We deliver quality aquaculture inputs and services across five countries — with logistics, field teams, and after-sales support in every region.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {COMPANY.regions.map((r) => (
              <div key={r} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium">
                <CheckCircle2 size={16} className="text-[#3aaf6c]" /> {r}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold text-[#0c4a6e] mb-4">Ready to Work With Us?</h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-8">Contact our team today for a free consultation or visit our farm at Kajjansi to see our operations firsthand.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary">Get In Touch <ArrowRight size={16} /></Link>
            <Link href="/farm" className="btn-outline">Visit Our Farm</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
