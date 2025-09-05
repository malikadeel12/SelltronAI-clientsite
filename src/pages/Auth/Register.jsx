import React, { useState } from "react";
import logo from "../../assets/mainlogo/logoicon.png";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getIdToken, GoogleAuthProvider, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInWithPopup } from "firebase/auth";
import { getAuthInstance } from "../../lib/firebase";
import { sendVerificationCode, verifyEmailCode } from "../../lib/api";
import Timer from "../../components/Timer";

/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Implemented email verification flow with 60-second timer.
 * - Added verification code input step before account creation.
 * - Maintains existing Firebase auth and role-based routing.
 * Why: Enhanced security with email verification during signup.
 * Dependencies/Related: Timer component, email verification APIs, Firebase auth.
 */

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
  const [step, setStep] = useState("signup"); // "signup" or "verification"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    terms: false,
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  // Handle redirect result after Google redirect sign-in
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSendVerification = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Name, Email, Password and Confirm Password are required!");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address!");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendVerificationCode(formData.email);
      setStep("verification");
      setTimerExpired(false);
    } catch (e) {
      setError(e?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyEmailCode(formData.email, verificationCode);
      
      // Code verified, now create the account
      const cred = await createUserWithEmailAndPassword(
        getAuthInstance(),
        formData.email,
        formData.password
      );

      // Assign admin role for specific email (demo)
      if (formData.email === "admin@gmail.com") {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        await fetch(`${apiBase}/api/auth/assign-role`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: cred.user.uid, role: "admin" }),
        });
      }

      // Get token and determine role
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
        who = { role: "user" };
      }

      // Redirect based on role
      if (who.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/predatordashboard");
      }
    } catch (e) {
      setError(e?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    try {
      await sendVerificationCode(formData.email);
      setTimerExpired(false);
    } catch (e) {
      setError(e?.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimerExpire = () => {
    setTimerExpired(true);
  };

  const handleBackToSignup = () => {
    setStep("signup");
    setVerificationCode("");
    setError("");
    setTimerExpired(false);
  };

  // Google Sign-Up/Login (same flow)
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuthInstance();
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      try {
        const cred = await signInWithPopup(auth, provider);
        if (cred.user?.email === "admin@gmail.com") {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          await fetch(`${apiBase}/api/auth/assign-role`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: cred.user.uid, role: "admin" }),
          });
        }
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

  // Verification Step UI
  if (step === "verification") {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        <div
          className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-4 sm:px-6 lg:px-8 py-2"
          style={openSansStyle}
        >
          <img src={logo} alt="Logo" className="w-12 sm:w-16 mb-2" />

          <h1
            className="text-lg sm:text-xl font-bold text-purple-800 mb-1 text-center"
            style={orbitronStyle}
          >
            Verify Your Email
          </h1>
          <p className="text-[#000000] mb-3 text-center text-xs sm:text-sm max-w-md">
            We've sent a verification code to <strong>{formData.email}</strong>
          </p>

          <div className="bg-[#f5f5f5] shadow-md rounded-lg p-4 sm:p-5 w-full max-w-md">
            {/* Timer */}
            <div className="mb-4">
              <Timer 
                seconds={60} 
                onExpire={handleTimerExpire}
                onReset={handleResendCode}
              />
            </div>

            {/* Verification Code Input */}
            <div className="mb-3">
              <label className="block text-xs sm:text-sm text-[#000000] mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full border rounded-md px-3 py-2 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && <p className="text-[#D72638] text-xs mt-2 mb-3">{error}</p>}

            <button
              onClick={handleVerifyCode}
              disabled={loading || timerExpired}
              className="w-full bg-[#FFD700] text-[#000000] font-medium py-2 rounded-full text-sm hover:bg-[#FFD700] transition mt-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <button
              onClick={handleBackToSignup}
              className="w-full border border-gray-300 text-[#000000] bg-white py-2 rounded-full text-sm hover:bg-gray-50 transition mt-2 cursor-pointer"
            >
              Back to Sign Up
            </button>
          </div>

          <p className="mt-2 text-[10px] sm:text-xs text-[#000000] text-center">
            © 2025 Sell Predator. All rights reserved.
          </p>
        </div>
      </>
    );
  }

  // Signup Step UI
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-4 sm:px-6 lg:px-8 py-2"
        style={openSansStyle}
      >
        <img src={logo} alt="Logo" className="w-12 sm:w-16 mb-2" />

        <h1
          className="text-lg sm:text-xl font-bold text-purple-800 mb-1 text-center"
          style={orbitronStyle}
        >
          Sign Up for Sell Predator
        </h1>
        <p className="text-[#000000] mb-3 text-center text-xs sm:text-sm max-w-md">
          Fill in your details and verify your email to get started.
        </p>

        <div className="bg-[#f5f5f5] shadow-md rounded-lg p-4 sm:p-5 w-full max-w-md">
          <div className="mb-2">
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

          <div className="mb-2">
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

          <div className="mb-2">
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
          
          <div className="mb-2">
            <label className="block text-xs sm:text-sm text-[#000000] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-2">
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

          <p className="text-xs text-[#000000] mt-2 flex items-start sm:items-center">
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
            onClick={handleSendVerification}
            disabled={loading}
            className="w-full bg-[#FFD700] text-[#000000] font-medium py-2 rounded-full text-sm hover:bg-[#FFD700] transition mt-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Sending Code..." : "Signup"}
          </button>

          {/* Or divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-2 text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 text-[#000000] bg-white py-2 rounded-full text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer"
            aria-label="Continue with Google"
          >
            <span className="text-[#4285F4] font-bold">G</span>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Existing account redirect CTA */}
        <p className="text-xs text-[#000000] mt-2 text-center">
          Already have an account? {" "}
          <Link to="/login" className="text-purple-600 underline">
            Login
          </Link>
        </p>

        <p className="mt-2 text-[10px] sm:text-xs text-[#000000] text-center">
          © 2025 Sell Predator. All rights reserved.
        </p>
      </div>
    </>
  );
}
