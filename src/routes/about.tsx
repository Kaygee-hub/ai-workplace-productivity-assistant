import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { NAV, DISCLAIMER } from "@/components/app-shell";
import { PageIntro } from "@/components/tool-ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo("About", "About WorkPilot AI, an integrated AI workplace productivity assistant."),
  component: About,
});

function About() {
  const tools = NAV.filter((n) => !["/", "/about"].includes(n.to));
  return (
    <div className="max-w-3xl space-y-6">
      <PageIntro title="About WorkPilot AI" text="One integrated assistant for everyday professional work." />
      <section className="rounded-xl border bg-card p-6 shadow-card space-y-3 text-sm leading-relaxed">
        <h3 className="text-base font-semibold">Purpose</h3>
        <p>WorkPilot AI helps students, employees, entrepreneurs and professionals complete routine work more efficiently. Instead of switching between separate apps, it brings writing, summarising, planning, research and conversation into one dashboard.</p>
        <h3 className="pt-2 text-base font-semibold">What it includes</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {tools.map((t) => <li key={t.to} className="flex items-center gap-2"><t.icon className="h-4 w-4 text-primary" /> {t.label}</li>)}
        </ul>
        <h3 className="pt-2 text-base font-semibold">How it works</h3>
        <p>Your inputs are sent securely to a large language model through Lovable AI on the server — no API keys are ever exposed in the browser. Tasks, chat history and preferences are stored locally in your browser only. The research assistant does not browse the internet and never provides citations.</p>
      </section>
      <section className="flex gap-3 rounded-xl border border-gold/40 bg-gold-soft p-5 text-sm text-gold-foreground">
        <ShieldAlert className="h-5 w-5 shrink-0" /> <p><strong>Responsible AI.</strong> {DISCLAIMER}</p>
      </section>
    </div>
  );
}
