/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Centralizes client API calls for the Voice pipeline (dummy backend).
 * - Added email verification API functions for signup flow.
 * - Why: Keep UI clean and allow easy replacement with real providers later.
 * - Related: `server/src/routes/voice.js` endpoints and `server/src/routes/auth.js` for email verification.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "https://selltronai-serverside.onrender.com";

// --- Helper: JSON POST ---
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
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


