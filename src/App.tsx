/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Mic, 
  ShieldAlert, 
  Lock, 
  Settings, 
  Cpu, 
  Activity, 
  Wifi, 
  Volume2, 
  VolumeX,
  Send,
  Loader2,
  ChevronRight,
  User,
  Bot,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils';
import ReactMarkdown from 'react-markdown';
import { gemini } from './services/geminiService';

type Module = 'terminal' | 'live' | 'scan' | 'encryption';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>('terminal');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'System initialized. Team Broken online. Awaiting briefing.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await gemini.chat(input, history);
      const modelContent = response.text || "Error: No response from system.";
      
      const modelMessage: Message = {
        role: 'model',
        content: modelContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, modelMessage]);

      if (isTtsEnabled) {
        const audioData = await gemini.generateTTS(modelContent);
        if (audioData) {
          const audio = new Audio(`data:audio/wav;base64,${audioData}`);
          audio.play();
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "CRITICAL ERROR: Connection to neural link severed. Check logs.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startSTT = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex h-screen w-full bg-matrix-bg text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-matrix-border bg-matrix-surface flex flex-col z-20">
        <div className="p-6 border-b border-matrix-border flex items-center gap-3">
          <div className="w-10 h-10 bg-matrix-green/10 border border-matrix-green flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            <ShieldAlert className="text-matrix-green w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight terminal-glow text-matrix-green">TEAM BROKEN</h1>
            <p className="text-[10px] font-mono text-matrix-green/60 uppercase tracking-widest">Neural Link v3.1</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <ModuleButton 
            active={activeModule === 'terminal'} 
            onClick={() => setActiveModule('terminal')}
            icon={<TerminalIcon size={18} />}
            label="Terminal"
            sub="Neural Chat"
          />
          <ModuleButton 
            active={activeModule === 'live'} 
            onClick={() => setActiveModule('live')}
            icon={<Mic size={18} />}
            label="Live Assistant"
            sub="Real-time Link"
          />
          <ModuleButton 
            active={activeModule === 'scan'} 
            onClick={() => setActiveModule('scan')}
            icon={<Activity size={18} />}
            label="Vulnerability Scan"
            sub="Network Analysis"
          />
          <ModuleButton 
            active={activeModule === 'encryption'} 
            onClick={() => setActiveModule('encryption')}
            icon={<Lock size={18} />}
            label="Encryption"
            sub="Secure Tunnel"
          />
        </nav>

        <div className="p-4 border-t border-matrix-border space-y-4">
          <div className="bg-black/40 p-3 rounded border border-matrix-border font-mono text-[9px] text-matrix-green/40 h-24 overflow-hidden">
            <div className="animate-pulse mb-1">{">"} SYSTEM_READY</div>
            <div>{">"} KERNEL_LOADED: 0x8823</div>
            <div>{">"} NEURAL_LINK: ACTIVE</div>
            <div className="opacity-20">{">"} SCANNING_PORTS...</div>
            <div className="opacity-20">{">"} BYPASSING_FIREWALL...</div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-matrix-green/40">
            <span>UPTIME: 99.99%</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-matrix-green rounded-full animate-pulse" />
              CONNECTED
            </span>
          </div>
          <button 
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded border transition-all text-xs font-mono",
              isTtsEnabled 
                ? "bg-matrix-green/10 border-matrix-green text-matrix-green" 
                : "bg-transparent border-matrix-border text-white/40 hover:text-white/60"
            )}
          >
            <span className="flex items-center gap-2">
              {isTtsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              VOICE BRIEFING
            </span>
            <span>{isTtsEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="glass-header h-16 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-matrix-green/60 font-mono text-xs">
              <Cpu size={14} />
              <span>CPU: 12%</span>
            </div>
            <div className="flex items-center gap-2 text-matrix-green/60 font-mono text-xs">
              <Zap size={14} />
              <span>LATENCY: 24ms</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
              <span className="text-xs font-mono tracking-widest text-matrix-green">ENCRYPTED_SESSION_ACTIVE</span>
            </div>
            <Settings className="text-matrix-green/40 hover:text-matrix-green cursor-pointer transition-colors" size={18} />
          </div>
        </header>

        {/* Module Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeModule === 'terminal' && (
              <motion.div 
                key="terminal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-4 max-w-4xl",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center shrink-0 border",
                        msg.role === 'user' 
                          ? "bg-matrix-green/10 border-matrix-green text-matrix-green" 
                          : "bg-matrix-surface border-matrix-border text-matrix-green"
                      )}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-lg border",
                        msg.role === 'user' 
                          ? "bg-matrix-green/5 border-matrix-green/20 text-white" 
                          : "bg-matrix-surface/50 border-matrix-border text-white/90"
                      )}>
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <div className="mt-2 text-[10px] font-mono opacity-30">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded flex items-center justify-center bg-matrix-surface border border-matrix-border text-matrix-green">
                        <Bot size={16} />
                      </div>
                      <div className="p-4 bg-matrix-surface/50 border border-matrix-border rounded-lg flex items-center gap-3">
                        <Loader2 className="animate-spin text-matrix-green" size={16} />
                        <span className="text-xs font-mono text-matrix-green/60 animate-pulse">DECRYPTING RESPONSE...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-8 pt-0">
                  <form 
                    onSubmit={handleSendMessage}
                    className="relative bg-matrix-surface border border-matrix-border rounded-xl focus-within:border-matrix-green/50 transition-all shadow-lg"
                  >
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter command or query..."
                      className="w-full bg-transparent p-4 pr-24 outline-none font-mono text-sm placeholder:text-white/20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={startSTT}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isRecording ? "text-red-500 bg-red-500/10" : "text-matrix-green/40 hover:text-matrix-green hover:bg-matrix-green/10"
                        )}
                      >
                        <Mic size={18} />
                      </button>
                      <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-matrix-green text-black rounded-lg hover:bg-matrix-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeModule === 'live' && (
              <LiveAssistantModule />
            )}

            {activeModule === 'scan' && (
              <MockModule 
                icon={<Activity size={48} />}
                title="Vulnerability Scanner"
                description="Real-time network traffic analysis and vulnerability identification active."
              />
            )}

            {activeModule === 'encryption' && (
              <MockModule 
                icon={<Lock size={48} />}
                title="Encryption Engine"
                description="AES-256 bit end-to-end encryption tunnel established. Session secure."
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ModuleButton({ active, onClick, icon, label, sub }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, sub: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative overflow-hidden",
        active 
          ? "bg-matrix-green/10 border border-matrix-green/30 text-matrix-green" 
          : "hover:bg-white/5 text-white/40 hover:text-white/80 border border-transparent"
      )}
    >
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
        active ? "bg-matrix-green/20 border-matrix-green" : "bg-matrix-surface border-matrix-border group-hover:border-white/20"
      )}>
        {icon}
      </div>
      <div className="text-left">
        <div className="font-bold text-sm tracking-tight">{label}</div>
        <div className="text-[10px] font-mono opacity-50 uppercase tracking-tighter">{sub}</div>
      </div>
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute right-2 w-1 h-6 bg-matrix-green rounded-full shadow-[0_0_10px_rgba(0,255,65,0.8)]"
        />
      )}
    </button>
  );
}

function LiveAssistantModule() {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const toggleLive = async () => {
    if (isActive) {
      setIsActive(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup processor for capturing audio
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processor.onaudioprocess = (e) => {
        if (!isActive || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        // Base64 encode
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      const sessionPromise = gemini.connectLive({
        onopen: () => {
          setTranscript(prev => [...prev, "Neural link established. Listening..."]);
        },
        onmessage: async (message) => {
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const pcmData = new Int16Array(bytes.buffer);
            audioQueue.current.push(pcmData);
            if (!isPlaying.current) playNextInQueue();
          }

          if (message.serverContent?.interrupted) {
            audioQueue.current = [];
            isPlaying.current = false;
          }
        },
        onerror: (err) => {
          console.error("Live Error:", err);
          setIsActive(false);
        },
        onclose: () => {
          setIsActive(false);
        }
      });

      sessionRef.current = await sessionPromise;
      setIsActive(true);
      drawVisualizer();
    } catch (err) {
      console.error("Failed to start live link:", err);
      alert("Microphone access required for Live Assistant.");
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(0, 255, 65, ${dataArray[i] / 255})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative mb-12">
        <div className={cn(
          "w-48 h-48 rounded-full border-2 flex items-center justify-center transition-all duration-500",
          isActive 
            ? "border-matrix-green bg-matrix-green/5 shadow-[0_0_50px_rgba(0,255,65,0.2)]" 
            : "border-matrix-border bg-matrix-surface"
        )}>
          <Mic className={cn(
            "w-16 h-16 transition-all",
            isActive ? "text-matrix-green animate-pulse" : "text-white/20"
          )} />
        </div>
        {isActive && (
          <div className="absolute -inset-4 border border-matrix-green/20 rounded-full animate-[ping_3s_infinite]" />
        )}
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-bold tracking-tight terminal-glow text-matrix-green">LIVE NEURAL LINK</h2>
        <p className="text-white/40 font-mono text-sm leading-relaxed">
          Establish a full-duplex, low-latency audio connection with Team Broken. 
          Speak naturally to receive real-time tactical advice.
        </p>
      </div>

      <div className="mt-8 w-full max-w-lg h-24 bg-matrix-surface border border-matrix-border rounded-xl overflow-hidden relative">
        <canvas ref={canvasRef} width={512} height={96} className="w-full h-full opacity-50" />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-matrix-green/20 tracking-[0.5em]">
            SIGNAL_OFFLINE
          </div>
        )}
      </div>

      <button 
        onClick={toggleLive}
        className={cn(
          "mt-12 px-12 py-4 rounded-full font-bold tracking-widest transition-all shadow-lg",
          isActive 
            ? "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20" 
            : "bg-matrix-green text-black hover:bg-matrix-green/80 shadow-[0_0_20px_rgba(0,255,65,0.4)]"
        )}
      >
        {isActive ? "TERMINATE LINK" : "ESTABLISH LINK"}
      </button>

      <div className="mt-8 w-full max-w-lg space-y-2">
        {transcript.map((t, i) => (
          <div key={i} className="text-left text-[10px] font-mono text-matrix-green/60 flex gap-2">
            <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
            <span className="animate-pulse">{t}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MockModule({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-24 h-24 rounded-2xl bg-matrix-surface border border-matrix-border flex items-center justify-center text-matrix-green mb-8 shadow-inner">
        {icon}
      </div>
      <h2 className="text-2xl font-bold tracking-tight terminal-glow text-matrix-green mb-4 uppercase">{title}</h2>
      <p className="max-w-md text-white/40 font-mono text-sm leading-relaxed">
        {description}
      </p>
      <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-2xl">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-24 bg-matrix-surface border border-matrix-border rounded-lg p-4 flex flex-col justify-between">
            <div className="w-full h-1 bg-matrix-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.random() * 100}%` }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                className="h-full bg-matrix-green"
              />
            </div>
            <div className="text-[8px] font-mono text-matrix-green/40 text-left">
              DATA_STREAM_{i}<br />
              STATUS: STABLE
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
