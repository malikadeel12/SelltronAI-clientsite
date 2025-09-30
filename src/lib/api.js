// Prefer env base URL in production; fallback to same-origin relative paths
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) 
  ? import.meta.env.VITE_API_BASE_URL 
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? "http://localhost:8000" 
    : ""; // For production, use relative paths

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

// --- Email Verification APIs ---
export async function checkEmailExists(email) {
  return postJson(`/api/auth/check-email`, { email });
}

export async function sendVerificationCode(email) {
  return postJson(`/api/auth/send-verification`, { email });
}

export async function verifyEmailCode(email, code) {
  return postJson(`/api/auth/verify-email`, { email, code });
}

export async function setEmailVerified(uid) {
  return postJson(`/api/auth/set-email-verified`, { uid });
}


