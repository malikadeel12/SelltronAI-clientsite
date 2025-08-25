import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react"; 
import service from "../assets/images/service.png";

const orbitronStyle = { fontFamily: "'Orbitron', sans-serif", fontWeight: 600 };
const openSansStyle = { fontFamily: "'Open Sans', sans-serif" };

export default function Services() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const slides = [
    {
      title: "AI-Powered Sales and Support Operations",
      description:
        "Sell Predator automates sales workflows, streamlines customer interactions, and integrates seamlessly with your CRM. Save time, close deals faster, and provide exceptional customer support – all powered by AI.",
      image: service,
    },
    {
      title: "AI-Powered Sales and Support Operations",
      description:
        "Sell Predator automates sales workflows, streamlines customer interactions, and integrates seamlessly with your CRM. Save time, close deals faster, and provide exceptional customer support – all powered by AI.",
      image: service,
    },
  ];

  const changeSlide = (direction) => {
    setFade(false); 
    setTimeout(() => {
      if (direction === "next") {
        setIndex((prev) => (prev + 1) % slides.length);
      } else {
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
      setFade(true); 
    }, 200); 
  };

  const current = slides[index];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <section
        className="px-4 sm:px-6 md:px-6 py-10 md:py-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center"
        style={openSansStyle}
      >
        {/* Left Side - Image */}
        <div className="flex justify-center md:justify-start overflow-hidden">
          <img
            src={current.image}
            alt="Service"
            className={`rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md transition-opacity duration-500 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {/* Right Side - Text */}
        <div className={`flex flex-col text-left h-full transition-opacity duration-500 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}>
          <div
            className="bg-[#FFD700] text-[#000000] text-sm sm:text-base font-medium px-4 py-1 rounded-full w-fit mb-4"
            style={openSansStyle}
          >
            Services
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4" style={orbitronStyle}>
            {current.title}
          </h3>

          <p className="text-[#000000] mb-6 leading-relaxed text-sm sm:text-base md:text-base" style={openSansStyle}>
            {current.description}
          </p>

          <div className="flex justify-center md:justify-end space-x-3 mt-4 md:mt-auto">
            <button
              onClick={() => changeSlide("prev")}
              className="p-3 cursor-pointer rounded-full bg-[#FFD700] hover:bg-[#FFD700] transition-transform duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-[#f5f5f5]" />
            </button>
            <button
              onClick={() => changeSlide("next")}
              className="p-3 cursor-pointer rounded-full bg-[#f5f5f5] border border-[#D72638] text-[#D72638] hover:bg-[#D72638] hover:text-[#f5f5f5] transition-transform duration-200"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
