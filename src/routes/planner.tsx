import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListChecks, Plus, Wand2, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel, Field, CopyButton, ClearButton, Loading, ErrorNote, Empty, PageIntro, Markdown, useAITool, logActivity } from "@/components/tool-ui";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => seo("AI Task Planner", "Organise tasks into a prioritised daily or weekly plan and detect scheduling conflicts."),
  component: PlannerPage,
});

type Task = { id: string; title: string; deadline: string; duration: string; priority: string; done: boolean };
const blank = { title: "", deadline: "", duration: "", priority: "Medium" };
const PRI = ["High", "Medium", "Low"];

function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [scope, setScope] = useState("Daily");
  const [hours, setHours] = useState("");
  const ai = useAITool("planner");

  useEffect(() => {
    try { setTasks(JSON.parse(localStorage.getItem("wp-tasks") || "[]")); } catch { /* ignore */ }
    setScope(localStorage.getItem("wp-plan-scope") || "Daily");
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("wp-tasks", JSON.stringify(tasks)); }, [tasks, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("wp-plan-scope", scope); }, [scope, loaded]);

  const save = () => {
    if (!f.title.trim()) return setErr("Task name is required");
    setErr("");
    if (editing) setTasks((t) => t.map((x) => (x.id === editing ? { ...x, ...f } : x)));
    else setTasks((t) => [...t, { ...f, id: crypto.randomUUID(), done: false }]);
    setF(blank); setEditing(null);
  };

  const plan = async () => {
    const open = tasks.filter((t) => !t.done);
    if (!open.length) return setErr("Add at least one open task to generate a plan.");
    setErr("");
    const list = open.map((t, i) => `${i + 1}. ${t.title} | deadline: ${t.deadline || "not specified"} | duration: ${t.duration || "not specified"} | priority: ${t.priority}`).join("\n");
    await ai.run(`Plan scope: ${scope}\nToday: ${new Date().toDateString()}\nAvailable working time: ${hours || "not specified"}\nTasks:\n${list}`);
    logActivity(`Generated a ${scope.toLowerCase()} plan`);
  };

  return (
    <>
      <PageIntro title="AI Task Planner" text="Add your tasks, then let WorkPilot AI build a prioritised plan. Tasks are saved in this browser." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Panel title={editing ? "Edit task" : "Add a task"}>
            <div className="space-y-3">
              <Field label="Task *" error={err && !f.title.trim() ? err : undefined}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Prepare quarterly report" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Deadline"><Input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
                <Field label="Est. duration"><Input value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="e.g. 2h" /></Field>
              </div>
              <Field label="Priority">
                <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRI.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="flex gap-2">
                <Button onClick={save} className="flex-1">{editing ? <><Save /> Save changes</> : <><Plus /> Add task</>}</Button>
                {editing && <Button variant="outline" onClick={() => { setEditing(null); setF(blank); }}>Cancel</Button>}
              </div>
            </div>
          </Panel>
          <Panel title={`Tasks (${tasks.length})`}>
            {tasks.length === 0 ? <Empty icon={ListChecks} text="No tasks yet. Add your first task above." /> : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <Checkbox className="mt-0.5" checked={t.done} aria-label={`Mark ${t.title} complete`} onCheckedChange={(c) => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !!c } : x)))} />
                    <div className="min-w-0 flex-1">
                      <div className={cn("text-sm font-medium", t.done && "text-muted-foreground line-through")}>{t.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className={cn("rounded px-1.5 py-0.5", t.priority === "High" ? "bg-destructive/10 text-destructive" : t.priority === "Medium" ? "bg-gold-soft text-gold-foreground" : "bg-muted")}>{t.priority}</span>
                        {t.deadline && <span>Due {t.deadline}</span>}
                        {t.duration && <span>· {t.duration}</span>}
                      </div>
                    </div>
                    <button aria-label="Edit task" onClick={() => { setEditing(t.id); setF({ title: t.title, deadline: t.deadline, duration: t.duration, priority: t.priority }); }} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                    <button aria-label="Delete task" onClick={() => setTasks((all) => all.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <Panel className="lg:col-span-3" title="AI plan" actions={<><CopyButton text={ai.output} /><ClearButton onClick={() => { ai.setOutput(""); ai.setError(null); }} /></>}>
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Plan type">
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Daily">Daily plan</SelectItem><SelectItem value="Weekly">Weekly plan</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Available time (optional)"><Input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 9am–5pm" /></Field>
            <Button onClick={plan} disabled={ai.loading}><Wand2 /> {ai.loading ? "Planning…" : "Generate plan"}</Button>
          </div>
          {err && tasks.length > 0 && f.title.trim() === "" && !editing ? null : null}
          {err && !tasks.filter((t) => !t.done).length && <div className="mb-3"><ErrorNote message={err} /></div>}
          {ai.error && <div className="mb-3"><ErrorNote message={ai.error} /></div>}
          {ai.loading ? <Loading /> : ai.output ? <Markdown text={ai.output} /> : <Empty icon={Wand2} text="Your prioritised plan, conflicts and risks will appear here." />}
        </Panel>
      </div>
    </>
  );
}
