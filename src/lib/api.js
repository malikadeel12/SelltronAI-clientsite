/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Centralizes client API calls for the Voice pipeline (dummy backend).
 * - Added email verification API functions for signup flow.
 * - Why: Keep UI clean and allow easy replacement with real providers later.
 * - Related: `server/src/routes/voice.js` endpoints and `server/src/routes/auth.js` for email verification.
 */

// Detect if we're on mobile and adjust API base accordingly
const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) return envBase;
  
  // Check if we're on mobile or if localhost won't work
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isMobile && isLocalhost) {
    // For mobile devices, try to use the current host with port 8000
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  
  return "http://localhost:8000";
};

const API_BASE = getApiBase();

// --- Helper: JSON POST with retry logic ---
async function postJson(path, body, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body || {}),
        // Add timeout for mobile devices
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
      
      return res.json();
    } catch (error) {
      console.error(`API call failed (attempt ${i + 1}):`, error);
      
      if (i === retries) {
        // Last attempt failed, throw a more helpful error
        if (error.name === 'AbortError') {
          throw new Error("Request timed out. Please check your internet connection.");
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error("Cannot connect to server. Please check your internet connection and try again.");
        } else {
          throw error;
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// --- Helper: multipart POST with retry logic ---
async function postForm(path, formData, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        body: formData,
        // Add timeout for mobile devices
        signal: AbortSignal.timeout(15000) // 15 second timeout for file uploads
      });
      
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
      
      return res.json();
    } catch (error) {
      console.error(`Form upload failed (attempt ${i + 1}):`, error);
      
      if (i === retries) {
        if (error.name === 'AbortError') {
          throw new Error("Upload timed out. Please check your internet connection.");
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error("Cannot connect to server. Please check your internet connection and try again.");
        } else {
          throw error;
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function fetchVoiceConfig() {
  const res = await fetch(`${API_BASE}/api/voice/config`);
  if (!res.ok) throw new Error("Failed to fetch voice config");
  return res.json();
}

export async function runVoicePipeline({ audioBlob, mode, voice, language }) {
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (mode) form.append("mode", mode);
  if (voice) form.append("voice", mode);
  if (language) form.append("language", language);
  return postForm(`/api/voice/pipeline`, form);
}

export async function runStt({ audioBlob, language }) {
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (language) form.append("language", language);
  return postForm(`/api/voice/stt`, form);
}

export async function runGpt({ transcript, mode }) {
  return postJson(`/api/voice/gpt`, { transcript, mode });
}

export async function runTts({ text, voice }) {
  return postJson(`/api/voice/tts`, { text, voice });
}

// --- Email Verification APIs ---
export async function sendVerificationCode(email) {
  return postJson(`/api/auth/send-verification`, { email });
}

export async function verifyEmailCode(email, code) {
  return postJson(`/api/auth/verify-email`, { email, code });
}

// --- Debug function to test API connection ---
export async function testApiConnection() {
  try {
    console.log('Testing API connection to:', API_BASE);
    const res = await fetch(`${API_BASE}/api/voice/config`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (res.ok) {
      console.log('API connection successful');
      return true;
    } else {
      console.error('API connection failed:', res.status, res.statusText);
      return false;
    }
  } catch (error) {
    console.error('API connection error:', error);
    return false;
  }
}


