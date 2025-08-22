import React from "react";
import Navbar from "../../components/Navbar";
import Pricing from "../../components/Pricing";
import WhyUs from "../../components/WhyUs";
import Footer from "../../components/Footer";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function PricingPage() {
  return (
    <>
      {/* Google Fonts import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="bg-gray-50 min-h-screen flex flex-col" style={openSansStyle}>
        {/* Navbar */}
        <Navbar />

        {/* Heading Section */}
        <section className="text-center py-8 px-4 md:py-12 md:px-6">
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-snug"
            style={orbitronStyle}
          >
            Transparent Pricing for Exceptional Value
          </h1>
          <p
            className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2"
            style={openSansStyle}
          >
            Find the perfect plan for your needs with our straightforward pricing
            options. Discover competitive rates and unlock the exceptional value
            we offer for our top-notch services.
          </p>
        </section>

        {/* Pricing Plans */}
        <div className="px-4 sm:px-6">
          <Pricing />
        </div>

        {/* Why Us */}
        <div className="px-4 sm:px-6">
          <WhyUs />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
