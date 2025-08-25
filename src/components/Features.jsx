import React from "react";
import icon1 from "../assets/icons/icons1.svg";
import icon2 from "../assets/icons/icons2.png.svg";
import icon3 from "../assets/icons/icons3.png.svg";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Features() {
  const features = [
    {
      icon: icon1,
      title: "Live Call Transcription + AI Sales Responses",
      desc: "Instantly transcribe calls and get AI-powered responses proven to close deals faster.",
    },
    {
      icon: icon2,
      title: "Speak Any Language – In Your Own Voice",
      desc: "Sell globally without a language barrier. AI voice cloning in natural tone across 30+ languages.",
    },
    {
      icon: icon3,
      title: "Seamless CRM Sync",
      desc: "Every lead, note, and follow-up is auto-synced into your CRM like HubSpot, Zoho, and Pipedrive.",
    },
  ];

  return (
    <>
      {/* Google Fonts import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section className="px-4 sm:px-6 md:px-6 py-10 md:py-12 max-w-6xl mx-auto" style={openSansStyle}>
        {/* 🔹 Top Label */}
        <div className="bg-[#FFD700] text-[#000000] text-sm font-medium px-4 py-1 rounded-full w-fit mx-auto mb-6">
          Features
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-3xl text-center mb-4" style={orbitronStyle}>
          Powerful AI Tools for Sales &<br />
          Customer Support
        </h2>

        {/* Description */}
        <p className="text-center text-[#000000] mb-10 text-sm sm:text-base md:text-base" style={openSansStyle}>
          Unleash innovation and accelerate growth with our dynamic product.
        </p>

        {/* 🔹 Cards */}
        <div className="bg-[#FFFFFF] shadow-md rounded-lg p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-6 text-center">
          {features.map((f, i) => (
            <div key={i} className="relative flex flex-col items-center px-2 sm:px-4 md:px-6 mb-4 sm:mb-0">
              {/* Icon */}
              <img
                src={f.icon}
                alt={f.title}
                className="mx-auto mb-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
              />

              {/* Title + Desc with red shade bg */}
              <div className="relative rounded-lg p-3 sm:p-4 w-full max-w-xs">
                {/* 🔥 Red shade background */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-200/60 to-transparent rounded-lg blur-2xl"></div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-base sm:text-lg md:text-lg font-semibold" style={orbitronStyle}>
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[#000000] text-sm sm:text-base md:text-base" style={openSansStyle}>
                    {f.desc}
                  </p>
                </div>
              </div>

              {/* Vertical Divider (desktop only) */}
              {i < features.length - 1 && (
                <div className="hidden md:block absolute right-0 top-4 h-[80%] w-[1px] bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
