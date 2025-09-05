import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/mainlogo/logoicon.png";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAuthInstance } from "../lib/firebase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      navigate("/");
      setMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <nav className="w-full bg-[#000000] text-[#f5f5f5] px-4 sm:px-6 py-4 relative">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <img src={logo} alt="Logo" className="w-16 sm:w-20 h-auto" />
          </Link>
          <div className="hidden md:flex space-x-6 text-sm md:text-base">
            <div className="animate-pulse bg-gray-600 h-4 w-16 rounded"></div>
            <div className="animate-pulse bg-gray-600 h-4 w-20 rounded"></div>
            <div className="animate-pulse bg-gray-600 h-4 w-24 rounded"></div>
          </div>
          <div className="hidden md:block">
            <div className="animate-pulse bg-gray-600 h-8 w-24 rounded-full"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-[#000000] text-[#f5f5f5] px-4 sm:px-6 py-4 relative">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 cursor-pointer">
          <img src={logo} alt="Logo" className="w-16 sm:w-20 h-auto" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-sm md:text-base">
          <li><Link to="/" className="hover:text-[#FFD700]">Home</Link></li>
          <li><Link to="/pricingpage" className="hover:text-[#FFD700]">Pricing</Link></li>
          {user ? (
            <li><Link to="/predatordashboard" className="hover:text-[#FFD700]">Dashboard</Link></li>
          ) : (
            <li><Link to="/contactpage" className="hover:text-[#FFD700]">Contact Us</Link></li>
          )}
          <li><Link to="/aboutpage" className="hover:text-[#FFD700]">About Us</Link></li>
          <li><Link to="/termspage" className="hover:text-[#FFD700]">Privacy Policy</Link></li>
        </ul>

        {/* Desktop Button */}
        {user ? (
          <button
            onClick={handleLogout}
            className="hidden md:block bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/signUp"
            className="hidden md:block bg-[#FFD700] text-[#000000] px-4 py-2 rounded-full font-medium hover:bg-[#FFD700]"
          >
            Sign Up
          </Link>
        )}

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
        <div className="md:hidden bg-[#000000] border-t border-[#333333] mt-2">
          <ul className="flex flex-col space-y-3 p-4 text-sm">
            <li><Link to="/" className="hover:text-[#FFD700]" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/pricingpage" className="hover:text-[#FFD700]" onClick={() => setMenuOpen(false)}>Pricing</Link></li>
            {user ? (
              <li><Link to="/predatordashboard" className="hover:text-[#FFD700]" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            ) : (
              <li><Link to="/contactpage" className="hover:text-[#FFD700]" onClick={() => setMenuOpen(false)}>Contact Us</Link></li>
            )}
            <li><Link to="/aboutpage" className="hover:text-[#FFD700]" onClick={() => setMenuOpen(false)}>About Us</Link></li>
            <li><Link to="/termspage" className="hover:text-[#FFD700]" onClick={() => setMenuOpen(false)}>Privacy Policy</Link></li>
          </ul>
          <div className="px-4 pb-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full block text-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/signUp"
                className="w-full block text-center bg-[#FFD700] text-[#000000] px-4 py-2 rounded-full font-medium hover:bg-[#FFD700]"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
