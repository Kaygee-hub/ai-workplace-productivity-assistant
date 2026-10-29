import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Wand2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Panel, Field, CopyButton, ClearButton, Loading, ErrorNote, Empty, PageIntro, Markdown, useAITool, logActivity } from "@/components/tool-ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/research")({
  head: () => seo("AI Research Assistant", "Get an overview, key findings, insights and recommendations from a question or pasted article."),
  component: ResearchPage,
});

function ResearchPage() {
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const ai = useAITool("research");
  const submit = async () => {
    if (!q.trim() && !text.trim()) return setErr("Enter a research question or paste an article.");
    setErr("");
    await ai.run(`Research question: ${q || "(none — analyse the supplied text)"}\n\nUser-supplied text:\n"""\n${text || "(none supplied)"}\n"""`);
    logActivity("Ran a research analysis");
  };
  return (
    <>
      <PageIntro title="AI Research Assistant" text="Analyse a question or article. Output is labelled as from your input or AI analysis." />
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold-soft p-3 text-sm text-gold-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        This assistant does not browse the internet. It works only from what you supply plus the model's general knowledge, and it does not provide citations.
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your input">
          <div className="space-y-4">
            <Field label="Research question"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What are the benefits of hybrid work?" /></Field>
            <Field label="Article or source text (optional)"><Textarea rows={11} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste an article, report or notes…" /></Field>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button onClick={submit} disabled={ai.loading} className="w-full"><Wand2 /> {ai.loading ? "Analysing…" : "Analyse"}</Button>
          </div>
        </Panel>
        <Panel title="Analysis" actions={<><CopyButton text={ai.output} /><ClearButton onClick={() => { ai.setOutput(""); ai.setError(null); setQ(""); setText(""); }} /></>}>
          {ai.error && <div className="mb-3"><ErrorNote message={ai.error} /></div>}
          {ai.loading ? <Loading /> : ai.output ? <Markdown text={ai.output} /> : <Empty icon={Search} text="Overview, findings, insights and recommendations will appear here." />}
        </Panel>
      </div>
    </>
  );
}
