import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Stats from "../../components/Stats";
import Features from "../../components/Features";
import Pricing from "../../components/Pricing";
import Demo from "../../components/Demo";
import WhyUs from "../../components/WhyUs";
import Services from "../../components/Services";
import CallToAction from "../../components/CallToAction";
import Footer from "../../components/Footer";

export default function Home() {
  return (
    <div className="bg-[#f5f5f5] text-[#000000]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <div className="flex justify-center space-x-3 mb-4">
        <a
          href="/contactpage" 
          className="px-5 py-2 bg-[#FFD700] text-[#f5f5f5] rounded-full hover:bg-[#FFD700] transition"
        >
          Contact Us
        </a>
        <a
          href="/pricingpage" 
          className="px-5 py-2 text-[#000000] flex items-center space-x-2"
        >
          <span>View All</span>
          <span className="text-lg">{">"}</span>
        </a>
      </div>
      <Pricing />
      <Demo />
      <WhyUs />
      <Services />
      <CallToAction />
      <Footer />
    </div>
  );
}
