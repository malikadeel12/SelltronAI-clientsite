import React from "react";
import { Link } from "react-router-dom"; 
import demoImg from "../assets/images/demo.png";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Demo() {
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section 
        className="px-4 sm:px-6 md:px-6 py-10 md:py-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center" 
        style={openSansStyle}
      >
        {/* Left Side Text */}
        <div>
          {/* Label */}
          <span 
            className="text-sm sm:text-base text-[#D72638] font-bold bg-[#F5F5F5] px-3 py-1 rounded-full"
            style={openSansStyle}
          >
            Demo
          </span>

          {/* Heading */}
          <h3 
            className="text-2xl sm:text-3xl md:text-3xl font-bold mt-3 leading-snug"
            style={orbitronStyle}
          >
            Demo Of Live Sales Call <br className="hidden md:block"/> With AI Assistant
          </h3>

          {/* Description */}
          <p 
            className="text-[#000000] mt-4 text-sm sm:text-base md:text-base leading-relaxed"
            style={openSansStyle}
          >
            We are dedicated to empowering individuals, businesses, and communities 
            by providing innovative and cutting-edge technology solutions that unlock 
            new possibilities and drive positive change. Our mission is to make 
            technology accessible, reliable, and impactful – enabling our customers 
            to thrive in the digital era and shape a better future for all.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <a 
              href="/signUp" 
              className="text-[#D72638] px-5 py-2 rounded-full border border-[#D72638] hover:bg-[#f5f5f5] w-full sm:w-auto text-center"
              style={openSansStyle}
            >
              Sign Up
            </a>
            
            <a 
              href="/contactpage" 
              className="bg-[#FFD700] px-5 py-2 rounded-full hover:bg-[#FFD700] w-full sm:w-auto text-center"
              style={openSansStyle}
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="flex justify-center md:justify-end mt-6 md:mt-0">
          <img
            src={demoImg}
            alt="Demo"
            className="rounded-lg shadow-md max-w-xs sm:max-w-sm md:max-w-md w-full"
          />
        </div>
      </section>
    </>
  );
}
