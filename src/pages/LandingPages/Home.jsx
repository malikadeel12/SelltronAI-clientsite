import React from "react";
import { Link } from "react-router-dom";
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
      <div className="flex justify-center space-x-3 mb-2">
        <Link
          to="/contactpage" 
          className="px-5 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition"
        >
          Contact Us
        </Link>
        <Link
          to="/all-items" // Your route
          className="px-5 py-2 text-black flex items-center space-x-2"
        >
          <span>View All</span>
          <span className="text-lg">{">"}</span>
        </Link>
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
