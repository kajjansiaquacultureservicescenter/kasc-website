import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | KASC",
  description: "Terms and conditions governing use of the Kajjansi Aquaculture Service Centre website, shop, and services.",
};

const LAST_UPDATED = "22 June 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold text-[#0c4a6e] font-display mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

const TOC = [
  { id: "acceptance",    label: "Acceptance of Terms" },
  { id: "services",      label: "Our Services & Products" },
  { id: "orders",        label: "Orders & Payments" },
  { id: "delivery",      label: "Delivery & Shipping" },
  { id: "returns",       label: "Returns & Refunds" },
  { id: "accounts",      label: "User Accounts" },
  { id: "ip",            label: "Intellectual Property" },
  { id: "conduct",       label: "Acceptable Use" },
  { id: "disclaimer",    label: "Disclaimers" },
  { id: "liability",     label: "Limitation of Liability" },
  { id: "governing",     label: "Governing Law" },
  { id: "changes",       label: "Changes to These Terms" },
  { id: "contact",       label: "Contact Us" },
];

export default function TermsPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0ea5e9]/20 blur-3xl" />
        <div className="container-wide relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <FileText size={14} className="text-[#7dd3fc]" /> Legal
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
              Terms of Service
            </h1>
            <p className="text-blue-100 text-base lg:text-lg">
              Please read these terms carefully before using our website or placing an order.
            </p>
            <p className="text-gray-400 text-sm mt-4">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contents</p>
                <nav className="space-y-1">
                  {TOC.map(({ id, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0284c7] py-1 transition-colors group"
                    >
                      <ArrowRight size={11} className="text-[#38bdf8] group-hover:translate-x-0.5 transition-transform" />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-3 max-w-3xl">

              <Section id="acceptance" title="1. Acceptance of Terms">
                <p>
                  By accessing or using the Kajjansi Aquaculture Service Centre (&quot;KASC&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) website at kasc-website.vercel.app, placing an order through our online shop, or engaging any of our services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our website or services.
                </p>
                <p>
                  These Terms apply to all visitors, customers, and registered users of our platform. We reserve the right to update these Terms at any time, and continued use of the site after changes constitutes acceptance.
                </p>
              </Section>

              <Section id="services" title="2. Our Services & Products">
                <p>KASC offers the following products and services through our website and physical premises at Kajjansi, Entebbe Road, Uganda:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Fish Fingerlings</strong> — Nile Tilapia, African Catfish (Clarias), and Miracle Tilapia produced in our certified hatchery</li>
                  <li><strong>Fish Feeds</strong> — Starter and grower pellet feeds with 38–45% protein content</li>
                  <li><strong>Dam Liners</strong> — HDPE geomembrane liners (0.5mm, 0.75mm, 1.0mm), UV-treated and machine-welded</li>
                  <li><strong>Fish Pond Construction</strong> — Full earthworks, design, liner installation, and water testing</li>
                  <li><strong>Cage Construction & Installation</strong> — HDPE and galvanised lake cage systems</li>
                  <li><strong>Aquaculture Training</strong> — Practical farm management and liner installation courses at our Kajjansi demonstration farm</li>
                  <li><strong>Consultancy & Feasibility Studies</strong> — Site assessment, species selection, licensing support, and financial planning</li>
                  <li><strong>Equipment & Accessories</strong> — Aeration systems, water quality test kits, and ancillary farm equipment</li>
                </ul>
                <p>
                  Product availability, pricing, and specifications may change without prior notice. Photographs on the website are illustrative; actual products may vary slightly. All prices are quoted in Uganda Shillings (UGX) and exclude delivery charges unless stated.
                </p>
              </Section>

              <Section id="orders" title="3. Orders & Payments">
                <p>
                  Orders placed through our online shop constitute an offer to purchase. We reserve the right to accept or decline any order. An order is confirmed only once you receive a confirmation message or order number from KASC.
                </p>
                <p><strong>Accepted payment methods:</strong></p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Cash on Delivery (COD)</strong> — Payment collected at the time of delivery</li>
                  <li><strong>MTN Mobile Money</strong> — Transfer to our KASC collection number before delivery</li>
                  <li><strong>Airtel Money</strong> — Transfer to our Airtel Money number before delivery</li>
                  <li><strong>Bank Transfer</strong> — Transfer to our designated bank account; provide transaction reference at checkout</li>
                </ul>
                <p>
                  For Mobile Money and Bank Transfer orders, payment must be completed and a valid transaction reference provided before goods are dispatched. KASC is not liable for delays arising from payment processing or incorrect references.
                </p>
                <p>
                  Minimum order quantities apply to fingerlings (300–500 fingerlings) and certain bulk products. Prices displayed are subject to change; the price confirmed at the time of order confirmation is binding.
                </p>
              </Section>

              <Section id="delivery" title="4. Delivery & Shipping">
                <p>
                  We deliver across Uganda and to neighbouring countries (Kenya, Tanzania, Rwanda). Delivery fees are calculated at checkout based on your district and order value. Orders above UGX 500,000 may qualify for free delivery within certain zones.
                </p>
                <p>
                  Delivery timelines are estimates and may vary due to product availability, geographic location, or circumstances beyond our control. KASC takes reasonable care in packaging live fingerlings for transport; however, we cannot guarantee survival rates in transit if conditions (temperature, water quality, handling) outside our control affect the consignment.
                </p>
                <p>
                  For live products such as fingerlings, the customer is responsible for ensuring appropriate reception facilities (prepared pond or tank with adequate water quality) are ready at the delivery point. Any mortality attributable to inadequate reception facilities is not covered under our delivery guarantee.
                </p>
                <p>
                  Customers are advised to inspect goods upon delivery and raise any discrepancies or damage claims immediately. Claims raised after 24 hours of delivery may not be considered.
                </p>
              </Section>

              <Section id="returns" title="5. Returns & Refunds">
                <p>
                  Due to the perishable and live nature of many of our products (fingerlings, feeds), <strong>all sales are generally final</strong> once goods have been delivered and accepted.
                </p>
                <p><strong>Eligible returns and refunds may be considered in the following cases:</strong></p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Wrong product delivered (different species or specification than ordered)</li>
                  <li>Defective or clearly damaged non-perishable goods (dam liners, equipment) reported within 48 hours of delivery</li>
                  <li>Order cancelled before dispatch</li>
                </ul>
                <p>
                  Refund requests must be submitted by calling <strong>+256 705 641626</strong> or emailing <strong>aquqtechuganda1@gmail.com</strong> with your order number, description of the issue, and supporting photos where applicable. Approved refunds will be processed via the original payment method within 7–14 business days.
                </p>
                <p>
                  Construction and installation services (pond construction, dam liner installation, cage setup) are governed by separate service agreements and are not subject to this general returns policy.
                </p>
              </Section>

              <Section id="accounts" title="6. User Accounts">
                <p>
                  You may register for an account to track orders, save your delivery details, and access order history. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.
                </p>
                <p>
                  You agree to provide accurate, current, and complete registration information. KASC reserves the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in fraudulent activity.
                </p>
                <p>
                  Admin accounts are created exclusively by KASC staff and are not accessible through the public registration process.
                </p>
              </Section>

              <Section id="ip" title="7. Intellectual Property">
                <p>
                  All content on this website — including text, images, logos, product photographs, technical guides, training materials, and software — is the property of Kajjansi Aquaculture Service Centre or its content suppliers and is protected by applicable intellectual property laws.
                </p>
                <p>
                  You may not reproduce, redistribute, republish, or use any content from this site for commercial purposes without prior written permission from KASC. Personal, non-commercial use with appropriate attribution is permitted.
                </p>
              </Section>

              <Section id="conduct" title="8. Acceptable Use">
                <p>You agree not to use this website or our services to:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Submit false or fraudulent orders</li>
                  <li>Impersonate any person or entity</li>
                  <li>Transmit malicious code, spam, or engage in any activity that disrupts site operation</li>
                  <li>Scrape or harvest data from the website without authorisation</li>
                  <li>Violate any applicable Ugandan or international law or regulation</li>
                </ul>
                <p>
                  We reserve the right to block access to users who breach these conditions.
                </p>
              </Section>

              <Section id="disclaimer" title="9. Disclaimers">
                <p>
                  KASC provides product information and aquaculture guidance in good faith based on our professional experience. However, fish farming outcomes depend on many variables — water quality, weather, farm management practices, and disease — that are beyond our control. Results described in marketing materials or training content are illustrative and not guarantees of individual farm performance.
                </p>
                <p>
                  The website is provided &quot;as is&quot; without warranties of any kind. We do not warrant that the site will be uninterrupted, error-free, or free of viruses or other harmful components.
                </p>
              </Section>

              <Section id="liability" title="10. Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, KASC shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the website or services, including but not limited to loss of profits, crop loss, or business interruption.
                </p>
                <p>
                  Our total liability for any claim arising from a specific order or transaction shall not exceed the value of that transaction.
                </p>
              </Section>

              <Section id="governing" title="11. Governing Law">
                <p>
                  These Terms are governed by and construed in accordance with the laws of the Republic of Uganda. Any disputes shall be subject to the exclusive jurisdiction of the courts of Uganda. We encourage all customers to first contact us directly to resolve any disputes amicably.
                </p>
              </Section>

              <Section id="changes" title="12. Changes to These Terms">
                <p>
                  We may update these Terms from time to time to reflect changes in our services, legal requirements, or business practices. The updated date will appear at the top of this page. We encourage you to review these Terms periodically.
                </p>
              </Section>

              <Section id="contact" title="13. Contact Us">
                <p>For questions about these Terms, please reach out:</p>
                <div className="bg-[#f8fafc] rounded-2xl p-5 border border-gray-100 mt-2">
                  <p className="font-semibold text-[#0c4a6e] mb-1">Kajjansi Aquaculture Service Centre</p>
                  <p>Entebbe Road, Kajjansi, Wakiso District, Uganda</p>
                  <p className="mt-2">
                    <strong>Phone:</strong> <a href="tel:+256705641626" className="text-[#0284c7] hover:underline">+256 705 641626</a> &nbsp;|&nbsp; <a href="tel:+256782520244" className="text-[#0284c7] hover:underline">+256 782 520244</a>
                  </p>
                  <p>
                    <strong>Email:</strong> <a href="mailto:aquqtechuganda1@gmail.com" className="text-[#0284c7] hover:underline">aquqtechuganda1@gmail.com</a>
                  </p>
                </div>
                <p className="mt-4">
                  You may also visit our{" "}
                  <Link href="/contact" className="text-[#0284c7] hover:underline font-medium">Contact page</Link>{" "}
                  or read our{" "}
                  <Link href="/privacy" className="text-[#0284c7] hover:underline font-medium">Privacy Policy</Link>.
                </p>
              </Section>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
