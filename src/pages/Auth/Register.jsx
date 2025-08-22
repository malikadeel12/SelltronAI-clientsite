import React from "react";
import logo from "../../assets/logo/logo.png"; 

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function SignUp() {
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-[90vh] flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-6"
        style={openSansStyle}
      >
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-20  sm:w-24 mb-3" />

        {/* Title */}
        <h1
          className="text-lg sm:text-2xl font-bold text-purple-800 mb-1 text-center"
          style={orbitronStyle}
        >
          Sign Up for Sell Predator
        </h1>
        <p className="text-gray-500 mb-5 text-center text-xs sm:text-sm max-w-md">
          Fill in your details and our team will get back to you shortly.
        </p>

        {/* Form Card */}
        <div className="bg-white shadow-md rounded-lg p-5 sm:p-6 w-full max-w-md">
          {/* Name */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              placeholder="futuresphere"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="abc@abcs.com"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">
              Phone number (Optional)
            </label>
            <div className="flex flex-col sm:flex-row">
              <select className="border rounded-t-md sm:rounded-l-md sm:rounded-tr-none px-2 py-2 text-xs sm:text-sm text-gray-600">
                <option>US</option>
                <option>PK</option>
                <option>IN</option>
              </select>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="flex-1 border rounded-b-md sm:rounded-r-md sm:rounded-bl-none px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Button */}
          <button className="w-full bg-yellow-400 text-gray-900 font-medium py-2 rounded-full text-sm hover:bg-yellow-500 transition">
            Get Started
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-3 flex items-start sm:items-center">
            <input type="checkbox" className="mr-2 mt-0.5 sm:mt-0" />
            <span>
              By signing up, you agree to our{" "}
              <a href="#" className="text-purple-600 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 underline">
                Privacy Policy
              </a>
              .
            </span>
          </p>
        </div>

        {/* Login Link */}
        <p className="mt-4 text-xs sm:text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 underline">
            Log in
          </a>
        </p>

        {/* Footer */}
        <p className="mt-4 text-[10px] sm:text-xs text-gray-500 text-center">
          © 2025 Sell Predator. All rights reserved.
        </p>
      </div>
    </>
  );
}
