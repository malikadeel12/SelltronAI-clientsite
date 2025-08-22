import React from "react";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Pricing() {
  const plans = [
    { 
      price: "€89.90", 
      title: "Standard", 
      text: "Unleash the Basic Features", 
      features: ["Basic Features", "1 User"] 
    },
    { 
      price: "€129.90", 
      title: "Premium", 
      text: "Unleash the power of automation.", 
      features: ["All Features", "1 User"] 
    },
    { 
      price: "€249.90", 
      title: "Team Predator", 
      text: "Advanced tools to take your work to the next level.", 
      features: ["All Features", "Priority Support", "3 Users team", "Shared Workspace"]  
    }
  ];

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section id="pricing" className="px-6 py-12 bg-gray-50" style={openSansStyle}>

        {/* 🔹 Buttons Above Heading */}
        <div className="flex justify-center space-x-4 mb-6">
          <button className="px-5 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition">
            Contact Us
          </button>
          <button className="px-5 py-2 text-black flex items-center space-x-2 hover:underline">
            <span>View All</span>
            <span className="text-lg">{">"}</span>
          </button>
        </div>

        {/* Heading */}
        <h2 
          className="text-2xl md:text-3xl font-bold text-center mb-4"
          style={orbitronStyle}
        >
          Plans & Pricing
        </h2>
        <p className="text-gray-600 text-sm md:text-base text-center mb-8" style={openSansStyle}>
          Whether your automation needs are small or large, we’re here to help you scale.
        </p>

        {/* 🔹 Single Card Container */}
        <div className="bg-white rounded-lg p-6 md:p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className="relative flex flex-col items-center px-4 py-6 h-full"
              >
                <h3 className="text-lg md:text-xl font-semibold" style={orbitronStyle}>
                  {plan.title}
                </h3>
                <p className="text-xl md:text-2xl font-bold mt-2" style={orbitronStyle}>
                  {plan.price}
                  <span className="text-sm" style={openSansStyle}>/month</span>
                </p>
                <p className="text-gray-500 text-xs md:text-sm mt-1" style={openSansStyle}>
                  {plan.text}
                </p>

                {/* Features */}
                <ul className="mt-4 text-gray-700 space-y-2 text-left w-full max-w-[220px] mx-auto" style={openSansStyle}>
                  {plan.features.map((f, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-center space-x-2"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs">
                        ✓
                      </span>
                      <span className="text-sm md:text-base">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Equal Sized Button */}
                <button className="mt-6 w-full max-w-[200px] px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700" style={openSansStyle}>
                  Choose Plan
                </button>

                {/* Divider for Desktop */}
                {i < plans.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-4 h-[90%] w-[1px] bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>

          {/* Note Text */}
          <p className="text-xs text-gray-500 mt-6 text-center" style={openSansStyle}>
            License cost: €349.90 (charged after the 7-day trial period).
          </p>
        </div>
      </section>
    </>
  );
}
