import React from "react";
import heroImg from "../assets/Images/Hero.png";
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

      <section className="text-center px-4 md:px-6 py-10" style={openSansStyle}>
        {/* Heading */}
        <h1
          className="text-3xl md:text-6xl font-bold leading-snug"
          style={orbitronStyle}
        >
          <span className="text-red-600">Sell Smarter.</span>{" "}
          <span className="text-gray-700">
            Support<br className="hidden md:block" /> Faster.
          </span>{" "}
          <span className="text-red-600">Powered by AI</span>
        </h1>

        {/* Paragraph */}
        <p className="mt-4 text-base md:text-lg text-gray-600 max-w-md md:max-w-2xl mx-auto" style={openSansStyle}>
          Real-time transcription, multilingual voice, and CRM integration – 
          all in one powerful sales platform.
        </p>

        {/* CTA Button */}
        <button className="mt-6 px-6 py-2 bg-yellow-400 text-gray-900 rounded-full font-medium hover:bg-yellow-500">
          Start Free Trial
        </button>

        {/* Hero Image */}
        <img
          src={heroImg}
          alt="Hero"
          className="mt-5 mx-auto rounded-3xl w-full max-w-md md:max-w-6xl"
        />
      </section>
    </>
  );
}
