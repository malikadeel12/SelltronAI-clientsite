import React from "react";
import { Link } from "react-router-dom"; 
import demoImg from "../assets/Images/demo.png";

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
        className="px-6 py-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center" 
        style={openSansStyle}
      >
        {/* Left Side Text */}
        <div>
          {/* Label */}
          <span 
            className="text-sm text-red-600 font-bold bg-[#E9D8FF] px-3 py-1 rounded-full"
            style={openSansStyle}
          >
            Demo
          </span>

          {/* Heading */}
          <h3 
            className="text-2xl md:text-3xl font-bold mt-3 leading-snug"
            style={orbitronStyle}
          >
            Demo Of Live Sales Call <br className="hidden md:block"/> With AI Assistant
          </h3>

          {/* Description */}
          <p 
            className="text-gray-600 mt-4 text-sm md:text-base leading-relaxed"
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
            <Link 
              to="/signUp" 
              className="text-red-700 px-5 py-2 rounded-full border border-red-600 hover:bg-gray-100 w-full sm:w-auto text-center"
              style={openSansStyle}
            >
              Sign Up
            </Link>
            
            <Link 
              to="/contactpage" 
              className="bg-yellow-400 px-5 py-2 rounded-full hover:bg-yellow-500 w-full sm:w-auto text-center"
              style={openSansStyle}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="flex justify-center">
          <img
            src={demoImg}
            alt="Demo"
            className="rounded-lg shadow-md max-w-sm w-full"
          />
        </div>
      </section>
    </>
  );
}
