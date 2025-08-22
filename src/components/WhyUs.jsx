import React from "react";
import icon4 from "../assets/icons/icon4.png";
import icon5 from "../assets/icons/icon5.png";
import icon6 from "../assets/icons/icon6.png";
import icon7 from "../assets/icons/icon7.png";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function WhyUs() {
  const points = [
    { text: "24/7 AI Sales Assistant", icon: icon4 },
    { text: "Real-time Transcription", icon: icon5 },
    { text: "Multilingual Voice Support", icon: icon6 },
    { text: "Seamless CRM Integration", icon: icon7 },
  ];

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section 
        className="px-6 py-12 bg-gray-50 text-center"
        style={openSansStyle}
      >
        {/* 🔹 Top Label */}
        <div 
          className="bg-yellow-200 text-black text-sm font-medium px-4 py-1 rounded-full w-fit mx-auto mb-6"
          style={openSansStyle}
        >
          Why Us
        </div>

        {/* Heading + Subtext */}
        <h2 
          className="text-2xl md:text-3xl font-bold mb-4"
          style={orbitronStyle}
        >
          Why Teams Choose Sell Predator
        </h2>
        <p 
          className="text-gray-600 mb-8 text-sm md:text-base"
          style={openSansStyle}
        >
          Four key reasons sales and support teams choose our AI platform.
        </p>

        {/* 🔹 Single Card Container */}
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {points.map((p, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Icon */}
              <img
                src={p.icon}
                alt={p.text}
                className="w-12 h-12 mb-4"
              />
              {/* Text */}
              <p 
                className="font-semibold text-sm md:text-base"
                style={openSansStyle}
              >
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
