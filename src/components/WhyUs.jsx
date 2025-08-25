import React from "react";
import icon4 from "../assets/icons/icons4.png.svg";
import icon5 from "../assets/icons/icons5.png.svg";
import icon6 from "../assets/icons/icons6.png.svg";
import icon7 from "../assets/icons/icons7.png.svg";

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
        className="px-4 sm:px-6 md:px-6 py-10 md:py-12 bg-[#f5f5f5] text-center"
        style={openSansStyle}
      >
        {/* 🔹 Top Label */}
        <div 
          className="bg-[#FFD700] text-[#000000] text-sm sm:text-base font-medium px-4 py-1 rounded-full w-fit mx-auto mb-6"
          style={openSansStyle}
        >
          Why Us
        </div>

        {/* Heading + Subtext */}
        <h2 
          className="text-2xl sm:text-3xl md:text-3xl font-bold mb-4"
          style={orbitronStyle}
        >
          Why Teams Choose Sell Predator
        </h2>
        <p 
          className="text-[#000000] mb-8 text-sm sm:text-base md:text-base"
          style={openSansStyle}
        >
          Four key reasons sales and support teams choose our AI platform.
        </p>

        {/* 🔹 Single Card Container */}
        <div className="bg-[#ffffff] shadow-md rounded-lg p-6 md:p-8 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {points.map((p, i) => (
            <div key={i} className="flex flex-col items-center px-2 sm:px-4">
              {/* Icon */}
              <img
                src={p.icon}
                alt={p.text}
                className="w-10 sm:w-12 h-10 sm:h-12 mb-4"
              />
              {/* Text */}
              <p 
                className="font-semibold text-sm sm:text-base md:text-base"
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
