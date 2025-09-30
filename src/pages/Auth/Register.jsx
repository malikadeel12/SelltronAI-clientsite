import React, { useState } from "react";
import logo from "../../assets/mainlogo/logoicon.png";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getIdToken, GoogleAuthProvider, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInWithPopup, updateProfile } from "firebase/auth";
import { getAuthInstance } from "../../lib/firebase";
import { checkEmailExists, sendVerificationCode, verifyEmailCode, setEmailVerified } from "../../lib/api";
import Timer from "../../components/Timer";

/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Implemented email verification flow with 60-second timer.
 * - Added verification code input step before account creation.
 * - Maintains existing Firebase auth and role-based routing.
 * - Added toast notifications for better user feedback during signup process.
 * Why: Enhanced security with email verification during signup and improved UX.
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
  const [selectedCountry, setSelectedCountry] = useState("PK");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Country codes and prefixes
  const countries = {
    PK: { code: "PK", prefix: "+92", flag: "🇵🇰", name: "Pakistan" },
    US: { code: "US", prefix: "+1", flag: "🇺🇸", name: "United States" },
    IN: { code: "IN", prefix: "+91", flag: "🇮🇳", name: "India" },
    DE: { code: "DE", prefix: "+49", flag: "🇩🇪", name: "Germany" },
    FR: { code: "FR", prefix: "+33", flag: "🇫🇷", name: "France" },
    ES: { code: "ES", prefix: "+34", flag: "🇪🇸", name: "Spain" },
    IT: { code: "IT", prefix: "+39", flag: "🇮🇹", name: "Italy" },
    NL: { code: "NL", prefix: "+31", flag: "🇳🇱", name: "Netherlands" },
    // Add more EU countries as needed
  };
  // Auto-detect country based on phone number
  const detectCountryFromPhone = (phoneNumber, selectedCountry = "US") => {
    const cleanPhone = phoneNumber.replace(/\s+/g, "");

    // Pakistan: 03xx, 92xxx, +92xxx
    if (/^(03|92|\+92)/.test(cleanPhone)) return "PK";

    // US: 1xxx, +1xxx or area codes 2xx-9xx
    if (/^(1|\+1)/.test(cleanPhone) || /^[2-9]\d{2}/.test(cleanPhone)) return "US";

    // India: 91xxx, +91xxx, starts with 6-9
    if (/^(91|\+91|[6-9])/.test(cleanPhone)) return "IN";

    // Germany: +49 or starts with 49
    if (/^(\+49|49)/.test(cleanPhone)) return "DE";

    // France: +33 or starts with 33
    if (/^(\+33|33)/.test(cleanPhone)) return "FR";

    // Spain: +34 or starts with 34
    if (/^(\+34|34)/.test(cleanPhone)) return "ES";

    // Italy: +39 or starts with 39
    if (/^(\+39|39)/.test(cleanPhone)) return "IT";

    // Netherlands: +31 or starts with 31
    if (/^(\+31|31)/.test(cleanPhone)) return "NL";

    return selectedCountry; // Keep current if no match
  };
  // Format phone number based on country
  const formatPhoneNumber = (phone, country) => {
    let cleanPhone = phone.replace(/[^\d]/g, "");
    const countryData = countries[country];
    if (!cleanPhone) return "";

    // Remove country codes if already included
    if (country === "PK" && cleanPhone.startsWith("92")) cleanPhone = cleanPhone.substring(2);
    if (country === "US" && cleanPhone.startsWith("1")) cleanPhone = cleanPhone.substring(1);
    if (country === "IN" && cleanPhone.startsWith("91")) cleanPhone = cleanPhone.substring(2);
    if (country === "DE" && cleanPhone.startsWith("49")) cleanPhone = cleanPhone.substring(2);
    if (country === "FR" && cleanPhone.startsWith("33")) cleanPhone = cleanPhone.substring(2);
    if (country === "ES" && cleanPhone.startsWith("34")) cleanPhone = cleanPhone.substring(2);
    if (country === "IT" && cleanPhone.startsWith("39")) cleanPhone = cleanPhone.substring(2);
    if (country === "NL" && cleanPhone.startsWith("31")) cleanPhone = cleanPhone.substring(2);

    // Special handling per country
    if (country === "PK") {
      if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
      return `${countryData.prefix} ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 10)}`.trim();
    }

    if (country === "US" && cleanPhone.length <= 10) {
      const area = cleanPhone.substring(0, 3);
      const first = cleanPhone.substring(3, 6);
      const second = cleanPhone.substring(6, 10);
      return `${countryData.prefix} (${area}) ${first}-${second}`.trim();
    }

    if (country === "IN" && cleanPhone.length <= 10) {
      return `${countryData.prefix} ${cleanPhone.substring(0, 5)} ${cleanPhone.substring(5, 10)}`.trim();
    }

    if (country === "DE") {
      // Germany numbers vary, but format as +49 XXXX XXXXXX
      return `${countryData.prefix} ${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4)}`.trim();
    }

    if (country === "FR" && cleanPhone.length === 9) {
      // French numbers: +33 X XX XX XX XX
      return `${countryData.prefix} ${cleanPhone[0]} ${cleanPhone.substring(1, 3)} ${cleanPhone.substring(3, 5)} ${cleanPhone.substring(5, 7)} ${cleanPhone.substring(7)}`;
    }

    if (country === "ES") {
      // Spain: +34 XXX XXX XXX
      return `${countryData.prefix} ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 9)}`;
    }

    if (country === "IT") {
      // Italy: +39 XXX XXX XXXX
      return `${countryData.prefix} ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    }

    if (country === "NL") {
      // Netherlands: +31 XX XXX XXXX
      return `${countryData.prefix} ${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
    }

    return `${countryData.prefix} ${cleanPhone}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone") {
      // Auto-detect country from phone number
      const detectedCountry = detectCountryFromPhone(value);
      if (detectedCountry !== selectedCountry) {
        setSelectedCountry(detectedCountry);
      }

      // Format the phone number
      const formattedPhone = formatPhoneNumber(value, detectedCountry);
      setFormData({
        ...formData,
        [name]: formattedPhone,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);

    // Reformat existing phone number with new country
    if (formData.phone) {
      const formattedPhone = formatPhoneNumber(formData.phone, newCountry);
      setFormData({
        ...formData,
        phone: formattedPhone,
      });
    } else {
      // Set country prefix if no phone number exists
      setFormData({
        ...formData,
        phone: countries[newCountry].prefix + " ",
      });
    }
  };

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
          } catch (_) { }
          if (who.role === "admin") navigate("/AdminDashboard"); else navigate("/predatordashboard");
        }
      } catch (_) {
        // ignore; no redirect result
      }
    })();
  }, [navigate]);

  const handleSendVerification = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Name, Email, Password and Confirm Password are required!");
      showToast("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address!");
      showToast("Invalid email format");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      showToast("Password too short (minimum 6 characters)");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      showToast("Passwords do not match");
      return;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms of Service.");
      showToast("Please agree to Terms of Service");
      return;
    }

    setLoading(true);
    setError("");
    showToast("Sending verification code...");

    try {
      // Optimized: Single API call that handles both email check and verification sending
      console.log("📧 Sending verification code...");
      const result = await sendVerificationCode(formData.email);
      console.log("✅ Verification code sent successfully");
      setStep("verification");
      setTimerExpired(false);
      
      // Check if fallback code is provided (for development)
      if (result.fallbackCode) {
        console.log(`🔑 Fallback code: ${result.fallbackCode}`);
        showToast(`Verification code: ${result.fallbackCode} (Check console if email fails)`);
      } else {
        showToast("Verification code sent to your email!");
        // For development: Also log to console
        console.log(`📧 Email sent to: ${formData.email}`);
        console.log(`🔑 If email doesn't arrive, check server console for the verification code`);
      }
    } catch (e) {
      console.error("❌ Signup error:", e);

      // Handle specific error cases with user-friendly messages
      let errorMessage = "Failed to send verification code. Please try again.";
      let toastMessage = "Failed to send verification code";

      // Check if it's an email already exists error
      if (e?.message && (e.message.includes("Email already in use") || e.message.includes("already exists") || e.message.includes("Email already used"))) {
        errorMessage = "This email is already registered. Please use a different email or try logging in.";
        toastMessage = "Email already exists";
      } else if (e?.message && e.message.includes("Request failed: 400")) {
        errorMessage = "This email is already registered. Please use a different email or try logging in.";
        toastMessage = "Email already exists";
      } else if (e?.message && e.message.includes("invalid email")) {
        errorMessage = "Please enter a valid email address.";
        toastMessage = "Invalid email format";
      } else if (e?.message && e.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
        toastMessage = "Network error";
      } else if (e?.message) {
        errorMessage = e.message;
        toastMessage = "Signup failed";
      }

      setError(errorMessage);
      showToast(toastMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      showToast("Please enter verification code");
      return;
    }

    setLoading(true);
    setError("");
    showToast("Verifying code...");

    try {
      console.log("🔍 Starting OTP verification...");
      await verifyEmailCode(formData.email, verificationCode);
      console.log("✅ OTP verified successfully");

      showToast("Code verified! Creating account...");

      // Optimized: Parallel operations for faster account creation
      const [cred, adminRolePromise] = await Promise.allSettled([
        createUserWithEmailAndPassword(getAuthInstance(), formData.email, formData.password),
        formData.email === "admin@gmail.com" ? 
          fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/assign-role`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: "temp", role: "admin" }),
          }) : Promise.resolve()
      ]);

      if (cred.status === 'rejected') throw cred.reason;
      const userCred = cred.value;
      console.log("✅ Firebase account created:", userCred.user.uid);

      // Update admin role if needed (after getting actual UID)
      if (formData.email === "admin@gmail.com") {
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/assign-role`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: userCred.user.uid, role: "admin" }),
          });
        } catch (e) {
          console.warn("Failed to assign admin role:", e);
        }
      }

      showToast("Setting up your profile...");

      // Optimized: Parallel profile and email verification setup
      const [profileUpdate, emailVerifiedUpdate] = await Promise.allSettled([
        formData.name ? updateProfile(userCred.user, { displayName: formData.name }) : Promise.resolve(),
        setEmailVerified(userCred.user.uid)
      ]);

      // Get token and determine role (optimized with single request)
      const token = await getIdToken(userCred.user, true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      let who = { role: "user" };
      try {
        const res = await fetch(`${apiBase}/api/auth/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) who = await res.json();
      } catch (_) {
        who = { role: "user" };
      }

      // Show success message
      console.log("🎉 All steps completed successfully!");
      setSuccess(true);
      setLoading(false);
      if (who.role === "admin") {
        showToast("Account created successfully! Redirecting to Admin Dashboard...");
      } else {
        showToast("Account created successfully! Redirecting to Predator Dashboard...");
      }

      // Optimized: Reduced redirect delay for faster UX
      setTimeout(() => {
        console.log("🚀 Redirecting to dashboard...");
        if (who.role === "admin") {
          navigate("/AdminDashboard");
        } else {
          navigate("/predatordashboard");
        }
      }, 500); // Reduced from 2000ms to 500ms
    } catch (e) {
      console.error("Verification error:", e);
      setError(e?.message || "Verification failed. Please try again.");
      showToast("Verification failed");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    showToast("Resending verification code...");
    try {
      await sendVerificationCode(formData.email);
      setTimerExpired(false);
      showToast("New verification code sent!");
    } catch (e) {
      setError(e?.message || "Failed to resend code. Please try again.");
      showToast("Failed to resend code");
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
    setSuccess(false);
  };

  // Google Sign-Up/Login (same flow) - Optimized
  const handleGoogleSignIn = async () => {
    try {
      showToast("Signing up with Google...");

      const auth = getAuthInstance();
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        const cred = await signInWithPopup(auth, provider);

        showToast("Google signup successful! Setting up account...");

        // Optimized: Parallel operations for faster setup
        const [token, adminRolePromise] = await Promise.allSettled([
          getIdToken(cred.user, true),
          cred.user?.email === "admin@gmail.com" ? 
            fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/assign-role`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid: cred.user.uid, role: "admin" }),
            }) : Promise.resolve()
        ]);

        // Update display name if not set (non-blocking)
        if (cred.user && !cred.user.displayName) {
          updateProfile(cred.user, {
            displayName: cred.user.email?.split('@')[0] || 'User'
          }).catch(e => console.warn("Failed to update display name:", e));
        }

        // Get user role
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        let who = { role: "user" };
        try {
          const res = await fetch(`${apiBase}/api/auth/whoami`, {
            headers: { Authorization: `Bearer ${token.value || token}` },
          });
          if (res.ok) who = await res.json();
        } catch (_) { }

        showToast("Redirecting to dashboard...");
        // Optimized: Reduced redirect delay
        setTimeout(() => {
          if (who.role === "admin") navigate("/AdminDashboard"); else navigate("/predatordashboard");
        }, 300); // Reduced from 1000ms to 300ms
      } catch (popupErr) {
        await signInWithRedirect(auth, provider);
      }
    } catch (e) {
      setError(e?.message || "Google sign-in failed. Please try again.");
      showToast("Google signup failed");
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
              {/* Development: Show code in console */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Check browser console and server logs for the verification code
                </p>
              )}
            </div>

            {error && <p className="text-[#D72638] text-xs mt-2 mb-3">{error}</p>}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">✅ Account created successfully! Redirecting to dashboard...</p>
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={loading || timerExpired || success}
              className="w-full bg-[#FFD700] text-[#000000] font-medium py-2 rounded-full text-sm hover:bg-[#FFD700] transition mt-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : success ? "✅ Success!" : "Verify & Create Account"}
            </button>

            <button
              onClick={handleBackToSignup}
              className="w-full border border-gray-300 text-[#000000] bg-white py-2 rounded-full text-sm hover:bg-gray-50 transition mt-2 cursor-pointer"
            >
              Back to Sign Up
            </button>
          </div>

          <p className="mt-2 text-[10px] sm:text-xs text-[#000000] text-center">
            &copy; 2025 Sell Predator. All rights reserved.
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
                value={selectedCountry}
                onChange={handleCountryChange}
                className="border rounded-t-md sm:rounded-l-md sm:rounded-tr-none px-2 py-2 text-xs sm:text-sm text-[#000000]"
              >
                <option value="PK">Pakistan (+92)</option>
                <option value="US">United States (+1)</option>
                <option value="IN">India (+91)</option>
                <option value="DE">Germany (+49)</option>
                <option value="FR">France (+33)</option>
                <option value="ES">Spain (+34)</option>
                <option value="IT">Italy (+39)</option>
                <option value="NL">Netherlands (+31)</option>

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
              className="mr-2 mt-0.5 sm:mt-0 cursor-pointer"
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
          &copy; 2025 Sell Predator. All rights reserved.
        </p>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-[#000000] text-[#f5f5f5] px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50">
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s forwards;
        }
      `}</style>
    </>
  );
}
