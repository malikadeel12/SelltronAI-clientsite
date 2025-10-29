// Use environment variable for API base URL with fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL;
console.log("API BASE 👉", import.meta.env.VITE_API_BASE_URL);

//const API_BASE ="http://localhost:7000";


// --- Helper: JSON POST without caching ---
async function postJson(path, body) {
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

// Streaming STT for Live Transcription
export async function runStreamingStt({ audioBlob, language, encoding, onTranscript }) {
  console.log("🎤 API: Starting streaming STT...");
  const form = new FormData();
  if (audioBlob) form.append("audio", audioBlob, "audio.webm");
  if (language) form.append("language", language);
  if (encoding) form.append("encoding", encoding);
  
  try {
    const response = await fetch(`${API_BASE}/api/voice/stt-stream`, {
      method: "POST",
      body: form,
    });
    
    if (!response.ok) throw new Error(`Streaming failed: ${response.status}`);
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (onTranscript) onTranscript(data);
        }
      }
    }
  } catch (error) {
    console.error("❌ Streaming STT error:", error);
    throw error;
  }
}

export async function runVoicePipeline({ audioBlob, mode, voice, language, encoding, hints, boost, sttModel, conversationHistory = [] }) {
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
  if (conversationHistory && conversationHistory.length > 0) {
    form.append("conversationHistory", JSON.stringify(conversationHistory));
  }
  
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

export async function runGpt({ transcript, mode, conversationHistory = [], language = "en-US" }) {
  return postJson(`/api/voice/gpt`, { transcript, mode, conversationHistory, language });
}

export async function runTts({ text, voice, language = "en-US" }) {
  return postJson(`/api/voice/tts`, { text, voice, language });
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

// --- CRM API Functions ---

export async function getCustomerData(email) {
  const fullUrl = `${API_BASE}/api/voice/crm/customer/${encodeURIComponent(email)}`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function updateCustomerData(customerData) {
  const fullUrl = `${API_BASE}/api/voice/crm/customer`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function extractCustomerInfo(transcript, conversationHistory = []) {
  const fullUrl = `${API_BASE}/api/voice/crm/extract-customer-info`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, conversationHistory }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function searchCustomerByNameOrCompany(name, company) {
  const fullUrl = `${API_BASE}/api/voice/crm/search-customer`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function extractKeyHighlights(transcript, conversationHistory = []) {
  const fullUrl = `${API_BASE}/api/voice/crm/extract-key-highlights`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, conversationHistory }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function saveKeyHighlightsToHubSpot(email, keyHighlights) {
  const fullUrl = `${API_BASE}/api/voice/crm/save-key-highlights`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  console.log(`💾 Saving key highlights for email: ${email}`, keyHighlights);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, keyHighlights }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  console.log(`✅ Key highlights saved successfully:`, result);
  return result;
}

export async function saveSentimentToHubSpot(email, sentimentData) {
  const fullUrl = `${API_BASE}/api/voice/crm/save-sentiment`;
  console.log(`🌐 Making API request to: ${fullUrl}`);
  console.log(`💾 Saving sentiment for email: ${email}`, sentimentData);
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sentimentData }),
  });
  
  if (!res.ok) {
    console.error(`❌ API request failed: ${res.status} ${res.statusText}`);
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  console.log(`✅ Sentiment saved successfully:`, result);
  return result;
}





