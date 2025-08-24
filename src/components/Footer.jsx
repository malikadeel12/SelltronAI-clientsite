import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import logo from "../assets/mainlogo/logoicon.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-600 via-pink-500 to-red-400 text-white py-10 px-6">
      {/* 🔹 Logo + Links + Socials inside Border */}
      <div className="border-t border-b border-white py-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto w-full">
          
          {/* Logo (always left) */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={logo} alt="Logo" className="w-18 h-15" />
          </div>

          {/* Links + Socials (pushed to right) */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 text-sm">
            {/* Links */}
            <ul className="flex flex-col md:flex-row md:space-x-6 text-center md:text-left">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/pricingpage" className="hover:underline">Pricing</Link></li>
              <li><Link to="/predatordashboard" className="hover:underline">Dashboard</Link></li>
              <li><Link to="/aboutpage" className="hover:underline">About Us</Link></li>
              <li><Link to="/termspage" className="hover:underline">Terms & Conditions</Link></li>
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
