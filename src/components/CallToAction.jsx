import React from "react";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function CallToAction() {
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section
        className="text-center py-16 px-6 mx-4 sm:mx-8 md:mx-12 lg:mx-20 mb-10 rounded-lg"
        style={{
          background: "linear-gradient(135deg, #FFD700, #434343, #D92A73)",
          ...openSansStyle,
        }}
      >
        {/* Text */}
        <p
          className="text-[#f5f5f5] text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          style={openSansStyle}
        >
          Sell Predator provides powerful tools and continuous improvements.{" "}
          <br className="hidden sm:block" />
          With our customers, we are shaping the future of AI sales – turning
          beginners into professionals instantly.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Sign Up (transparent) */}
          <a
            href="/signUp"
            className="px-6 py-2 border border-[#f5f5f5] text-[#f5f5f5] rounded-full hover:bg-[#f5f5f5] hover:text-[#000000] transition w-full sm:w-auto text-center"
            style={orbitronStyle}
          >
            Sign Up
          </a>

          {/* Contact Us (yellow bg) */}
          <a
            href="/contactpage"
            className="px-6 py-2 bg-[#FFD700] text-[#000000] rounded-full hover:bg-[#FFD700] transition w-full sm:w-auto text-center"
            style={orbitronStyle}
          >
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
