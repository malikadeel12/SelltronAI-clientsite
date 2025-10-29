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
import { fetchVoiceConfig, runGpt, runTts, runVoicePipeline, runStreamingStt, getCustomerData, updateCustomerData, extractCustomerInfo, searchCustomerByNameOrCompany, extractKeyHighlights } from "../../lib/api";
import CRMSidebar from "../../components/CRMSidebar";

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
  const [predatorAnswer, setPredatorAnswer] = useState("");
  const [askText, setAskText] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [transcribing, setTranscribing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mode, setMode] = useState("sales");
  const [previousMode, setPreviousMode] = useState("sales");
  const modeRef = useRef("sales");
  const [voices, setVoices] = useState([{ id: "voice_1", label: "Voice 1" }]);
  const [streaming, setStreaming] = useState(false);
  const streamingRef = useRef(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [coachingSuggestions, setCoachingSuggestions] = useState([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micReactivated, setMicReactivated] = useState(false);
  const isTtsPlayingRef = useRef(false);
  const isProcessingRef = useRef(false); // Track processing state to prevent interrupt
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
  // CRM Panel state
  const [crmSidebarVisible, setCrmSidebarVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [keyHighlights, setKeyHighlights] = useState({});
  const [crmLoading, setCrmLoading] = useState(false);
  const [userSelectingResponse, setUserSelectingResponse] = useState(false);
  // Sentiment analysis state
  const [sentimentData, setSentimentData] = useState(null);
  
  // STT accuracy tuners
  const sttModel = 'latest_long';
  const sttBoost = 16; // 10-20 is common
  // Guards and synchronous dedupe refs
  const sttRunningRef = useRef(false);
  const lastProcessedTranscriptRef = useRef("");
  const accumulatedTranscriptRef = useRef(""); // Track accumulated live transcript
  
  // Load conversation history from localStorage for both modes
  useEffect(() => {
    const savedHistory = localStorage.getItem('predatorConversationHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setConversationHistory(history);
        
        // Load all previous conversations into live transcript
        if (history.length > 0) {
          rebuildLiveTranscript(history);
          setShowLiveTranscript(true);
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setConversationHistory([]);
      }
    } else {
      setConversationHistory([]);
    }
  }, []);

  // Save conversation history to localStorage whenever it changes
  useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem('predatorConversationHistory', JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);
  
  // Auto-scroll Predator Answer box to bottom when new content arrives
  useEffect(() => {
    const box = conversationBoxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [conversationHistory, predatorAnswer, liveTranscript]);

  // Helper function to get sentiment emoji
  const getSentimentEmoji = (sentimentData) => {
    if (!sentimentData || !sentimentData.color) return '';
    const color = sentimentData.color.toLowerCase();
    if (color === 'green') return '🟢';
    if (color === 'red') return '🔴';
    if (color === 'yellow') return '🟡';
    return '';
  };

  // Helper function to format live transcript with bold labels
  const formatLiveTranscript = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line starts with "Customer:" or "Predator AI:"
      if (line.startsWith('Customer:')) {
        const parts = line.split('Customer:');
        if (parts.length > 1) {
          return (
            <div key={index} className="mb-2">
              <span className="font-bold">Customer:</span>
              <span>{parts[1]}</span>
            </div>
          );
        }
      } else if (line.startsWith('Predator AI:')) {
        const parts = line.split('Predator AI:');
        if (parts.length > 1) {
          return (
            <div key={index} className="mb-2">
              <span className="font-bold">Predator AI:</span>
              <span>{parts[1]}</span>
            </div>
          );
        }
      }
      
      // Regular line (empty line or other content)
      if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      
      return <div key={index} className="mb-2">{line}</div>;
    });
  };

  // Function to rebuild live transcript from conversation history
  const rebuildLiveTranscript = (history) => {
    if (history.length > 0) {
      const allConversations = history.map(entry => {
        const sentimentEmoji = getSentimentEmoji(entry.sentimentData);
        return `Customer: ${entry.userInput}${sentimentEmoji ? ' ' + sentimentEmoji : ''}\n\nPredator AI: ${entry.predatorResponse}`;
      }).join('\n\n');
      setLiveTranscript(allConversations);
    } else {
      setLiveTranscript("");
    }
    
    // Auto-scroll to bottom when transcript is rebuilt
    setTimeout(() => {
      const box = conversationBoxRef.current;
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    }, 50);
  };

  // Function to force auto-scroll to bottom
  const forceAutoScroll = () => {
    setTimeout(() => {
      const box = conversationBoxRef.current;
      if (box) {
        box.scrollTop = box.scrollHeight;
        console.log("🔄 Force auto-scroll triggered");
      }
    }, 100);
  };

  // Function to rebuild live transcript with current live query
  const rebuildLiveTranscriptWithQuery = (history, currentQuery, currentSentiment = null) => {
    console.log("🔄 Rebuilding live transcript with query:", currentQuery);
    
    if (history.length > 0) {
      const allConversations = history.map(entry => {
        const sentimentEmoji = getSentimentEmoji(entry.sentimentData);
        return `Customer: ${entry.userInput}${sentimentEmoji ? ' ' + sentimentEmoji : ''}\n\nPredator AI: ${entry.predatorResponse}`;
      }).join('\n\n');
      
      if (currentQuery && currentQuery.trim()) {
        const currentSentimentEmoji = getSentimentEmoji(currentSentiment);
        const fullTranscript = `${allConversations}\n\nCustomer: ${currentQuery}${currentSentimentEmoji ? ' ' + currentSentimentEmoji : ''}`;
        console.log("📝 Setting live transcript with history + current query");
        setLiveTranscript(fullTranscript);
      } else {
        console.log("📝 Setting live transcript with history only");
        setLiveTranscript(allConversations);
      }
    } else {
      if (currentQuery && currentQuery.trim()) {
        const currentSentimentEmoji = getSentimentEmoji(currentSentiment);
        const fullTranscript = `Customer: ${currentQuery}${currentSentimentEmoji ? ' ' + currentSentimentEmoji : ''}`;
        console.log("📝 Setting live transcript with current query only");
        setLiveTranscript(fullTranscript);
      } else {
        console.log("📝 Setting empty live transcript");
        setLiveTranscript("");
      }
    }
    
    // Force auto-scroll multiple times to ensure it works
    forceAutoScroll();
    setTimeout(() => forceAutoScroll(), 200);
    setTimeout(() => forceAutoScroll(), 500);
  };

  // Function to add conversation entry (both modes)
  const addConversationEntry = (userInput, predatorResponse, suggestions = [], sentiment = null) => {
    // Get Response A (default response)
    const responseA = suggestions.find(s => s.responseType === 'A')?.text || suggestions[0]?.text || '';
    const cleanResponseA = responseA.replace(/^[ABC]:\s*/, '');
    
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      userInput: userInput.trim(),
      predatorResponse: cleanResponseA.trim(),
      mode: mode, // Current mode (sales or support)
      sentimentData: sentiment || null // Store sentiment with each entry
    };
    setConversationHistory(prev => {
      const updated = [...prev, newEntry];
      // Save to unified key
      localStorage.setItem('predatorConversationHistory', JSON.stringify(updated));
      // Rebuild live transcript with complete history
      rebuildLiveTranscript(updated);
      return updated;
    });
  };

  // Function to clear conversation history
  const clearConversationHistory = () => {
    setConversationHistory([]);
    setLiveTranscript("");
    localStorage.removeItem('predatorConversationHistory');
    showToast('Conversation history cleared');
  };

  const defaultHints = useMemo(() => ([
    // Brand/Product terms (edit these for your domain)
    'Selltron', 'Predator', 'Cockpit', 'dashboard',
    // Sales/support phrases
    'pricing', 'subscription', 'free trial', 'enterprise plan',
    'customer support', 'technical issue', 'refund', 'upgrade', 'downgrade',
    // Common names/terms
    'Adeel', 'email', 'phone number', 'order number',
    // Email and contact info recognition
    'gmail.com', 'email', 'at gmail', 'gmail', 'gmail dot com',
    '@gmail.com', 'gmail.com', 'my email is', 'my name is', 'my phone is',
    // Numbers for better recognition
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    // Common phrases that help with recognition
    'innocent', 'boy', 'name', 'email address', 'contact', 'phone',
  ]), []);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mimeTypeRef = useRef('audio/webm;codecs=opus');
  const encodingRef = useRef('WEBM_OPUS');
  const processingTimeoutRef = useRef(null);
  const lastProcessedTextRef = useRef("");
  const currentAudioRef = useRef(null);
  const lastAutoSelectedSuggestionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastGptResponseTimeRef = useRef(0);
  const conversationBoxRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const googleSttIntervalRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // Stop any active microphone inputs (Google STT or manual recording)
  const stopAllInput = () => {
    // Stop Google STT interval if running
    if (googleSttIntervalRef.current) {
      clearInterval(googleSttIntervalRef.current);
      googleSttIntervalRef.current = null;
      console.log("🔇 Stopped Google STT interval to prevent AI voice transcription");
    }
    // Stop Web Speech API if running
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
        console.log("🔇 Stopped Web Speech API");
      } catch (e) {
        console.log("⚠️ Error stopping Web Speech API:", e.message);
      }
    }
    // Stop MediaRecorder recording if active
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      try { rec.stop(); } catch (_) {}
    }
    // Clear heartbeat timer
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    // DON'T set streaming to false - keep mic always on
    // Note: recording state not defined in this component
    // Don't set isVoiceActive to false - keep mic ready for next input
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  // CRM Functions
  const processCustomerInfo = async (transcript) => {
    const t = (transcript || "").trim();
    if (!t || t === lastProcessedTranscriptRef.current) {
      return; // Skip if same transcript or empty
    }
    
    console.log("🔍 CRM: Processing customer info for transcript:", t);
    lastProcessedTranscriptRef.current = t;
    
    try {
      // First, try to extract specific customer information from the conversation
      const { extractedData } = await extractCustomerInfo(transcript, conversationHistory);
      console.log("🔍 CRM: Extracted data:", extractedData);
      
      // Also extract key highlights from the conversation
      const { keyHighlights: extractedHighlights } = await extractKeyHighlights(transcript, conversationHistory);
      if (extractedHighlights && Object.keys(extractedHighlights).length > 0) {
        setKeyHighlights(extractedHighlights);
        console.log("🔍 CRM: Extracted key highlights:", extractedHighlights);
      }
      
      // Only proceed if we found actual customer information
      if (!extractedData || (!extractedData.email && !extractedData.name && !extractedData.phone && !extractedData.company)) {
        console.log("ℹ️ CRM: No customer information found in transcript - skipping CRM processing");
        return;
      }
      
      console.log("✅ CRM: Customer information found - proceeding with CRM processing");
      
      // Silent processing - only show loading if we don't already have customer data AND this is the first time
      if (!customerData && !crmSidebarVisible) {
        setCrmLoading(true);
      }
      
      let customerFound = false;
      
      // Method 1: Try traditional extraction (email, name, phone, company)
      if (extractedData && (extractedData.email || extractedData.name || extractedData.phone || extractedData.company)) {
        console.log("✅ CRM: Customer information found via extraction");
        
        // Only show HubSpot data, not extracted data
        if (extractedData.email) {
          // Try to get existing customer data from HubSpot by email
          try {
            console.log("🔍 CRM: Searching HubSpot by email:", extractedData.email);
            const { customerData: existingData } = await getCustomerData(extractedData.email);
            if (existingData) {
              console.log("✅ CRM: Customer found in HubSpot, opening sidebar");
              setCrmSidebarVisible(true);
              customerFound = true;
              
              // Only use HubSpot data - do not merge with extracted data
              // This ensures CRM sidebar shows only HubSpot data as requested
              setCustomerData(existingData);
              showToast("Customer data loaded from HubSpot CRM");
              console.log("✅ CRM: Customer data loaded from HubSpot:", existingData);
              
              // Update customer data in HubSpot with new information if any fields were updated
              if (extractedData.name || extractedData.phone || extractedData.company) {
                try {
                  console.log("🔄 CRM: Updating customer data in HubSpot with new information...");
                  await updateCustomerData(extractedData);
                  showToast("Customer data updated in HubSpot CRM");
                  console.log("✅ CRM: Customer data updated in HubSpot successfully");
                } catch (updateError) {
                  console.error("Error updating customer in HubSpot:", updateError);
                  console.log("ℹ️ CRM: HubSpot update failed, but data is still displayed correctly");
                }
              }

            } else {
              console.log("ℹ️ CRM: Customer not found in HubSpot via email - not showing sidebar");
              // Don't show sidebar or extracted data if customer not found in HubSpot
            }
          } catch (error) {
            console.error("Error fetching customer from HubSpot:", error);
            console.log("ℹ️ CRM: HubSpot search failed - not showing sidebar");
            // Don't show sidebar if HubSpot search fails
          }
        } else if (extractedData.name || extractedData.company) {
          // Try to search HubSpot by name and company when email is not available
          try {
            console.log("🔍 CRM: Searching HubSpot by name/company...");
            const searchResult = await searchCustomerByNameOrCompany(extractedData.name, extractedData.company);
            if (searchResult && searchResult.customers && searchResult.customers.length > 0) {
              console.log("✅ CRM: Customer found in HubSpot via name/company, opening sidebar");
              setCrmSidebarVisible(true);
              customerFound = true;
              
              const existingCustomer = searchResult.customers[0];
              // Only use HubSpot data - do not merge with extracted data
              // This ensures CRM sidebar shows only HubSpot data as requested
              setCustomerData(existingCustomer);
              showToast("Customer data loaded from HubSpot CRM");
              console.log("✅ CRM: Customer data loaded from HubSpot:", existingCustomer);
              
              // Update customer data in HubSpot with new information if any fields were updated
              if (extractedData.name || extractedData.phone || extractedData.company) {
                try {
                  console.log("🔄 CRM: Updating customer data in HubSpot with new information...");
                  await updateCustomerData(extractedData);
                  showToast("Customer data updated in HubSpot CRM");
                  console.log("✅ CRM: Customer data updated in HubSpot successfully");
                } catch (updateError) {
                  console.error("Error updating customer in HubSpot:", updateError);
                  console.log("ℹ️ CRM: HubSpot update failed, but data is still displayed correctly");
                }
              }

            } else {
              console.log("ℹ️ CRM: Customer not found in HubSpot via name/company - not showing sidebar");
              // Don't show sidebar or extracted data if customer not found in HubSpot
            }
          } catch (error) {
            console.error("Error searching customer in HubSpot:", error);
            console.log("ℹ️ CRM: HubSpot search failed - not showing sidebar");
            // Don't show sidebar if HubSpot search fails
          }
        }
      }
      
      
      if (!customerFound) {
        console.log("ℹ️ CRM: No customer information found in transcript");
        setCustomerData(null);
        
      }
      
    } catch (error) {
      console.error("Error processing customer info:", error);
      showToast("Failed to process customer information");
      setCustomerData(null);
    } finally {
      setCrmLoading(false);
    }
  };

  


  // Function to stop all audio playback and mute microphone during AI speech
  const stopAllAudio = () => {
    console.log("🔇 Stopping all audio playback");
    
    // Stop any playing audio immediately
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Mute microphone during AI speech to prevent feedback loop
    if (googleSttIntervalRef.current) {
      try {
        clearInterval(googleSttIntervalRef.current);
        googleSttIntervalRef.current = null;
        console.log("🔇 Google STT interval stopped during AI speech");
      } catch (e) {
        console.log("🔇 Google STT interval already stopped");
      }
    }
    
    console.log("🔇 All audio stopped - mic muted to prevent feedback");
  };

  // Function to restart microphone after AI speech ends
  const restartMicrophone = () => {
    console.log("🎤 Restarting microphone after AI speech ended");
    console.log("🔍 Current states:", { 
      streaming: streamingRef.current, 
      isTtsPlaying, 
      isTtsPlayingRef: isTtsPlayingRef.current, 
      currentAudio: !!currentAudioRef.current,
      manuallyStopped: manuallyStoppedRef.current
    });
    
    // Only restart if mic wasn't manually stopped and no audio is playing
    if (!manuallyStoppedRef.current && !isTtsPlaying && !isTtsPlayingRef.current && !currentAudioRef.current) {
      setTimeout(() => {
        // Double-check that no audio is playing before restarting
        if (!isTtsPlaying && !isTtsPlayingRef.current && !currentAudioRef.current && !manuallyStoppedRef.current) {
          console.log("🎤 All conditions met - restarting microphone");
          // Ensure streaming ref is set to true before starting recognition
          streamingRef.current = true;
          startGoogleSttRecognition();
          showToast("🎤 Mic is ready - speak your next query!");
        } else {
          console.log("🔇 Audio still playing or mic was stopped - not restarting microphone");
        }
      }, 300); // Reduced delay from 1000ms to 300ms for faster restart
    } else {
      console.log("🔇 Not restarting microphone - conditions not met:", { 
        streaming: streamingRef.current, 
        isTtsPlaying, 
        isTtsPlayingRef: isTtsPlayingRef.current, 
        currentAudio: !!currentAudioRef.current,
        manuallyStopped: manuallyStoppedRef.current
      });
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

  // Clean up old localStorage keys on component mount
  useEffect(() => {
    // Remove old localStorage keys
    localStorage.removeItem('predatorConversationHistory_sales');
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
      // Clear heartbeat timer on unmount
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, []);

  // Legacy recording functions removed - Current flow uses Google STT (startGoogleSttRecognition)

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
      const { responseText } = await runGpt({ transcript: askText, mode, conversationHistory, language: language === "German" ? "de-DE" : "en-US" });
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
      
      // Don't auto-play here - let the main response handling logic handle it
      // if (speechActive && responseText) {
      //   // Try to get TTS audio for the response (only first individual response)
      //   const firstResponse = getFirstIndividualResponse(responseText);
      //   try {
      //     const ttsResult = await runTts({ text: firstResponse, voice: aiVoiceSelection });
      //     if (ttsResult.audioUrl) {
      //       // Ensure mic is off and no overlap with any existing audio
      //       stopAllInput();
      //       stopAllAudio();
      //       const audio = new Audio(ttsResult.audioUrl);
      //       currentAudioRef.current = audio;
      //       audio.onplay = () => {
      //       console.log("🔊 TTS audio started playing");
      //       setIsTtsPlaying(true);
      //     };
      //                   audio.onended = () => { 
      //                     console.log("🔊 TTS audio ended");
      //                     setIsTtsPlaying(false);
      //                     isTtsPlayingRef.current = false;
      //                     currentAudioRef.current = null;
      //                     // Restart microphone after AI speech ends
      //                     restartMicrophone(); 
      //                   };
      //       audio.onpause = () => { /* keep state unless ended */ };
      //       audio.play().catch(e => {
      //         console.error("TTS audio playback failed:", e);
      //         speakText(firstResponse);
      //       });
      //     } else {
      //       speakText(firstResponse);
      //     }
      //   } catch (ttsError) {
      //     console.error("TTS failed:", ttsError);
      //     speakText(firstResponse);
      //   }
      // }
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



  // Helper function to handle TTS consistently - Google Cloud TTS only
  // Note: This is only used for manual/coaching button TTS, not for auto-response
  const speakText = async (text) => {
    if (!speechActive || !text) return;
    
    console.log("🔇 Starting Google Cloud TTS - stopping all input to prevent AI voice transcription");
    // Stop mic input so we don't capture our own TTS
    stopAllInput();
    // Stop any currently playing audio/speech to avoid overlap
    stopAllAudio();
    
    try {
      const ttsResult = await runTts({ text, voice: aiVoiceSelection, language: language === "German" ? "de-DE" : "en-US" });
      if (ttsResult.audioUrl) {
        const audio = new Audio(ttsResult.audioUrl);
        currentAudioRef.current = audio;
        
        setIsTtsPlaying(true);
        isTtsPlayingRef.current = true;
        
        audio.onplay = () => {
          console.log("🔊 Google Cloud TTS started playing");
          setIsTtsPlaying(true);
          isTtsPlayingRef.current = true;
        };
        audio.onended = () => { 
          console.log("🔊 Google Cloud TTS ended, streaming:", streaming);
          setIsTtsPlaying(false);
          isTtsPlayingRef.current = false;
          currentAudioRef.current = null;
          // Restart microphone after AI speech ends
          restartMicrophone();
          setMicReactivated(true);
          setTimeout(() => setMicReactivated(false), 2000);
        };
        audio.onerror = () => {
          console.log("🔊 Google Cloud TTS error occurred");
          setIsTtsPlaying(false);
          isTtsPlayingRef.current = false;
          currentAudioRef.current = null;
          // Restart microphone after TTS error
          restartMicrophone();
        };
        
        audio.play().catch(e => {
          console.error("Google Cloud TTS audio playback failed:", e);
          setIsTtsPlaying(false);
          isTtsPlayingRef.current = false;
          currentAudioRef.current = null;
          restartMicrophone();
        });
      } else {
        console.error("Google Cloud TTS failed - no audio URL returned");
        setIsTtsPlaying(false);
        isTtsPlayingRef.current = false;
        restartMicrophone();
      }
    } catch (error) {
      console.error("Google Cloud TTS failed:", error);
      setIsTtsPlaying(false);
      isTtsPlayingRef.current = false;
      restartMicrophone();
    }
  };

  // Google STT speech recognition setup
  const startGoogleSttRecognition = () => {
    console.log("🎤 Starting Google STT recognition...");
    
    // Reset manual stop flag when explicitly starting recognition
    manuallyStoppedRef.current = false;
    console.log("🎤 Reset manuallyStoppedRef to false - allowing restart");
    
    // Prevent duplicate starts if STT loop is already running
    if (sttRunningRef.current) {
      console.log("🎤 STT already running - skipping start");
      return;
    }
    
    // First, stop any existing recognition to prevent conflicts
    if (googleSttIntervalRef.current) {
      console.log("🛑 Stopping existing Google STT before starting new one");
      clearInterval(googleSttIntervalRef.current);
      googleSttIntervalRef.current = null;
    }
    
    // Clear any existing heartbeat timer
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    // Start Google STT recognition
    setStreaming(true);
    streamingRef.current = true;
    manuallyStoppedRef.current = false;
    setIsVoiceActive(true);
    
    // Start heartbeat mechanism to ensure continuous listening
    heartbeatTimerRef.current = setInterval(() => {
      if (!manuallyStoppedRef.current && streamingRef.current) {
        // Only restart if STT loop is NOT running
        if (!sttRunningRef.current) {
          console.log("🔄 Heartbeat detected inactive Google STT - restarting");
          startGoogleSttRecognition();
        }
      }
    }, 1000); // Check every 1 second
    
    console.log("🔇 Checking TTS state:", isTtsPlaying, "TTS ref:", isTtsPlayingRef.current, "Current audio:", currentAudioRef.current);
    if (!isTtsPlaying && !isTtsPlayingRef.current && !currentAudioRef.current) {
      console.log("🔇 No TTS playing - mic is ready for new input");
    } else {
      console.log("🔇 TTS is playing - mic will listen but won't interrupt until user speaks");
    }
    
    setTranscript("");
    showToast("🎤 Google STT is listening - speak anytime! (Response stays visible until you speak)");
    console.log("✅ Mic state: isVoiceActive = true, streaming = true");
    
    // Start continuous Google STT processing
    startContinuousGoogleStt();
  };

  // Continuous Google STT processing
  const startContinuousGoogleStt = async () => {
    if (sttRunningRef.current) {
      return;
    }
    sttRunningRef.current = true;
    console.log("🎤 Starting continuous Google STT processing...");
    
    // Record audio continuously and process with Google STT
    const recordAndProcess = async () => {
      try {
        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000
          } 
        });
        
        // Choose MIME type
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
            mimeType = '';
            encodingRef.current = 'WEBM_OPUS';
          }
        }
        mimeTypeRef.current = mimeType || 'audio/webm';
        
        const mediaRecorder = new MediaRecorder(stream, mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined);
        const recordedChunks = [];
        let processedSpeech = false; // Track if speech was actually processed
        let isProcessingInOnstop = false; // Prevent duplicate onstop processing
        let streamingInProgress = false; // Track streaming state
        
        mediaRecorder.ondataavailable = async (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
            // Note: Individual chunks are too fragmented for STT
            // We'll show transcript only after complete recording
          }
        };
        
        mediaRecorder.onstop = async () => {
          // Prevent duplicate onstop calls - MediaRecorder can fire onstop multiple times
          if (isProcessingInOnstop || processedSpeech) {
            console.log("⚠️ onstop already processing or processed, skipping duplicate:", { isProcessingInOnstop, processedSpeech });
            return;
          }
          
          isProcessingInOnstop = true; // Mark as processing
          
          try {
            // Prevent duplicate processing - if already processed, skip
            if (processedSpeech) {
              console.log("⚠️ Audio already processed, skipping duplicate processing");
              isProcessingInOnstop = false;
              return;
            }
            
            // Only process if we actually detected speech and have audio chunks
            if (!speechDetected) {
              console.log("⚠️ No speech detected - skipping processing");
              processedSpeech = true; // Mark as processed to allow next iteration
              return;
            }
            
            if (recordedChunks.length > 0) {
              const blob = new Blob(recordedChunks, { type: mimeTypeRef.current || 'audio/webm' });
              
              // Skip if blob size is too small (likely empty or noise)
              if (blob.size < 1000) {
                console.log("⚠️ Audio too small, likely no speech - skipping:", blob.size);
                processedSpeech = true;
                return;
              }
              
              // Don't process speech input if AI is currently speaking
              if (isTtsPlaying || isTtsPlayingRef.current || currentAudioRef.current) {
                console.log("🔇 AI is speaking - ignoring audio input to prevent AI voice transcription");
                processedSpeech = true;
                return;
              }
              
              // Mark as processing to prevent duplicate calls
              processedSpeech = true;
              
              // Process with complete pipeline (STT -> GPT -> TTS)
              // Pipeline uses streaming STT internally, so we get live transcript in one call
              let pipelineResult;
              try {
                console.log("🎤 Sending audio to backend, size:", blob.size);
                pipelineResult = await runVoicePipeline({
                  audioBlob: blob,
                  mode: modeRef.current,
                  voice: aiVoiceSelection,
                  language: language === "German" ? "de-DE" : "en-US",
                  encoding: encodingRef.current,
                  hints: defaultHints,
                  boost: sttBoost,
                  sttModel,
                  conversationHistory
                });
              } catch (pipelineError) {
                console.error("❌ Pipeline error:", pipelineError);
                showToast("⚠️ Voice pipeline error - Check Google Cloud STT configuration");
                // Already marked as processed above
                return; // Stop processing and don't add to history
              }
              
              const { transcript, responseText, audioUrl, keyHighlights, sentimentData, error, message } = pipelineResult || {};
              
              // Handle server-side error response
              if (error || message) {
                console.warn("⚠️ Pipeline returned error:", error || message);
                showToast(`⚠️ ${message || error || "Voice processing failed"}`);
                // Already marked as processed above
                return; // Don't process error as transcript
              }
              
              // Skip if no transcript at all
              if (!transcript || !transcript.trim()) {
                console.warn("⚠️ No transcript received, skipping");
                // Already marked as processed above
                return;
              }
              
              if (transcript && transcript.trim()) {
                console.log("🎤 Google STT final result:", transcript);
                
                // Skip processing if this is an error message or empty detection (prevents infinite loop)
                const isErrorTranscript = transcript.includes("Google Cloud Speech-to-Text is not configured") ||
                                         transcript.includes("AI response generation failed") ||
                                         transcript.toLowerCase().includes("error") ||
                                         transcript.toLowerCase().includes("failed") ||
                                         transcript.toLowerCase().includes("no speech detected") ||
                                         transcript.toLowerCase().trim() === "" ||
                                         !speechDetected; // Don't process if no speech was detected
                
                if (isErrorTranscript) {
                  console.warn("⚠️ Skipping error/empty message to prevent loop:", transcript);
                  if (!transcript.toLowerCase().includes("no speech detected")) {
                    showToast("⚠️ Google Cloud STT configuration issue");
                  }
                  // Already marked as processed above
                  return; // Don't process or add to history
                }
                
                // Update with final transcript - show actual text in live transcript
                setCurrentUserInput(transcript.trim());
                setTranscript(transcript);
                // Update sentiment data first, then rebuild transcript with sentiment
                if (sentimentData) {
                  setSentimentData(sentimentData);
                  console.log("🎨 Sentiment updated:", sentimentData);
                }
                rebuildLiveTranscriptWithQuery(conversationHistory, transcript, sentimentData);
                console.log("📝 Live transcript updated with actual text:", transcript);
                
                // Process response from pipeline
                if (responseText && responseText.trim()) {
                    const speedTimer = startSpeedTimer();
                  try {
                    setIsProcessing(true);
                    isProcessingRef.current = true; // Track in ref
                    stopAllAudio();
                    // Show processing status (without sentiment emoji during processing)
                    rebuildLiveTranscriptWithQuery(conversationHistory, `🔄 Processing: ${transcript.trim()}`, null);
                    setCurrentUserInput("");
                    
                    if (responseText) {
                      // Sentiment data removed
                      
                      // Parse response based on current mode (same logic as before)
                      let suggestions = [];
                      
                      if (modeRef.current === "sales") {
                        if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                          const questionBlocks = responseText.split(/\n\s*\n/).filter(block => block.trim());
                          const responsesByType = { A: [], B: [], C: [] };
                          
                          questionBlocks.forEach((block) => {
                            const lines = block.split('\n').filter(line => line.trim());
                            lines.forEach((line) => {
                              if (line.includes("Response A:") || line.includes("Response B:") || line.includes("Response C:")) {
                                const text = line.replace(/^Response [ABC]:\s*/, '').trim();
                                if (text) {
                                  const responseType = line.includes("Response A:") ? "A" : line.includes("Response B:") ? "B" : "C";
                                  responsesByType[responseType].push({ responseText: text });
                                }
                              }
                            });
                          });
                          
                          suggestions = [];
                          ['A', 'B', 'C'].forEach(type => {
                            if (responsesByType[type].length > 0) {
                              const combinedText = responsesByType[type]
                                .map(item => item.responseText)
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
                        } else if (responseText.includes("Response A:") && responseText.includes("Response B:") && responseText.includes("Response C:")) {
                          const responseLines = responseText.split('\n').filter(line => line.trim());
                          suggestions = responseLines.map((line, index) => {
                            const text = line.replace(/^Response [ABC]:\s*/, '').trim();
                            const responseType = line.includes("Response A:") ? "A" : line.includes("Response B:") ? "B" : "C";
                            return {
                              id: index + 1,
                              text: text,
                              timestamp: Date.now(),
                              responseType: responseType
                            };
                          });
                        } else {
                          const lines = responseText.split('\n').filter(line => line.trim());
                          suggestions = lines.slice(0, 3).map((suggestion, index) => ({
                            id: index + 1,
                            text: suggestion.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '').trim(),
                            timestamp: Date.now(),
                            responseType: String.fromCharCode(65 + index)
                          }));
                        }
                      } else {
                        suggestions = [{
                          id: 1,
                          text: responseText.trim(),
                          timestamp: Date.now()
                        }];
                      }
                      
                      if (suggestions.length > 0) {
                        setCoachingSuggestions(suggestions);
                        setShowLiveTranscript(true);
                        setShowCoachingButtons(false);
                        setCoachingButtonsRefreshing(true);
                        setTimeout(() => setCoachingButtonsRefreshing(false), 1000);
                        setTimeout(() => setShowCoachingButtons(true), 3000);
                        
                        const responseA = suggestions.find(s => s.responseType === 'A');
                        const predatorAnswerText = responseA ? responseA.text : "Response A not found";
                        setPredatorAnswer(predatorAnswerText);
                        
                        triggerRefreshAnimation();
                        
                        // Add to conversation history - this will automatically rebuild live transcript
                        addConversationEntry(transcript, predatorAnswerText, suggestions, sentimentData);
                        
                        // Ensure live transcript shows after state update
                        setTimeout(() => {
                          setShowLiveTranscript(true);
                        }, 200);
                        
                        processCustomerInfo(transcript);
                        
                        // Auto-play ONLY Response A TTS from pipeline (single audio, no fallback)
                        if (speechActive && !userSelectingResponse && audioUrl) {
                          console.log("🎵 FRONTEND: Playing Response A TTS audio from pipeline");
                          
                          // Ensure only ONE audio plays - stop all other audio
                          stopAllInput();
                          stopAllAudio();
                          
                          // Create single audio instance
                          const audio = new Audio(audioUrl);
                          currentAudioRef.current = audio;
                          
                          setIsTtsPlaying(true);
                          isTtsPlayingRef.current = true;
                          
                          audio.onplay = () => {
                            console.log("🎵 FRONTEND: Response A TTS started playing");
                            setIsTtsPlaying(true);
                            isTtsPlayingRef.current = true;
                          };
                          
                          audio.onended = () => { 
                            console.log("🎵 FRONTEND: Response A TTS finished playing");
                            setIsTtsPlaying(false);
                            isTtsPlayingRef.current = false;
                            currentAudioRef.current = null;
                            restartMicrophone();
                            setMicReactivated(true);
                            setTimeout(() => setMicReactivated(false), 2000);
                          };
                          
                          audio.onerror = () => {
                            console.error("❌ FRONTEND: Response A TTS audio playback error");
                            setIsTtsPlaying(false);
                            isTtsPlayingRef.current = false;
                            currentAudioRef.current = null;
                            restartMicrophone();
                          };
                          
                          // Play single audio only
                          audio.play().catch((e) => {
                            console.error("❌ FRONTEND: Response A TTS audio playback failed:", e);
                            setIsTtsPlaying(false);
                            isTtsPlayingRef.current = false;
                            currentAudioRef.current = null;
                            restartMicrophone();
                          });
                        } else {
                          console.log("⚠️ FRONTEND: Skipping TTS - conditions not met:", {
                            speechActive,
                            userSelectingResponse,
                            hasAudioUrl: !!audioUrl
                          });
                        }
                      }
                    }
                    } catch (err) {
                      console.error('Pipeline processing error:', err);
                      showToast('Pipeline failed');
                    } finally {
                      setIsProcessing(false);
                      isProcessingRef.current = false; // Update ref
                      endSpeedTimer(speedTimer);
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Google STT processing error:", error);
            } finally {
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop());
              processedSpeech = true; // Mark as processed
              isProcessingInOnstop = false; // Reset processing flag
            }
        };
        
        // Wait for speech to be detected before starting recording
        let lastAudioTime = Date.now();
        let speechDetected = false;
        let silenceDetected = false;
        let isRecording = false;
        let lastLogTime = 0;
        const LOG_INTERVAL = 2000; // Log every 2 seconds to reduce spam
        
        // Create audio context to analyze volume
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        // Function to check for speech detection and silence
        const checkSpeechAndSilence = () => {
          if (silenceDetected || !streamingRef.current) return;
          
          // Don't start new recording if processing is in progress
          if (isProcessingRef.current) {
            requestAnimationFrame(checkSpeechAndSilence);
            return;
          }
          
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          // Detect speech (lower threshold to catch softer speech - reduced from 35 to 28 for better sensitivity)
          if (average > 28 && !speechDetected && !isRecording) {
            speechDetected = true;
            isRecording = true;
            lastAudioTime = Date.now();
            console.log("🎤 Speech detected, starting recording...");
            // Clear previous live transcript to start fresh
            setCurrentUserInput("");
            accumulatedTranscriptRef.current = ""; // Reset accumulated transcript
            
            // Start Web Speech API for live word-by-word transcription
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = language === "German" ? "de-DE" : "en-US";
              
              recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                  const transcript = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                  } else {
                    interimTranscript += transcript;
                  }
                }
                
                const fullTranscript = finalTranscript + interimTranscript;
                if (fullTranscript.trim()) {
                  console.log("📝 Web Speech API live transcript:", fullTranscript);
                  setCurrentUserInput(fullTranscript.trim());
                  rebuildLiveTranscriptWithQuery(conversationHistory, fullTranscript.trim());
                }
              };
              
              recognition.onerror = (event) => {
                console.log("⚠️ Web Speech API error:", event.error);
              };
              
              recognition.onend = () => {
                console.log("🎤 Web Speech API ended");
                speechRecognitionRef.current = null;
              };
              
              recognition.start();
              speechRecognitionRef.current = recognition; // Store for cleanup
              console.log("🎤 Web Speech API started for live transcription");
            }
            
            // Start recording with 1000ms timeslice for better STT results
            mediaRecorder.start(1000);
          }
          
          // If already recording, track audio and silence
          if (isRecording) {
            // If audio is detected, update last audio time
            // Lower threshold (30 instead of 35) to catch softer speech and pauses
            if (average > 30) {
              lastAudioTime = Date.now();
              // Note: Live transcript will be updated by streaming STT in mediaRecorder.ondataavailable
              // No need to show "Listening" placeholder - just let the actual transcription flow
            } else {
              // Natural silence pause detection - 2.5 seconds (2500ms) for natural speech pauses
              const silenceDuration = Date.now() - lastAudioTime;
              if (silenceDuration >= 2500 && !silenceDetected) {
                console.log("🔇 2.5 seconds of silence detected, stopping recording");
                silenceDetected = true;
                isRecording = false;
                // Prevent multiple stop calls
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
                // Only close audio context once
                try {
                  audioContext.close();
                } catch (e) {
                  // Audio context might already be closed
                }
                return;
              }
            }
          }
          
          // Continue checking if still active
          if (!silenceDetected && streamingRef.current) {
            requestAnimationFrame(checkSpeechAndSilence);
          }
        };
        
        console.log("🎤 Waiting for speech to start recording...");
        
        // Start checking for speech
        setTimeout(() => checkSpeechAndSilence(), 100);
        
        // Track completion state
        let completed = false;
        
        // Note: No time limits - recording stops naturally after 2.5 seconds of silence only
        
        // Wait for onstop to complete or timeout
        await new Promise((resolve) => {
          const checkComplete = () => {
            if (completed || processedSpeech || (silenceDetected && !isRecording)) {
              console.log("✅ Recording cycle complete, ready for next query");
              resolve();
            } else {
              setTimeout(checkComplete, 100);
            }
          };
          checkComplete();
        });
        
      } catch (error) {
        console.error("Microphone access error:", error);
        showToast("Microphone permission denied");
      }
    };
    
    // Single recording session (no continuous loop)
    const recordingLoop = async () => {
      while (!manuallyStoppedRef.current && streamingRef.current) {
        try {
          // Wait if processing is in progress to prevent interruption
          while (isProcessingRef.current) {
            console.log("⏳ Processing in progress, waiting before starting new recording...");
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          console.log("🎤 Waiting for you to speak...");
          await recordAndProcess();
          console.log("✅ Query processed. Now waiting for your next speech...");
          // Wait longer to ensure processing is complete before listening again
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          console.error("Recording error:", error);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      sttRunningRef.current = false;
    };
    
    // Start the recording loop
    recordingLoop();
  };

  // Stop Google STT recognition
  const stopRealTimeRecognition = () => {
    console.log("🛑 Stopping Google STT recognition - MIC WILL BE OFF");
    manuallyStoppedRef.current = true; // Set flag to prevent auto-restart
    streamingRef.current = false; // Also set ref to false
    
    // Stop all audio playback immediately
    stopAllAudio();
    
    // Clear heartbeat timer
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    // Clear Google STT interval
    if (googleSttIntervalRef.current) {
      clearInterval(googleSttIntervalRef.current);
      googleSttIntervalRef.current = null;
    }
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    // Stop all processing when mic is stopped
    setIsProcessing(false);
    isProcessingRef.current = false; // Update ref
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
    console.log("🎯 Selecting suggestion:", suggestion.responseType, suggestion.text);
    setUserSelectingResponse(true); // Prevent main response logic from auto-playing
    setPredatorAnswer(suggestion.text);
    
    // Only update Predator Answer box, don't add to conversation history
    // Play audio for all responses when clicked (A, B, C)
    if (speechActive) {
      console.log("🎯 Playing Response", suggestion.responseType);
      // Use TTS with selected voice for better quality
      try {
        const ttsResult = await runTts({ text: suggestion.text, voice: aiVoiceSelection, language: language === "German" ? "de-DE" : "en-US" });
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
                          setUserSelectingResponse(false); // Reset flag after TTS ends
                          // Restart microphone after AI speech ends
                          restartMicrophone(); 
                        };
          audio.play().catch(async (e) => {
            console.error("TTS audio playback failed:", e);
            await speakText(suggestion.text);
          });
        } else {
          await speakText(suggestion.text);
        }
      } catch (ttsError) {
        console.error("TTS failed:", ttsError);
        await speakText(suggestion.text);
      }
    }
    
    triggerConfetti();
    showToast("Suggestion selected");
  };

  // Removed auto-selection useEffect - Good Answer A is now auto-selected in silence timeout

  return (
    <div className={`min-h-screen flex flex-col p-4 sm:p-2 bg-[#f5f5f5] font-sans overflow-y-auto transition-all duration-300 ${crmSidebarVisible ? 'pr-80' : ''}`} style={openSansStyle}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border border-[#000000] rounded-2xl px-4 py-3 bg-[#f5f5f5] shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg sm:text-xl text-center sm:text-left" style={orbitronStyle}>
            SELL PREDATOR Cockpit
          </span>
          
        </div>

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
              onClick={startGoogleSttRecognition}
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
          <div ref={conversationBoxRef} className={`w-full h-[60vh] border-2 border-[#D72638] rounded-2xl p-3 shadow-sm mb-3 overflow-y-auto`}>
            {showLiveTranscript ? (
              /* Live Transcript View */
              <div className="w-full h-full border-none resize-none focus:ring-0 outline-none bg-transparent text-black text-sm whitespace-pre-wrap">
                {liveTranscript ? (
                  formatLiveTranscript(liveTranscript)
                ) : (
                  <div className="text-gray-400">
                    {streaming ? (isProcessing ? "🔄 Processing your query..." : (isTtsPlaying || isTtsPlayingRef.current) ? "🔊 AI is speaking... Just speak to interrupt!" : "🎤 Always listening... Speak anytime! (Response stays visible)") : "Click 'Start Live Mic' to begin listening..."}
                  </div>
                )}
              </div>
            ) : (
              /* Conversation History View from localStorage */
              <>
                    {conversationHistory.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500 mb-2 font-semibold">
                      {mode === 'sales' ? '📈 Sales Mode History' : '🛠️ Support Mode History'}
                    </div>
                    {conversationHistory.map((entry) => {
                      const sentimentEmoji = getSentimentEmoji(entry.sentimentData);
                      return (
                        <div key={entry.id} className="space-y-3">
                          {/* Customer Query */}
                          <div className="p-3 mb-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-bold mb-1">Customer:</div>
                            <div className="text-sm flex items-center gap-2">
                              <span>{entry.userInput}</span>
                              {sentimentEmoji && <span className="text-lg">{sentimentEmoji}</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">{entry.timestamp}</div>
                          </div>
                          
                          {/* Predator AI Response A (default response) */}
                          {entry.predatorResponse && entry.predatorResponse.trim() && (
                            <div className="p-3 mb-2 bg-blue-50 rounded-lg">
                              <div className="text-sm font-bold mb-1">Predator AI:</div>
                              <div className="text-sm">{entry.predatorResponse}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
            Notes & Conversion History
          </h3>
          <textarea
            className="w-full flex-1 border-2 border-[#D72638] rounded-2xl p-3 shadow-sm resize-none focus:ring-2 focus:ring-[#FFD700] outline-none overflow-y-auto"
            placeholder="Add your notes and conversion history here..."
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

      {/* CRM Sidebar */}
      <CRMSidebar 
        isVisible={crmSidebarVisible}
        customerData={customerData}
        isLoading={crmLoading}
        keyHighlights={keyHighlights}
        sentimentData={sentimentData}
      />
    </div>
  );
}
