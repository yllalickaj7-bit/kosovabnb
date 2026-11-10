import { useEffect, useRef, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { Bot, Loader2, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Msg = { role: "user" | "assistant"; content: string };

const HIDDEN_ON = ["/admin", "/auth"];

const copy = {
  sq: {
    title: "Asistenti KosovaBnB",
    welcome:
      "Përshëndetje! Mund t'ju ndihmoj të gjeni një vend, të kontrolloj disponueshmërinë dhe çmimin, dhe të bëj rezervimin. Çfarë po kërkoni?",
    placeholder: "Shkruani një mesazh...",
    error: "Ndodhi një gabim. Provoni përsëri.",
    open: "Hap asistentin",
    close: "Mbyll",
    send: "Dërgo",
  },
  en: {
    title: "KosovaBnB Assistant",
    welcome: "Hi! I can help you find a place, check availability and prices, and make a booking. What are you looking for?",
    placeholder: "Type a message...",
    error: "Something went wrong. Please try again.",
    open: "Open assistant",
    close: "Close",
    send: "Send",
  },
} as const;

const sessionId = (() => {
  try {
    let id = sessionStorage.getItem("kbnb_chat_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("kbnb_chat_session", id);
    }
    return id;
  } catch {
    return undefined;
  }
})();

// Lidhjet bëhen klikueshme vetëm për domenin e vet dhe shtigjet e brendshme
const LINK_RE = /(https?:\/\/[^\s)]+|\/checkout\/[0-9a-f-]{36})/gi;
const Linkified = ({ text }: { text: string }) => (
  <>
    {text.split(LINK_RE).map((part, i) => {
      if (!/^(https?:\/\/|\/checkout\/)/i.test(part)) return <span key={i}>{part}</span>;
      const internal = part.startsWith("/") || part.startsWith(window.location.origin);
      return internal ? (
        <a key={i} href={part} className="underline font-medium break-all">{part}</a>
      ) : (
        <span key={i} className="break-all">{part}</span>
      );
    })}
  </>
);

export const ChatWidget = () => {
  const { lang } = useLanguage();
  const location = useLocation();
  const c = copy[lang === "en" ? "en" : "sq"];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);

  const listingId = matchPath("/listing/:id", location.pathname)?.params.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  if (HIDDEN_ON.includes(location.pathname)) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: next.slice(-20),
          listing_id: listingId,
          language: lang === "en" ? "en" : "sq",
          conversation_id: conversationId,
          session_id: sessionId,
        },
      });
      if (error || !data?.reply) throw error ?? new Error("empty");
      setConversationId(data.conversation_id ?? undefined);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: c.error }]);
    }
    setLoading(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={c.open}
          className="fixed right-4 bottom-20 md:bottom-6 z-50 h-14 w-14 rounded-full gradient-brand text-white shadow-xl flex items-center justify-center hover:opacity-90"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {open && (
        <section
          aria-label={c.title}
          className="fixed z-50 right-0 bottom-0 md:right-6 md:bottom-6 w-full md:w-96 h-[75vh] md:h-[32rem] max-h-[100dvh] bg-card border border-border md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <header className="flex items-center justify-between px-4 py-3 gradient-brand text-white">
            <span className="flex items-center gap-2 font-semibold text-sm"><Bot className="h-4 w-4" /> {c.title}</span>
            <button onClick={() => setOpen(false)} aria-label={c.close} className="h-7 w-7 rounded-full hover:bg-white/20 flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm" aria-live="polite">
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">{c.welcome}</div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-3 py-2 max-w-[85%] whitespace-pre-wrap rounded-2xl ${
                  m.role === "user" ? "ml-auto bg-foreground text-background rounded-tr-sm" : "bg-secondary rounded-tl-sm"
                }`}
              >
                {m.role === "assistant" ? <Linkified text={m.content} /> : m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2 w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={c.placeholder}
              maxLength={2000}
              className="flex-1 border border-input rounded-full px-4 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={c.send}
              className="h-9 w-9 rounded-full gradient-brand text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
};
