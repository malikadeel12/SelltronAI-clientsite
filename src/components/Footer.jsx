import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import logo from "../assets/logs/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-600 via-pink-500 to-red-400 text-white py-10 px-6">
      {/* 🔹 Logo + Links + Socials inside Border */}
      <div className="border-t border-b border-white py-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto w-full">
          
          {/* Logo (always left) */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={logo} alt="Logo" className="w-20 h-8 invert brightness-0" />
          </div>

          {/* Links + Socials (pushed to right) */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 text-sm">
            {/* Links */}
            <ul className="flex flex-col md:flex-row md:space-x-6 text-center md:text-left">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="#pricing" className="hover:underline">Pricing</a></li>
              <li><a href="#dashboard" className="hover:underline">Dashboard</a></li>
              <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:underline">Terms & Conditions</a></li>
            </ul>

            {/* Social Icons */}
            <div className="flex justify-center space-x-4 mt-4 md:mt-0">
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter className="w-5 h-5 hover:text-yellow-300 transition" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebook className="w-5 h-5 hover:text-yellow-300 transition" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedin className="w-5 h-5 hover:text-yellow-300 transition" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Bottom Text (below border, under logo section) */}
      <div className="max-w-6xl mx-auto mt-6">
        <p className="text-left md:text-center text-xs">
          © 2025 Sell Predator. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
