import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Fish, GraduationCap, Microscope, Waves, CheckCircle2, Clock, ArrowRight, Phone, Calendar } from "lucide-react";
import { COMPANY } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Farm",
  description: "Visit the Kajjansi Aquaculture Service Center demonstration farm — hatchery, training center, demo ponds, water lab, and fabrication shop, all at Kajjansi, Wakiso, Uganda.",
};

const FACILITIES = [
  { icon: Fish, title: "Fingerling Hatchery", desc: "Our certified hatchery breeds Nile Tilapia, African Catfish, and Miracle Tilapia fingerlings year-round. All stock is disease-screened and quality-certified before release." },
  { icon: Microscope, title: "Water Quality Laboratory", desc: "Full on-site water testing lab equipped with multi-parameter analysers, microscopes, and chemical test kits for real-time water quality assessment." },
  { icon: Waves, title: "Demonstration Ponds", desc: "Multiple production ponds showcasing different farming systems — earthen ponds, lined ponds, and cage culture. Live working examples you can see and learn from." },
  { icon: GraduationCap, title: "Training & Conference Center", desc: "A dedicated hands-on training facility where we run aquaculture courses, dam liner installation programs, and farmer workshops." },
  { icon: MapPin, title: "Dam Liner Fabrication Shop", desc: "Our on-site fabrication workshop where we cut, weld, and test HDPE dam liners of all sizes before installation. Complete with pneumatic leak-testing equipment." },
  { icon: Fish, title: "Feed Production Unit", desc: "Small-scale fish feed production unit producing starter and grower pellets. Visitors can observe the formulation, pelleting, and quality testing process." },
];

export default function FarmPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85" alt="Kajjansi farm" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071e2e]/90 via-[#0a2d43]/80 to-[#071e2e]/60" />
        </div>

        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <MapPin size={14} className="text-[#5aafd4]" /> Kajjansi, Wakiso, Uganda
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              The Heart of KASC —{" "}
              <span className="text-gradient">Our Kajjansi Farm</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-10">
              Located at Kajjansi, Wakiso District on Entebbe Road, our demonstration farm is where we breed fish, train farmers, install dam liners, and produce fish feed — all under one roof.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">
                Book a Farm Visit <Calendar size={16} />
              </Link>
              <a href={`tel:${COMPANY.phone}`} className="btn-secondary">
                <Phone size={16} /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Farm overview */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef8fd] text-[#0f5070] text-sm font-medium mb-5 border border-[#a0d4ea]">
                About the Farm
              </div>
              <h2 className="text-3xl font-bold text-[#071e2e] mb-5 leading-tight">
                More Than a Farm —{" "}
                <span className="text-gradient">A Centre of Excellence</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Kajjansi Aquaculture Service Center farm is our living laboratory and training ground. Everything we recommend to our clients, we first test and perfect here. From fingerling genetics to feed formulations to liner durability — we prove it at Kajjansi before we scale it.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                The farm sits adjacent to our office and fabrication facility on Entebbe Road, making it the single place where you can see, touch, and experience every aspect of what we offer — from a fingerling in the hatchery to a completed lined pond.
              </p>
              <div className="space-y-3">
                {["Certified by the Ministry of Agriculture, Animal Industry and Fisheries (MAAIF)",
                  "Over 10 production and demonstration ponds",
                  "Fingerling hatchery capacity: 1 million fingerlings per year",
                  "Farmer visits welcome Monday–Saturday, 8am–5pm",
                  "Group training sessions available by appointment",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 size={15} className="text-[#2d8ab8] shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80",
                "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&q=80",
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"
              ].map((src, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg aspect-square">
                  <Image src={src} alt={`Farm view ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="section-padding gradient-section">
        <div className="container-wide">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#071e2e] mb-3">Farm Facilities</h2>
            <p className="text-gray-500">Every building and pond on our farm serves a specific purpose in delivering quality aquaculture solutions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f5070] to-[#226640] flex items-center justify-center mb-4">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-[#071e2e] mb-2 font-display">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Visit */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-[#071e2e] mb-5">Visit Us</h2>
              <div className="space-y-5 mb-8">
                {[
                  { icon: MapPin, label: "Farm Address", value: COMPANY.farmAddress },
                  { icon: Clock, label: "Farm Visits", value: "Monday – Saturday, 8:00am – 5:00pm EAT" },
                  { icon: Phone, label: "Book a Visit", value: COMPANY.phone },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#eef8fd] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#0f5070]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                      <div className="text-gray-800 font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary">
                Book a Farm Visit <ArrowRight size={16} />
              </Link>
            </div>

            {/* Google Maps embed placeholder */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 h-80 lg:h-96 bg-gradient-to-br from-[#eef8fd] to-[#f0fcf4] flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7572305955393!2d32.5396!3d0.2765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMTYnMzUuNCJOIDMywrAzMicyMy40IkU!5e0!3m2!1sen!2sug!4v1620000000000!5m2!1sen!2sug"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                title="Kajjansi Aquaculture Service Center location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
