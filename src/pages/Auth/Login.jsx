import React from "react";
import logo from "../../assets/mainlogo/logoicon.png"; 

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Login() {
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
       <img src={logo} alt="Logo" className="w-20 sm:w-24 mb-3" />


        {/* Title */}
        <h1
          className="text-lg sm:text-2xl font-bold text-purple-800 mb-1 text-center"
          style={orbitronStyle}
        >
          Log in to Sell Predator
        </h1>
        <p className="text-gray-500 mb-5 text-center text-xs sm:text-sm max-w-md">
          Welcome back! Please enter your details.
        </p>

        {/* Form Card */}
        <div className="bg-white shadow-md rounded-lg p-5 sm:p-6 w-full max-w-md">
          {/* Email */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="abc@abcs.com"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Button */}
          <button className="w-full bg-yellow-400 text-gray-900 font-medium py-2 rounded-full text-sm hover:bg-yellow-500 transition">
            Log In
          </button>

          {/* Remember + Forgot Password */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2 sm:gap-0">
            <label className="flex items-center text-xs sm:text-sm text-gray-500">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="#" className="text-xs sm:text-sm text-purple-600 underline">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="mt-4 text-xs sm:text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a href="/signUp" className="text-purple-600 underline">
            Sign Up
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
