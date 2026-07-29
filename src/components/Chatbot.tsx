import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, CornerDownLeft, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "user" | "vault";
  text: string;
  timestamp: string;
}

// Preset Q&As for rapid assistance
const PRESETS = [
  { q: "How do the RESTROOM sweatshirts fit?", key: "restroom" },
  { q: "What is your shipping policy?", key: "shipping" },
  { q: "When is the next drop?", key: "drop" },
  { q: "Are the puffer jackets waterproof?", key: "puffer" },
];

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "vault",
      text: "SYSTEM_ACCESS: GRANTED. WELCOME TO NANGSAL APPAREL ASSISTANT. I CAN CONFIRM SYSTEM SPECIFICATIONS, DROP TIMING, ANATOMICAL SIZING FIT, AND ORDER CARGO TRACKS. HOW MAY I ASSIST YOU?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes("size") || q.includes("fit") || q.includes("restroom") || q.includes("sweatshirt") || q.includes("tee")) {
      return "ANATOMICAL SIZING CALIBRATION: ALL NANGSAL APPAREL TEES, HOODIES, AND SWEATSHIRTS ARE ENGINEERED WITH AN OPTIMAL OVERSIZED STREETWEAR FIT. SIZING UP IS UNNECESSARY FOR AN AUTHENTIC SILHOUETTE.";
    }
    if (q.includes("puffer") || q.includes("waterproof") || q.includes("rain") || q.includes("jacket")) {
      return "MATERIAL UTILITY MATRIX: NANGSAL APPAREL OUTERWEAR AND JACKETS ARE FULLY INSULATED AND PROTECTED BY PREMIUM FABRICS. HIGHLY RAIN-PROOF AND COLD-SHIELD CERTIFIED.";
    }
    if (q.includes("shipping") || q.includes("postage") || q.includes("deliver") || q.includes("country")) {
      return "LOGISTIC SHIPMENT STATUS: FAST COURIER DELIVERY ACROSS KATHMANDU, HETAUDA, AND ALL OVER NEPAL. INSIDE KTM: RS 120, OUTSIDE KTM: RS 200.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "SYSTEM RESPONSE: GREETINGS VISITOR. I AM NANGSAL APPAREL AUTOMATED ASSISTANT. TRANSMIT SIZING, LOGISTICS OR ORDER ENQUIRIES FOR DIRECT ASSISTANCE.";
    }

    return "NANGSAL SUPPORT ALERT: FOR SPECIFIC INQUIRIES, FEEL FREE TO CHAT DIRECTLY WITH US ON WHATSAPP (+977 984-7459808) OR INSTAGRAM (@BY_NANGSAL).";
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.toUpperCase(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    // Simulate thinking delay
    setTimeout(() => {
      const vaultAnswerText = generateAnswer(textToSend);
      const vaultMsg: Message = {
        id: `vault-${Date.now()}`,
        sender: "vault",
        text: vaultAnswerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, vaultMsg]);
    }, 600);
  };

  return (
    <div id="vault-core-bot-interface" className="fixed bottom-6 right-6 z-50 font-mono text-left">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[360px] md:w-[400px] h-[520px] bg-white border border-neutral-200 shadow-2xl flex flex-col rounded-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.25em] text-white">
                    VAULT CORE v1.0
                  </h3>
                  <span className="text-[8px] tracking-widest text-[#a8a8a8] block mt-0.5 uppercase">
                    online & encrypted
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#a8a8a8] hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 space-y-4">
              {messages.map((m) => {
                const isVault = m.sender === "vault";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isVault ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3.5 rounded-none text-[10px] leading-relaxed tracking-wider ${
                        isVault
                          ? "bg-white text-black border border-neutral-200"
                          : "bg-black text-white"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[8px] text-[#999999] mt-1 tracking-widest font-semibold uppercase px-1">
                      {m.sender === "vault" ? "SYSTEM CORE" : "VISITOR"} — {m.timestamp}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets suggestions */}
            <div className="px-4 py-2 bg-white border-t border-neutral-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleSend(p.q)}
                  className="bg-neutral-50 px-3 py-1.5 border border-neutral-200 text-[9px] text-[#444444] hover:bg-black hover:text-white hover:border-black transition-colors rounded-full cursor-pointer flex-shrink-0 font-bold"
                >
                  {p.q}
                </button>
              ))}
            </div>

            {/* WhatsApp Human Support Button */}
            <div className="px-3 pb-3 bg-white pt-2 border-t border-neutral-100">
              <a 
                href="https://wa.me/9779847459808?text=Hello%20Nangsal%20Apparel%20Support," 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#20ba5a] transition-colors rounded-sm shadow-sm"
              >
                CONNECT VIA WHATSAPP 💬
              </a>
            </div>

            {/* Input Form Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="CONVERT QUERY SPEC..."
                className="flex-1 bg-neutral-55 border border-neutral-200 rounded-sm px-3 py-2.5 text-[10px] uppercase tracking-widest focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="bg-black text-white p-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none rounded-sm cursor-pointer flex items-center justify-center"
                aria-label="Send query"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        ) : (
          /* Floating button widget */
          <motion.button
            layoutId="chatbot-trigger"
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center bg-black hover:bg-neutral-900 text-white w-12 h-12 shadow-2xl transition-all rounded-full cursor-pointer hover:scale-105 active:scale-95 group border border-neutral-800"
            aria-label="Open support chat"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare size={20} className="text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
