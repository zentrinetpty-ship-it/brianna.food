import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2, ChefHat } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const SUGGESTIONS = [
  "Give me an Egusi soup recipe",
  "What can I cook with stockfish?",
  "How do I make Jollof rice?",
  "Suya spice recipe",
];

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: "Kedu! I'm Brianna, your Naija kitchen assistant. Ask me anything — recipes, ingredient swaps, or how to use what's in your basket. 🍲",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);
  const { items } = useCart();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = async (text) => {
    const message = (text || input).trim();
    if (!message || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setLoading(true);
    try {
      const { data } = await api.post("/chat", {
        session_id: sessionId,
        message,
        context_items: items.map((i) => i.name),
      });
      setSessionId(data.session_id);
      setMsgs((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: "Sorry, my kitchen timer is stuck. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-nigeria-dark hover:bg-nigeria-orange text-white shadow-[0_12px_32px_rgba(6,78,59,0.4)] flex items-center justify-center group transition-colors"
        data-testid="ai-chat-toggle"
        aria-label="Open AI recipe assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chef" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <ChefHat className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-nigeria-lime animate-pulse" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-40 w-[92vw] sm:w-[420px] max-h-[70vh] bg-white rounded-3xl shadow-2xl border border-black/5 flex flex-col overflow-hidden"
            data-testid="ai-chat-panel"
          >
            <div className="bg-nigeria-dark text-white p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-nigeria-lime flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-nigeria-dark" />
              </div>
              <div>
                <div className="font-display font-black text-lg leading-none">Ask Brianna</div>
                <div className="text-xs text-nigeria-lime/80 mt-1">Your Naija recipe AI, always cooking</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-nigeria-cream">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-nigeria-orange text-white rounded-br-sm"
                        : "bg-white text-nigeria-dark rounded-bl-sm border border-black/5"
                    }`}
                    data-testid={`chat-msg-${i}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-black/5 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-nigeria-orange" /> Brianna is stirring the pot...
                  </div>
                </div>
              )}
              {msgs.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs bg-white border border-nigeria-lime text-nigeria-dark font-bold px-3 py-1.5 rounded-full hover:bg-nigeria-lime transition"
                      data-testid={`chat-suggestion-${s.slice(0, 10)}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-black/5 p-3 flex items-center gap-2 bg-white"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a recipe..."
                className="flex-1 h-11 px-4 rounded-full bg-nigeria-cream border-0 focus:outline-none focus:ring-2 focus:ring-nigeria-lime text-sm"
                data-testid="chat-input"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-11 h-11 rounded-full bg-nigeria-orange text-white flex items-center justify-center disabled:opacity-40 hover:-translate-y-0.5 transition"
                data-testid="chat-send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
