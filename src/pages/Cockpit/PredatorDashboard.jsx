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
  const [responseSpeed, setResponseSpeed] = useState(null);
  const [isProcessingFast, setIsProcessingFast] = useState(false);
  const manuallyStoppedRef = useRef(false);
  // STT accuracy tuners
  const sttModel = 'latest_long';
  const sttBoost = 16; // 10-20 is common
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

  // Function to stop all audio playback
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
    
    // DON'T set isVoiceActive to false - keep mic ready for next input
    console.log("🔇 All audio stopped - mic still ready");
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
    setCoachingSuggestions([]);
    setPredatorAnswer("");
    setTranscript("");
    setLiveTranscript("");
    showToast(`Switched to ${newMode === 'sales' ? 'Sales Mode (3 responses)' : 'Support Mode (1 response)'}`);
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

  // Handle mode changes - clear previous responses when mode switches
  useEffect(() => {
    if (mode !== previousMode) {
      console.log(`🔄 Mode changed from ${previousMode} to ${mode} - clearing previous responses`);
      modeRef.current = mode; // Update ref when mode changes
      setCoachingSuggestions([]);
      setPredatorAnswer("");
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
              sttModel
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
              
              const { responseText } = await runGpt({ transcript: prompt, mode: currentMode });
              
              if (responseText) {
                // Parse response based on current mode
                let suggestions = [];
                
                if (currentMode === "sales") {
                  // For sales mode, check if we have database responses (format: "Response A: ...")
                  if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                    // Parse database responses
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
                  // Set first answer as the main answer and auto-play it
                  const firstAnswer = suggestions[0].text;
                  setPredatorAnswer(firstAnswer);
                  triggerRefreshAnimation();                  
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
                          // DON'T set isVoiceActive to false - keep mic always on
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          currentAudioRef.current = null;
                          // Mic stays active - no need to restart recognition
                          console.log("🔊 TTS ended - mic remains active for next query");
                          setMicReactivated(true);
                          setTimeout(() => setMicReactivated(false), 2000);
                          showToast("🎤 Mic is ready - speak your next query!");
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
            const { responseText } = await runGpt({ transcript, mode });
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
      const { responseText } = await runGpt({ transcript: askText, mode });
      setPredatorAnswer(responseText);
      
      // Trigger refresh animation for new response
      if (responseText) {
        triggerRefreshAnimation();
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
                          // DON'T set isVoiceActive to false - keep mic always on
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          isTtsPlayingRef.current = false;
                          currentAudioRef.current = null; 
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
      // DON'T set isVoiceActive to false - keep mic always on
      setIsTtsPlaying(false);
      // Mic stays active - no need to restart recognition
      console.log("🔊 Browser TTS ended - mic remains active for next query");
      setMicReactivated(true);
      setTimeout(() => setMicReactivated(false), 2000);
      showToast("🎤 Mic is ready - speak your next query!");
    };
    utter.onerror = () => {
      console.log("🔊 Browser TTS error occurred");
      // DON'T set isVoiceActive to false - keep mic always on
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
        setLiveTranscript("Listening...");
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
        // Always process speech input - mic stays active during TTS
        console.log("🎤 Speech detected - processing input");
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Clear predator answer as soon as user starts speaking and show processing
        if (event.resultIndex === 0 && predatorAnswer) {
          setPredatorAnswer("");
          setCoachingSuggestions([]); // Clear previous suggestions when new speech starts
          setResponseSpeed(null);
          setIsProcessingFast(true);
        }
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
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
          setLiveTranscript(finalTranscript + interimTranscript);
          
          // Debounce silence: after ~3s of no more finals, call GPT and update answer
          // Increased from 1s to 3s to allow for longer queries
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
              
              const { responseText } = await runGpt({ transcript: prompt, mode: currentMode });
              
              if (responseText) {
                // Parse response based on current mode
                let suggestions = [];
                
                if (currentMode === "sales") {
                  // For sales mode, check if we have database responses (format: "Response A: ...")
                  if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                    // Parse database responses
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
                  // Set first answer as the main answer and auto-play it
                  const firstAnswer = suggestions[0].text;
                  setPredatorAnswer(firstAnswer);
                  triggerRefreshAnimation();
                  
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
                          // DON'T set isVoiceActive to false - keep mic always on
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          currentAudioRef.current = null;
                          // Mic stays active - no need to restart recognition
                          console.log("🔊 TTS ended - mic remains active for next query");
                          setMicReactivated(true);
                          setTimeout(() => setMicReactivated(false), 2000);
                          showToast("🎤 Mic is ready - speak your next query!");
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
          }, 3000); // Increased from 1000ms to 3000ms to allow for longer queries
        } else if (interimTranscript) {
          // Show interim results - use only interim content
          setLiveTranscript(interimTranscript);
          // Clear any pending silence timeout when user is actively speaking
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
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
    setStreaming(false);
    setLiveTranscript("");
    setCoachingSuggestions([]);
    lastProcessedTextRef.current = "";
    setIsVoiceActive(false);
    showToast("🛑 Mic stopped - click Start to listen again");
  };

  // Removed processForCoaching - now handled directly in silence timeout

  // Handle coaching suggestion selection
  const selectCoachingSuggestion = async (suggestion) => {
    setPredatorAnswer(suggestion.text);
    
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
                          // DON'T set isVoiceActive to false - keep mic always on
                          console.log("🔊 TTS audio ended");
                          setIsTtsPlaying(false);
                          isTtsPlayingRef.current = false;
                          currentAudioRef.current = null; 
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

          <div className="flex gap-2 mb-3">
            <button
              className={`cursor-pointer border rounded-lg px-4 py-1.5 shadow w-full sm:w-auto ${
                streaming ? (isProcessing ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : (isTtsPlaying || isTtsPlayingRef.current) ? 'bg-blue-100 border-blue-400 text-blue-700' : micReactivated ? 'bg-green-200 border-green-500 text-green-800 animate-pulse' : 'bg-green-100 border-green-400 text-green-700') : 'hover:bg-[#f5f5f5]'
              }`}
              onClick={startRealTimeRecognition}
              disabled={streaming}
            >
              {streaming ? (isProcessing ? '🔄 Processing...' : (isTtsPlaying || isTtsPlayingRef.current) ? '🔊 AI Speaking' : micReactivated ? '🎤 Ready!' : '🎤 Auto-Listening') : 'Start Live Mic'}
            </button>
            <button
              className="cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg shadow w-full sm:w-auto"
              onClick={stopRealTimeRecognition}
            >
              Stop Mic
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
                onChange={(e) => handleModeChange(e.target.value)}
                className={`mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer ${
                  mode === 'sales' ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
                }`}
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
              <span className={`text-xs mt-1 font-semibold ${
                mode === 'sales' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {mode === 'sales' ? '🎯 Sales Mode: 3 Responses, Professional & Confident' : '🛠️ Support Mode: 1 Response, Empathetic & Problem-Solving'}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
            <label className="flex flex-col text-sm font-medium w-full sm:w-1/2">
              AI Voice Selection
              <select
                value={aiVoiceSelection}
                onChange={(e) => { setAiVoiceSelection(e.target.value); setVoice(e.target.value); }}
                className="mt-1 border rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-[#FFD700] outline-none w-full cursor-pointer bg-yellow-50"
              >
                {voices.map(v => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <span className="text-xs text-gray-600 mt-1">Selected: {voices.find(v => v.id === aiVoiceSelection)?.label || aiVoiceSelection}</span>
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
            value={liveTranscript}
            onChange={(e) => setLiveTranscript(e.target.value)}
            className={`w-full flex-1 border-2 rounded-2xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-[#FFD700] outline-none overflow-y-auto ${
              streaming ? (isProcessing ? 'border-yellow-400 bg-yellow-50' : (isTtsPlaying || isTtsPlayingRef.current) ? 'border-blue-400 bg-blue-50' : 'border-green-400 bg-green-50') : 'border-[#D72638]'
            }`}
            placeholder={streaming ? (isProcessing ? "🔄 Processing your query..." : (isTtsPlaying || isTtsPlayingRef.current) ? "🔊 AI is speaking... Just speak to interrupt!" : "🎤 Always listening... Speak anytime! (Response stays visible)") : "Click 'Start Live Mic' to begin listening..."}
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
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg" style={orbitronStyle}>
              Predator Answer
            </h2>
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
          </div>
          <textarea
            value={predatorAnswer}
            onChange={(e) => setPredatorAnswer(e.target.value)}
            className={`w-full flex-1 border-2 border-[#D72638] rounded-2xl p-3 mb-3 shadow-sm resize-none focus:ring-2 focus:ring-[#FFD700] outline-none overflow-y-auto transition-all duration-500 ${
              predatorAnswerRefreshing ? 'animate-pulse bg-yellow-50 border-yellow-400 shadow-lg' : ''
            }`}
          />
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
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            {coachingSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                className={`cursor-pointer bg-[#FFD700] hover:bg-[#FFD700] px-4 py-1.5 rounded-lg shadow flex-1 font-medium transition-all duration-500 ${
                  coachingButtonsRefreshing ? 'animate-pulse bg-yellow-400 shadow-lg transform scale-105' : ''
                }`}
                onClick={() => selectCoachingSuggestion(suggestion)}
              >
                {mode === "sales" ? `Good Answer ${String.fromCharCode(65 + index)}` : "Support Response"}
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
