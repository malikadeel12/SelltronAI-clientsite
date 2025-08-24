import React, { useState } from "react";
import { Menu, X } from "lucide-react"; 
import logo from "../assets/mainlogo/logoicon.png";
import { Link } from "react-router-dom"; 

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-black text-white px-6 py-4 relative">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-20 h-15 " />
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-sm">
          <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
          <li><Link to="/pricingpage" className="hover:text-yellow-400">Pricing</Link></li>
          <li><Link to="/predatordashboard" className="hover:text-yellow-400">Dashboard</Link></li>
          <li><Link to="/aboutpage" className="hover:text-yellow-400">About Us</Link></li>
          <li><Link to="/termspage" className="hover:text-yellow-400">Privacy Policy</Link></li>
        </ul>

        {/* Desktop Button */}
        <Link
          to="/contactpage"
          className="hidden md:block bg-yellow-400 text-black px-4 py-2 rounded-full font-medium hover:bg-yellow-500"
        >
          Contact Us
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-700 mt-2">
          <ul className="flex flex-col space-y-3 p-4 text-sm">
            <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
            <li><Link to="/pricingpage" className="hover:text-yellow-400">Pricing</Link></li>
            <li><Link to="/predatordashboard" className="hover:text-yellow-400">Dashboard</Link></li>
            <li><Link to="/aboutpage" className="hover:text-yellow-400">About Us</Link></li>
            <li><Link to="/termspage" className="hover:text-yellow-400">Privacy Policy</Link></li>
          </ul>
          <div className="px-4 pb-4">
            <Link
              to="/contactpage"
              className="w-full block text-center bg-yellow-400 text-black px-4 py-2 rounded-full font-medium hover:bg-yellow-500"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
