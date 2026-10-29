import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Clock, ShieldAlert } from "lucide-react";
import { NAV, DISCLAIMER } from "@/components/app-shell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Dashboard", "Your AI workplace productivity dashboard: emails, meeting notes, task plans, research and chat in one place."),
  component: Dashboard,
});

const DESCRIPTIONS: Record<string, string> = {
  "/email": "Draft formal, friendly or persuasive emails in seconds.",
  "/meetings": "Turn raw notes into decisions, owners and deadlines.",
  "/planner": "Prioritise tasks and spot conflicts in your schedule.",
  "/research": "Get overviews, findings and recommendations from text.",
  "/chat": "Ask anything about writing, planning or productivity.",
};

function Dashboard() {
  const [activity, setActivity] = useState<{ label: string; at: number }[]>([]);
  const [stats, setStats] = useState({ open: 0, done: 0 });
  useEffect(() => {
    try {
      setActivity(JSON.parse(localStorage.getItem("wp-activity") || "[]"));
      const tasks = JSON.parse(localStorage.getItem("wp-tasks") || "[]") as { done: boolean }[];
      setStats({ open: tasks.filter((t) => !t.done).length, done: tasks.filter((t) => t.done).length });
    } catch { /* ignore */ }
  }, []);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const tools = NAV.filter((n) => DESCRIPTIONS[n.to]);

  return (
    <div className="space-y-8">
      <section className="bg-hero rounded-2xl p-6 text-primary-foreground shadow-card md:p-8">
        <p className="text-sm font-medium text-gold">{greet} 👋</p>
        <h2 className="mt-1 text-2xl font-bold md:text-3xl">Welcome to WorkPilot AI</h2>
        <p className="mt-2 max-w-xl text-primary-foreground/80">
          Your AI co-pilot for everyday work. Pick a tool below to write, summarise, plan and research faster.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/email" className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:opacity-90">Write an email</Link>
          <Link to="/planner" className="rounded-lg border border-primary-foreground/30 px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/10">Plan my day</Link>
          <Link to="/chat" className="rounded-lg border border-primary-foreground/30 px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/10">Ask the assistant</Link>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-semibold">AI tools</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="group rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-primary/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <t.icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold">{t.label}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{DESCRIPTIONS[t.to]}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
          <div className="rounded-xl border bg-gold-soft p-5">
            <h4 className="font-semibold text-gold-foreground">Your tasks</h4>
            <div className="mt-3 flex gap-6">
              <div><div className="text-3xl font-bold">{stats.open}</div><div className="text-xs text-muted-foreground">Open</div></div>
              <div><div className="text-3xl font-bold">{stats.done}</div><div className="text-xs text-muted-foreground">Completed</div></div>
            </div>
            <Link to="/planner" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold-foreground">Manage tasks <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-3 font-semibold">Recent activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet. Your recent AI actions will appear here.</p>
          ) : (
            <ul className="divide-y">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span>{a.label}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{new Date(a.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-gold/40 bg-card p-5 shadow-card">
          <h3 className="mb-2 flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 text-gold" /> Responsible AI</h3>
          <p className="text-sm text-muted-foreground">{DISCLAIMER}</p>
        </section>
      </div>
    </div>
  );
}
