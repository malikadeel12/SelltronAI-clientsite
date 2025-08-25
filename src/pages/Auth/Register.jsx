import React, { useState, useEffect } from "react";
import logo from "../../assets/mainlogo/logoicon.png";
import { Link, useNavigate } from "react-router-dom";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    terms: false,
  });
  const [error, setError] = useState("");

  // ✅ Pre-fill dummy admin in localStorage
  useEffect(() => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const adminExists = users.find((u) => u.email === "admin@gmail.com");
    if (!adminExists) {
      users.push({ name: "Admin", email: "admin@gmail.com", terms: true });
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      setError("Name and Email are required!");
      return;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    const exists = users.find((u) => u.email === formData.email);
    if (!exists) {
      users.push(formData);
      localStorage.setItem("users", JSON.stringify(users));
    }

    setError("");

    // ✅ Dummy admin redirect
    if (formData.email === "admin@gmail.com") {
      alert("Admin login successful!");
      navigate("/AdminDashboard"); // Redirect to Admin Dashboard
    } else {
      alert("Signup successful!");
      navigate("/predatordashboard"); // Redirect normal dashboard
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-[90vh] flex flex-col items-center justify-center bg-[#f5f5f5] px-4 sm:px-6 lg:px-8 py-4"
        style={openSansStyle}
      >
        <img src={logo} alt="Logo" className="w-16 sm:w-20 mb-3" />

        <h1
          className="text-lg sm:text-2xl font-bold text-purple-800 mb-1 text-center"
          style={orbitronStyle}
        >
          Sign Up for Sell Predator
        </h1>
        <p className="text-[#000000] mb-5 text-center text-xs sm:text-sm max-w-md">
          Fill in your details and our team will get back to you shortly.
        </p>

        <div className="bg-[#f5f5f5] shadow-md rounded-lg p-5 sm:p-6 w-full max-w-md">
          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-[#000000] mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="futuresphere"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-[#000000] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="abc@abcs.com"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs sm:text-sm text-[#000000] mb-1">
              Phone number (Optional)
            </label>
            <div className="flex flex-col sm:flex-row">
              <select
                name="country"
                className="border rounded-t-md sm:rounded-l-md sm:rounded-tr-none px-2 py-2 text-xs sm:text-sm text-[#000000]"
              >
                <option>US</option>
                <option>PK</option>
                <option>IN</option>
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="flex-1 border rounded-b-md sm:rounded-r-md sm:rounded-bl-none px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <p className="text-xs text-[#000000] mt-3 flex items-start sm:items-center">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="mr-2 mt-0.5 sm:mt-0"
            />
            <span>
              By signing up, you agree to our{" "}
              <Link to="#" className="text-purple-600 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-purple-600 underline">
                Privacy Policy
              </Link>
              .
            </span>
          </p>

          {error && <p className="text-[#D72638] text-xs mt-2">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#FFD700] text-[#000000] font-medium py-2 rounded-full text-sm hover:bg-[#FFD700] transition mt-4"
          >
            Get Started
          </button>
        </div>

        <p className="mt-4 text-[10px] sm:text-xs text-[#000000] text-center">
          © 2025 Sell Predator. All rights reserved.
        </p>
      </div>
    </>
  );
}
