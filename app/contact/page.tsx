"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { COMPANY } from "@/lib/data";
import { toast } from "sonner";

const SERVICES = ["Aquaculture Consultancy", "Fish Pond Construction", "Fish Cage Installation", "Dam Liner Supply & Installation", "Training Programs", "Product Order", "Other"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", service: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Message sent! We'll get back to you within 24 hours.");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Something went wrong. Please call us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#1a6b94]/20 blur-3xl" />
        <div className="container-wide relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <MessageCircle size={14} className="text-[#5aafd4]" /> Get In Touch
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5">
              Talk to Our{" "}
              <span className="text-gradient">Aquaculture Experts</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Whether you&apos;re planning your first fish farm or expanding an existing one, we&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Contact details */}
      <section className="py-12 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Phone, label: "Call / WhatsApp", values: [{ text: COMPANY.phone, href: `tel:${COMPANY.phone}` }, { text: COMPANY.phone2, href: `tel:${COMPANY.phone2}` }], color: "brand" },
              { icon: Mail, label: "Email Us", values: [{ text: COMPANY.email, href: `mailto:${COMPANY.email}` }], color: "green" },
              { icon: MapPin, label: "Visit Our Farm", values: [{ text: COMPANY.farmAddress, href: "#map" }], color: "brand" },
              { icon: Clock, label: "Working Hours", values: [{ text: "Mon – Sat, 8am – 6pm EAT", href: null }], color: "green" },
            ].map(({ icon: Icon, label, values, color }) => (
              <div key={label} className={`p-6 rounded-2xl border ${color === "brand" ? "bg-[#eef8fd] border-[#a0d4ea]" : "bg-[#f0fcf4] border-[#beeecf]"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color === "brand" ? "bg-[#0f5070]" : "bg-[#226640]"}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                {values.map(({ text, href }) =>
                  href ? (
                    <a key={text} href={href} className={`block font-semibold text-sm hover:underline ${color === "brand" ? "text-[#0f5070]" : "text-[#226640]"}`}>{text}</a>
                  ) : (
                    <div key={text} className="font-semibold text-sm text-gray-700">{text}</div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section id="quote" className="section-padding bg-[#f8fafc]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-8 lg:p-10 shadow-[var(--shadow-card)] border border-gray-100">
              <h2 className="text-2xl font-bold text-[#071e2e] mb-2 font-display">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-8">Fill in the form and one of our specialists will respond within 24 hours.</p>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f0fcf4] flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-[#226640]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#071e2e] mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6 max-w-xs">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", service: "", message: "" }); }}
                    className="btn-outline text-sm">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Mugisha"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone / WhatsApp</label>
                      <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+256 700 000000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Service of Interest</label>
                      <select value={form.service} onChange={(e) => update("service", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all bg-white">
                        <option value="">Select a service…</option>
                        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="e.g. Enquiry about fingerling prices"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
                    <textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us about your project, location, farm size, and any specific questions…"
                      rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2d8ab8] focus:ring-2 focus:ring-[#2d8ab8]/10 transition-all resize-none" required />
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><Send size={17} /> Send Message</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">We&apos;ll never share your information. All inquiries are handled confidentially.</p>
                </form>
              )}
            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick contact */}
              <div className="bg-gradient-to-br from-[#0f5070] to-[#226640] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4 font-display">Prefer to Talk?</h3>
                <p className="text-blue-100 text-sm mb-5">Our team is available Monday to Saturday, 8am–6pm East Africa Time.</p>
                <div className="space-y-3">
                  <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <Phone size={16} className="text-[#5aafd4]" />
                    <span className="text-sm font-medium">{COMPANY.phone}</span>
                  </a>
                  <a href={`https://wa.me/${COMPANY.social.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/40 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-sm font-medium">WhatsApp Us</span>
                  </a>
                  <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <Mail size={16} className="text-[#5aafd4]" />
                    <span className="text-sm font-medium">{COMPANY.email}</span>
                  </a>
                </div>
              </div>

              {/* FAQ teaser */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[var(--shadow-card)]">
                <h3 className="font-bold text-[#071e2e] mb-4 font-display">Common Questions</h3>
                <div className="space-y-3">
                  {[
                    "What is the minimum order for fingerlings?",
                    "Do you deliver outside Uganda?",
                    "How long does pond construction take?",
                    "What dam liner thickness do I need?",
                  ].map((q) => (
                    <div key={q} className="flex items-center gap-2 text-sm text-gray-600 p-3 rounded-xl bg-[#f8fafc] border border-gray-100 hover:border-[#a0d4ea] hover:text-[#0f5070] transition-all cursor-pointer">
                      <CheckCircle2 size={13} className="text-[#2d8ab8] shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Or chat with our AI assistant at the bottom right of the screen for instant answers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
