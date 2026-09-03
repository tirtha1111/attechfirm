"use client";

import { useEffect, useState, useRef } from "react";
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  Bot, 
  User, 
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I am your **A&T Tech Advisor**. Built by Tirtharaj and Aditya, I am here to discuss your web design, SaaS platform, custom app, or automation workflow. How can I help supercharge your vision today?"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Live Voice States
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"disconnected" | "connecting" | "connected" | "speaking" | "listening">("disconnected");
  
  // WebAudio & Socket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);
  
  // Animation Waves for Live Voice
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 15, 15, 15, 15]);
  const animationFrameRef = useRef<number | null>(null);

  // Suggested Prompts
  const suggestedQuestions = [
    "What are your core services?",
    "Who built A&T Tech Firm?",
    "Do you build custom mobile apps?",
    "How can I buy a package?"
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Clean up Voice connections on unmount
  useEffect(() => {
    return () => {
      cleanupVoiceSession();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Pulse voice visualizer when active
  useEffect(() => {
    if (voiceStatus === "connected" || voiceStatus === "speaking" || voiceStatus === "listening") {
      const updateWave = () => {
        setWaveHeights(prev => prev.map(() => {
          const min = voiceStatus === "speaking" ? 10 : 5;
          const max = voiceStatus === "speaking" ? 60 : 25;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }));
        animationFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setTimeout(() => {
        setWaveHeights([15, 15, 15, 15, 15]);
      }, 0);
    }
  }, [voiceStatus]);

  // Trigger floating alert if first visit
  useEffect(() => {
    const shown = localStorage.getItem("attechfirm_assistant_welcomed");
    if (!shown) {
      setTimeout(() => {
        toast("💡 AI Advisor Available", {
          description: "Talk to our expert technical assistant using voice or text!",
          action: {
            label: "Chat Now",
            onClick: () => setIsOpen(true)
          }
        });
        localStorage.setItem("attechfirm_assistant_welcomed", "true");
      }, 3500);
    }
  }, []);

  // Send a Chat Message to backend `/api/chat`
  const handleSendMessage = async (textToSend?: string) => {
    const msgText = (textToSend || inputVal).trim();
    if (!msgText) return;

    if (!textToSend) setInputVal("");

    const newMessages = [...chatMessages, { role: "user" as const, content: msgText }];
    setChatMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();

      if (data.success && data.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: "I encountered a minor lag in my network. Feel free to try again or ask another technical question!" }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: "assistant", content: "I ran into a connection issue. Please verify you're online and let's try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Convert Float32Array (Microphone channel data) to 16-bit PCM little endian
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  // Base64 helper
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convert incoming model output base64 16-bit PCM to Float32 Array
  const base64ToFloat32PCM = (base64: string): Float32Array => {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  };

  // Queue and play incoming 24kHz PCM chunks
  const playAudioChunk = (base64Data: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;
    
    try {
      const pcmData = base64ToFloat32PCM(base64Data);
      const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
      audioBuffer.getChannelData(0).set(pcmData);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextAudioStartTimeRef.current < currentTime) {
        nextAudioStartTimeRef.current = currentTime;
      }

      // Schedule play with continuous flow
      source.start(nextAudioStartTimeRef.current);
      nextAudioStartTimeRef.current += audioBuffer.duration;
      
      setVoiceStatus("speaking");
      source.onended = () => {
        // If no more audio is scheduled or playing, return to listening/connected
        if (ctx.currentTime >= nextAudioStartTimeRef.current - 0.05) {
          setVoiceStatus("listening");
        }
      };
    } catch (e) {
      console.error("Audio chunk playback error:", e);
    }
  };

  // Initialize Audio & WebSocket Connection for Live Voice API
  const startVoiceSession = async () => {
    setVoiceStatus("connecting");
    setIsVoiceActive(true);

    try {
      // 1. Request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Setup Audio contexts
      // Resample micro input to 16kHz
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output playback is 24kHz
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextAudioStartTimeRef.current = outputAudioCtxRef.current.currentTime;

      // 3. Connect to the server's WebSocket Live bridge
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/live`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection established with Gemini Live bridge");
        setVoiceStatus("connected");
        toast.success("Voice connection established!", {
          description: "Say hello to start conversing with A&T Advisor!"
        });

        // Start processing microphone audio
        const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
        const processor = inputAudioCtxRef.current!.createScriptProcessor(2048, 1, 1);
        scriptProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(inputAudioCtxRef.current!.destination);

        processor.onaudioprocess = (e) => {
          if (isMicMuted) return; // Silent stream when muted
          if (ws.readyState !== WebSocket.OPEN) return;

          const channelData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = floatTo16BitPCM(channelData);
          const base64Audio = arrayBufferToBase64(pcmBuffer);

          ws.send(JSON.stringify({ audio: base64Audio }));
          if (voiceStatus !== "speaking") {
            setVoiceStatus("listening");
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.audio) {
            playAudioChunk(parsed.audio);
          }
          if (parsed.interrupted) {
            // Cut off speech if client starts speaking or model is interrupted
            nextAudioStartTimeRef.current = outputAudioCtxRef.current?.currentTime || 0;
            setVoiceStatus("listening");
          }
          if (parsed.error) {
            toast.error("Assistant Notice", { description: parsed.error });
            cleanupVoiceSession();
          }
        } catch (e) {
          console.error("WS Message Error:", e);
        }
      };

      ws.onclose = () => {
        console.log("Gemini WebSocket connection closed");
        cleanupVoiceSession();
      };

      ws.onerror = (err) => {
        console.error("WS Live Error:", err);
        toast.error("Connection failed", { description: "Voice services are briefly unavailable." });
        cleanupVoiceSession();
      };

    } catch (err: any) {
      console.error("Mic/WebAudio start failed:", err);
      toast.error("Microphone Required", { description: "Please grant microphone permissions to use voice conversations." });
      cleanupVoiceSession();
    }
  };

  // Close and free audio & websocket resources
  function cleanupVoiceSession() {
    setIsVoiceActive(false);
    setVoiceStatus("disconnected");
    setIsMicMuted(false);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
  }

  // Helper formatting markdown-like bold strings
  const formatContent = (text: string) => {
    // Basic formatting for **bold** strings
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-white font-extrabold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Sparkle Action Button */}
      <button
        id="floating-gemini-assistant-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20 flex items-center justify-center gap-2 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-sm tracking-wide whitespace-nowrap">
          A&T AI Advisor
        </span>
      </button>

      {/* Floating Control Panel */}
      {isOpen && (
        <div 
          id="gemini-assistant-panel"
          className="fixed bottom-24 right-6 w-[92vw] sm:w-[420px] h-[550px] bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-300"
        >
          {/* Header Panel */}
          <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  A&T Tech Advisor
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400">Expert Technical Solutions AI</p>
              </div>
            </div>
            <button 
              onClick={() => {
                cleanupVoiceSession();
                setIsOpen(false);
              }}
              className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-white/5 flex gap-2">
            <button
              onClick={() => {
                cleanupVoiceSession();
                setActiveTab("chat");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === "chat" 
                  ? "bg-blue-600 text-white border-blue-500 shadow-md" 
                  : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10"
              }`}
            >
              <MessageSquare size={14} />
              Chat Assistant
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === "voice" 
                  ? "bg-blue-600 text-white border-blue-500 shadow-md" 
                  : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10"
              }`}
            >
              <Mic size={14} />
              Live Voice
            </button>
          </div>

          {/* Tab Content 1: Chatbot */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/40">
              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-blue-600/20 text-blue-400" : "bg-indigo-600/20 text-indigo-400"
                    }`}>
                      {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                    }`}>
                      {formatContent(msg.content)}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Pre-suggested options */}
              {chatMessages.length === 1 && !isTyping && (
                <div className="px-4 pb-2 pt-1 flex flex-wrap gap-2 shrink-0">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-[10px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 py-1.5 px-3 rounded-full transition-all flex items-center gap-1.5"
                    >
                      <HelpCircle size={10} className="text-blue-400" />
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-900/80 border-t border-white/10 flex gap-2 items-center">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask any technical query..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isTyping}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 text-white disabled:text-slate-500 rounded-2xl transition-all shadow-md shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Tab Content 2: Live Voice Conversations */}
          {activeTab === "voice" && (
            <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                
                {/* Visual Audio Wave animation */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Outer glowing pulsing circle */}
                  <div className={`absolute inset-0 rounded-full bg-blue-500/10 blur-xl transition-all duration-700 ${
                    voiceStatus === "speaking" ? "scale-125 opacity-100" : "scale-100 opacity-60"
                  }`} />

                  {/* Pulsing visual circles */}
                  <div className={`absolute w-32 h-32 rounded-full border border-white/5 flex items-center justify-center transition-all ${
                    voiceStatus !== "disconnected" ? "animate-pulse" : ""
                  }`}>
                    {/* Visualizer bars */}
                    <div className="flex items-center gap-2">
                      {waveHeights.map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-150"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Central status icon */}
                  <div className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                    voiceStatus === "speaking" 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/20 scale-110" 
                      : voiceStatus === "listening"
                      ? "bg-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                      : "bg-slate-800"
                  }`}>
                    {voiceStatus === "speaking" ? (
                      <Volume2 size={18} />
                    ) : voiceStatus === "listening" ? (
                      <Activity size={18} className="animate-pulse" />
                    ) : (
                      <Mic size={18} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <Activity size={10} className="text-blue-400 animate-pulse" />
                    {voiceStatus}
                  </span>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {voiceStatus === "disconnected" && "Connect to talk with our conversational Gemini-3.1-Live API model in real-time."}
                    {voiceStatus === "connecting" && "Establishing bidirectional high-fidelity stream..."}
                    {voiceStatus === "connected" && "A&T Live session ready! Say something to begin."}
                    {voiceStatus === "listening" && "Listening... speak now."}
                    {voiceStatus === "speaking" && "Gemini is replying..."}
                  </p>
                </div>
              </div>

              {/* Control Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {voiceStatus === "disconnected" ? (
                    <button
                      onClick={startVoiceSession}
                      className="w-full py-3 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      Start Voice Session
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsMicMuted(!isMicMuted)}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isMicMuted 
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" 
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                        }`}
                        title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                      >
                        {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>
                      <button
                        onClick={cleanupVoiceSession}
                        className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
                
                <div className="text-[10px] text-center text-slate-500">
                  Voice Mode converts inputs directly to PCM. Requires mic permission.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
