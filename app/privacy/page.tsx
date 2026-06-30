import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | KASC",
  description: "How Kajjansi Aquaculture Service Centre collects, uses, and protects your personal information.",
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
  { id: "intro",       label: "Introduction" },
  { id: "collect",     label: "Information We Collect" },
  { id: "use",         label: "How We Use Your Information" },
  { id: "sharing",     label: "Sharing Your Information" },
  { id: "storage",     label: "Data Storage & Security" },
  { id: "cookies",     label: "Cookies" },
  { id: "rights",      label: "Your Rights" },
  { id: "retention",   label: "Data Retention" },
  { id: "children",    label: "Children's Privacy" },
  { id: "changes",     label: "Changes to This Policy" },
  { id: "contact",     label: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0ea5e9]/20 blur-3xl" />
        <div className="container-wide relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <ShieldCheck size={14} className="text-[#7dd3fc]" /> Legal
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight font-display">
              Privacy Policy
            </h1>
            <p className="text-blue-100 text-base lg:text-lg">
              We take your privacy seriously. This policy explains what data we collect and how we use it.
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

              <Section id="intro" title="1. Introduction">
                <p>
                  Kajjansi Aquaculture Service Centre (&quot;KASC&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy describes how we collect, use, store, and share information when you visit our website, create an account, place an order, or contact us.
                </p>
                <p>
                  By using our website or services, you consent to the practices described in this policy. If you do not agree, please refrain from using our services.
                </p>
              </Section>

              <Section id="collect" title="2. Information We Collect">
                <p>We collect information in the following ways:</p>

                <p><strong>Information you provide directly:</strong></p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Account registration:</strong> Full name, email address, phone number, and password when you create a customer account</li>
                  <li><strong>Orders:</strong> Delivery name, email, phone number, delivery address, district, and payment method when you place an order</li>
                  <li><strong>Contact & inquiries:</strong> Name, email, phone, subject, and message when you submit our contact form or request a quote</li>
                  <li><strong>Training registrations:</strong> Name and contact details when you register for a training course or workshop</li>
                </ul>

                <p><strong>Information collected automatically:</strong></p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Browser type, device type, IP address, and pages visited when you use our website</li>
                  <li>Cookies and similar tracking technologies (see Cookies section below)</li>
                  <li>Order history and interaction logs within your account</li>
                </ul>

                <p>
                  We do not collect payment card numbers. All financial transactions via Mobile Money or bank transfer are handled directly between you and your financial service provider.
                </p>
              </Section>

              <Section id="use" title="3. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Process and fulfil your orders, including coordinating delivery to your location</li>
                  <li>Send order confirmations, status updates, and delivery notifications</li>
                  <li>Respond to your enquiries, complaints, and support requests</li>
                  <li>Manage your customer account and order history</li>
                  <li>Send relevant updates about new products, promotions, or aquaculture tips (only with your consent)</li>
                  <li>Improve our website, products, and services through usage analysis</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                  <li>Contact you for feedback or research about our services</li>
                </ul>
                <p>
                  We will not use your information for automated decision-making that significantly affects your rights or interests.
                </p>
              </Section>

              <Section id="sharing" title="4. Sharing Your Information">
                <p>
                  We do not sell, rent, or trade your personal information to third parties. We may share your data only in the following limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Delivery partners:</strong> Your name, phone number, and delivery address are shared with our logistics partners solely to fulfil your order</li>
                  <li><strong>Technology providers:</strong> We use Supabase (hosted in EU data centres) for secure database and authentication services. Supabase processes data on our behalf under strict data processing agreements</li>
                  <li><strong>Legal requirements:</strong> We may disclose information if required by law, regulation, or valid legal process (e.g., a court order)</li>
                  <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, customer data may be transferred to the successor entity with equivalent privacy protections</li>
                </ul>
                <p>
                  All third-party service providers we use are contractually bound to handle your data securely and only for the purposes we specify.
                </p>
              </Section>

              <Section id="storage" title="5. Data Storage & Security">
                <p>
                  Your data is stored on Supabase infrastructure, which operates secure, encrypted PostgreSQL databases with industry-standard access controls and regular security audits. Data is encrypted in transit (TLS) and at rest.
                </p>
                <p>
                  We implement Row Level Security (RLS) policies on our database, meaning each user can only access their own account and order information. Administrative access is restricted to authorised KASC staff only.
                </p>
                <p>
                  Passwords are never stored in plain text — they are hashed using industry-standard cryptographic algorithms by Supabase Auth. We do not have access to your password.
                </p>
                <p>
                  While we take reasonable measures to protect your data, no system is completely secure. We encourage you to use a strong, unique password for your account and to contact us immediately if you suspect unauthorised access.
                </p>
              </Section>

              <Section id="cookies" title="6. Cookies">
                <p>
                  Our website uses cookies — small text files stored on your device — to enhance your browsing experience. We use:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Session cookies:</strong> To keep you logged in during your visit and maintain your shopping cart</li>
                  <li><strong>Authentication cookies:</strong> Set by Supabase to manage your login session securely</li>
                  <li><strong>Preference cookies:</strong> To remember your settings and cart contents across visits</li>
                </ul>
                <p>
                  We do not currently use advertising or third-party tracking cookies. You can control cookie behaviour through your browser settings, but disabling cookies may affect site functionality such as staying logged in or maintaining your cart.
                </p>
              </Section>

              <Section id="rights" title="7. Your Rights">
                <p>As a user of our services, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated personal data (subject to legal retention requirements)</li>
                  <li><strong>Objection:</strong> Object to us processing your data for marketing purposes at any time</li>
                  <li><strong>Portability:</strong> Request your data in a portable, machine-readable format</li>
                </ul>
                <p>
                  To exercise any of these rights, contact us at <a href="mailto:aquqtechuganda1@gmail.com" className="text-[#0284c7] hover:underline">aquqtechuganda1@gmail.com</a>. We will respond within 30 days. Some requests may require us to verify your identity before processing.
                </p>
              </Section>

              <Section id="retention" title="8. Data Retention">
                <p>
                  We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Account data:</strong> Retained for as long as your account is active. You may request deletion at any time.</li>
                  <li><strong>Order records:</strong> Retained for a minimum of 5 years for financial record-keeping and compliance with Ugandan tax laws</li>
                  <li><strong>Inquiry and contact data:</strong> Retained for up to 2 years unless an ongoing business relationship exists</li>
                  <li><strong>Marketing consent records:</strong> Retained until you withdraw consent</li>
                </ul>
              </Section>

              <Section id="children" title="9. Children's Privacy">
                <p>
                  Our website and services are not directed at children under 18 years of age. We do not knowingly collect personal information from minors. If you believe a child has provided us with personal information without parental consent, please contact us and we will promptly delete such data.
                </p>
              </Section>

              <Section id="changes" title="10. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The &quot;last updated&quot; date at the top of this page will reflect any changes. We encourage you to review this policy periodically.
                </p>
                <p>
                  For significant changes that affect how we use your data, we will notify registered users by email or through a notice on the website.
                </p>
              </Section>

              <Section id="contact" title="11. Contact Us">
                <p>
                  For any privacy-related questions, requests, or concerns, please contact our data management team:
                </p>
                <div className="bg-[#f8fafc] rounded-2xl p-5 border border-gray-100 mt-2">
                  <p className="font-semibold text-[#0c4a6e] mb-1">Kajjansi Aquaculture Service Centre</p>
                  <p>Entebbe Road, Kajjansi, Wakiso District, Uganda</p>
                  <p className="mt-2">
                    <strong>Phone:</strong>{" "}
                    <a href="tel:+256705641626" className="text-[#0284c7] hover:underline">+256 705 641626</a>{" "}
                    &nbsp;|&nbsp;{" "}
                    <a href="tel:+256782520244" className="text-[#0284c7] hover:underline">+256 782 520244</a>
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:aquqtechuganda1@gmail.com" className="text-[#0284c7] hover:underline">aquqtechuganda1@gmail.com</a>
                  </p>
                </div>
                <p className="mt-4">
                  You may also review our{" "}
                  <Link href="/terms" className="text-[#0284c7] hover:underline font-medium">Terms of Service</Link>{" "}
                  or visit our{" "}
                  <Link href="/contact" className="text-[#0284c7] hover:underline font-medium">Contact page</Link>.
                </p>
              </Section>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
