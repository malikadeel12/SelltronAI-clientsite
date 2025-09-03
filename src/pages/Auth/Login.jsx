import React, { useState } from "react";
import logo from "../../assets/mainlogo/logoicon.png";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, getIdToken, GoogleAuthProvider, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInWithPopup } from "firebase/auth";
import { getAuthInstance } from "../../lib/firebase";

/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Created Login page with email and password fields.
 * - Mirrors the style of the existing signup page for UX consistency.
 * - Uses localStorage for demo auth parity until backend is wired.
 * Why: Project requires a dedicated login screen with basic validation.
 * Dependencies/Related: Will be replaced by server-side auth in `server/`.
 */

const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  // Handle redirect result if popup is blocked
  React.useEffect(() => {
    (async () => {
      try {
        const auth = getAuthInstance();
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const token = await getIdToken(result.user, true);
          const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          let who = { role: "user" };
          try {
            const res = await fetch(`${apiBase}/api/auth/whoami`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) who = await res.json();
          } catch (_) {}
          if (who.role === "admin") navigate("/AdminDashboard"); else navigate("/predatordashboard");
        }
      } catch (_) {
        // ignore; no redirect result
      }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // --- Validation Step ---
    if (!formData.email || !formData.password) {
      setError("Email and Password are required!");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address!");
      return;
    }
    
    // Password length validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    
    try {
      // --- Firebase email/password sign-in ---
      const cred = await signInWithEmailAndPassword(
        getAuthInstance(),
        formData.email,
        formData.password
      );

      // --- Resolve role from backend using ID token ---
      const token = await getIdToken(cred.user, true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      let who = { role: "user" };
      try {
        const res = await fetch(`${apiBase}/api/auth/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          who = await res.json();
        }
      } catch (_) {
        // Backend not reachable; default to user role to preserve UX
        who = { role: "user" };
      }

      setError("");
      if (who.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/predatordashboard");
      }
    } catch (e) {
      setError(e?.message || "Login failed. Please try again.");
    }
  };

  // --- Google Sign-In Flow ---
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuthInstance();
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // Try popup first; fallback to redirect if blocked
      try {
        const cred = await signInWithPopup(auth, provider);
        const token = await getIdToken(cred.user, true);
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        let who = { role: "user" };
        try {
          const res = await fetch(`${apiBase}/api/auth/whoami`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) who = await res.json();
        } catch (_) {}
        if (who.role === "admin") navigate("/AdminDashboard"); else navigate("/predatordashboard");
      } catch (popupErr) {
        await signInWithRedirect(auth, provider);
      }
    } catch (e) {
      setError(e?.message || "Google sign-in failed. Please try again.");
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
          Login to Sell Predator
        </h1>
        <p className="text-[#000000] mb-5 text-center text-xs sm:text-sm max-w-md">
          Enter your credentials to access your dashboard.
        </p>

        <div className="bg-[#f5f5f5] shadow-md rounded-lg p-5 sm:p-6 w-full max-w-md">
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
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && <p className="text-[#D72638] text-xs mt-2">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#FFD700] text-[#000000] font-medium py-2 rounded-full text-sm hover:bg-[#FFD700] transition mt-4 cursor-pointer"
          >
            Login
          </button>

          {/* --- Or divider --- */}
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-2 text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* --- Google Sign-In Button --- */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 text-[#000000] bg-white py-2 rounded-full text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer"
            aria-label="Continue with Google"
          >
            {/* Simple G icon using text to avoid asset dependency */}
            <span className="text-[#4285F4] font-bold">G</span>
            <span>Continue with Google</span>
          </button>

          <p className="text-xs text-[#000000] mt-3 text-center">
            Don&apos;t have an account? {" "}
            <Link to="/signUp" className="text-purple-600 underline">
              Sign Up
            </Link>
          </p>
        </div>

        <p className="mt-4 text-[10px] sm:text-xs text-[#000000] text-center">
          © 2025 Sell Predator. All rights reserved.
        </p>
      </div>
    </>
  );
}


