import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PROMPTS = {
  email:
    "You are WorkPilot AI, a professional email writer. Write a complete, ready-to-send email with a subject line, greeting, body and sign-off. Use only the details provided; use bracketed placeholders like [Your Name] for anything missing. Output plain text, no markdown.",
  meeting:
    "You are WorkPilot AI, a meeting notes analyst. From the notes, produce markdown with these exact sections: ## Summary, ## Key Decisions, ## Action Items (as a table: Action | Responsible | Deadline), ## Open Questions. NEVER invent names, decisions or deadlines — write 'Not specified' when absent, and 'None identified' for empty sections.",
  planner:
    "You are WorkPilot AI, a task planning assistant. Given tasks (with deadline, duration, priority) and the plan scope, produce markdown with: ## Prioritised Plan (organised by day or time block), ## Conflicts & Risks (scheduling conflicts, unrealistic workload), ## Tips. Prioritise urgent and important tasks. Never invent deadlines or available working hours; if information is missing, say so and assume nothing.",
  research:
    "You are WorkPilot AI, a research assistant WITHOUT internet access. Produce markdown with sections: ## Overview, ## Key Findings, ## Insights, ## Recommendations, ## Limitations. Label every bullet as either **[From your input]** (directly supported by text the user supplied) or **[AI analysis]** (your own reasoning or general knowledge). Never fabricate citations, URLs, statistics or sources, and never claim to have browsed the web.",
  chat:
    "You are WorkPilot AI, a friendly workplace productivity assistant. Help with workplace writing, brainstorming, task planning and productivity questions. Be concise and practical; use markdown when helpful. You cannot browse the internet.",
} as const;

const schema = z.object({
  tool: z.enum(["email", "meeting", "planner", "research", "chat"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(30000) }))
    .min(1)
    .max(60),
});

export const runAI = createServerFn({ method: "POST" })
  .validator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const r = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: PROMPTS[data.tool],
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      const text = r.output
        .flatMap((o) => (o.type === "message" ? o.content : []))
        .map((c) => (c.type === "output_text" ? c.text : ""))
        .join("")
        .trim();
      if (!text) return { ok: false as const, error: "The AI returned an empty response. Please try again." };
      return { ok: true as const, text };
    } catch (e) {
      console.error("AI error", e);
      if (e instanceof GatewayError) {
        const code = e.httpStatus;
        if (code === 429) return { ok: false as const, error: "Too many requests right now. Please wait a moment and try again." };
        if (code === 402) return { ok: false as const, error: "AI credits are exhausted. Add credits in workspace settings to continue." };
        if (code === 401) return { ok: false as const, error: "The AI service is not configured. Enable Lovable AI for this project." };
      }
      return { ok: false as const, error: "The AI service is temporarily unavailable. Your inputs are kept — please try again." };
    }
  });
