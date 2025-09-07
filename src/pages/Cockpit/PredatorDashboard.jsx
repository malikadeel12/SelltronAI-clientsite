// Change Summary (MCP Context 7 Best Practices)
// - Wired Cockpit to dummy Voice pipeline APIs (STT -> GPT -> TTS).
// - Added recording via MediaRecorder, mode/voice controls, and browser TTS playback.
// - Why: Implements Voice → GPT → Voice flow with replaceable backend providers.
// - Related: `client/src/lib/api.js`, `server/src/routes/voice.js`, `server/src/index.js`.
// - TODO: Replace dummy pipeline with Google STT/TTS and GPT-4 providers.
import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getAuthInstance } from "../../lib/firebase";
import { fetchVoiceConfig, runVoicePipeline, runStt, runGpt, runTts } from "../../lib/api";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function PredatorDashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("en-US-Wavenet-D");
  const [aiVoiceSelection, setAiVoiceSelection] = useState("en-US-Wavenet-D");
  const [speechActive, setSpeechActive] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [highlights, setHighlights] = useState("");
  const [predatorAnswer, setPredatorAnswer] = useState("");
  const [askText, setAskText] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mode, setMode] = useState("sales");
  const [voices, setVoices] = useState([{ id: "voice_1", label: "Voice 1" }]);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      showToast("Logged out successfully");
      navigate("/signUp");
    } catch (error) {
      showToast("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    // Load available voices/modes from backend
    fetchVoiceConfig()
      .then((cfg) => {
        const fetchedVoices = cfg.voices || [];
        setVoices(fetchedVoices);
        // If current selection is invalid, set to the first valid voice
        const current = aiVoiceSelection;
        const isValid = fetchedVoices.some(v => v.id === current);
        if (!isValid && fetchedVoices.length > 0) {
          const firstId = fetchedVoices[0].id;
          setAiVoiceSelection(firstId);
          setVoice(firstId);
        }
      })
      .catch(() => {});
  }, []);

  const startRecording = async () => {
    try {
      console.log("🎤 Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        } 
      });
      console.log("🎤 Microphone access granted, stream:", stream);
      
      // Check if MediaRecorder supports webm
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      console.log("🎤 Using MIME type:", mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        console.log("🎤 Audio data available:", e.data.size, "bytes");
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
          console.log("🎤 Chunks recorded:", recordedChunksRef.current.length);
        }
      };
      
      mediaRecorder.onstart = () => {
        console.log("🎤 MediaRecorder started");
        setRecording(true);
      };
      
      mediaRecorder.onstop = () => {
        console.log("🎤 MediaRecorder stopped");
        setRecording(false);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      showToast("Recording started");
    } catch (e) {
      console.error("❌ Microphone error:", e);
      showToast("Mic permission denied");
    }
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      console.log("🛑 Stopping MediaRecorder...");
      rec.stop();
      // Stream tracks are already stopped in onstop event
    }
  };

  const handleStart = async () => {
    console.log("🎤 Starting voice recording...");
    await startRecording();
    setTranscript("Listening...");
    console.log("🎤 Voice recording started successfully");
  };

  const handleStop = async () => {
    console.log("🛑 Stopping voice recording...");
    stopRecording();
    showToast("Processing...");
    try {
      // Wait a bit for the last audio data to be collected
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      console.log("📦 Audio blob created:", {
        size: blob.size,
        type: blob.type,
        chunks: recordedChunksRef.current.length
      });
      
      // Check if we have audio data
      if (blob.size === 0) {
        console.error("❌ No audio data recorded!");
        showToast("No audio recorded. Please try again.");
        return;
      }
      
      console.log("🚀 Starting voice pipeline with params:", {
        mode,
        voice,
        language: language === "German" ? "de-US" : "en-US"
      });
      
      const result = await runVoicePipeline({ audioBlob: blob, mode, voice, language: language === "German" ? "de-US" : "en-US" });
      
      console.log("📝 Voice pipeline result:", result);
      console.log("🎯 STT Transcript:", result.transcript);
      console.log("🤖 GPT Response:", result.responseText);
      console.log("🔊 TTS Audio URL:", result.audioUrl ? "Available" : "Not available");
      
      // Check if STT failed and use browser fallback
      if (result.transcript && result.transcript.includes("Google Cloud Speech-to-Text is not configured")) {
        console.log("🔄 STT failed, using browser Speech Recognition...");
        await handleBrowserSTT(blob);
        return;
      }
      
      setTranscript(result.transcript || "");
      setPredatorAnswer(result.responseText || "");
      
      // Use real TTS audio if available, otherwise fallback to browser TTS
      if (speechActive && (result.responseText || predatorAnswer)) {
        console.log("🔊 Playing audio response...");
        if (result.audioUrl) {
          console.log("🎵 Using Google Cloud TTS audio");
          // Play real TTS audio from Google Cloud
          const audio = new Audio(result.audioUrl);
          audio.play().catch(e => {
            console.error("❌ TTS audio playback failed:", e);
            console.log("🔄 Falling back to browser TTS");
            // Fallback to browser TTS
            const utter = new SpeechSynthesisUtterance(result.responseText || predatorAnswer);
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          });
        } else {
          console.log("🔄 Using browser TTS (no Google Cloud audio)");
          // Fallback to browser TTS
          const utter = new SpeechSynthesisUtterance(result.responseText || predatorAnswer);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        }
      }
      console.log("✅ Voice pipeline completed successfully!");
      triggerConfetti();
      showToast("Ready");
    } catch (e) {
      console.error("❌ Voice pipeline failed:", e);
      showToast("Pipeline failed");
    }
  };

  const handleRecording = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleBrowserSTT = async (blob) => {
    console.log("🎤 Using browser Speech Recognition...");
    showToast("Using browser speech recognition...");
    
    try {
      // Create audio element and play it for browser STT
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      // Use Web Speech API for transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "German" ? "de-DE" : "en-US";
        
        recognition.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("🎯 Browser STT result:", transcript);
          setTranscript(transcript);
          
          // Get GPT response
          try {
            const { responseText } = await runGpt({ transcript, mode });
            setPredatorAnswer(responseText);
            
            // Play TTS response
            if (speechActive && responseText) {
              const utter = new SpeechSynthesisUtterance(responseText);
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utter);
            }
            
            triggerConfetti();
            showToast("Ready");
          } catch (error) {
            console.error("GPT Error:", error);
            showToast("GPT failed");
          }
        };
        
        recognition.onerror = (event) => {
          console.error("Browser STT Error:", event.error);
          showToast("Speech recognition failed");
        };
        
        recognition.start();
      } else {
        showToast("Speech recognition not supported");
      }
    } catch (error) {
      console.error("Browser STT Error:", error);
      showToast("Speech recognition failed");
    }
  };

  const handleTranscribe = async () => {
    if (!recordedChunksRef.current.length) {
      showToast("No audio recorded");
      return;
    }
    setTranscribing(true);
    showToast("Transcribing...");
    try {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const { transcript: t } = await runStt({ audioBlob: blob, language: language === "German" ? "de-US" : "en-US" });
      setHighlights(`Transcription: ${t}`);
    } catch (e) {
      showToast("STT failed");
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmitAsk = async () => {
    if (!askText.trim()) return;
    try {
      const { responseText } = await runGpt({ transcript: askText, mode });
      setPredatorAnswer(responseText);
      
      if (speechActive && responseText) {
        // Try to get TTS audio for the response
        try {
          const ttsResult = await runTts({ text: responseText, voice });
          if (ttsResult.audioUrl) {
            const audio = new Audio(ttsResult.audioUrl);
            audio.play().catch(e => {
              console.error("TTS audio playback failed:", e);
              // Fallback to browser TTS
              const utter = new SpeechSynthesisUtterance(responseText);
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utter);
            });
          } else {
            // Fallback to browser TTS
            const utter = new SpeechSynthesisUtterance(responseText);
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          }
        } catch (ttsError) {
          console.error("TTS failed:", ttsError);
          // Fallback to browser TTS
          const utter = new SpeechSynthesisUtterance(responseText);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        }
      }
      triggerConfetti();
      setAskText("");
      showToast("GPT responded");
    } catch (e) {
      showToast("GPT failed");
    }
  };

  const handleGoodAnswer = (choice) => {
    const answer = `You clicked ${choice}. Here is a dummy response.`;
    setPredatorAnswer(answer);
    triggerConfetti();
    showToast(`${choice} selected`);
  };

  const handleOtherButton = (name) => {
    const answer = `${name} clicked. Showing dummy response.`;
    setPredatorAnswer(answer);
    triggerConfetti();
    showToast(`${name} executed`);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-2 bg-[#f5f5f5] font-sans overflow-y-auto" style={openSansStyle}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border border-[#000000] rounded-2xl px-4 py-3 bg-[#f5f5f5] shadow-lg">
        <span className="font-bold text-lg sm:text-xl text-center sm:text-left" style={orbitronStyle}>
          SELL PREDATOR Cockpit
        </span>

        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
          <button 
            onClick={() => navigate("/profile")}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
          <button 
            onClick={handleLogout}
            className="cursor-pointer bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-[#000000] px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
          <span className="text-sm sm:text-base text-center sm:text-left w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg" style={openSansStyle}>
            Status: <span className="font-semibold text-green-600">Free Version</span>
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Predator Live Transcript */}
        <div className="rounded-2xl p-4 bg-[#f5f5f5] shadow-lg flex flex-col">
          <h2 className="font-bold text-lg mb-3" style={orbitronStyle}>
            Predator Live Transcript
          </h2>

          <div className="flex gap-2 mb-3">
            <button
              className="cursor-pointer border rounded-lg px-4 py-1.5 shadow hover:bg-[#f5f5f5] w-full sm:w-auto"
              onClick={handleStart}
            >
              Start
            </button>
            <button
              className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg shadow w-full sm:w-auto"
              onClick={handleStop}
            >
              Stop
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <label className="flex flex-col text-sm font-medium">
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                <option>English</option>
                <option>German</option>
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium">
              Mode
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
            <label className="flex flex-col text-sm font-medium w-full sm:w-1/2">
              AI Voice Selection
              <select
                value={aiVoiceSelection}
                onChange={(e) => { setAiVoiceSelection(e.target.value); setVoice(e.target.value); }}
                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                {voices.map(v => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center text-sm sm:text-base w-full sm:w-1/2 sm:justify-end cursor-pointer">
              <input
                type="checkbox"
                checked={speechActive}
                onChange={() => setSpeechActive(!speechActive)}
                className="mr-2 cursor-pointer"
              />
              Speech Output Active
            </label>
          </div>

          <button
            className="cursor-pointer border rounded-lg px-4 py-1.5 mb-3 shadow hover:bg-[#f5f5f5] w-full flex items-center justify-center gap-2"
            onClick={handleRecording}
          >
            {recording && <span className="animate-pulse">🎤</span>} Recording Own Voice
          </button>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full flex-1 border-2 border-[#D72638] rounded-2xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-[#FFD700] outline-none overflow-y-auto"
          />
        </div>

        {/* Whisper */}
        <div className="rounded-2xl p-4 bg-[#f5f5f5] shadow-lg flex flex-col">
          <h2 className="font-bold text-lg mb-3" style={orbitronStyle}>
            Whisper
          </h2>
          <input type="file" className="mb-3 text-sm cursor-pointer" />
          <button
            className="cursor-pointer border rounded-lg px-4 py-1.5 mb-3 shadow hover:bg-[#f5f5f5] w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={handleTranscribe}
          >
            {transcribing && <span className="animate-spin">⏳</span>} Transcribe
          </button>

          <div className="flex flex-col mb-3">
            <label className="font-medium mb-1 text-sm cursor-pointer">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
            >
              <option>German</option>
              <option>English</option>
            </select>
          </div>

          <h3 className="font-bold text-base mb-2" style={orbitronStyle}>
            Highlights & Conversion History
          </h3>
          <textarea
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            className="w-full flex-1 border-2 border-[#D72638] rounded-2xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-[#FFD700] outline-none overflow-y-auto"
          />
        </div>

        {/* Predator Answer */}
        <div className="rounded-2xl p-4 bg-[#f5f5f5] shadow-lg flex flex-col">
          <h2 className="font-bold text-lg mb-3" style={orbitronStyle}>
            Predator Answer
          </h2>
          <textarea
            value={predatorAnswer}
            onChange={(e) => setPredatorAnswer(e.target.value)}
            className="w-full flex-1 border-2 border-[#D72638] rounded-2xl p-3 mb-3 shadow-sm resize-none focus:ring-2 focus:ring-[#FFD700] outline-none overflow-y-auto"
          />
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            {["Good Answer A", "Good Answer B", "Good Answer C"].map((btn) => (
              <button
                key={btn}
                className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg shadow flex-1 font-medium"
                onClick={() => handleGoodAnswer(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <input
          type="text"
          placeholder="Ask GPT..."
          value={askText}
          onChange={(e) => setAskText(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none"
        />
        <button
          className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-5 py-1.5 rounded-lg shadow font-medium w-full sm:w-auto"
          onClick={handleSubmitAsk}
        >
          Submit
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4 mb-2">
        <button
          className="cursor-pointer bg-[#f5f5f5] hover:bg-[#f5f5f5] px-4 py-1.5 rounded-lg flex-1 shadow font-medium border border-[#000000]"
          onClick={() => handleOtherButton("TTS")}
        >
          TTS
        </button>
        <button
          className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg flex-1 shadow border font-medium"
          onClick={() => handleOtherButton("Correction")}
        >
          Correction
        </button>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-[#000000] text-[#f5f5f5] px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
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
    </div>
  );
}
