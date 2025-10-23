import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";
import { getAuthInstance } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function ProfileCover() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("PK");
  const [showCompanyEdit, setShowCompanyEdit] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Country codes and prefixes
const countries = {
  PK: { code: "PK", prefix: "+92", name: "Pakistan" },
  US: { code: "US", prefix: "+1", name: "United States" },
  IN: { code: "IN", prefix: "+91", name: "India" },
  DE: { code: "DE", prefix: "+49", name: "Germany" },
  FR: { code: "FR", prefix: "+33", name: "France" },
  ES: { code: "ES", prefix: "+34", name: "Spain" },
  IT: { code: "IT", prefix: "+39", name: "Italy" },
  NL: { code: "NL", prefix: "+31", name: "Netherlands" },
};

// Auto-detect country based on phone number
const detectCountryFromPhone = (phoneNumber) => {
  const cleanPhone = phoneNumber.replace(/\s+/g, "");

  if (/^(03|92|(\+92))/.test(cleanPhone)) return "PK";
  if (/^(1|(\+1))/.test(cleanPhone) || /^[2-9]\d{2}/.test(cleanPhone)) return "US";
  if (/^(91|(\+91)|[6-9])/.test(cleanPhone)) return "IN";
  if (/^(\+49|49)/.test(cleanPhone)) return "DE";
  if (/^(\+33|33)/.test(cleanPhone)) return "FR";
  if (/^(\+34|34)/.test(cleanPhone)) return "ES";
  if (/^(\+39|39)/.test(cleanPhone)) return "IT";
  if (/^(\+31|31)/.test(cleanPhone)) return "NL";

  return selectedCountry;
};

// Format phone number based on country
const formatPhoneNumber = (phone, country) => {
  let cleanPhone = phone.replace(/[^\d]/g, "");
  const countryData = countries[country];

  if (!cleanPhone) return "";

  // Remove country code if already present
  if (country === "PK" && cleanPhone.startsWith("92")) cleanPhone = cleanPhone.substring(2);
  else if (country === "US" && cleanPhone.startsWith("1")) cleanPhone = cleanPhone.substring(1);
  else if (country === "IN" && cleanPhone.startsWith("91")) cleanPhone = cleanPhone.substring(2);
  else if (country === "DE" && cleanPhone.startsWith("49")) cleanPhone = cleanPhone.substring(2);
  else if (country === "FR" && cleanPhone.startsWith("33")) cleanPhone = cleanPhone.substring(2);
  else if (country === "ES" && cleanPhone.startsWith("34")) cleanPhone = cleanPhone.substring(2);
  else if (country === "IT" && cleanPhone.startsWith("39")) cleanPhone = cleanPhone.substring(2);
  else if (country === "NL" && cleanPhone.startsWith("31")) cleanPhone = cleanPhone.substring(2);

  // Special rule: Pakistan remove leading zero
  if (country === "PK" && cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Format based on country
  if (country === "PK") {
    // +92 3XX XXX XXXX
    return `${countryData.prefix} ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 10)}`.trim();
  } else if (country === "US") {
    // +1 (XXX) XXX XXXX
    const area = cleanPhone.substring(0, 3);
    const first = cleanPhone.substring(3, 6);
    const second = cleanPhone.substring(6, 10);
    return `${countryData.prefix} (${area}) ${first} ${second}`.trim();
  } else if (country === "IN") {
    // +91 XXXXX XXXXX
    return `${countryData.prefix} ${cleanPhone.substring(0, 5)} ${cleanPhone.substring(5, 10)}`.trim();
  } else if (country === "DE") {
    // +49 XXXX XXXXXXX
    return `${countryData.prefix} ${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 11)}`.trim();
  } else if (country === "FR") {
    // +33 X XX XX XX XX
    return `${countryData.prefix} ${cleanPhone.substring(0, 1)} ${cleanPhone.substring(1, 3)} ${cleanPhone.substring(3, 5)} ${cleanPhone.substring(5, 7)} ${cleanPhone.substring(7, 9)}`.trim();
  } else if (country === "ES") {
    // +34 XXX XXX XXX
    return `${countryData.prefix} ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 9)}`.trim();
  } else if (country === "IT") {
    // +39 XXX XXX XXXX
    return `${countryData.prefix} ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 10)}`.trim();
  } else if (country === "NL") {
    // +31 6 XXXXXXXX
    return `${countryData.prefix} ${cleanPhone.substring(0, 1)} ${cleanPhone.substring(1, 9)}`.trim();
  }

  return `${countryData.prefix} ${cleanPhone}`;
};


  const handlePhoneChange = (e) => {
    const value = e.target.value;

    // Auto-detect country from phone number
    const detectedCountry = detectCountryFromPhone(value);
    if (detectedCountry !== selectedCountry) {
      setSelectedCountry(detectedCountry);
    }

    // Format the phone number
    const formattedPhone = formatPhoneNumber(value, detectedCountry);
    setPhoneNumber(formattedPhone);
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);

    // Reformat existing phone number with new country
    if (phoneNumber) {
      const formattedPhone = formatPhoneNumber(phoneNumber, newCountry);
      setPhoneNumber(formattedPhone);
    } else {
      // Set country prefix if no phone number exists
      setPhoneNumber(countries[newCountry].prefix + " ");
    }
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    
    console.log("📱 Phone update attempt:", phoneNumber);

    if (!phoneNumber.trim()) {
      setError("Phone number cannot be empty.");
      return;
    }

    // More flexible phone number validation
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const phoneRegex = /^[\+]?[0-9][\d]{4,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid phone number (at least 5 digits).");
      return;
    }

    try {
      setError("");
      setSuccess("");

      // Try server API first
      try {
        const idToken = await user.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
        console.log("🌐 API Base URL:", API_BASE);
        console.log("🔑 Token available:", !!idToken);
        
        const response = await fetch(`${API_BASE}/api/auth/update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber.trim()
          })
        });

        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Server response:", data);
          // Update local state
          setUserData(prev => ({ ...prev, phoneNumber: phoneNumber.trim() }));
          setShowPhoneEdit(false);
          setSuccess("Phone number updated successfully!");
          showToast("Phone number updated successfully!");
          setTimeout(() => setSuccess(""), 3000);
          return;
        } else {
          const errorData = await response.json();
          console.error("❌ Server error:", errorData);
          throw new Error(errorData.error || "Server request failed");
        }
      } catch (serverError) {
        console.log('Server API not available, falling back to Firestore:', serverError);
      }

      // Fallback to direct Firestore update
      console.log('Saving phone number to Firestore:', phoneNumber.trim());
      await setDoc(doc(db, 'users', user.uid), {
        phoneNumber: phoneNumber.trim(),
        updatedAt: new Date()
      }, { merge: true });

      // Verify the save by reading back from Firestore
      const updatedDoc = await getDoc(doc(db, 'users', user.uid));
      if (updatedDoc.exists()) {
        const savedData = updatedDoc.data();
        console.log('Verified saved data:', savedData);
        setUserData(savedData);
        setPhoneNumber(savedData.phoneNumber || phoneNumber.trim());
      } else {
        // Update local state as fallback
        setUserData(prev => ({ ...prev, phoneNumber: phoneNumber.trim() }));
      }

      setShowPhoneEdit(false);
      setSuccess("Phone number updated successfully!");
      showToast("Phone number updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error updating phone number:', error);

      let errorMessage = "Failed to update phone number. Please try again.";

      if (error.code === 'permission-denied' || error.message.includes('permission')) {
        errorMessage = "Permission denied. Please contact support to update your phone number.";
      } else if (error.code === 'network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      setError(errorMessage);
      showToast(errorMessage);
    }
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    
    console.log("🏢 Company update attempt:", companyName);

    if (!companyName.trim()) {
      setError("Company name cannot be empty.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      // Try server API first
      try {
        const idToken = await user.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
        console.log("🌐 API Base URL:", API_BASE);
        console.log("🔑 Token available:", !!idToken);
        
        const response = await fetch(`${API_BASE}/api/auth/update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            companyName: companyName.trim()
          })
        });

        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Server response:", data);
          // Update local state
          setUserData(prev => ({ ...prev, companyName: companyName.trim() }));
          setShowCompanyEdit(false);
          setSuccess("Company name updated successfully!");
          showToast("Company name updated successfully!");
          setTimeout(() => setSuccess(""), 3000);
          return;
        } else {
          const errorData = await response.json();
          console.error("❌ Server error:", errorData);
          throw new Error(errorData.error || "Server request failed");
        }
      } catch (serverError) {
        console.log('Server API not available, falling back to Firestore:', serverError);
      }

      // Fallback to direct Firestore update
      console.log('Saving company name to Firestore:', companyName.trim());
      await setDoc(doc(db, 'users', user.uid), {
        companyName: companyName.trim(),
        updatedAt: new Date()
      }, { merge: true });

      // Verify the save by reading back from Firestore
      const updatedDoc = await getDoc(doc(db, 'users', user.uid));
      if (updatedDoc.exists()) {
        const savedData = updatedDoc.data();
        console.log('Verified saved data:', savedData);
        setUserData(savedData);
        setCompanyName(savedData.companyName || companyName.trim());
      } else {
        // Update local state as fallback
        setUserData(prev => ({ ...prev, companyName: companyName.trim() }));
      }

      setShowCompanyEdit(false);
      setSuccess("Company name updated successfully!");
      showToast("Company name updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error updating company name:', error);

      let errorMessage = "Failed to update company name. Please try again.";

      if (error.code === 'permission-denied' || error.message.includes('permission')) {
        errorMessage = "Permission denied. Please contact support to update your company name.";
      } else if (error.code === 'network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      setError(errorMessage);
      showToast(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      navigate("/signUp");
    } catch (error) {
      setError("Logout failed. Please try again.");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      setSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordChange(false);
      showToast("Password changed successfully!");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        setError("New password is too weak.");
      } else {
        setError(error.message || "Failed to change password. Please try again.");
      }
    }
  };

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // ✅ Firestore ka phoneNumber state me set karo
            if (data.phoneNumber) {
              setPhoneNumber(data.phoneNumber);
            }
            
            // ✅ Firestore ka companyName state me set karo
            if (data.companyName) {
              setCompanyName(data.companyName);
            }
          } else {
            // Agar Firestore me user document nahi hai to create kar do
            const newUserDoc = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              phoneNumber: '', // pehle empty rakho
              createdAt: new Date(),
              emailVerified: user.emailVerified,
            };
            await setDoc(doc(db, 'users', user.uid), newUserDoc, { merge: true });
            setUserData(newUserDoc);
            setPhoneNumber('');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        navigate("/signUp");
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto"></div>
          <p className="mt-4 text-[#f5f5f5]" style={openSansStyle}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-[#000000] py-4 sm:py-8 px-4" style={openSansStyle}>
        <div className="max-w-6xl mx-auto">
          {/* Header with professional gradient background */}
          <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-[#f5f5f5] border border-[#333333]">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FFD700] rounded-full flex items-center justify-center text-[#000000] font-bold text-2xl sm:text-3xl mr-4" style={orbitronStyle}>
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-[#f5f5f5]" style={orbitronStyle}>
                    Profile Settings
                  </h1>
                  <p className="text-[#cccccc] text-sm sm:text-base" style={openSansStyle}>Manage your account and preferences</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#cccccc] text-xs sm:text-sm" style={openSansStyle}>Account Status</p>
                <div className="flex items-center justify-end">
                  <div className={`w-2 h-2 rounded-full mr-2 ${user.emailVerified ? 'bg-[#FFD700]' : 'bg-[#D72638]'}`}></div>
                  <span className="text-sm font-semibold text-[#f5f5f5]" style={openSansStyle}>
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-[#FFD700] p-4 sm:p-6 border border-[#333333]">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFD700] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={orbitronStyle}>Email</h3>
              </div>
              <p className="text-[#cccccc] text-xs sm:text-sm mb-1" style={openSansStyle}>Primary Email</p>
              <p className="text-sm sm:text-lg font-semibold text-[#f5f5f5] break-all" style={openSansStyle}>{user.email}</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-[#FFD700] p-4 sm:p-6 border border-[#333333]">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFD700] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={orbitronStyle}>Name</h3>
              </div>
              <p className="text-[#cccccc] text-xs sm:text-sm mb-1" style={openSansStyle}>Display Name</p>
              <p className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={openSansStyle}>
                {user.displayName || user.email?.split('@')[0] || "Not provided"}
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-[#FFD700] p-4 sm:p-6 border border-[#333333]">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFD700] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={orbitronStyle}>Phone</h3>
                </div>
                <button
                  onClick={() => setShowPhoneEdit(!showPhoneEdit)}
                  className="text-[#FFD700] hover:text-[#FFD700] text-sm font-medium cursor-pointer" style={openSansStyle}
                >
                  {showPhoneEdit ? "Cancel" : "Edit"}
                </button>
              </div>
              <p className="text-[#cccccc] text-xs sm:text-sm mb-1" style={openSansStyle}>Contact</p>

              {showPhoneEdit ? (
                <form onSubmit={handlePhoneUpdate} className="space-y-3">
                  <div className="flex items-center">
                    <select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      className="w-20 border-2 border-[#333333] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-sm bg-[#2a2a2a] text-[#f5f5f5]"
                    >
                      {Object.keys(countries).map((country) => (
                        <option key={country} value={country}>{countries[country].name}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="w-full border-2 border-[#333333] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-sm bg-[#2a2a2a] text-[#f5f5f5]"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-[#FFD700] text-[#000000] px-4 py-2 rounded-lg hover:bg-[#FFD700] transition-colors text-sm cursor-pointer font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhoneEdit(false)}
                      className="bg-[#333333] text-[#f5f5f5] px-4 py-2 rounded-lg hover:bg-[#444444] transition-colors text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={openSansStyle}>
                  {userData?.phoneNumber || "Add phone number"}
                </p>
              )}
            </div>

            <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-[#FFD700] p-4 sm:p-6 border border-[#333333]">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFD700] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={orbitronStyle}>Company</h3>
                </div>
                <button
                  onClick={() => setShowCompanyEdit(!showCompanyEdit)}
                  className="text-[#FFD700] hover:text-[#FFD700] text-sm font-medium cursor-pointer" style={openSansStyle}
                >
                  {showCompanyEdit ? "Cancel" : "Edit"}
                </button>
              </div>
              <p className="text-[#cccccc] text-xs sm:text-sm mb-1" style={openSansStyle}>Organization</p>

              {showCompanyEdit ? (
                <form onSubmit={handleCompanyUpdate} className="space-y-3">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border-2 border-[#333333] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-sm bg-[#2a2a2a] text-[#f5f5f5]"
                    placeholder="Enter company name"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-[#FFD700] text-[#000000] px-4 py-2 rounded-lg hover:bg-[#FFD700] transition-colors text-sm cursor-pointer font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompanyEdit(false)}
                      className="bg-[#333333] text-[#f5f5f5] px-4 py-2 rounded-lg hover:bg-[#444444] transition-colors text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm sm:text-lg font-semibold text-[#f5f5f5]" style={openSansStyle}>
                  {userData?.companyName || "Add company name"}
                </p>
              )}
            </div>

          </div>

          {/* Password Change Section */}
          <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-[#333333]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFD700] rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-[#f5f5f5]" style={orbitronStyle}>
                    Security Settings
                  </h2>
                  <p className="text-[#cccccc] text-sm sm:text-base" style={openSansStyle}>Update your password to keep your account secure</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="bg-[#FFD700] text-[#000000] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-[#FFD700] transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm sm:text-base cursor-pointer"
              >
                {showPasswordChange ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordChange && (
              <div className="bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#333333]">
                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#f5f5f5] mb-2" style={openSansStyle}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full border-2 border-[#333333] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-sm sm:text-base cursor-text bg-[#2a2a2a] text-[#f5f5f5]"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#f5f5f5] mb-2" style={openSansStyle}>
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full border-2 border-[#333333] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-sm sm:text-base cursor-text bg-[#2a2a2a] text-[#f5f5f5]"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-semibold text-[#f5f5f5] mb-2" style={openSansStyle}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full border-2 border-[#333333] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-sm sm:text-base cursor-text bg-[#2a2a2a] text-[#f5f5f5]"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-[#2a2a2a] border border-[#D72638] rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#D72638] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[#D72638] font-medium text-sm sm:text-base" style={openSansStyle}>{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-[#2a2a2a] border border-[#FFD700] rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[#FFD700] font-medium text-sm sm:text-base" style={openSansStyle}>{success}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#FFD700] text-[#000000] py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-[#FFD700] transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              onClick={() => navigate("/predatordashboard")}
              className="flex-1 bg-[#FFD700] text-[#000000] py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-[#FFD700] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-[#D72638] text-[#f5f5f5] py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-[#D72638] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </div>
            </button>
          </div>
        </div>
      </div>
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-[#1a1a1a] border border-[#FFD700] rounded-lg p-3 shadow-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#FFD700] font-medium text-sm" style={openSansStyle}>{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
