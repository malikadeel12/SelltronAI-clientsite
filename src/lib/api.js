// Use environment variable for API base URL with fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL;
//const API_BASE ="http://localhost:7000";
// Debug logging for deployment issues
console.log('🔧 API Configuration:', {
  hostname: window.location.hostname,
  envUrl: import.meta.env.VITE_API_BASE_URL,
  finalApiBase: API_BASE,
  isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
});

// Optimized: Request cache to reduce redundant API calls
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

function getCacheKey(method, path, body) {
  return `${method}:${path}:${JSON.stringify(body || {})}`;
}

function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

// --- Helper: JSON POST with caching ---
async function postJson(path, body) {
  const cacheKey = getCacheKey('POST', path, body);
  const cached = requestCache.get(cacheKey);
  
  // Return cached result if valid
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`🚀 Cache hit for ${path}`);
    return cached.data;
  }

  const fullUrl = `${API_BASE}${path}`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    console.error(`📡 Request URL: ${fullUrl}`);
    console.error(`📦 Request body:`, body);
    
    // Try to get error message from response
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || `Request failed: ${res.status}`);
    } catch (parseError) {
      throw new Error(`Request failed: ${res.status} - ${res.statusText}`);
    }
  }
  
  const data = await res.json();
  
  // Cache successful responses
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}

// --- Helper: multipart POST ---
async function postForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchVoiceConfig() {
  const res = await fetch(`${API_BASE}/api/voice/config`);
  if (!res.ok) throw new Error("Failed to fetch voice config");
  return res.json();
}

export async function runVoicePipeline({ audioBlob, mode, voice, language, encoding, hints, boost, sttModel }) {
  console.log("🌐 API: Starting voice pipeline call...");
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (mode) form.append("mode", mode);
  if (voice) form.append("voice", voice);
  if (language) form.append("language", language);
  if (encoding) form.append("encoding", encoding);
  if (typeof hints !== 'undefined') {
    if (Array.isArray(hints)) form.append("hints", JSON.stringify(hints));
    else form.append("hints", String(hints));
  }
  if (typeof boost !== 'undefined') form.append("boost", String(boost));
  if (typeof sttModel !== 'undefined') form.append("sttModel", sttModel);
  
  console.log("🌐 API: Sending request to /api/voice/pipeline with:", {
    audioSize: audioBlob?.size,
    mode,
    voice,
    language
  });
  
  const result = await postForm(`/api/voice/pipeline`, form);
  console.log("🌐 API: Voice pipeline response received:", result);
  return result;
}

export async function runStt({ audioBlob, language, encoding, hints, boost, sttModel }) {
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (language) form.append("language", language);
  if (encoding) form.append("encoding", encoding);
  if (typeof hints !== 'undefined') {
    if (Array.isArray(hints)) form.append("hints", JSON.stringify(hints));
    else form.append("hints", String(hints));
  }
  if (typeof boost !== 'undefined') form.append("boost", String(boost));
  if (typeof sttModel !== 'undefined') form.append("sttModel", sttModel);
  return postForm(`/api/voice/stt`, form);
}

export async function runGpt({ transcript, mode }) {
  return postJson(`/api/voice/gpt`, { transcript, mode });
}

export async function runTts({ text, voice }) {
  return postJson(`/api/voice/tts`, { text, voice });
}

// --- Email Verification APIs (No caching for auth operations) ---
export async function checkEmailExists(email) {
  const fullUrl = `${API_BASE}/api/auth/check-email`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function sendVerificationCode(email) {
  const fullUrl = `${API_BASE}/api/auth/send-verification`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  console.log(`📧 Email being sent: ${email}`);
  console.log(`🔧 API_BASE: ${API_BASE}`);
  
  try {
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    console.log(`📡 Response status: ${res.status} ${res.statusText}`);
    console.log(`📡 Response headers:`, Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
      console.error(`📡 Request URL: ${fullUrl}`);
      let errorData;
      try {
        errorData = await res.json();
        console.error(`📦 Error response:`, errorData);
      } catch (parseError) {
        console.error(`📦 Could not parse error response:`, parseError);
        errorData = { error: `Request failed: ${res.status}` };
      }
      throw new Error(errorData.error || `Request failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log(`✅ API response successful:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API call failed:`, error);
    throw error;
  }
}

export async function verifyEmailCode(email, code) {
  const fullUrl = `${API_BASE}/api/auth/verify-email`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  console.log(`📧 Verifying code for email: ${email}, code: ${code}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    console.error(`📦 Error response:`, errorData);
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  console.log(`✅ Verification successful:`, result);
  return result;
}

export async function setEmailVerified(uid) {
  const fullUrl = `${API_BASE}/api/auth/set-email-verified`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}


