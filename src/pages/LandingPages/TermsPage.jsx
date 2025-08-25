import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

const sections = [
  { id: "legal", label: "Legal Notice / Imprint" },
  { id: "tos", label: "Terms of Service (ToS)" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "cookies", label: "Cookie Policy" },
  { id: "dpa", label: "Data Processing Agreement (DPA)" },
  { id: "sla", label: "Service Level Agreement (SLA)" },
  { id: "withdrawal", label: "Withdrawal & Refund Policy" },
  { id: "aup", label: "Acceptable Use Policy (AUP)" },
  { id: "export", label: "Export & International Compliance" },
  { id: "security", label: "Security Policy" },
  { id: "subprocessors", label: "Subprocessor List" },
  { id: "dmca", label: "DMCA / Copyright Notice" },
  { id: "children", label: "Children’s Privacy (COPPA / Minor Protection)" },
  { id: "force", label: "Force Majeure" },
  { id: "continuity", label: "Business Continuity" },
  { id: "api", label: "API Cost Disclaimer" },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleClick = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false); // close mobile menu on click
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="bg-[#f5f5f5] min-h-screen flex flex-col" style={openSansStyle}>
        <Navbar />

        {/* Heading */}
        <section className="text-center py-12 px-6">
          <h1 className="text-3xl md:text-5xl font-bold text-[#000000]" style={orbitronStyle}>
            Terms & Policies
          </h1>
          <p className="text-[#000000] text-sm md:text-base mt-3">
            Please read our terms and policies carefully before using Sell Predator services.
          </p>
        </section>

        {/* Subheading */}
        <h2 className="text-2xl md:text-4xl font-bold text-[#000000] mb-4 px-6 md:ml-20" style={orbitronStyle}>
          General Terms of Service
        </h2>

        {/* Sidebar & Content */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 mb-12">

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden mb-4">
            <button
              className="px-4 py-2 bg-[#D72638] text-[#f5f5f5] rounded-lg shadow-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? "Close Menu" : "Open Menu"}
            </button>
            {mobileMenuOpen && (
              <div className="flex flex-col mt-2 space-y-2 bg-[#f5f5f5] p-4 rounded-lg shadow-md">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === sec.id
                        ? "bg-[#D72638] text-[#f5f5f5]"
                        : "text-[#000000] hover:text-[#D72638] hover:bg-[#f5f5f5]"
                    }`}
                    onClick={() => handleClick(sec.id)}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex md:flex-col gap-2 md:w-64 font-medium sticky top-24">
            {sections.map((sec) => (
              <button
                key={sec.id}
                className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 text-left ${
                  activeSection === sec.id
                    ? "bg-[#D72638] text-[#f5f5f5] shadow-lg"
                    : "text-[#000000] hover:text-[#D72638] hover:bg-[#f5f5f5]"
                }`}
                onClick={() => handleClick(sec.id)}
              >
                {sec.label}
              </button>
            ))}
          </aside>

          {/* Content Section */}
          <div className="flex-1 space-y-8">
            {/* Legal Notice / Imprint */}
            <div id="legal" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Legal Notice / Imprint</h2>
              <p>Provider: Sell Predator – Milad Chakeri, Hamburg, Germany</p>
              <p>Contact: [Insert Email Address] / [Insert Phone Number]</p>
              <p>Authorized Representative: Milad Chakeri</p>
              <p>VAT ID: [Insert]</p>
              <p>Commercial Register: [Insert, if applicable]</p>
            </div>

            {/* Terms of Service (ToS) */}
            <div id="tos" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Terms of Service (ToS)</h2>
              <p><strong>§1 Contracting Parties:</strong> These Terms of Service govern the contractual relationship between the provider Sell Predator (“Provider”) and the users of the SaaS service (“Customer” or “User”).</p>
              <p><strong>§2 Description of Services:</strong> Sell Predator is an AI-powered SaaS platform that offers call transcription, real-time coaching, customer data analysis, and sales optimization. Access is granted to use these services online.</p>
              <p><strong>§3 Prices and Payment Terms:</strong> All prices exclude VAT; payment in advance via Stripe/PayPal. Third-party API costs (OpenAI) borne by Customer.</p>
              <p><strong>§4 Obligations of the User:</strong> No unlawful use, spam, phishing, illegal content, or IT attacks. Credentials must remain confidential.</p>
              <p><strong>§5 Liability:</strong> Provider not liable for interruptions beyond intent/gross negligence; indirect damages excluded.</p>
              <p><strong>§6 Term and Termination:</strong> Contracts indefinite unless agreed; 14 days’ notice; extraordinary termination rights unaffected.</p>
              <p><strong>§7 Changes to Terms:</strong> Changes announced 30 days prior; non-objection within 14 days deemed accepted.</p>
              <p><strong>§8 Governing Law and Jurisdiction:</strong> German law; Hamburg courts.</p>
            </div>

            {/* Privacy Policy */}
            <div id="privacy" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Privacy Policy</h2>
              <p>Controller: Sell Predator – Milad Chakeri, Hamburg</p>
              <p>Data Categories: Master data, Usage data, Call transcripts, Payment data</p>
              <p>Purposes: Contract fulfillment, service improvement, IT security, payment processing</p>
              <p>Legal Basis (GDPR): Contract performance, consent, legitimate interest</p>
              <p>Retention: Usage data until account deletion; Payment data 10 years</p>
              <p>Third-Party Recipients: AWS, OpenAI, Stripe, PayPal</p>
              <p>User Rights (GDPR): Access, rectification, erasure, portability, complaint to authority</p>
            </div>

            {/* Cookie Policy */}
            <div id="cookies" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Cookie Policy</h2>
              <p>Necessary cookies required for functionality. Analytics/Marketing cookies need opt-in. Users can withdraw consent anytime.</p>
            </div>

            {/* Data Processing Agreement */}
            <div id="dpa" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Data Processing Agreement (DPA)</h2>
              <p>Processing on Customer’s instructions only; TLS 1.2+, AES-256, ISO 27001 centers; breaches reported within 72h; subprocessors: AWS, OpenAI, Stripe, PayPal</p>
            </div>

            {/* Service Level Agreement */}
            <div id="sla" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Service Level Agreement (SLA)</h2>
              <p>Uptime: 99%, support response 24h, maintenance announced 48h prior. No liability for third-party outages.</p>
            </div>

            {/* Withdrawal & Refund Policy */}
            <div id="withdrawal" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Withdrawal & Refund Policy</h2>
              <p>B2C: 14-day withdrawal; B2B: excluded; refunds only if legally required or at Provider’s discretion.</p>
            </div>

            {/* Acceptable Use Policy */}
            <div id="aup" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Acceptable Use Policy (AUP)</h2>
              <p>Lawful use only. Prohibited: spam, phishing, illegal content, hacking, API abuse.</p>
            </div>

            {/* Export & International Compliance */}
            <div id="export" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Export & International Compliance</h2>
              <p>Use restricted in sanctioned countries (e.g., North Korea, Syria). User responsible for compliance. Provider not liable for violations.</p>
            </div>

            {/* Security Policy */}
            <div id="security" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Security Policy</h2>
              <p>TLS 1.2+, AES-256, ISO 27001 data centers, daily backups, monitoring, multi-region hosting.</p>
            </div>

            {/* Subprocessor List */}
            <div id="subprocessors" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Subprocessor List</h2>
              <p>AWS: Hosting, OpenAI: AI processing, Stripe/PayPal: payments. Provider may add subprocessors with notice.</p>
            </div>

            {/* DMCA */}
            <div id="dmca" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>DMCA / Copyright Notice</h2>
              <p>Users responsible for content; infringing content removed promptly; DMCA applies for U.S. customers.</p>
            </div>

            {/* Children’s Privacy */}
            <div id="children" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Children’s Privacy (COPPA / Minor Protection)</h2>
              <p>Service for 18+ only; no data collection from minors under 16; data deleted if found.</p>
            </div>

            {/* Force Majeure */}
            <div id="force" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Force Majeure</h2>
              <p>Provider not liable for events outside reasonable control: war, disasters, pandemics, power/telecom failure, government actions.</p>
            </div>

            {/* Business Continuity */}
            <div id="continuity" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>Business Continuity</h2>
              <p>Backups, disaster recovery, multi-region hosting, rapid service restoration.</p>
            </div>

            {/* API Cost Disclaimer */}
            <div id="api" className="bg-[#f5f5f5] rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold mb-2" style={orbitronStyle}>API Cost Disclaimer</h2>
              <p>Third-party API costs (OpenAI, Google, AWS) are Customer’s responsibility. Provider not liable for unpaid restrictions.</p>
            </div>

          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
