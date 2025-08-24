// src/components/PredatorDashboard.jsx
import React, { useState } from "react";

export default function PredatorDashboard() {
    const [language, setLanguage] = useState("German");
    const [voice, setVoice] = useState("AI Voice");
    const [aiVoiceSelection, setAiVoiceSelection] = useState("Voice 1");
    const [speechActive, setSpeechActive] = useState(true);
    const [transcript, setTranscript] = useState("");
    const [highlights, setHighlights] = useState("");
    const [predatorAnswer, setPredatorAnswer] = useState("");
    const [askText, setAskText] = useState("");

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-2 bg-gray-100 font-sans overflow-y-auto">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-lg">
                <span className="font-bold text-lg sm:text-xl text-center sm:text-left">SELL PREDATOR Cockpit</span>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                    <input
                        type="email"
                        placeholder="Write Email..."
                        className="border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none w-full sm:w-auto"
                    />
                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none w-full sm:w-auto"
                    />
                    <button className="border rounded-lg px-4 py-1.5 shadow hover:bg-gray-100 w-full sm:w-auto">
                        Log In
                    </button>
                    <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded-lg shadow font-medium w-full sm:w-auto">
                        Backup
                    </button>
                    <span className="text-sm sm:text-base text-center sm:text-left w-full sm:w-auto">
                        Status: <span className="font-semibold">Free Version</span>
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                {/* Predator Live Transcript */}
                <div className=" rounded-2xl p-4 bg-white shadow-lg flex flex-col">
                    <h2 className="font-bold text-lg mb-3">Predator Live Transcript</h2>

                    {/* Start / Stop */}
                    <div className="flex gap-2 mb-3">
                        <button className="border rounded-lg px-4 py-1.5 shadow hover:bg-gray-100 w-full sm:w-auto">
                            Start
                        </button>
                        <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded-lg shadow w-full sm:w-auto">
                            Stop
                        </button>
                    </div>

                    {/* Dropdowns Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <label className="flex flex-col text-sm font-medium">
                            Language
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none w-full"
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
                                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none w-full"
                            >
                                <option>AI Voice</option>
                            </select>
                        </label>
                    </div>

                    {/* AI Voice Selection + Speech Toggle */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                        <label className="flex flex-col text-sm font-medium w-full sm:w-1/2">
                            AI Voice Selection
                            <select
                                value={aiVoiceSelection}
                                onChange={(e) => setAiVoiceSelection(e.target.value)}
                                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none w-full"
                            >
                                <option>Voice 1</option>
                                <option>Voice 2</option>
                            </select>
                        </label>

                        <label className="flex items-center text-sm sm:text-base w-full sm:w-1/2 sm:justify-end">
                            <input
                                type="checkbox"
                                checked={speechActive}
                                onChange={() => setSpeechActive(!speechActive)}
                                className="mr-2"
                            />
                            Speech Output Active
                        </label>
                    </div>

                    {/* Record Button */}
                    <button className="border rounded-lg px-4 py-1.5 mb-3 shadow hover:bg-gray-100 w-full">
                        Recording Own Voice
                    </button>

                    {/* Transcript */}
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="w-full flex-1 border-2 border-red-500 rounded-2xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-yellow-400 outline-none overflow-y-auto"
                    />
                </div>

                {/* Whisper */}
                <div className=" rounded-2xl p-4 bg-white shadow-lg flex flex-col">
                    <h2 className="font-bold text-lg mb-3">Whisper</h2>
                    <input type="file" className="mb-3 text-sm" />
                    <button className="border rounded-lg px-4 py-1.5 mb-3 shadow hover:bg-gray-100 w-full sm:w-auto">
                        Transcribe
                    </button>

                    {/* Language Selection */}
                    <div className="flex flex-col mb-3">
                        <label className="font-medium mb-1 text-sm">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none w-full"
                        >
                            <option>German</option>
                            <option>English</option>
                        </select>
                    </div>

                    <h3 className="font-bold text-base mb-2">Highlights & Conversion History</h3>
                    <textarea
                        value={highlights}
                        onChange={(e) => setHighlights(e.target.value)}
                        className="w-full flex-1 border-2 border-red-500 rounded-2xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-yellow-400 outline-none overflow-y-auto"
                    />
                </div>

                {/* Predator Answer */}
                <div className=" rounded-2xl p-4 bg-white shadow-lg flex flex-col">
                    <h2 className="font-bold text-lg mb-3">Predator Answer</h2>
                    <textarea
                        value={predatorAnswer}
                        onChange={(e) => setPredatorAnswer(e.target.value)}
                        className="w-full flex-1 border-2 border-red-500 rounded-2xl p-3 mb-3 shadow-sm resize-none focus:ring-2 focus:ring-yellow-400 outline-none overflow-y-auto"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded-lg shadow flex-1 font-medium">
                            Good Answer A
                        </button>
                        <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded-lg shadow flex-1 font-medium">
                            Good Answer B
                        </button>
                        <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded-lg shadow flex-1 font-medium">
                            Good Answer C
                        </button>
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
                    className="flex-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <button className="bg-yellow-400 hover:bg-yellow-500 px-5 py-1.5 rounded-lg shadow font-medium w-full sm:w-auto">
                    Submit
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 mb-2">
                <button className="border px-4 py-1.5 rounded-lg flex-1 shadow hover:bg-gray-100">
                    TTS
                </button>
                <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded-lg flex-1 shadow font-medium">
                    Correction
                </button>
            </div>
        </div>
    );
}
