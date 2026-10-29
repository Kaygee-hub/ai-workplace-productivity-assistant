import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Panel, CopyButton, ClearButton, Loading, ErrorNote, Empty, PageIntro, Markdown, useAITool, logActivity } from "@/components/tool-ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/meetings")({
  head: () => seo("Meeting Notes Summarizer", "Summarise meeting notes into decisions, action items, owners and deadlines."),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const ai = useAITool("meeting");
  const submit = async () => {
    if (notes.trim().length < 30) return setErr("Please paste at least a few sentences of meeting notes.");
    setErr("");
    await ai.run(`Meeting notes:\n"""\n${notes}\n"""`);
    logActivity("Summarised meeting notes");
  };
  return (
    <>
      <PageIntro title="Meeting Notes Summarizer" text="Paste your notes. Missing names or deadlines are marked 'Not specified' — never invented." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Meeting notes">
          <Textarea rows={16} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste raw meeting notes or a transcript here…" />
          {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
          <Button onClick={submit} disabled={ai.loading} className="mt-4 w-full"><Wand2 /> {ai.loading ? "Summarising…" : "Summarise notes"}</Button>
        </Panel>
        <Panel title="Summary" actions={<><CopyButton text={ai.output} /><ClearButton onClick={() => { ai.setOutput(""); ai.setError(null); setNotes(""); }} /></>}>
          {ai.error && <div className="mb-3"><ErrorNote message={ai.error} /></div>}
          {ai.loading ? <Loading /> : ai.output ? <Markdown text={ai.output} /> : <Empty icon={NotebookPen} text="Summary, decisions and action items will appear here." />}
        </Panel>
      </div>
    </>
  );
}
