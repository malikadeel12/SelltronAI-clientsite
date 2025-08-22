import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react"; 
import service from "../assets/Images/service.png";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Services() {
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section 
        className="px-6 py-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        style={openSansStyle}
      >
        {/* Left Side (Image - full left aligned) */}
        <div className="flex justify-center md:justify-start">
          <img
            src={service}
            alt="Service"
            className="rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-sm"
          />
        </div>

        {/* Right Side (Text + buttons) */}
        <div className="flex flex-col text-left h-full">
          {/* 🔹 Top Label */}
          <div 
            className="bg-yellow-200 text-black text-sm font-medium px-4 py-1 rounded-full w-fit mb-4"
            style={openSansStyle}
          >
            Services
          </div>

          {/* Heading */}
          <h3 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={orbitronStyle}
          >
            AI-Powered Sales and <br/>Support Operations
          </h3>

          {/* Description */}
          <p 
            className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base"
            style={openSansStyle}
          >
            Sell Predator automates sales workflows, streamlines customer interactions, 
            and integrates seamlessly with your CRM. <br/>
            Save time, close deals faster, and provide exceptional customer support – all powered by AI.
          </p>

          {/* 🔹 Buttons aligned right (desktop) / center (mobile) */}
          <div className="flex justify-center md:justify-end space-x-3 mt-4 md:mt-auto">
            <button className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button className="p-3 rounded-full bg-white border border-red-500 text-red-500 hover:bg-red-600 hover:text-white">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
