// Change Summary (MCP Context 7 Best Practices)
// - Wired Cockpit to dummy Voice pipeline APIs (STT -> GPT -> TTS).
// - Added recording via MediaRecorder, mode/voice controls, and browser TTS playback.
// - Why: Implements Voice → GPT → Voice flow with replaceable backend providers.
// - Related: `client/src/lib/api.js`, `server/src/routes/voice.js`, `server/src/index.js`.
// - TODO: Replace dummy pipeline with Google STT/TTS and GPT-4 providers.
import React, { useState, useEffect, useRef, useMemo } from "react";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getAuthInstance } from "../../lib/firebase";
import { fetchVoiceConfig, runStt, runGpt, runTts, runVoicePipeline } from "../../lib/api";

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
  const [previousMode, setPreviousMode] = useState("sales");
  const modeRef = useRef("sales");
  const [voices, setVoices] = useState([{ id: "voice_1", label: "Voice 1" }]);
  const [streaming, setStreaming] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [coachingSuggestions, setCoachingSuggestions] = useState([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micReactivated, setMicReactivated] = useState(false);
  const isTtsPlayingRef = useRef(false);
  const [isAskGptProcessing, setIsAskGptProcessing] = useState(false);
  const [predatorAnswerRefreshing, setPredatorAnswerRefreshing] = useState(false);
  const [coachingButtonsRefreshing, setCoachingButtonsRefreshing] = useState(false);
  const [showCoachingButtons, setShowCoachingButtons] = useState(true);
  const [showLiveTranscript, setShowLiveTranscript] = useState(true);
  const [responseSpeed, setResponseSpeed] = useState(null);
  const [isProcessingFast, setIsProcessingFast] = useState(false);
  const manuallyStoppedRef = useRef(false);
  // New state for conversation history
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentUserInput, setCurrentUserInput] = useState("");
  // STT accuracy tuners
  const sttModel = 'latest_long';
  const sttBoost = 16; // 10-20 is common
  
  // Load Sales conversation history from localStorage (ignore support mode)
  useEffect(() => {
    if (mode === 'sales') {
      const savedHistory = localStorage.getItem('predatorConversationHistory_sales');
      if (savedHistory) {
        try {
          setConversationHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Error loading conversation history:', error);
        }
      } else {
        setConversationHistory([]);
      }
    } else {
      // Support mode - show empty history
      setConversationHistory([]);
    }
  }, [mode]);

  // Save Sales conversation history to localStorage whenever it changes
  useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem('predatorConversationHistory_sales', JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);
  
  // Auto-scroll Predator Answer box to bottom when new content arrives
  useEffect(() => {
    const box = conversationBoxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [conversationHistory, predatorAnswer]);

  // Function to add conversation entry (Sales only)
  const addConversationEntry = (userInput, predatorResponse, suggestions = []) => {
    if (modeRef.current !== 'sales') return; // do not store support mode history
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      userInput: userInput.trim(),
      predatorResponse: predatorResponse.trim(),
      responseA: suggestions.find(s => s.responseType === 'A')?.text || suggestions[0]?.text || '',
      responseB: suggestions.find(s => s.responseType === 'B')?.text || suggestions[1]?.text || '',
      responseC: suggestions.find(s => s.responseType === 'C')?.text || suggestions[2]?.text || '',
      mode: 'sales' // Always tag as sales
    };
    setConversationHistory(prev => {
      const updated = [...prev, newEntry];
      // Save to Sales-only key
      localStorage.setItem('predatorConversationHistory_sales', JSON.stringify(updated));
      return updated;
    });
    // Keep current user input and predator response visible for current interaction
    // They will be cleared when new speech starts
  };

  // Function to clear Sales conversation history
  const clearConversationHistory = () => {
    setConversationHistory([]);
    localStorage.removeItem('predatorConversationHistory_sales');
    showToast('Sales conversation history cleared');
  };

  const defaultHints = useMemo(() => ([
    // Brand/Product terms (edit these for your domain)
    'Selltron', 'Predator', 'Cockpit', 'dashboard',
    // Sales/support phrases
    'pricing', 'subscription', 'free trial', 'enterprise plan',
    'customer support', 'technical issue', 'refund', 'upgrade', 'downgrade',
    // Common names/terms
    'Adeel', 'email', 'phone number', 'order number',
  ]), []);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mimeTypeRef = useRef('audio/webm;codecs=opus');
  const encodingRef = useRef('WEBM_OPUS');
  const recognitionRef = useRef(null);
  const processingTimeoutRef = useRef(null);
  const lastProcessedTextRef = useRef("");
  const currentAudioRef = useRef(null);
  const lastAutoSelectedSuggestionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastGptResponseTimeRef = useRef(0);
  const conversationBoxRef = useRef(null);
  
  // Stop any active microphone inputs (live recognition or manual recording)
  const stopAllInput = () => {
    // Stop real-time recognition if running
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    // Stop MediaRecorder recording if active
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      try { rec.stop(); } catch (_) {}
    }
    // DON'T set streaming to false - keep mic always on
    setRecording(false);
    // Don't set isVoiceActive to false - keep mic ready for next input
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  // Function to stop all audio playback and mute microphone during AI speech
  const stopAllAudio = () => {
    console.log("🔇 Stopping all audio playback");
    
    // Stop speech synthesis immediately
    window.speechSynthesis.cancel();
    
    // Stop any playing audio immediately
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Mute microphone during AI speech to prevent feedback loop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("🔇 Microphone muted during AI speech");
      } catch (e) {
        console.log("🔇 Microphone already stopped");
      }
    }
    
    console.log("🔇 All audio stopped - mic muted to prevent feedback");
  };

  // Function to restart microphone after AI speech ends
  const restartMicrophone = () => {
    console.log("🎤 Restarting microphone after AI speech ended");
    if (streaming && !isTtsPlaying && !isTtsPlayingRef.current) {
      setTimeout(() => {
        startRealTimeRecognition();
        showToast("🎤 Mic is ready - speak your next query!");
      }, 500); // Small delay to ensure TTS has fully ended
    }
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  const triggerRefreshAnimation = () => {
    // Trigger predator answer refresh
    setPredatorAnswerRefreshing(true);
    setTimeout(() => setPredatorAnswerRefreshing(false), 1000);
    
    // Trigger coaching buttons refresh
    setCoachingButtonsRefreshing(true);
    setTimeout(() => setCoachingButtonsRefreshing(false), 1000);
  };

  const startSpeedTimer = () => {
    const startTime = Date.now();
    setIsProcessingFast(true);
    setResponseSpeed(null);
    return startTime;
  };

  const endSpeedTimer = (startTime) => {
    const endTime = Date.now();
    const speed = endTime - startTime;
    setResponseSpeed(speed);
    setIsProcessingFast(false);
    
    // Show speed feedback
    if (speed < 3000) {
      showToast(`⚡ Ultra-fast response: ${speed}ms`);
    } else if (speed < 5000) {
      showToast(`🚀 Fast response: ${speed}ms`);
    } else {
      showToast(`⏱️ Response time: ${speed}ms`);
    }
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

  // Handle mode change with proper cleanup
  const handleModeChange = (newMode) => {
    console.log(`🔄 Changing mode from ${mode} to ${newMode}`);
    setMode(newMode);
    modeRef.current = newMode; // Update ref immediately
    // Clear all previous responses immediately
    // Keep coaching suggestions visible - don't clear them
    setPredatorAnswer("");
    setTranscript("");
    setLiveTranscript("");
    // Clear current user input when switching modes
    setCurrentUserInput("");
    // Ensure buttons are always visible
    setShowCoachingButtons(true);
    showToast(`Switched to ${newMode === 'sales' ? 'Sales Mode (3 responses)' : 'Support Mode (1 response)'}`);
  };

  // Ensure buttons are always visible on mount
  useEffect(() => {
    setShowCoachingButtons(true);
  }, []);

  // Purge any existing Support history once
  useEffect(() => {
    localStorage.removeItem('predatorConversationHistory_support');
  }, []);

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

  // Handle mode changes - clear previous responses when mode switches
  useEffect(() => {
    if (mode !== previousMode) {
      console.log(`🔄 Mode changed from ${previousMode} to ${mode} - clearing previous responses`);
      modeRef.current = mode; // Update ref when mode changes
      // Keep coaching suggestions visible - don't clear them
      setPredatorAnswer("");
      // Clear live transcript and current input when mode changes
      setLiveTranscript("");
      setCurrentUserInput("");
      setPreviousMode(mode);
      showToast(`Mode switched to ${mode === 'sales' ? 'Sales (3 responses)' : 'Support (1 response)'}`);
    }
  }, [mode, previousMode]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
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
      
      // Choose a MIME type supported by the current browser (mobile-friendly)
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
          encodingRef.current = 'OGG_OPUS';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
          encodingRef.current = 'WEBM_OPUS';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
          encodingRef.current = 'WEBM_OPUS';
        } else {
          // As a last resort, allow browser to pick default; STT may not support some codecs
          mimeType = '';
          encodingRef.current = 'WEBM_OPUS';
        }
      }
      mimeTypeRef.current = mimeType || 'audio/webm';
      console.log("🎤 Using MIME type:", mimeTypeRef.current, " Encoding:", encodingRef.current);
      
      const mediaRecorder = new MediaRecorder(stream, mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined);
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
        setIsVoiceActive(true);
      };
      
      mediaRecorder.onstop = () => {
        console.log("🎤 MediaRecorder stopped");
        setRecording(false);
        // Don't set isVoiceActive to false - keep mic ready for next input
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // When recording stops, run the full voice pipeline (STT -> GPT -> optional TTS)
        (async () => {
          try {
            if (!recordedChunksRef.current.length) return;
            const blob = new Blob(recordedChunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
            const speedTimer = startSpeedTimer();
            const { transcript: t } = await runVoicePipeline({
              audioBlob: blob,
              mode,
              voice: aiVoiceSelection, // Use selected AI voice
              language: language === "German" ? "de-DE" : "en-US",
              encoding: encodingRef.current,
              hints: defaultHints,
              boost: sttBoost,
              sttModel,
              conversationHistory
            });
            
            if (t && t.trim()) {
              // Get responses from GPT based on current mode
              const currentMode = modeRef.current; // Use ref for immediate value
              const prompt = currentMode === "sales" 
                ? `Customer said: "${t}". 

SALES MODE INSTRUCTIONS:
- Always professional, confident, and helpful
- Short and clear answers (max 2-3 sentences)
- Never sound unsure or negative
- Focus on benefits, value, and closing
- Handle objections directly (price, competition, timing)
- Always give 3 different responses
- Small Talk: Keep it polite and short (e.g., "I'm doing well, thanks for asking."). Then quickly guide the conversation back to the sales topic.

Generate 3 different persuasive sales responses that help close deals, address objections, and build value. Each response should be professional, confident, and focused on benefits and closing:`
                : `Customer said: "${t}". 

SUPPORT MODE INSTRUCTIONS:
- Empathetic, problem-solving tone
- Give clear instructions or next steps
- Keep it simple and easy to understand
- Always give 1 response only

Generate 1 empathetic support response that solves problems, shows understanding, and provides clear solutions. Focus on problem resolution and customer satisfaction:`;
              
              const { responseText } = await runGpt({ transcript: prompt, mode: currentMode, conversationHistory });
              
              if (responseText) {
                // Parse response based on current mode
                let suggestions = [];
                
                if (currentMode === "sales") {
                  // For sales mode, check if we have multiple questions format
                  if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                    // Parse multiple questions format and group responses by type (A, B, C)
                    const questionBlocks = responseText.split(/\n\s*\n/).filter(block => block.trim());
                    
                    // Group responses by type across all questions
                    const responsesByType = { A: [], B: [], C: [] };
                    
                    questionBlocks.forEach((block, blockIndex) => {
                      const lines = block.split('\n').filter(line => line.trim());
                      
                      lines.forEach((line, lineIndex) => {
                        if (line.includes("Response A:") || line.includes("Response B:") || line.includes("Response C:")) {
                          const text = line.replace(/^Response [ABC]:\s*/, '').trim();
                          if (text) {
                            const responseType = line.includes("Response A:") ? "A" : line.includes("Response B:") ? "B" : "C";
                            responsesByType[responseType].push({
                              responseText: text
                            });
                          }
                        }
                      });
                    });
                    
                    // Create combined suggestions grouped by response type
                    suggestions = [];
                    ['A', 'B', 'C'].forEach(type => {
                      if (responsesByType[type].length > 0) {
                        // Combine all responses of this type (only answers, no questions)
                        const combinedText = responsesByType[type]
                          .map((item, index) => item.responseText)
                          .join('\n\n');
                        
                        suggestions.push({
                          id: suggestions.length + 1,
                          text: combinedText,
                          timestamp: Date.now(),
                          responseType: type,
                          isCombinedResponse: true
                        });
                      }
                    });
                    console.log(`🎯 Parsed ${suggestions.length} combined responses from ${questionBlocks.length} questions for sales mode`);
                  } else if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                    // Parse single question database responses
                    const responseLines = responseText.split('\n').filter(line => line.trim());
                    suggestions = responseLines.map((line, index) => {
                      const text = line.replace(/^Response [ABC]:\s*/, '').trim();
                      return {
                        id: index + 1,
                        text: text,
                        timestamp: Date.now()
                      };
                    });
                    console.log(`🎯 Parsed ${suggestions.length} database responses for sales mode`);
                  } else {
                    // Fallback to original parsing for non-database responses
                    const lines = responseText.split('\n').filter(line => line.trim());
                    suggestions = lines.slice(0, 3).map((suggestion, index) => ({
                      id: index + 1,
                      text: suggestion.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '').trim(),
                      timestamp: Date.now()
                    }));
                    console.log(`🎯 Generated ${suggestions.length} new responses for sales mode`);
                  }
                } else {
                  // Support mode - single response
                  suggestions = [{
                    id: 1,
                    text: responseText.trim(),
                    timestamp: Date.now()
                  }];
                  console.log(`🎯 Generated 1 response for support mode`);
                }
                
                console.log(`✅ Generated ${suggestions.length} suggestion(s):`, suggestions.map(s => s.text.substring(0, 50) + '...'));
                
                if (suggestions.length > 0) {
                  setCoachingSuggestions(suggestions);
                  // Switch to conversation history view when response arrives (except in support mode)
                  if (modeRef.current !== 'support') {
                    setShowLiveTranscript(false);
                  } else {
                    // In support mode, keep live transcript showing user's query
                    setShowLiveTranscript(true);
                  }
                  // Hide buttons when new response arrives
                  setShowCoachingButtons(false);
                  // Trigger button animation for new responses
                  setCoachingButtonsRefreshing(true);
                  setTimeout(() => setCoachingButtonsRefreshing(false), 1000);
                  // Show buttons after 3 seconds
                  setTimeout(() => setShowCoachingButtons(true), 3000);
                  // Set first actual response (not question header) as the main answer and auto-play it
                  const firstResponse = suggestions.find(s => !s.isQuestionHeader);
                  const firstAnswer = firstResponse ? firstResponse.text : suggestions[0].text;
                  setPredatorAnswer(firstAnswer);
                  triggerRefreshAnimation();                  
                  // Add to conversation history for pipeline path
                  addConversationEntry(t, firstAnswer, suggestions);
                  if (speechActive) {
                    // Use TTS with selected voice for better quality
                    try {
                      const ttsResult = await runTts({ text: firstAnswer, voice: aiVoiceSelection });
                      if (ttsResult.audioUrl) {
                        stopAllInput();
                        stopAllAudio();
                        const audio = new Audio(ttsResult.audioUrl);
                        currentAudioRef.current = audio;
                        
                        // Set TTS playing state immediately
                        console.log("🔊 Setting TTS playing state to true");
                        setIsTtsPlaying(true);
                        isTtsPlayingRef.current = true;
                        
                        // Add event listeners before playing
                        audio.addEventListener('play', () => {
                          console.log("🔊 TTS audio started playing (addEventListener)");
                          setIsTtsPlaying(true);
                          isTtsPlayingRef.current = true;
                        });
                        
                        audio.addEventListener('ended', () => {
                          console.log("🔊 TTS audio ended (addEventListener)");
                          setIsTtsPlaying(false);
                          isTtsPlayingRef.current = false;
                        });
                        
                        audio.onplay = () => {
                          console.log("🔊 TTS audio started playing (onplay)");
                          setIsTtsPlaying(true);
                          isTtsPlayingRef.current = true;
                        };
                        audio.onended = () => { 
                          console.log("🔊 TTS audio ended, streaming:", streaming);
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          currentAudioRef.current = null;
                          // Restart microphone after AI speech ends
                          restartMicrophone();
                          setMicReactivated(true);
                          setTimeout(() => setMicReactivated(false), 2000);
                        };
                        audio.play().catch(e => {
                          console.error("TTS audio playback failed:", e);
                          speakText(responseText);
                        });
                      } else {
                        speakText(responseText);
                      }
                    } catch (ttsError) {
                      console.error("TTS failed:", ttsError);
                      speakText(responseText);
                    }
                  }
                }
              }
            }
            endSpeedTimer(speedTimer);
          } catch (e) {
            console.error("Voice pipeline failed:", e);
            showToast("Voice pipeline failed");
          } finally {
            recordedChunksRef.current = [];
          }
        })();
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
      // Don't set isVoiceActive to false - keep mic ready
      setRecording(false);
      // Stream tracks are already stopped in onstop event
    }
  };

  // removed unused handleStart/handleStop to keep code minimal

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
            const { responseText } = await runGpt({ transcript, mode, conversationHistory });
            setPredatorAnswer(responseText);
            
            // Trigger refresh animation for new response
            if (responseText) {
              triggerRefreshAnimation();
            }
            
            // Play TTS response
            if (speechActive && responseText) {
              speakText(responseText);
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
      const { transcript: t } = await runStt({ 
        audioBlob: blob, 
        language: language === "German" ? "de-DE" : "en-US",
        encoding: encodingRef.current,
        hints: defaultHints,
        boost: sttBoost,
        sttModel
      });
      setHighlights(`Transcription: ${t}`);
    } catch (e) {
      showToast("STT failed");
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmitAsk = async () => {
    if (!askText.trim()) return;
    
    // Check if TTS is currently playing
    if (isTtsPlaying) {
      showToast("Wait, AI is speaking. After completion we will start Ask GPT.");
      return;
    }
    
    setIsAskGptProcessing(true);
    const speedTimer = startSpeedTimer();
    try {
      const { responseText } = await runGpt({ transcript: askText, mode, conversationHistory });
      setPredatorAnswer(responseText);
      
      // Ensure we show conversation history view (not live transcript) when response arrives
      setShowLiveTranscript(false);
      
      // Trigger refresh animation for new response
      if (responseText) {
        triggerRefreshAnimation();
        // Add to conversation history with a single suggestion for support/sales Ask flow
        const suggestions = [{ id: 1, text: responseText, timestamp: Date.now() }];
        addConversationEntry(askText, responseText, suggestions);
      }
      
      if (speechActive && responseText) {
        // Try to get TTS audio for the response
        try {
          const ttsResult = await runTts({ text: responseText, voice: aiVoiceSelection });
          if (ttsResult.audioUrl) {
            // Ensure mic is off and no overlap with any existing audio
            stopAllInput();
            stopAllAudio();
            const audio = new Audio(ttsResult.audioUrl);
            currentAudioRef.current = audio;
            audio.onplay = () => {
            console.log("🔊 TTS audio started playing");
            setIsTtsPlaying(true);
          };
                        audio.onended = () => { 
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          isTtsPlayingRef.current = false;
                          currentAudioRef.current = null;
                          // Restart microphone after AI speech ends
                          restartMicrophone(); 
                        };
            audio.onpause = () => { /* keep state unless ended */ };
            audio.play().catch(e => {
              console.error("TTS audio playback failed:", e);
              speakText(responseText);
            });
          } else {
            speakText(responseText);
          }
        } catch (ttsError) {
          console.error("TTS failed:", ttsError);
          speakText(responseText);
        }
      }
      triggerConfetti();
      setAskText("");
      endSpeedTimer(speedTimer);
    } catch (e) {
      showToast("GPT failed");
    } finally {
      setIsAskGptProcessing(false);
    }
  };

  // removed unused handleGoodAnswer

  const handleOtherButton = (name) => {
    const answer = `${name} clicked. Showing dummy response.`;
    setPredatorAnswer(answer);
    triggerConfetti();
    showToast(`${name} executed`);
  };

  // Helper function to handle TTS consistently
  const speakText = (text) => {
    if (!speechActive || !text) return;
    
    // Stop mic input so we don't capture our own TTS
    stopAllInput();
    // Stop any currently playing audio/speech to avoid overlap
    stopAllAudio();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    
    // Track active state properly
    utter.onstart = () => {
      console.log("🔊 Browser TTS started playing");
      setIsTtsPlaying(true);
    };
    utter.onend = () => { 
      console.log("🔊 Browser TTS ended, streaming:", streaming);
      setIsTtsPlaying(false);
      // Restart microphone after AI speech ends
      restartMicrophone();
      setMicReactivated(true);
      setTimeout(() => setMicReactivated(false), 2000);
    };
    utter.onerror = () => {
      console.log("🔊 Browser TTS error occurred");
      setIsTtsPlaying(false);
      // Restart microphone after TTS error
      restartMicrophone();
    };
    
    window.speechSynthesis.speak(utter);
  };

  // Real-time speech recognition setup
  const startRealTimeRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === "German" ? "de-DE" : "en-US";
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log("🎤 Real-time speech recognition started - MIC IS NOW LISTENING");
        setStreaming(true);
        manuallyStoppedRef.current = false; // Reset manual stop flag when starting
        setIsVoiceActive(true); // Mic is listening
        
        // Only stop audio if TTS is not actively playing - allow TTS to continue
        console.log("🔇 Checking TTS state:", isTtsPlaying, "TTS ref:", isTtsPlayingRef.current, "Current audio:", currentAudioRef.current);
        if (!isTtsPlaying && !isTtsPlayingRef.current && !currentAudioRef.current) {
          console.log("🔇 No TTS playing - mic is ready for new input");
        } else {
          console.log("🔇 TTS is playing - mic will listen but won't interrupt until user speaks");
        }
        // Don't clear response here - let it stay visible until user speaks
        setTranscript("");
        
        showToast("🎤 Mic is listening - speak anytime! (Response stays visible until you speak)");
        console.log("✅ Mic state: isVoiceActive = true, streaming = true");
        console.log("🔄 Recognition instance:", recognition);
      };
      
      recognition.onresult = (event) => {
        // Don't process speech input if AI is currently speaking
        if (isTtsPlaying || isTtsPlayingRef.current || currentAudioRef.current) {
          console.log("🔇 AI is speaking - ignoring user input to prevent feedback");
          return;
        }
        
        console.log("🎤 Speech detected - processing input");
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Clear live STT immediately when new speech segment starts
        if (event.resultIndex === 0) {
          setLiveTranscript("");
          // Switch to live transcript view when user starts speaking
          setShowLiveTranscript(true);
        }
        
        // Clear predator answer as soon as user starts speaking and show processing
        if (event.resultIndex === 0 && predatorAnswer) {
          setPredatorAnswer("");
          // Keep coaching suggestions visible - don't clear them
          setResponseSpeed(null);
          setIsProcessingFast(true);
          // Clear current user input when new speech starts
          setCurrentUserInput("");
        }
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        // Update current user input for display
        if (finalTranscript) {
          setCurrentUserInput(finalTranscript.trim());
        } else if (interimTranscript) {
          setCurrentUserInput(interimTranscript);
        }
        
        // Update live transcript with both final and interim results
        if (finalTranscript) {
          // If TTS is playing and user is speaking, stop TTS immediately
          if (isTtsPlaying || isTtsPlayingRef.current || currentAudioRef.current) {
            console.log("🔇 User is speaking - stopping current TTS response");
            stopAllAudio();
          }
          
          // Use only new speech content, don't append to old transcript
          setTranscript(finalTranscript);
          // In support mode, show only current query; in sales mode, show accumulated
          if (modeRef.current === 'support') {
            setLiveTranscript(finalTranscript + interimTranscript);
          } else {
            setLiveTranscript(finalTranscript + interimTranscript);
          }
          
          // Debounce silence: after ~2s of no more finals, call GPT and update answer
          // Reduced from 3s to 2s for better responsiveness while still handling pauses
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          const captured = finalTranscript.trim();
          const speedTimer = startSpeedTimer();
          silenceTimeoutRef.current = setTimeout(async () => {
            try {
              setIsProcessing(true);
              // Stop any playing audio before processing new response
              stopAllAudio();
              
              // In support mode, keep the user's query visible in live transcript during processing
              if (modeRef.current === 'support') {
                setLiveTranscript(captured);
              }
              
              // Get responses from GPT based on current mode
              const currentMode = modeRef.current; // Use ref for immediate value
              const prompt = currentMode === "sales" 
                ? `Customer said: "${captured}". 

SALES MODE INSTRUCTIONS:
- Always professional, confident, and helpful
- Short and clear answers (max 2-3 sentences)
- Never sound unsure or negative
- Focus on benefits, value, and closing
- Handle objections directly (price, competition, timing)
- Always give 3 different responses
- Small Talk: Keep it polite and short (e.g., "I'm doing well, thanks for asking."). Then quickly guide the conversation back to the sales topic.

Generate 3 different persuasive sales responses that help close deals, address objections, and build value. Each response should be professional, confident, and focused on benefits and closing:`
                : `Customer said: "${captured}". 

SUPPORT MODE INSTRUCTIONS:
- Empathetic, problem-solving tone
- Give clear instructions or next steps
- Keep it simple and easy to understand
- Always give 1 response only

Generate 1 empathetic support response that solves problems, shows understanding, and provides clear solutions. Focus on problem resolution and customer satisfaction:`;
              
              const { responseText } = await runGpt({ transcript: prompt, mode: currentMode, conversationHistory });
              
              if (responseText) {
                // Parse response based on current mode
                let suggestions = [];
                
                if (currentMode === "sales") {
                  // For sales mode, check if we have multiple questions format
                  if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                    // Parse multiple questions format and group responses by type (A, B, C)
                    const questionBlocks = responseText.split(/\n\s*\n/).filter(block => block.trim());
                    
                    // Group responses by type across all questions
                    const responsesByType = { A: [], B: [], C: [] };
                    
                    questionBlocks.forEach((block, blockIndex) => {
                      const lines = block.split('\n').filter(line => line.trim());
                      
                      lines.forEach((line, lineIndex) => {
                        if (line.includes("Response A:") || line.includes("Response B:") || line.includes("Response C:")) {
                          const text = line.replace(/^Response [ABC]:\s*/, '').trim();
                          if (text) {
                            const responseType = line.includes("Response A:") ? "A" : line.includes("Response B:") ? "B" : "C";
                            responsesByType[responseType].push({
                              responseText: text
                            });
                          }
                        }
                      });
                    });
                    
                    // Create combined suggestions grouped by response type
                    suggestions = [];
                    ['A', 'B', 'C'].forEach(type => {
                      if (responsesByType[type].length > 0) {
                        // Combine all responses of this type (only answers, no questions)
                        const combinedText = responsesByType[type]
                          .map((item, index) => item.responseText)
                          .join('\n\n');
                        
                        suggestions.push({
                          id: suggestions.length + 1,
                          text: combinedText,
                          timestamp: Date.now(),
                          responseType: type,
                          isCombinedResponse: true
                        });
                      }
                    });
                    console.log(`🎯 Parsed ${suggestions.length} combined responses from ${questionBlocks.length} questions for sales mode`);
                  } else if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                    // Parse single question database responses
                    const responseLines = responseText.split('\n').filter(line => line.trim());
                    suggestions = responseLines.map((line, index) => {
                      const text = line.replace(/^Response [ABC]:\s*/, '').trim();
                      return {
                        id: index + 1,
                        text: text,
                        timestamp: Date.now()
                      };
                    });
                    console.log(`🎯 Parsed ${suggestions.length} database responses for sales mode`);
                  } else {
                    // Fallback to original parsing for non-database responses
                    const lines = responseText.split('\n').filter(line => line.trim());
                    suggestions = lines.slice(0, 3).map((suggestion, index) => ({
                      id: index + 1,
                      text: suggestion.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '').trim(),
                      timestamp: Date.now()
                    }));
                    console.log(`🎯 Generated ${suggestions.length} new responses for sales mode`);
                  }
                } else {
                  // Support mode - single response
                  suggestions = [{
                    id: 1,
                    text: responseText.trim(),
                    timestamp: Date.now()
                  }];
                  console.log(`🎯 Generated 1 response for support mode`);
                }
                
                console.log(`✅ Generated ${suggestions.length} suggestion(s):`, suggestions.map(s => s.text.substring(0, 50) + '...'));
                
                if (suggestions.length > 0) {
                  setCoachingSuggestions(suggestions);
                  // Switch to conversation history view when response arrives (except in support mode)
                  if (modeRef.current !== 'support') {
                    setShowLiveTranscript(false);
                  } else {
                    // In support mode, keep live transcript showing user's query
                    setShowLiveTranscript(true);
                  }
                  // Hide buttons when new response arrives
                  setShowCoachingButtons(false);
                  // Trigger button animation for new responses
                  setCoachingButtonsRefreshing(true);
                  setTimeout(() => setCoachingButtonsRefreshing(false), 1000);
                  // Show buttons after 3 seconds
                  setTimeout(() => setShowCoachingButtons(true), 3000);
                  // Set first actual response (not question header) as the main answer and auto-play it
                  const firstResponse = suggestions.find(s => !s.isQuestionHeader);
                  const firstAnswer = firstResponse ? firstResponse.text : suggestions[0].text;
                  setPredatorAnswer(firstAnswer);
                  triggerRefreshAnimation();
                  
                  // Add to conversation history with all A/B/C responses
                  addConversationEntry(captured, firstAnswer, suggestions);
                  
                  if (speechActive) {
                    // Use TTS with selected voice for better quality
                    try {
                      const ttsResult = await runTts({ text: firstAnswer, voice: aiVoiceSelection });
                      if (ttsResult.audioUrl) {
                        stopAllInput();
                        stopAllAudio();
                        const audio = new Audio(ttsResult.audioUrl);
                        currentAudioRef.current = audio;
                        
                        // Set TTS playing state immediately
                        console.log("🔊 Setting TTS playing state to true");
                        setIsTtsPlaying(true);
                        isTtsPlayingRef.current = true;
                        
                        // Add event listeners before playing
                        audio.addEventListener('play', () => {
                          console.log("🔊 TTS audio started playing (addEventListener)");
                          setIsTtsPlaying(true);
                          isTtsPlayingRef.current = true;
                        });
                        
                        audio.addEventListener('ended', () => {
                          console.log("🔊 TTS audio ended (addEventListener)");
                          setIsTtsPlaying(false);
                          isTtsPlayingRef.current = false;
                        });
                        
                        audio.onplay = () => {
                          console.log("🔊 TTS audio started playing (onplay)");
                          setIsTtsPlaying(true);
                          isTtsPlayingRef.current = true;
                        };
                        audio.onended = () => { 
                          console.log("🔊 TTS audio ended, streaming:", streaming);
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          currentAudioRef.current = null;
                          // Restart microphone after AI speech ends
                          restartMicrophone();
                          setMicReactivated(true);
                          setTimeout(() => setMicReactivated(false), 2000);
                        };
                        audio.play().catch(e => {
                          console.error("TTS audio playback failed:", e);
                          speakText(responseText);
                        });
                      } else {
                        speakText(responseText);
                      }
                    } catch (ttsError) {
                      console.error("TTS failed:", ttsError);
                      speakText(responseText);
                    }
                  }
                }
              }
            } catch (err) {
              console.error('GPT after-silence error:', err);
              showToast('GPT failed');
            } finally {
              setIsProcessing(false);
              endSpeedTimer(speedTimer);
            }
          }, 2000); // Reduced from 3000ms to 2000ms for better responsiveness while handling pauses
        } else if (interimTranscript) {
          // Show interim results - use only interim content
          setLiveTranscript(interimTranscript);
          // Clear any pending silence timeout when user is actively speaking
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          // Update current user input for display during interim results
          setCurrentUserInput(interimTranscript);
          // Note: Audio stopping is now handled at the beginning of onresult
        }
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          showToast("Speech recognition error");
        }
      };
      
      recognition.onend = () => {
        console.log("🎤 Recognition ended, streaming:", streaming, "manuallyStopped:", manuallyStoppedRef.current, "TTS playing:", isTtsPlaying || isTtsPlayingRef.current);
        // Only restart recognition if it wasn't manually stopped
        if (!manuallyStoppedRef.current) {
          setTimeout(() => {
            console.log("🔄 Restarting recognition...");
            try {
              // Create new recognition instance for restart
              const newRecognition = new SpeechRecognition();
              newRecognition.continuous = true;
              newRecognition.interimResults = true;
              newRecognition.lang = language === "German" ? "de-DE" : "en-US";
              newRecognition.maxAlternatives = 1;
              
              // Copy all event handlers
              newRecognition.onstart = recognition.onstart;
              newRecognition.onresult = recognition.onresult;
              newRecognition.onerror = recognition.onerror;
              newRecognition.onend = recognition.onend;
              
              recognitionRef.current = newRecognition;
              newRecognition.start();
              setIsVoiceActive(true); // Mic is listening after restart
              console.log("✅ Recognition restarted successfully - MIC IS ACTIVE");
            } catch (e) {
              console.log("❌ Recognition restart failed:", e);
              // Try again after a longer delay
              setTimeout(() => {
                startRealTimeRecognition();
              }, 1000);
            }
          }, 1000); // Quick restart to maintain continuous listening
        } else {
          console.log("🛑 Recognition not restarted - was manually stopped");
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsVoiceActive(true); // Mic is listening when starting
    } else {
      showToast("Speech recognition not supported in this browser");
    }
  };

  // Stop real-time recognition
  const stopRealTimeRecognition = () => {
    console.log("🛑 Stopping real-time recognition - MIC WILL BE OFF");
    manuallyStoppedRef.current = true; // Set flag to prevent auto-restart
    
    // Stop all audio playback immediately
    stopAllAudio();
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    // Stop all processing when mic is stopped
    setIsProcessing(false);
    setIsProcessingFast(false);
    setResponseSpeed(null);
    setStreaming(false);
    setLiveTranscript("");
    // Keep coaching suggestions visible - don't clear them
    lastProcessedTextRef.current = "";
    setIsVoiceActive(false);
    showToast("🛑 Mic stopped - click Start to listen again");
  };

  // Removed processForCoaching - now handled directly in silence timeout

  // Handle coaching suggestion selection
  const selectCoachingSuggestion = async (suggestion) => {
    setPredatorAnswer(suggestion.text);
    
    // Only update Predator Answer box, don't add to conversation history
    // Speak the suggestion if speech is active
    if (speechActive) {
      // Use TTS with selected voice for better quality
      try {
        const ttsResult = await runTts({ text: suggestion.text, voice: aiVoiceSelection });
        if (ttsResult.audioUrl) {
          stopAllInput();
          stopAllAudio();
          const audio = new Audio(ttsResult.audioUrl);
          currentAudioRef.current = audio;
          
          // Set TTS playing state immediately
          console.log("🔊 Setting TTS playing state to true");
          setIsTtsPlaying(true);
          isTtsPlayingRef.current = true;
          
          // Add event listeners before playing
          audio.addEventListener('play', () => {
            console.log("🔊 TTS audio started playing (addEventListener)");
            setIsTtsPlaying(true);
            isTtsPlayingRef.current = true;
          });
          
          audio.addEventListener('ended', () => {
            console.log("🔊 TTS audio ended (addEventListener)");
            setIsTtsPlaying(false);
            isTtsPlayingRef.current = false;
          });
          
          audio.onplay = () => {
            console.log("🔊 TTS audio started playing (onplay)");
            setIsTtsPlaying(true);
            isTtsPlayingRef.current = true;
          };
                        audio.onended = () => { 
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          isTtsPlayingRef.current = false;
                          currentAudioRef.current = null;
                          // Restart microphone after AI speech ends
                          restartMicrophone(); 
                        };
          audio.play().catch(e => {
            console.error("TTS audio playback failed:", e);
            speakText(suggestion.text);
          });
        } else {
          speakText(suggestion.text);
        }
      } catch (ttsError) {
        console.error("TTS failed:", ttsError);
        speakText(suggestion.text);
      }
    }
    
    triggerConfetti();
    showToast("Suggestion selected");
  };

  // Removed auto-selection useEffect - Good Answer A is now auto-selected in silence timeout

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

          <div className="flex gap-1 mb-2">
            <button
              className="cursor-pointer border rounded-lg px-2 py-1 shadow w-full sm:w-auto hover:bg-gray-100"
              onClick={startRealTimeRecognition}
              disabled={streaming}
            >
              {streaming ? (isProcessing ? '🔄 Processing...' : (isTtsPlaying || isTtsPlayingRef.current) ? '🔊 AI Speaking' : micReactivated ? '🎤 Ready!' : '🎤 Auto-Listening') : 'Start Live Mic'}
            </button>
            <button
              className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-2 py-1 rounded-lg shadow w-full sm:w-auto"
              onClick={stopRealTimeRecognition}
            >
              Stop Mic
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <label className="flex flex-col text-sm font-medium">
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 border rounded-lg px-2 py-1 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                <option>English</option>
                <option>German</option>
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium">
              Mode
              <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
                className="mt-1 border rounded-lg px-2 py-1 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
              {/* Removed descriptive helper text under mode */}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
            <label className="flex flex-col text-sm font-medium w-full sm:w-1/2">
              AI Voice Selection
              <select
                value={aiVoiceSelection}
                onChange={(e) => { setAiVoiceSelection(e.target.value); setVoice(e.target.value); }}
                className="mt-1 border rounded-lg px-2 py-1 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer bg-yellow-50"
              >
                {voices.map(v => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              {/* Removed selected voice helper text */}
            </label>

            <label className="flex items-center text-sm sm:text-base w-full sm:w-1/2 sm:justify-end cursor-pointer">
              <input
                type="checkbox"
                checked={speechActive}
                onChange={() => setSpeechActive(!speechActive)}
                className="mr-1 cursor-pointer"
              />
              Speech Output Active
            </label>
          </div>


          {/* Live Transcript or Conversation History Display */}
          <div ref={conversationBoxRef} className="w-full h-[60vh] border-2 border-[#D72638] rounded-2xl p-3 shadow-sm overflow-y-auto mb-3">
            {showLiveTranscript ? (
              /* Live Transcript View */
              <textarea
                value={liveTranscript}
                onChange={(e) => setLiveTranscript(e.target.value)}
                className="w-full h-full border-none resize-none focus:ring-0 outline-none bg-transparent text-black"
                placeholder={streaming ? (isProcessing ? "🔄 Processing your query..." : (isTtsPlaying || isTtsPlayingRef.current) ? "🔊 AI is speaking... Just speak to interrupt!" : "🎤 Always listening... Speak anytime! (Response stays visible)") : "Click 'Start Live Mic' to begin listening..."}
              />
            ) : (
              /* Conversation History View from localStorage */
              <>
                    {conversationHistory.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500 mb-2 font-semibold">
                      {mode === 'sales' ? '📈 Sales Mode History' : '🛠️ Support Mode History'}
                    </div>
                    {conversationHistory.map((entry) => (
                      <div key={entry.id} className="space-y-3">
                        {/* Customer Query */}
                        <div className="p-3 mb-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold mb-1">Customer:</div>
                          <div className="text-sm">{entry.userInput}</div>
                          <div className="text-xs text-gray-500 mt-2">{entry.timestamp}</div>
                        </div>
                        
                        {/* Response A, B, C - only show if they exist and are not empty */}
                        {entry.responseA && entry.responseA.trim() && (
                          <div className="p-3 mb-2 bg-blue-50 rounded-lg">
                            <div className="text-sm font-semibold mb-1">Response A:</div>
                            <div className="text-sm">{entry.responseA}</div>
                          </div>
                        )}
                        {entry.responseB && entry.responseB.trim() && (
                          <div className="p-3 mb-2 bg-green-50 rounded-lg">
                            <div className="text-sm font-semibold mb-1">Response B:</div>
                            <div className="text-sm">{entry.responseB}</div>
                          </div>
                        )}
                        {entry.responseC && entry.responseC.trim() && (
                          <div className="p-3 mb-2 bg-purple-50 rounded-lg">
                            <div className="text-sm font-semibold mb-1">Response C:</div>
                            <div className="text-sm">{entry.responseC}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Placeholder when no conversation */}
                {conversationHistory.length === 0 && (
                  <div className="text-gray-500 text-sm text-center py-8">
                    {streaming ? (isProcessing ? "🔄 Processing your query..." : (isTtsPlaying || isTtsPlayingRef.current) ? "🔊 AI is speaking... Just speak to interrupt!" : "🎤 Always listening... Speak anytime!") : `Click 'Start Live Mic' to begin ${mode === 'sales' ? 'sales' : 'support'} conversations...`}
                  </div>
                )}
              </>
            )}
          </div>
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

        {/* Predator Answer - Conversation History */}
        <div className="rounded-2xl p-4 bg-[#f5f5f5] shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg" style={orbitronStyle}>
              Predator Answer
            </h2>
            <div className="flex items-center gap-2">
              {isProcessingFast && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                  <span className="animate-spin">⚡</span>
                  Processing...
                </div>
              )}
              {responseSpeed && (
                <div className={`text-xs font-semibold px-2 py-1 rounded ${
                  responseSpeed < 3000 ? 'bg-green-100 text-green-700' : 
                  responseSpeed < 5000 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {responseSpeed}ms
                </div>
              )}
              {conversationHistory.length > 0 && (
                <button
                  onClick={clearConversationHistory}
                  className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
          
          {/* Current Response Display */}
          <div className={`w-full flex-1 border-2 border-[#D72638] rounded-2xl p-3 shadow-sm overflow-y-auto mb-3 max-h-[70vh] ${
            predatorAnswerRefreshing ? 'animate-pulse bg-yellow-50 border-yellow-400 shadow-lg' : ''
          }`}>
            {predatorAnswer ? (
              <div className="p-3">
                <div className="text-sm font-semibold mb-2">Current Response:</div>
                <div className="text-sm text-black">{predatorAnswer.replace(/^[ABC]:\s*/, '')}</div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">
                {streaming ? (isProcessing ? "" : (isTtsPlaying || isTtsPlayingRef.current) ? "" : "") : ""}
              </div>
            )}
          </div>
          {/* <div className="flex flex-col sm:flex-row gap-2 mb-3">
            {["Good Answer A", "Good Answer B", "Good Answer C"].map((btn) => (
              <button
                key={btn}
                className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg shadow flex-1 font-medium"
                onClick={() => handleGoodAnswer(btn)}
              >
                {btn}
              </button>
            ))}
          </div> */}
          <div className={`flex flex-col sm:flex-row gap-2 mb-0 sticky bottom-0 bg-[#f5f5f5] pt-2 z-10 transition-opacity duration-500 ${showCoachingButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {coachingSuggestions.length > 0 ? coachingSuggestions.map((suggestion, index) => {
              // Check if this is a combined response from multiple questions
              if (suggestion.isCombinedResponse) {
                return (
                <button
                    key={suggestion.id}
                  className={`cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-2 rounded-lg shadow flex-1 font-medium transition-all duration-500 text-center ${
                      coachingButtonsRefreshing ? 'animate-pulse bg-yellow-400 shadow-lg transform scale-105' : ''
                    }`}
                    onClick={() => selectCoachingSuggestion(suggestion)}
                  >
                    Good Answer {suggestion.responseType}
                  </button>
                );
              }
              
              // Check if this is a question header (fallback for other formats)
              if (suggestion.isQuestionHeader) {
                return (
                  <div key={suggestion.id} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                    <h3 className="font-semibold text-blue-800 text-sm">
                      {suggestion.text}
                    </h3>
                  </div>
                );
              }
              
              // Regular response button (fallback for single question format)
              const responseLabel = suggestion.responseType 
                ? `Good Answer ${suggestion.responseType}` 
                : mode === "sales" 
                  ? `Good Answer ${String.fromCharCode(65 + index)}` 
                  : "Support Response";
              
              return (
                <button
                  key={suggestion.id}
                  className={`cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-2 rounded-lg shadow flex-1 font-medium transition-all duration-500 text-center ${
                    coachingButtonsRefreshing ? 'animate-pulse bg-yellow-400 shadow-lg transform scale-105' : ''
                  }`}
                  onClick={() => selectCoachingSuggestion(suggestion)}
                >
                  {responseLabel}
                </button>
              );
            }) : (
              // Default buttons when no suggestions available
              <>
                <button
                  className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-2 rounded-lg shadow flex-1 font-medium transition-all duration-500 text-center"
                  onClick={() => {
                    setPredatorAnswer("Response A: This is a sample response for option A. Please speak to get AI-generated responses.");
                    showToast("Selected Response A");
                  }}
                >
                  Good Answer A
                </button>
                <button
                  className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-2 rounded-lg shadow flex-1 font-medium transition-all duration-500 text-center"
                  onClick={() => {
                    setPredatorAnswer("Response B: This is a sample response for option B. Please speak to get AI-generated responses.");
                    showToast("Selected Response B");
                  }}
                >
                  Good Answer B
                </button>
                <button
                  className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-2 rounded-lg shadow flex-1 font-medium transition-all duration-500 text-center"
                  onClick={() => {
                    setPredatorAnswer("Response C: This is a sample response for option C. Please speak to get AI-generated responses.");
                    showToast("Selected Response C");
                  }}
                >
                  Good Answer C
                </button>
              </>
            )}
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
          disabled={isAskGptProcessing}
          className={`flex-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none ${
            isAskGptProcessing ? 'bg-gray-200 cursor-not-allowed' : ''
          }`}
        />
        <button
          className={`cursor-pointer px-5 py-1.5 rounded-lg shadow font-medium w-full sm:w-auto ${
            isAskGptProcessing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-[#FFD700] hover:bg-[#FFD700]'
          }`}
          onClick={handleSubmitAsk}
          disabled={isAskGptProcessing}
        >
          {isAskGptProcessing && <span className="animate-spin mr-2">⏳</span>}
          {isAskGptProcessing ? 'Processing...' : 'Submit'}
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
