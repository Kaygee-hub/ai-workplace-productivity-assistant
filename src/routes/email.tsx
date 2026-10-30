import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel, Field, CopyButton, ClearButton, Loading, ErrorNote, Empty, PageIntro, useAITool, logActivity } from "@/components/tool-ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/email")({
  head: () => seo("Smart Email Generator", "Generate complete professional emails in a formal, friendly or persuasive tone."),
  component: EmailPage,
});

const empty = { recipient: "", subject: "", purpose: "", points: "", tone: "Formal" };

function EmailPage() {
  const [f, setF] = useState(empty);
  const [errs, setErrs] = useState<{ recipient?: string; purpose?: string }>({});
  const ai = useAITool("email");
  const set = (k: keyof typeof empty) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    const e: { recipient?: string; purpose?: string } = {};
    if (!f.recipient.trim()) e.recipient = "Recipient is required";
    if (!f.purpose.trim()) e.purpose = "Describe the purpose of the email";
    setErrs(e);
    if (Object.keys(e).length) return;
    await ai.run(`Recipient: ${f.recipient}\nSubject: ${f.subject || "(suggest one)"}\nPurpose: ${f.purpose}\nKey points:\n${f.points || "(none)"}\nTone: ${f.tone}`);
    logActivity(`Generated a ${f.tone.toLowerCase()} email`);
  };

  return (
    <>
      <PageIntro title="Smart Email Generator" text="Fill in the details and get a polished, ready-to-edit email." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Email details">
          <div className="space-y-4">
            <Field label="Recipient *" error={errs.recipient}><Input value={f.recipient} onChange={(e) => set("recipient")(e.target.value)} placeholder="e.g. Ms. Dlamini, HR Manager" /></Field>
            <Field label="Subject"><Input value={f.subject} onChange={(e) => set("subject")(e.target.value)} placeholder="Leave blank to let AI suggest one" /></Field>
            <Field label="Purpose *" error={errs.purpose}><Input value={f.purpose} onChange={(e) => set("purpose")(e.target.value)} placeholder="e.g. Request a project deadline extension" /></Field>
            <Field label="Key points"><Textarea rows={4} value={f.points} onChange={(e) => set("points")(e.target.value)} placeholder="One point per line" /></Field>
            <Field label="Tone">
              <Select value={f.tone} onValueChange={set("tone")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Formal", "Friendly", "Persuasive"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Button onClick={submit} disabled={ai.loading} className="w-full"><Wand2 /> {ai.loading ? "Generating…" : "Generate email"}</Button>
          </div>
        </Panel>
        <Panel title="Generated email" description="Edit freely before sending."
          actions={<><CopyButton text={ai.output} /><ClearButton onClick={() => { ai.setOutput(""); ai.setError(null); setF(empty); setErrs({}); }} /></>}>
          {ai.error && <div className="mb-3"><ErrorNote message={ai.error} /></div>}
          {ai.loading ? <Loading /> : ai.output ? (
            <Textarea className="min-h-[420px] font-mono text-sm" value={ai.output} onChange={(e) => ai.setOutput(e.target.value)} aria-label="Generated email" />
          ) : <Empty icon={Mail} text="Your email will appear here." />}
        </Panel>
      </div>
    </>
  );
}
