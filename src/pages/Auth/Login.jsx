import React, { useState } from "react";
import logo from "../../assets/mainlogo/logoicon.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, getIdToken, GoogleAuthProvider, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInWithPopup, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { getAuthInstance } from "../../lib/firebase";

/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Created Login page with email and password fields.
 * - Mirrors the style of the existing signup page for UX consistency.
 * - Uses localStorage for demo auth parity until backend is wired.
 * - Added toast notifications for better user feedback during login process.
 * Why: Project requires a dedicated login screen with basic validation and user feedback.
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
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Check for message from navigation state
  React.useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  // Handle redirect result if popup is blocked
  React.useEffect(() => {
    (async () => {
      try {
        const auth = getAuthInstance();
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const token = await getIdToken(result.user, true);
          const apiBase = import.meta.env.VITE_API_BASE_URL || 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? "http://localhost:7000" 
            : "";
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
    
    // Password length validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      showToast("Password too short");
      return;
    }
    
    try {
      showToast("Logging in...");
      
      // --- Firebase email/password sign-in ---
      const cred = await signInWithEmailAndPassword(
        getAuthInstance(),
        formData.email,
        formData.password
      );

      // Check if email is verified
      if (!cred.user.emailVerified) {
        setError("Please verify your email before logging in. Your email verification is pending.");
        showToast("Email verification required");
        // Don't redirect, just show error message
        return;
      }

      showToast("Checking user role...");

      // Optimized: Get token and role in parallel
      const [token, roleResponse] = await Promise.allSettled([
        getIdToken(cred.user, true),
        fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"}/api/auth/whoami`, {
          headers: { Authorization: `Bearer ${await getIdToken(cred.user, true)}` },
        })
      ]);

      let who = { role: "user" };
      if (roleResponse.status === 'fulfilled' && roleResponse.value.ok) {
        who = await roleResponse.value.json();
      }

      // Sync user to HubSpot on login (non-blocking)
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
        const hubspotResponse = await fetch(`${apiBase}/api/auth/sync-to-hubspot`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.value || token}`
          }
        });
        
        if (hubspotResponse.ok) {
          const hubspotData = await hubspotResponse.json();
        } else if (hubspotResponse.status === 404) {
        } else {
        }
      } catch (hubspotError) {
        if (hubspotError.message.includes('404') || hubspotError.message.includes('Not Found')) {
        } else {
        }
        // Don't fail login if HubSpot sync fails
      }

      setError("");
      showToast("Login successful! Redirecting to dashboard...");
      
      // Optimized: Reduced redirect delay for faster UX
      setTimeout(() => {
        if (who.role === "admin") {
          navigate("/AdminDashboard");
        } else {
          navigate("/predatordashboard");
        }
      }, 300); // Reduced from 1000ms to 300ms
    } catch (e) {
      
      // Handle specific Firebase auth errors with user-friendly messages
      let errorMessage = "Login failed. Please try again.";
      let toastMessage = "Login failed";
      
      if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password" || e.code === "auth/user-not-found") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
        toastMessage = "Invalid email or password";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
        toastMessage = "Invalid email format";
      } else if (e.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact support.";
        toastMessage = "Account disabled";
      } else if (e.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
        toastMessage = "Too many attempts, please wait";
      } else if (e.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
        toastMessage = "Network error";
      } else if (e.message) {
        errorMessage = e.message;
        toastMessage = "Login failed";
      }
      
      setError(errorMessage);
      showToast(toastMessage);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address.");
      showToast("Email required for password reset");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordMessage("Please enter a valid email address.");
      showToast("Invalid email format");
      return;
    }

    try {
      setForgotPasswordMessage("Sending reset email...");
      showToast("Sending password reset email...");
      
      // Configure email action code settings to improve deliverability
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(getAuthInstance(), forgotPasswordEmail, actionCodeSettings);
      setForgotPasswordMessage("✅ Password reset email sent successfully! Please check your inbox and spam/junk folder. If you don't see it, please add noreply@firebaseapp.com to your contacts and check again. The email may take 2-5 minutes to arrive.");
      setForgotPasswordEmail("");
      showToast("Password reset email sent!");
    } catch (error) {
      
      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        setForgotPasswordMessage("❌ No account found with this email address. Please check your email or sign up for a new account.");
        showToast("No account found with this email");
      } else if (error.code === "auth/invalid-email") {
        setForgotPasswordMessage("❌ Please enter a valid email address.");
        showToast("Invalid email address");
      } else if (error.code === "auth/too-many-requests") {
        setForgotPasswordMessage("❌ Too many requests. Please wait a few minutes before trying again.");
        showToast("Too many requests, please wait");
      } else if (error.code === "auth/network-request-failed") {
        setForgotPasswordMessage("❌ Network error. Please check your internet connection and try again.");
        showToast("Network error");
      } else {
        setForgotPasswordMessage(`❌ Failed to send reset email: ${error.message || "Please try again."}`);
        showToast("Failed to send reset email");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      showToast("Signing in with Google...");
      
      const auth = getAuthInstance();
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // Try popup first; fallback to redirect if blocked
      try {
        const cred = await signInWithPopup(auth, provider);
        
        showToast("Google sign-in successful! Checking role...");
        
        // Optimized: Parallel operations for faster setup
        const [token, roleResponse] = await Promise.allSettled([
          getIdToken(cred.user, true),
          fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"}/api/auth/whoami`, {
            headers: { Authorization: `Bearer ${await getIdToken(cred.user, true)}` },
          })
        ]);
        
        // Update display name if not set (non-blocking)
        if (cred.user && !cred.user.displayName) {
          updateProfile(cred.user, {
            displayName: cred.user.email?.split('@')[0] || 'User'
          });
        }
        
        let who = { role: "user" };
        if (roleResponse.status === 'fulfilled' && roleResponse.value.ok) {
          who = await roleResponse.value.json();
        }

        // Sync Google user to HubSpot on login (non-blocking)
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
          const hubspotResponse = await fetch(`${apiBase}/api/auth/sync-to-hubspot`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token.value || token}`
            }
          });
          
          if (hubspotResponse.ok) {
            const hubspotData = await hubspotResponse.json();
          } else if (hubspotResponse.status === 404) {
          } else {
          }
        } catch (hubspotError) {
          if (hubspotError.message.includes('404') || hubspotError.message.includes('Not Found')) {
          } else {
          }
          // Don't fail Google login if HubSpot sync fails
        }
        
        showToast("Redirecting to dashboard...");
        // Optimized: Reduced redirect delay
        setTimeout(() => {
          if (who.role === "admin") navigate("/AdminDashboard"); else navigate("/predatordashboard");
        }, 300); // Reduced from 1000ms to 300ms
      } catch (popupErr) {
        await signInWithRedirect(auth, provider);
      }
    } catch (e) {
      const errorMessage = e?.message || "Google sign-in failed. Please try again.";
      setError(errorMessage);
      showToast("Google sign-in failed");
    }
  };

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
          Login to Sell Predator
        </h1>
        <p className="text-[#000000] mb-3 text-center text-xs sm:text-sm max-w-md">
          Enter your credentials to access your dashboard.
        </p>

        <div className="bg-[#f5f5f5] shadow-md rounded-lg p-4 sm:p-5 w-full max-w-md">
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
            <button
              type="button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              className="text-xs text-purple-600 hover:underline mt-1 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-[#D72638] text-xs mt-2">{error}</p>}

          {/* Forgot Password Section */}
          {showForgotPassword && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-[#000000]">Reset Password</h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">Enter your email address and we'll send you a link to reset your password.</p>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleForgotPassword}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Send Reset Email
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordMessage("");
                    setForgotPasswordEmail("");
                  }}
                  className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-600 transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              {forgotPasswordMessage && (
                <div className={`mt-3 p-3 rounded-lg text-xs ${
                  forgotPasswordMessage.includes('✅') 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : forgotPasswordMessage.includes('❌')
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-2">
                      {forgotPasswordMessage.includes('✅') ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : forgotPasswordMessage.includes('❌') ? (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <p className="font-medium">{forgotPasswordMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#FFD700] text-[#000000] font-medium py-2 rounded-full text-sm hover:bg-[#FFD700] transition mt-3 cursor-pointer"
          >
            Login
          </button>

          {/* --- Or divider --- */}
          <div className="flex items-center my-2">
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

          <p className="text-xs text-[#000000] mt-2 text-center">
            Don&apos;t have an account? {" "}
            <Link to="/signUp" className="text-purple-600 underline">
              Sign Up
            </Link>
          </p>
        </div>

        <p className="mt-2 text-[10px] sm:text-xs text-[#000000] text-center">
          2025 Sell Predator. All rights reserved.
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
