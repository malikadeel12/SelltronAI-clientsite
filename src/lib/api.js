/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Centralizes client API calls for the Voice pipeline (dummy backend).
 * - Added email verification API functions for signup flow.
 * - Why: Keep UI clean and allow easy replacement with real providers later.
 * - Related: `server/src/routes/voice.js` endpoints and `server/src/routes/auth.js` for email verification.
 */

// Prefer env base URL in production; fallback to same-origin relative paths
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : "";
// --- Helper: JSON POST ---
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  
  if (!res.ok) {
    // Try to get error message from response
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || `Request failed: ${res.status}`);
    } catch (parseError) {
      throw new Error(`Request failed: ${res.status}`);
    }
  }
  
  return res.json();
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

export async function runVoicePipeline({ audioBlob, mode, voice, language }) {
  console.log("🌐 API: Starting voice pipeline call...");
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (mode) form.append("mode", mode);
  if (voice) form.append("voice", voice);
  if (language) form.append("language", language);
  // Optionally forward encoding if caller set form.encoding
  if (arguments[0] && arguments[0].encoding) form.append("encoding", arguments[0].encoding);
  
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

export async function runStt({ audioBlob, language }) {
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (language) form.append("language", language);
  if (arguments[0] && arguments[0].encoding) form.append("encoding", arguments[0].encoding);
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


