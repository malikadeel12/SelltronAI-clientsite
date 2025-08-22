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
    <div className="bg-white text-gray-800">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <Demo />
      <WhyUs />
      <Services />
      <CallToAction/>
      <Footer />
    </div>
  );
}
