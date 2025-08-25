import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function PredatorDashboard() {
  const [language, setLanguage] = useState("German");
  const [voice, setVoice] = useState("AI Voice");
  const [aiVoiceSelection, setAiVoiceSelection] = useState("Voice 1");
  const [speechActive, setSpeechActive] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [highlights, setHighlights] = useState("");
  const [predatorAnswer, setPredatorAnswer] = useState("");
  const [askText, setAskText] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  const handleStart = () => {
    setTranscript("Predator Live Transcript started...");
    setPredatorAnswer("Dummy answer from Predator");
    triggerConfetti();
    showToast("Predator Live Transcript started");
  };

  const handleStop = () => {
    setTranscript("Predator Live Transcript stopped.");
    setPredatorAnswer("Dummy answer after stopping...");
    triggerConfetti();
    showToast("Predator Live Transcript stopped");
  };

  const handleRecording = () => {
    setRecording(true);
    setTranscript("🎤 Recording... speaking dummy text...");
    showToast("Recording Own Voice started");
    setTimeout(() => setRecording(false), 3000);
  };

  const handleTranscribe = () => {
    setTranscribing(true);
    showToast("Transcription started...");
    setTimeout(() => {
      setHighlights("Dummy Highlights & Conversion History generated...");
      setTranscribing(false);
      showToast("Transcription completed");
    }, 2000);
  };

  const handleSubmitAsk = () => {
    const answer = `GPT says: This is a dummy answer for "${askText}"`;
    setPredatorAnswer(answer);
    triggerConfetti();
    setAskText("");
    showToast("GPT query submitted");
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

        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
          <button className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg shadow font-medium w-full sm:w-auto">
            Logout
          </button>
          <span className="text-sm sm:text-base text-center sm:text-left w-full sm:w-auto" style={openSansStyle}>
            Status: <span className="font-semibold">Free Version</span>
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
                <option>German</option>
                <option>English</option>
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium">
              Voice
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                <option>AI Voice</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
            <label className="flex flex-col text-sm font-medium w-full sm:w-1/2">
              AI Voice Selection
              <select
                value={aiVoiceSelection}
                onChange={(e) => setAiVoiceSelection(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                <option>Voice 1</option>
                <option>Voice 2</option>
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
