import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import logo from "../assets/mainlogo/logoicon.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-600 via-pink-500 to-[#D72638] text-[#f5f5f5] py-10 px-4 sm:px-6 md:px-10">
      {/* 🔹 Logo + Links + Socials inside Border */}
      <div className="border-t border-b border-[#f5f5f5] py-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto w-full">
          
          {/* Logo (always left) */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={logo} alt="Logo" className="w-16 h-12 sm:w-18 sm:h-14 md:w-20 md:h-15" />
          </div>

          {/* Links + Socials (pushed to right) */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 text-sm w-full md:w-auto">
            {/* Links */}
            <ul className="flex flex-col sm:flex-row sm:space-x-6 text-center md:text-left w-full md:w-auto">
              <li className="py-1 sm:py-0"><Link to="/" className="hover:underline">Home</Link></li>
              <li className="py-1 sm:py-0"><Link to="/pricingpage" className="hover:underline">Pricing</Link></li>
              <li className="py-1 sm:py-0"><Link to="/predatordashboard" className="hover:underline">Dashboard</Link></li>
              <li className="py-1 sm:py-0"><Link to="/aboutpage" className="hover:underline">About Us</Link></li>
              <li className="py-1 sm:py-0"><Link to="/termspage" className="hover:underline">Terms & Conditions</Link></li>
            </ul>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start space-x-4 mt-4 md:mt-0">
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter className="w-5 h-5 hover:text-[#FFD700] transition" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebook className="w-5 h-5 hover:text-[#FFD700] transition" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedin className="w-5 h-5 hover:text-[#FFD700] transition" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Bottom Text (below border, under logo section) */}
      <div className="max-w-6xl mx-auto mt-6 px-2 sm:px-0">
        <p className="text-center text-xs sm:text-sm">
          © 2025 Sell Predator. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
