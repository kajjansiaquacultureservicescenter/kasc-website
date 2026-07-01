"use client";

import Link from "next/link";
import { NAV_ITEMS, SERVICES } from "@/lib/data";
import { Phone, Mail, MapPin, PlayCircle, ArrowRight } from "lucide-react";
import { useSiteContact } from "@/lib/useSiteContact";

const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
};

export default function Footer() {
  const contact = useSiteContact();

  return (
    <footer className="bg-[#0284c7] text-sky-50">
      {/* CTA Band */}
      <div className="bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#226640] py-14">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-white text-2xl lg:text-3xl font-bold font-display mb-2">
              Ready to Start Your Fish Farm?
            </h2>
            <p className="text-blue-100 text-sm lg:text-base max-w-lg">
              Talk to our experts today. From feasibility study to first harvest — we&apos;re with you every step of the way.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/contact" className="btn-primary whitespace-nowrap">
              Get Free Consultation <ArrowRight size={16} />
            </Link>
            <a
              href={`tel:${contact.phone}`}
              className="btn-secondary whitespace-nowrap"
            >
              <Phone size={16} /> Call Us Now
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white shrink-0">
                <img src="/logo.png" alt="KASC Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-white font-bold text-base leading-tight font-display">Kajjansi</div>
                <div className="text-[#7dd3fc] text-xs font-medium leading-tight">Aquaculture Service Centre</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Your premier partner for complete aquaculture solutions — providing high-quality inputs, advanced farming technology, and expert technical consultancy across East Africa.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: SocialIcons.Facebook, href: contact.facebook, label: "Facebook" },
                { icon: SocialIcons.Twitter, href: contact.twitter, label: "Twitter" },
                { icon: SocialIcons.Instagram, href: contact.instagram, label: "Instagram" },
                { icon: PlayCircle, href: contact.youtube, label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#38bdf8] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-display">
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#7dd3fc] transition-colors group"
                  >
                    <ArrowRight size={13} className="text-[#38bdf8] group-hover:translate-x-0.5 transition-transform" />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-display">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Shop Products", href: "/shop" },
                { label: "Our Farm", href: "/farm" },
                { label: "Gallery", href: "/gallery" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "Request a Quote", href: "/contact#quote" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#7dd3fc] transition-colors group"
                  >
                    <ArrowRight size={13} className="text-[#38bdf8] group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-display">
              Get In Touch
            </h3>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={14} className="text-[#7dd3fc]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Phone / WhatsApp</div>
                    <a href={`tel:${contact.phone}`} className="block text-sm text-gray-300 hover:text-[#7dd3fc] transition-colors">{contact.phone}</a>
                    {contact.phone2 && (
                      <a href={`tel:${contact.phone2}`} className="block text-sm text-gray-300 hover:text-[#7dd3fc] transition-colors">{contact.phone2}</a>
                    )}
                  </div>
                </div>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={14} className="text-[#7dd3fc]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Email</div>
                    <div className="text-sm text-gray-300 group-hover:text-[#7dd3fc] transition-colors">{contact.email}</div>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} className="text-[#7dd3fc]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Office & Farm</div>
                    <div className="text-sm text-gray-300">{contact.address}</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-6">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            © {new Date().getFullYear()} Kajjansi Aquaculture Service Centre. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            Serving Uganda, Kenya, Tanzania, Rwanda & South Africa
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
