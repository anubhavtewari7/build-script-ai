
import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, ChatMessage } from '../types';
import { getGeminiClient, analyzeVehicleImage } from '../services/geminiService';
import { 
  Send, 
  Camera, 
  Loader2, 
  X, 
  Terminal, 
  ShieldAlert, 
  Search, 
  HelpCircle, 
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface AIChatProps {
  vehicle: Vehicle;
}

const QUICK_PROMPTS = [
  { label: "Strange Noise", text: "My car is making a weird noise. How can I figure out what it is?", icon: <AlertTriangle size={14} /> },
  { label: "Warning Light", text: "There's a light on my dashboard. Can you explain what it might mean?", icon: <Lightbulb size={14} /> },
  { label: "Safe to Drive?", text: "Something feels off. How do I know if my car is safe to drive right now?", icon: <ShieldAlert size={14} /> },
  { label: "Oil Basics", text: "How do I check my oil level for this car?", icon: <Search size={14} /> },
  { label: "Dashboard Guide", text: "Explain the most common dashboard symbols on my car like I'm a beginner.", icon: <HelpCircle size={14} /> },
];

const BuildScriptLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" fill="white" />
    <circle cx="6" cy="18" r="2" fill="white" />
  </svg>
);

const AIChat: React.FC<AIChatProps> = ({ vehicle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let responseText = '';
      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        responseText = await analyzeVehicleImage(vehicle, base64Data, textToSend);
        setSelectedImage(null);
      } else {
        const ai = getGeminiClient();
        const chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are BuildScript AI, a patient and friendly automotive mentor for a ${vehicle.year} ${vehicle.make} ${vehicle.model}. 
            Your goal is to make car maintenance and diagnostics easy for people with ZERO car expertise.
            
            RULES:
            1. Use simple language. Avoid jargon like "torque converter" or "control arm" without explaining what they are using simple analogies (e.g., "Think of the brakes like the soles of your shoes...").
            2. Prioritize safety. If something sounds dangerous, tell them clearly: "⚠️ SAFETY FIRST: It might be best to pull over."
            3. Use numbered lists for steps.
            4. Be encouraging and empathetic. Don't make them feel bad for not knowing basics.
            5. Keep answers concise but thorough enough to be helpful.`
          }
        });
        
        const response = await chat.sendMessage({ message: textToSend });
        responseText = response.text || "Communication relay error. Please repeat command.";
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Systems offline. Check your network connection.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50">
      <header className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <BuildScriptLogo />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-[13px] uppercase tracking-wider">BuildScript Mentor</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-3 px-4">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Terminal size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">How can I help you <br/> with your {vehicle.make}?</h2>
              <p className="text-slate-500 text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                I can explain dashboard lights, strange noises, or help you learn basic maintenance. No car expertise required!
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Common Beginner Questions</h3>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl text-left hover:border-indigo-300 transition-all group active:scale-[0.98] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {prompt.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{prompt.label}</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-[2rem] p-5 shadow-sm relative ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-lg' 
                  : 'bg-white text-slate-800 rounded-bl-lg border border-slate-100'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="User Upload" className="w-full h-auto rounded-2xl mb-4 max-h-56 object-cover border-2 border-white/20" />
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                   {msg.text}
                </div>
                <div className={`text-[8px] mt-3 font-black uppercase tracking-[0.1em] opacity-40 ${msg.role === 'user' ? 'text-indigo-50' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-bl-lg p-4 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 pb-safe-area">
        {/* Quick Suggestion Chips */}
        {messages.length > 0 && !isTyping && (
           <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
             {QUICK_PROMPTS.map((prompt, i) => (
               <button
                 key={i}
                 onClick={() => handleSend(prompt.text)}
                 className="whitespace-nowrap bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 shadow-sm"
               >
                 {prompt.icon}
                 {prompt.label}
               </button>
             ))}
           </div>
        )}

        {selectedImage && (
          <div className="relative inline-block mb-3 animate-in zoom-in-95 duration-200">
            <img src={selectedImage} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-lg" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md border-2 border-white"
            >
              <X size={12} />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
            title="Upload Photo"
          >
            <Camera size={24} />
          </button>
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageSelect}
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-slate-100 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 border border-transparent focus:bg-white"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className="p-4 bg-indigo-600 text-white rounded-2xl disabled:opacity-30 transition-all active:scale-90 shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
