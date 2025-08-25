import React from "react";
import heroImg from "../assets/images/hero.png";

const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};
const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Hero() {
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section className="text-center px-4 sm:px-6 md:px-6 py-10" style={openSansStyle}>
        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl md:text-6xl font-bold leading-snug"
          style={orbitronStyle}
        >
          <span className="text-[#D72638]">Sell Smarter.</span>{" "}
          <span className="text-[#000000]">
            Support<br className="hidden md:block" /> Faster.
          </span>{" "}
          <span className="text-[#D72638]">Powered by AI</span>
        </h1>

        {/* Paragraph */}
        <p
          className="mt-4 text-base sm:text-lg md:text-lg text-[#000000] max-w-xs sm:max-w-md md:max-w-2xl mx-auto"
          style={openSansStyle}
        >
          Real-time transcription, multilingual voice, and CRM integration –
          all in one powerful sales platform.
        </p>

        {/* CTA Button */}
        <a
          href="/pricingpage"
          className="mt-6 px-6 py-2 bg-[#FFD700] text-[#000000] rounded-full font-medium hover:bg-[#FFD700] cursor-pointer inline-block"
        >
          Start Free Trial
        </a>

        {/* Hero Image */}
        <img
          src={heroImg}
          alt="Hero"
          className="mt-5 mx-auto rounded-3xl w-full max-w-xs sm:max-w-md md:max-w-6xl"
        />
      </section>
    </>
  );
}
