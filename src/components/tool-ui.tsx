import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runAI } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export type Tool = "email" | "meeting" | "planner" | "research" | "chat";
export type Msg = { role: "user" | "assistant"; content: string };

export async function callAI(tool: Tool, messages: Msg[]) {
  try {
    return await runAI({ data: { tool, messages } });
  } catch {
    return { ok: false as const, error: "Could not reach the AI service. Check your connection and try again." };
  }
}

export function useAITool(tool: Tool) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const run = async (prompt: string) => {
    setLoading(true);
    setError(null);
    const r = await callAI(tool, [{ role: "user", content: prompt }]);
    setLoading(false);
    if (r.ok) setOutput(r.text);
    else setError(r.error);
  };
  return { loading, error, output, setOutput, setError, run };
}

export function logActivity(label: string) {
  try {
    const list = JSON.parse(localStorage.getItem("wp-activity") || "[]");
    list.unshift({ label, at: Date.now() });
    localStorage.setItem("wp-activity", JSON.stringify(list.slice(0, 8)));
  } catch { /* ignore */ }
}

export function Panel({ title, description, children, actions, className }: {
  title: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm" variant="outline" disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true); toast.success("Copied to clipboard");
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check /> : <Copy />} Copy
    </Button>
  );
}

export function ClearButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button size="sm" variant="ghost" onClick={onClick} disabled={disabled}>
      <Trash2 /> Clear
    </Button>
  );
}

export function Loading({ label = "WorkPilot AI is working…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground justify-center">
      <Loader2 className="h-4 w-4 animate-spin text-primary" /> {label}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
    </div>
  );
}

export function Empty({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
      <Icon className="h-7 w-7 text-primary/60" /> {text}
    </div>
  );
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="md-output text-sm leading-relaxed">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string | undefined }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function PageIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}
