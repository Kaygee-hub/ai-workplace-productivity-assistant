import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Compass, SendHorizontal, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { callAI, ErrorNote, Markdown, PageIntro, logActivity, type Msg } from "@/components/tool-ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/chat")({
  head: () => seo("Workplace AI Chatbot", "Chat with WorkPilot AI about workplace writing, brainstorming, planning and productivity."),
  component: ChatPage,
});

const SUGGESTIONS = ["Brainstorm ideas for a team-building activity", "How do I write a polite follow-up email?", "Tips to run shorter meetings"];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { setMessages(JSON.parse(localStorage.getItem("wp-chat") || "[]")); } catch { /* ignore */ }
    inputRef.current?.focus();
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const persist = (m: Msg[]) => { setMessages(m); localStorage.setItem("wp-chat", JSON.stringify(m)); };

  const send = async (text = input) => {
    const t = text.trim();
    if (!t || loading) return;
    const next = [...messages, { role: "user" as const, content: t }];
    persist(next); setInput(""); setError(null); setLoading(true);
    const r = await callAI("chat", next.slice(-40));
    setLoading(false);
    if (r.ok) { persist([...next, { role: "assistant", content: r.text }]); logActivity("Chatted with the assistant"); }
    else setError(r.error);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[480px] flex-col">
      <div className="flex items-start justify-between gap-2">
        <PageIntro title="Workplace AI Chatbot" text="Ask about writing, brainstorming, planning or productivity." />
        <Button variant="outline" size="sm" disabled={!messages.length} onClick={() => { persist([]); setError(null); }}><Trash2 /> Clear chat</Button>
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 shadow-card md:p-6">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground"><Compass className="h-6 w-6" /></div>
            <p className="text-sm text-muted-foreground">Start a conversation, or try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1.5 text-sm hover:border-primary/50">{s}</button>)}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) => m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold text-gold-foreground"><Compass className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><Markdown text={m.content} /></div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" /> WorkPilot AI is typing…</div>}
            {error && <ErrorNote message={error} />}
            <div ref={endRef} />
          </div>
        )}
      </div>
      <form className="mt-3 flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Textarea ref={inputRef} rows={2} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message… (Enter to send, Shift+Enter for new line)" className="resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={loading || !input.trim()} aria-label="Send"><SendHorizontal /></Button>
      </form>
    </div>
  );
}
