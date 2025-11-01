// Use environment variable for API base URL with fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL;

//const API_BASE ="http://localhost:7000";

// --- Helper: JSON POST without caching ---
async function postJson(path, body) {
  const fullUrl = `${API_BASE}${path}`;
  
  const res = await fetch(fullUrl, {
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
    throw error;
  }
}

export async function runVoicePipeline({ mode, voice, language, conversationHistory = [], transcript }) {
  const form = new FormData();
  if (mode) form.append("mode", mode);
  if (voice) form.append("voice", voice);
  if (language) form.append("language", language);
  if (conversationHistory && conversationHistory.length > 0) {
    form.append("conversationHistory", JSON.stringify(conversationHistory));
  }
  if (transcript) {
    form.append("transcript", transcript);
  }
  
  const result = await postForm(`/api/voice/pipeline`, form);
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
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function sendVerificationCode(email) {
  const fullUrl = `${API_BASE}/api/auth/send-verification`;
  
  try {
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (parseError) {
        errorData = { error: `Request failed: ${res.status}` };
      }
      throw new Error(errorData.error || `Request failed: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function verifyEmailCode(email, code) {
  const fullUrl = `${API_BASE}/api/auth/verify-email`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  return result;
}

export async function setEmailVerified(uid) {
  const fullUrl = `${API_BASE}/api/auth/set-email-verified`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

// --- CRM API Functions ---

export async function getCustomerData(email) {
  const fullUrl = `${API_BASE}/api/voice/crm/customer/${encodeURIComponent(email)}`;
  
  const res = await fetch(fullUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function updateCustomerData(customerData) {
  const fullUrl = `${API_BASE}/api/voice/crm/customer`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function extractCustomerInfo(transcript, conversationHistory = []) {
  const fullUrl = `${API_BASE}/api/voice/crm/extract-customer-info`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, conversationHistory }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function searchCustomerByNameOrCompany(name, company) {
  const fullUrl = `${API_BASE}/api/voice/crm/search-customer`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function extractKeyHighlights(transcript, conversationHistory = []) {
  const fullUrl = `${API_BASE}/api/voice/crm/extract-key-highlights`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, conversationHistory }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

export async function saveKeyHighlightsToHubSpot(email, keyHighlights) {
  const fullUrl = `${API_BASE}/api/voice/crm/save-key-highlights`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, keyHighlights }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  return result;
}

export async function saveSentimentToHubSpot(email, sentimentData) {
  const fullUrl = `${API_BASE}/api/voice/crm/save-sentiment`;
  
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sentimentData }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const result = await res.json();
  return result;
}

